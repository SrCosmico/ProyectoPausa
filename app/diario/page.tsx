'use client';

import React, { useState, useEffect, useCallback, useLayoutEffect } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabase';
import {
  insertarNotaDiario,
  actualizarEntradaDiario,
  formatearFechaNota,
  hashPatron,
  obtenerPatronGuardado,
  guardarPatronUsuario,
  eliminarPatronUsuario,
} from '@/lib/supabase/contrasena';

interface NotaDiario {
  id: string;
  user_id: string;
  titulo: string;
  contenido: string;
  fecha: string;
  emoji_dia?: string | null;
  label_dia?: string | null;
}

// 'cargando' es una vista "neutra" mientras se determina si el usuario ya
// visitó el diario antes. Esto evita que la bienvenida aparezca por un
// instante (parpadeo) mientras se resuelven las consultas async.
type VistaDiario = 'cargando' | 'bienvenida' | 'bloqueo' | 'listaNotas' | 'crearNota' | 'verNota' | 'configuracion';
type ModoBloqueo = 'cargando' | 'crear_dibujar' | 'crear_confirmar' | 'verificar';

const MIN_PUNTOS_PATRON = 3;
const FILTRO_SIN_ETIQUETA = 'SIN_ETIQUETA';

const opcionesEstado = [
  { emoji: '💜', label: 'Productivo', color: '#8B5CF6' },
  { emoji: '💛', label: 'Cansado',    color: '#F59E0B' },
  { emoji: '💙', label: 'Tranquilo',  color: '#3B82F6' },
  { emoji: '💚', label: 'Aprendizaje',color: '#10B981' },
];

const claveVisitado = (uid: string) => `pausa_diario_visitado_${uid}`;

export default function DiarioPage() {
  const router = useRouter();
  const imagenInputRef = React.useRef<HTMLInputElement>(null);
  const editorRef = React.useRef<HTMLDivElement>(null);

  const [userId,      setUserId]      = useState<string>('');
  const [vista,       setVista]       = useState<VistaDiario>('cargando');
  const [listaNotas,  setListaNotas]  = useState<NotaDiario[]>([]);
  const [notaActiva,  setNotaActiva]  = useState<NotaDiario | null>(null);
  const [cargando,    setCargando]    = useState<boolean>(false);

  // Indica si esta es la primera vez que el usuario usa el diario (no ha
  // pasado antes por la pantalla de bienvenida). Se usa para decidir a dónde
  // lo manda la flecha de "atrás" desde la pantalla de patrón.
  const [esPrimeraVez, setEsPrimeraVez] = useState<boolean>(true);

  const [filtroEtiqueta, setFiltroEtiqueta] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');

  const [editorKey, setEditorKey] = useState(0);
  // Guarda el HTML con el que debe arrancar el editor cada vez que se
  // remonta (nota nueva / nota a editar). NO se usa para re-renderizar el
  // editor mientras el usuario escribe: eso es justamente lo que causaba
  // que el cursor "saltara" detrás del texto en vez de quedarse donde
  // estaba escribiendo (particularmente notorio con listas).
  const contenidoInicialRef = React.useRef('');

  const [grabando, setGrabando] = useState(false);
  const [tiempoGrabacion, setTiempoGrabacion] = useState(0);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const chunksAudioRef = React.useRef<Blob[]>([]);
  const timerGrabacionRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const MAX_SEGUNDOS_AUDIO = 120;

  const [modoBloqueo, setModoBloqueo] = useState<ModoBloqueo>('cargando');
  const [patronHashGuardado, setPatronHashGuardado] = useState<string | null>(null);
  const [puntosSeleccionados, setPuntosSeleccionados] = useState<number[]>([]);
  const [patronTemporal, setPatronTemporal] = useState<number[] | null>(null);
  const [errorPatron, setErrorPatron] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const [verificandoPatron, setVerificandoPatron] = useState(false);

  // Patrón tipo celular — se dibuja arrastrando, con líneas conectando los puntos
  const puntosRef = React.useRef<number[]>([]);
  const [arrastrando, setArrastrando] = useState(false);
  const [posicionPuntero, setPosicionPuntero] = useState<{ x: number; y: number } | null>(null);
  const gridContainerRef = React.useRef<HTMLDivElement>(null);
  const dotRefs = React.useRef<(HTMLDivElement | null)[]>([]);

  // Coordenadas de las líneas del patrón, calculadas en un efecto (NO durante
  // el render). Leer refs directamente en el cuerpo del render es un
  // antipatrón de React: puede dar posiciones desincronizadas o romper con
  // versiones más estrictas de React. Aquí se recalculan cada vez que
  // cambian los puntos seleccionados o la posición del puntero, y el JSX
  // solo lee este estado ya resuelto.
  const [lineasPatron, setLineasPatron] = useState<{ x1: number; y1: number; x2: number; y2: number }[]>([]);
  const [lineaViva, setLineaViva] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);

  const centroDelPunto = (idx: number) => {
    const el = dotRefs.current[idx];
    const cont = gridContainerRef.current;
    if (!el || !cont) return { x: 0, y: 0 };
    const r = el.getBoundingClientRect();
    const c = cont.getBoundingClientRect();
    return { x: r.left - c.left + r.width / 2, y: r.top - c.top + r.height / 2 };
  };

  useLayoutEffect(() => {
    const nuevasLineas = puntosSeleccionados.slice(1).map((idx, i) => {
      const desde = centroDelPunto(puntosSeleccionados[i]);
      const hasta = centroDelPunto(idx);
      return { x1: desde.x, y1: desde.y, x2: hasta.x, y2: hasta.y };
    });
    setLineasPatron(nuevasLineas);

    if (arrastrando && posicionPuntero && puntosSeleccionados.length > 0) {
      const desde = centroDelPunto(puntosSeleccionados[puntosSeleccionados.length - 1]);
      setLineaViva({ x1: desde.x, y1: desde.y, x2: posicionPuntero.x, y2: posicionPuntero.y });
    } else {
      setLineaViva(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [puntosSeleccionados, arrastrando, posicionPuntero]);


  const posicionRelativa = (clientX: number, clientY: number) => {
    const cont = gridContainerRef.current;
    if (!cont) return { x: 0, y: 0 };
    const c = cont.getBoundingClientRect();
    return { x: clientX - c.left, y: clientY - c.top };
  };

  const agregarPunto = (idx: number) => {
    if (puntosRef.current.includes(idx)) return;
    puntosRef.current = [...puntosRef.current, idx];
    setPuntosSeleccionados(puntosRef.current);
  };

  const reiniciarPuntos = () => {
    puntosRef.current = [];
    setPuntosSeleccionados([]);
  };

  const manejarPointerDown = (idx: number) => {
    if (modoBloqueo === 'cargando' || verificandoPatron) return;
    setErrorPatron(null);
    reiniciarPuntos();
    setArrastrando(true);
    agregarPunto(idx);
    setPosicionPuntero(centroDelPunto(idx));
  };

  const manejarPointerMove = (e: React.PointerEvent) => {
    if (!arrastrando) return;
    const pos = posicionRelativa(e.clientX, e.clientY);
    setPosicionPuntero(pos);

    dotRefs.current.forEach((el, idx) => {
      if (!el || puntosRef.current.includes(idx)) return;
      const centro = centroDelPunto(idx);
      const dist = Math.hypot(pos.x - centro.x, pos.y - centro.y);
      if (dist < 26) agregarPunto(idx);
    });
  };

  const manejarPointerUp = () => {
    if (!arrastrando) return;
    setArrastrando(false);
    setPosicionPuntero(null);
    confirmarPatron();
  };

  const [titulo,       setTitulo]       = useState('');
  const [contenido,    setContenido]    = useState('');
  const [estadoDia,    setEstadoDia]    = useState<{ emoji: string; label: string } | null>(null);
  const [panelAbierto, setPanelAbierto] = useState(false);
  const [notaEditandoId, setNotaEditandoId] = useState<string | null>(null);

  // IMPORTANTE (rendimiento): esta consulta ya NO trae `contenido` completo.
  // Si una nota tiene imágenes o audio insertados, ese HTML incluye datos
  // en base64 que pueden pesar varios MB — traerlos para TODAS las notas
  // solo para mostrar una lista de títulos es lo que hacía lento el abrir
  // y el guardar. Ahora la lista solo pide un extracto de texto plano
  // (250 caracteres) mediante la función `resumen_nota_diario`, y el
  // contenido completo se pide aparte, solo para la nota que se abre o
  // edita (ver `obtenerNotaCompleta`).
  const cargarNotas = useCallback(async (uid: string) => {
    if (!uid) return;
    const { data, error } = await supabase
      .rpc('listar_notas_diario_resumen', { p_user_id: uid });

    if (!error && data) {
      setListaNotas(data as NotaDiario[]);
      return;
    }

    // Respaldo: si la función RPC no existe todavía en la base de datos
    // (por ejemplo, no has corrido la migración), cae de vuelta a la
    // consulta completa para que la app siga funcionando mientras la
    // agregas — pero sin el beneficio de velocidad.
    const { data: dataCompleta, error: errorCompleto } = await supabase
      .from('notas_diario')
      .select('*')
      .eq('user_id', uid)
      .order('fecha', { ascending: false });

    if (!errorCompleto && dataCompleta) setListaNotas(dataCompleta as NotaDiario[]);
  }, []);

  // Trae el contenido COMPLETO de una sola nota (con imágenes/audio si los
  // tiene). Se usa solo al abrir o editar esa nota puntual, nunca para
  // la lista.
  const obtenerNotaCompleta = async (id: string): Promise<NotaDiario | null> => {
    const { data, error } = await supabase
      .from('notas_diario')
      .select('*')
      .eq('id', id)
      .single();
    if (error || !data) return null;
    return data as NotaDiario;
  };

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      setUserId(user.id);

      // ¿Ya visitó el diario antes? Combinamos DOS señales, resueltas en
      // paralelo para minimizar el tiempo mostrando la pantalla de carga:
      //   1) localStorage: rápido, pero se puede perder (incógnito, caché
      //      borrada, otro navegador/dispositivo).
      //   2) Patrón guardado en la base de datos: persiste siempre, pero
      //      requiere una consulta de red.
      // Si CUALQUIERA de las dos indica que ya usó el diario, saltamos
      // la bienvenida. Las notas se cargan en paralelo también, sin
      // bloquear la decisión de qué vista mostrar.
      let visitadoLocal = false;
      try {
        visitadoLocal = typeof window !== 'undefined' && !!localStorage.getItem(claveVisitado(user.id));
      } catch {
        visitadoLocal = false;
      }

      const [hashResultado] = await Promise.allSettled([
        obtenerPatronGuardado(user.id),
        cargarNotas(user.id),
      ]);

      const tienePatron = hashResultado.status === 'fulfilled' && !!hashResultado.value;
      const yaVisito = visitadoLocal || tienePatron;

      if (yaVisito) {
        try { localStorage.setItem(claveVisitado(user.id), '1'); } catch {}
        setEsPrimeraVez(false);
        setVista('bloqueo');
      } else {
        setEsPrimeraVez(true);
        setVista('bienvenida');
      }
    };
    init();
  }, [router, cargarNotas]);

  useEffect(() => {
    if (vista !== 'bloqueo' || !userId) return;

    const cargarPatron = async () => {
      setModoBloqueo('cargando');
      reiniciarPuntos();
      setPatronTemporal(null);
      setErrorPatron(null);

      const hash = await obtenerPatronGuardado(userId);
      setPatronHashGuardado(hash);
      setModoBloqueo(hash ? 'verificar' : 'crear_dibujar');
    };

    cargarPatron();
  }, [vista, userId]);

  const marcarComoVisitado = () => {
    if (!userId) return;
    try {
      localStorage.setItem(claveVisitado(userId), '1');
    } catch {
      // Si localStorage no está disponible lo ignoramos; el chequeo por
      // patrón guardado en la base de datos sigue funcionando como respaldo.
    }
  };

  const irABloqueoDesdeBienvenida = () => {
    marcarComoVisitado();
    setVista('bloqueo');
  };

  const limpiarSeleccion = () => {
    reiniciarPuntos();
    setErrorPatron(null);
  };

  const dispararError = (mensaje: string) => {
    setErrorPatron(mensaje);
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const confirmarPatron = async () => {
    if (verificandoPatron) return;
    const puntosActuales = puntosRef.current;

    if (puntosActuales.length < MIN_PUNTOS_PATRON) {
      setErrorPatron(`Tu patrón debe tener al menos ${MIN_PUNTOS_PATRON} puntos.`);
      reiniciarPuntos();
      return;
    }

    if (modoBloqueo === 'crear_dibujar') {
      setPatronTemporal(puntosActuales);
      reiniciarPuntos();
      setModoBloqueo('crear_confirmar');
      return;
    }

    if (modoBloqueo === 'crear_confirmar') {
      const coincide =
        patronTemporal !== null &&
        JSON.stringify(patronTemporal) === JSON.stringify(puntosActuales);

      if (!coincide) {
        dispararError('Los patrones no coinciden. Vuelve a intentarlo.');
        reiniciarPuntos();
        setPatronTemporal(null);
        setModoBloqueo('crear_dibujar');
        return;
      }

      setVerificandoPatron(true);
      const hash = await hashPatron(puntosActuales);
      const { error } = await guardarPatronUsuario(userId, hash);
      setVerificandoPatron(false);

      if (error) {
        setErrorPatron('No se pudo guardar tu patrón. Intenta de nuevo.');
        return;
      }

      marcarComoVisitado();
      setVista('listaNotas');
      return;
    }

    if (modoBloqueo === 'verificar') {
      setVerificandoPatron(true);
      const hashIntento = await hashPatron(puntosActuales);
      setVerificandoPatron(false);

      if (hashIntento === patronHashGuardado) {
        marcarComoVisitado();
        setVista('listaNotas');
      } else {
        dispararError('Patrón incorrecto. Intenta de nuevo.');
        reiniciarPuntos();
      }
    }
  };

  const manejarRestablecerPatron = async () => {
    if (!confirm('Esto eliminará tu patrón actual y podrás crear uno nuevo. ¿Continuar?')) return;
    await eliminarPatronUsuario(userId);
    setPatronHashGuardado(null);
    reiniciarPuntos();
    setPatronTemporal(null);
    setErrorPatron(null);
    setModoBloqueo('crear_dibujar');
    setVista('bloqueo');
  };

  const manejarInsertarImagen = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      alert('La imagen no puede superar los 3 MB.');
      if (imagenInputRef.current) imagenInputRef.current.value = '';
      return;
    }

    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    editorRef.current?.focus();
    document.execCommand(
      'insertHTML',
      false,
      `<span contenteditable="false" style="position:relative;display:inline-block;max-width:100%;" class="my-2"><img src="${base64}" style="max-width:100%;border-radius:14px;display:block;" /><button type="button" onclick="this.parentElement.remove()" style="position:absolute;top:6px;right:6px;width:24px;height:24px;border-radius:9999px;background:#ef4444;color:white;border:2px solid white;font-size:13px;font-weight:bold;cursor:pointer;line-height:1;box-shadow:0 2px 6px rgba(0,0,0,0.25);">×</button></span><br>`
    );
    if (editorRef.current) setContenido(editorRef.current.innerHTML);
    if (imagenInputRef.current) imagenInputRef.current.value = '';
  };

  const iniciarGrabacion = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksAudioRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksAudioRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        if (timerGrabacionRef.current) clearInterval(timerGrabacionRef.current);
        setTiempoGrabacion(0);

        const blob = new Blob(chunksAudioRef.current, { type: 'audio/webm' });

        if (blob.size > 4 * 1024 * 1024) {
          alert('El audio grabado es muy largo/pesado. Intenta con una nota más corta.');
          return;
        }

        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });

        editorRef.current?.focus();
        document.execCommand(
          'insertHTML',
          false,
          `<span contenteditable="false" style="position:relative;display:block;" class="my-2"><audio controls src="${base64}" style="width:100%;display:block;"></audio><button type="button" onclick="this.parentElement.remove()" style="position:absolute;top:-8px;right:-8px;width:24px;height:24px;border-radius:9999px;background:#ef4444;color:white;border:2px solid white;font-size:13px;font-weight:bold;cursor:pointer;line-height:1;box-shadow:0 2px 6px rgba(0,0,0,0.25);">×</button></span><br>`
        );
        if (editorRef.current) setContenido(editorRef.current.innerHTML);
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setGrabando(true);

      let segundos = 0;
      timerGrabacionRef.current = setInterval(() => {
        segundos += 1;
        setTiempoGrabacion(segundos);
        if (segundos >= MAX_SEGUNDOS_AUDIO) detenerGrabacion();
      }, 1000);

    } catch (err) {
      console.error('Error al acceder al micrófono:', err);
      alert('No se pudo acceder al micrófono. Verifica los permisos del navegador.');
    }
  };

  const detenerGrabacion = () => {
    mediaRecorderRef.current?.stop();
    setGrabando(false);
  };

  const formatearTiempoGrabacion = (segundos: number) => {
    const m = Math.floor(segundos / 60);
    const s = segundos % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // ── Comandos del editor: siempre se enfoca el editor ANTES de ejecutar
  // el comando. Sin esto, si el foco quedó en otro elemento (por ejemplo
  // el campo de título), document.execCommand se aplica al elemento
  // equivocado (o a ninguno), lo que causaba el bug de listas.
  const ejecutarComandoEditor = (comando: string, valor?: string) => {
    editorRef.current?.focus();
    document.execCommand(comando, false, valor);
    if (editorRef.current) setContenido(editorRef.current.innerHTML);
  };

  const guardarNota = async () => {
    if (!userId) return;
    setCargando(true);

    let error: any;

    if (notaEditandoId) {
      const resultado = await actualizarEntradaDiario(
        notaEditandoId,
        contenido,
        titulo || 'Sin título'
      );
      error = (resultado as any)?.error;
    } else {
      const resultado = await insertarNotaDiario(
        userId,
        titulo || 'Sin título',
        contenido,
        estadoDia?.emoji  ?? null,
        estadoDia?.label  ?? null
      );
      error = resultado?.error;
    }

    if (!error) {
      setTitulo('');
      setContenido('');
      setEstadoDia(null);
      setNotaEditandoId(null);
      setEditorKey((k) => k + 1);
      setVista('listaNotas');
      setCargando(false);
      // La lista ahora es liviana (extracto, no contenido completo), así
      // que refrescarla en segundo plano no bloquea la vuelta a la lista.
      cargarNotas(userId);
      return;
    } else {
      console.error('Error al guardar nota:', error);
      alert('No se pudo guardar la nota. Intenta de nuevo.');
    }
    setCargando(false);
  };

  // ── Iniciar edición de una nota existente ─────────────────────────
  // Recibe la versión "resumen" (de la lista) y pide el contenido
  // completo antes de abrir el editor, para no perder imágenes/audio.
  const iniciarEdicionNota = async (nota: NotaDiario) => {
    setCargando(true);
    const completa = await obtenerNotaCompleta(nota.id);
    const contenidoCompleto = completa?.contenido ?? nota.contenido;

    setNotaEditandoId(nota.id);
    setTitulo(completa?.titulo ?? nota.titulo);
    setContenido(contenidoCompleto);
    contenidoInicialRef.current = contenidoCompleto;
    setEstadoDia(
      nota.label_dia && nota.emoji_dia
        ? { emoji: nota.emoji_dia, label: nota.label_dia }
        : null
    );
    setCargando(false);
    setEditorKey((k) => k + 1);
    setVista('crearNota');
  };

  // ── Empezar una nota nueva desde cero (limpia cualquier edición previa) ──
  const iniciarNotaNueva = () => {
    setNotaEditandoId(null);
    setTitulo('');
    setContenido('');
    contenidoInicialRef.current = '';
    setEstadoDia(null);
    setEditorKey((k) => k + 1);
    setVista('crearNota');
  };

  const eliminarNota = async (notaId: string) => {
    const { error } = await supabase
      .from('notas_diario')
      .delete()
      .eq('id', notaId);

    if (!error) {
      setListaNotas((prev) => prev.filter((n) => n.id !== notaId));
      if (notaActiva?.id === notaId) {
        setNotaActiva(null);
        setVista('listaNotas');
      }
    }
  };

  // Abre una nota mostrando primero la versión resumida (instantáneo) y
  // reemplazándola por el contenido completo apenas llega, en vez de
  // bloquear la pantalla esperando la respuesta.
  const abrirNota = (nota: NotaDiario) => {
    setNotaActiva(nota);
    setVista('verNota');
    obtenerNotaCompleta(nota.id).then((completa) => {
      if (completa) setNotaActiva(completa);
    });
  };

  // ── Inicializa el contenido del editor SOLO cuando cambia editorKey
  // (es decir, cuando se abre una nota nueva o se entra a editar una
  // existente). El div deja de estar "controlado" por React en cada
  // tecla — así el cursor se comporta como en cualquier bloc de notas,
  // en vez de reiniciarse al principio del texto al escribir listas.
  useEffect(() => {
    if (vista === 'crearNota' && editorRef.current) {
      editorRef.current.innerHTML = contenidoInicialRef.current;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editorKey, vista]);

  const manejarAtras = () => {
    if (vista === 'bienvenida') {
      router.push('/home');
    } else if (vista === 'bloqueo') {
      // Primera vez: la flecha regresa a la bienvenida.
      // No es primera vez: la bienvenida ya no existe en el flujo del
      // usuario, así que la flecha lo manda directo al home.
      if (esPrimeraVez) setVista('bienvenida');
      else router.push('/home');
    }
    else if (vista === 'listaNotas')   setVista('bloqueo');
    else if (vista === 'crearNota')    { setNotaEditandoId(null); setVista('listaNotas'); }
    else if (vista === 'verNota')      setVista('listaNotas');
    else if (vista === 'configuracion') setVista('listaNotas');
  };

  const notasFiltradas = listaNotas
    .filter((n) => {
      if (filtroEtiqueta === null) return true;
      if (filtroEtiqueta === FILTRO_SIN_ETIQUETA) return !n.label_dia;
      return n.label_dia === filtroEtiqueta;
    })
    .filter((n) =>
      busqueda.trim()
        ? n.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
          n.contenido.toLowerCase().includes(busqueda.toLowerCase())
        : true
    );

  const colorDeEtiqueta = (label?: string | null) =>
    opcionesEstado.find((o) => o.label === label)?.color ?? '#94A3B8';

  const extraerTextoPlano = (html: string) =>
    html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

  // ── Vista de carga inicial: se muestra mientras se determina si es
  // primera vez o no, para que NUNCA se vea la bienvenida "de paso".
  if (vista === 'cargando') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-0 sm:p-4 font-sans">
        <div className="relative w-full max-w-md h-screen sm:h-[850px] bg-white shadow-2xl flex flex-col items-center justify-center sm:rounded-[40px] overflow-hidden border border-slate-100">
          <div className="w-10 h-10 border-4 border-[#6B66B2] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-0 sm:p-4 font-sans text-slate-800">
      <div className="relative w-full max-w-md h-screen sm:h-[850px] bg-white shadow-2xl flex flex-col sm:rounded-[40px] overflow-hidden border border-slate-100">

        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <img src="/images/forma_morada.png" alt="" aria-hidden="true" className="absolute -top-14 -right-16 w-60 h-auto opacity-30 select-none rotate-12" />
          <img src="/images/ramita_izquierda.png" alt="" aria-hidden="true" className="absolute top-[40%] -left-10 w-28 h-auto opacity-35 select-none rotate-[16deg]" />
          <img src="/images/ramita_derecha.png" alt="" aria-hidden="true" className="absolute bottom-[6%] -right-10 w-32 h-auto opacity-35 select-none -rotate-12" />
        </div>

        <div className="relative z-10 px-6 pt-6 pb-4 flex items-center justify-between bg-white/95 backdrop-blur-sm">
          <button onClick={manejarAtras} className="p-2 -ml-2 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
          </button>
          <h3 className="text-sm font-bold">
            {vista === 'crearNota' ? (notaEditandoId ? 'Editar nota' : 'Nueva nota') : vista === 'verNota' ? 'Detalle' : vista === 'configuracion' ? 'Configuración del diario' : vista === 'listaNotas' ? 'Mis notas' : 'Diario emocional'}
          </h3>
          {vista === 'listaNotas' ? (
            <button onClick={() => setVista('configuracion')} className="p-2 -mr-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors" title="Configuración">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.43l-1.003.767c-.293.224-.438.613-.431.983.001.066.002.132.002.198 0 .066-.001.132-.002.198-.007.37.138.76.431.983l1.003.767a1.125 1.125 0 0 1 .26 1.43l-1.296 2.247a1.125 1.125 0 0 1-1.37.49l-1.216-.456a1.125 1.125 0 0 0-1.076.124 6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281a1.125 1.125 0 0 0-.644-.87 6.52 6.52 0 0 1-.22-.127 1.125 1.125 0 0 0-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.37-.49l-1.296-2.247a1.125 1.125 0 0 1 .26-1.43l1.003-.767c.293-.224.438-.613.431-.983a6.53 6.53 0 0 1-.002-.198c0-.066.001-.132.002-.198.007-.37-.138-.76-.431-.983l-1.003-.767a1.125 1.125 0 0 1-.26-1.43l1.296-2.247a1.125 1.125 0 0 1 1.37-.49l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
            </button>
          ) : (
            <div className="w-9" />
          )}
        </div>

        <div className="relative z-10 flex-1 overflow-y-auto px-6 py-2">

          {vista === 'bienvenida' && (
            <div className="pt-6 space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-[#2A3B50]">Diario emocional</h2>
                <p className="text-xs text-slate-400 mt-1">Escribe, expresa y organiza tus pensamientos.</p>
              </div>

              <div className="flex justify-center py-2">
                <div
                  className="w-32 h-32 rounded-[32px] flex items-center justify-center shadow-sm border border-purple-100/60"
                  style={{ background: 'linear-gradient(135deg, #EDE9FE 0%, #F5F3FF 100%)' }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#6B66B2" className="w-14 h-14">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                  </svg>
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur-sm border border-slate-100 rounded-2xl p-4 space-y-3.5 shadow-sm">
                {[
                  { icono: '✅', titulo: 'Escribe como en tus notas', desc: 'Crea entradas rápidas y detalladas.' },
                  { icono: '🗂️', titulo: 'Organiza tus ideas', desc: 'Busca, edita y elimina cuando quieras.' },
                  { icono: '🔒', titulo: 'Privado y seguro', desc: 'Solo tú puedes acceder a tus notas.' },
                  { icono: '💜', titulo: 'Inspirado en notas', desc: 'Simple, limpio y hecho para ti.' },
                ].map((item) => (
                  <div key={item.titulo} className="flex items-start gap-3">
                    <span className="text-lg flex-shrink-0">{item.icono}</span>
                    <div>
                      <p className="text-xs font-bold text-[#334155]">{item.titulo}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button onClick={irABloqueoDesdeBienvenida} className="w-full py-4 bg-[#6B66B2] text-white rounded-2xl font-bold text-sm shadow-md shadow-purple-100 hover:bg-[#5a5596] transition-colors">
                Abrir mi diario
              </button>
            </div>
          )}

          {vista === 'bloqueo' && (
            <div className="flex flex-col items-center pt-10 space-y-5 px-2">
              <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-2xl">🔒</div>
              <h2 className="text-lg font-bold text-center">
                {modoBloqueo === 'crear_dibujar' && 'Crea tu patrón de seguridad'}
                {modoBloqueo === 'crear_confirmar' && 'Confirma tu patrón'}
                {modoBloqueo === 'verificar' && 'Ingresa tu patrón'}
                {modoBloqueo === 'cargando' && 'Cargando...'}
              </h2>
              <p className="text-xs text-slate-400 text-center max-w-xs">
                {modoBloqueo === 'crear_dibujar' && `Desliza tu dedo o mouse para conectar al menos ${MIN_PUNTOS_PATRON} puntos.`}
                {modoBloqueo === 'crear_confirmar' && 'Vuelve a dibujar el mismo patrón para confirmar.'}
                {modoBloqueo === 'verificar' && 'Dibuja tu patrón para acceder.'}
              </p>

              <div
                ref={gridContainerRef}
                className={`relative select-none touch-none ${shake ? 'animate-shake' : ''}`}
                style={{ width: 232, height: 232 }}
                onPointerMove={manejarPointerMove}
                onPointerUp={manejarPointerUp}
                onPointerLeave={manejarPointerUp}
              >
                {/* Líneas conectando los puntos ya seleccionados + línea viva hacia el puntero */}
                <svg className="absolute inset-0 pointer-events-none" width={232} height={232}>
                  {lineasPatron.map((l, i) => (
                    <line
                      key={i}
                      x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
                      stroke="#6B66B2" strokeWidth={4} strokeLinecap="round"
                    />
                  ))}
                  {lineaViva && (
                    <line
                      x1={lineaViva.x1} y1={lineaViva.y1} x2={lineaViva.x2} y2={lineaViva.y2}
                      stroke="#6B66B2" strokeWidth={4} strokeLinecap="round" opacity={0.5}
                    />
                  )}
                </svg>

                <div className="grid grid-cols-3 gap-8 relative z-10">
                  {[...Array(9)].map((_, i) => {
                    const seleccionado = puntosSeleccionados.includes(i);
                    return (
                      <div
                        key={i}
                        ref={(el) => { dotRefs.current[i] = el; }}
                        onPointerDown={() => manejarPointerDown(i)}
                        className={`w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all duration-100 cursor-pointer ${
                          seleccionado
                            ? 'border-[#6B66B2] bg-[#6B66B2] scale-110 shadow-md'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        <span className={`w-2.5 h-2.5 rounded-full transition-colors ${seleccionado ? 'bg-white' : 'bg-slate-300'}`} />
                      </div>
                    );
                  })}
                </div>
              </div>

              {errorPatron && (
                <p className="text-xs font-semibold text-rose-500 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2 text-center">
                  ⚠️ {errorPatron}
                </p>
              )}

              <button
                onClick={limpiarSeleccion}
                disabled={verificandoPatron}
                className="text-xs font-bold text-slate-500 hover:text-slate-700 disabled:opacity-50"
              >
                Borrar e intentar de nuevo
              </button>

              {modoBloqueo === 'verificar' && (
                <button onClick={manejarRestablecerPatron} className="text-[11px] text-slate-400 underline hover:text-slate-600">
                  ¿Olvidaste tu patrón?
                </button>
              )}
            </div>
          )}

          {vista === 'listaNotas' && (
            <div className="space-y-4 pt-2">
              <div className="relative">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
                <input
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar en mis notas..."
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-medium text-slate-700 focus:outline-none focus:border-[#6B66B2] transition-colors"
                />
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
                <button
                  onClick={() => setFiltroEtiqueta(null)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all ${
                    filtroEtiqueta === null ? 'bg-[#6B66B2] text-white border-[#6B66B2]' : 'bg-white text-slate-500 border-slate-200'
                  }`}
                >
                  Todas
                </button>
                {opcionesEstado.map((op) => (
                  <button
                    key={op.label}
                    onClick={() => setFiltroEtiqueta(op.label)}
                    className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all ${
                      filtroEtiqueta === op.label ? 'bg-[#6B66B2] text-white border-[#6B66B2]' : 'bg-white text-slate-500 border-slate-200'
                    }`}
                  >
                    <span>{op.emoji}</span><span>{op.label}</span>
                  </button>
                ))}
                <button
                  onClick={() => setFiltroEtiqueta(FILTRO_SIN_ETIQUETA)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all ${
                    filtroEtiqueta === FILTRO_SIN_ETIQUETA ? 'bg-[#6B66B2] text-white border-[#6B66B2]' : 'bg-white text-slate-500 border-slate-200'
                  }`}
                  title="Notas sin etiqueta"
                >
                  <span>🤍</span><span>Sin etiqueta</span>
                </button>
              </div>

              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pt-1">Notas recientes</p>

              {!notasFiltradas.length && (
                <p className="text-xs text-slate-400 text-center py-6">
                  {listaNotas.length === 0 ? 'Aún no tienes notas. ¡Crea la primera!' : 'No se encontraron notas.'}
                </p>
              )}

              {notasFiltradas.map((nota) => (
                <div
                  key={nota.id}
                  onClick={() => abrirNota(nota)}
                  className="p-4 bg-white/90 backdrop-blur-sm border border-slate-100 rounded-2xl shadow-sm flex items-start gap-3 cursor-pointer hover:border-[#6B66B2]/40 hover:shadow-md transition-all"
                >
                  <span
                    className="w-1.5 self-stretch rounded-full flex-shrink-0"
                    style={{ backgroundColor: colorDeEtiqueta(nota.label_dia) }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] text-slate-400 font-semibold">{formatearFechaNota(nota.fecha)}</p>
                      <span className="text-base flex-shrink-0">{nota.emoji_dia ?? '🤍'}</span>
                    </div>
                    <p className="text-xs font-bold text-[#2A3B50] mt-0.5">{nota.titulo}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5 truncate">{extraerTextoPlano(nota.contenido)}</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); eliminarNota(nota.id); }}
                    className="p-1 text-slate-300 hover:text-rose-500 transition-colors flex-shrink-0"
                    title="Eliminar nota"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {vista === 'verNota' && notaActiva && (
            <div className="pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-slate-400 font-semibold">{formatearFechaNota(notaActiva.fecha)}</p>
                <span className="text-2xl">{notaActiva.emoji_dia ?? '🤍'}</span>
              </div>
              <h2 className="text-lg font-bold text-[#2A3B50]">{notaActiva.titulo}</h2>

              <div
                className="text-xs text-slate-600 leading-relaxed [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_li]:mb-1 [&_img]:max-w-full [&_img]:rounded-xl [&_img]:my-2 [&_audio]:w-full [&_audio]:my-2"
                dangerouslySetInnerHTML={{ __html: notaActiva.contenido.replace(/<button[^>]*>×<\/button>/g, '') }}
              />

              {notaActiva.label_dia && (
                <div className="pt-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Etiqueta</p>
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold text-white"
                    style={{ backgroundColor: colorDeEtiqueta(notaActiva.label_dia) }}
                  >
                    {notaActiva.emoji_dia} {notaActiva.label_dia}
                  </span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 mt-4">
                <button
                  onClick={() => iniciarEdicionNota(notaActiva)}
                  className="py-3 border border-[#6B66B2]/20 bg-[#6B66B2]/10 text-[#6B66B2] rounded-2xl text-xs font-bold hover:bg-[#6B66B2]/20 transition-colors"
                >
                  ✏️ Editar nota
                </button>
                <button
                  onClick={() => eliminarNota(notaActiva.id)}
                  className="py-3 border border-rose-100 bg-rose-50 text-rose-600 rounded-2xl text-xs font-bold hover:bg-rose-100 transition-colors"
                >
                  Eliminar nota
                </button>
              </div>
            </div>
          )}

          {vista === 'crearNota' && (
            <div className="h-full flex flex-col pt-2">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Título</label>
                <input
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Escribe un título..."
                  className="w-full text-sm font-bold p-3 mt-1 focus:outline-none bg-slate-50 rounded-2xl mb-3 placeholder:text-slate-300 placeholder:font-medium"
                />
              </div>

              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Escribe tu nota</label>
              <div
                key={editorKey}
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={(e) => setContenido((e.target as HTMLDivElement).innerHTML)}
                onClick={() => { if (editorRef.current) setContenido(editorRef.current.innerHTML); }}
                data-placeholder="¿Qué está en tu mente hoy?"
                className="w-full flex-1 p-3 mt-1 text-xs text-slate-600 bg-slate-50 rounded-2xl focus:outline-none overflow-y-auto empty:before:content-[attr(data-placeholder)] empty:before:text-slate-300 [&_img]:max-w-full [&_img]:rounded-xl [&_img]:my-2 [&_audio]:w-full [&_audio]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1"
              />

              {grabando && (
                <div className="mt-2 flex items-center justify-center gap-2 bg-rose-50 border border-rose-100 rounded-xl py-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  <span className="text-[11px] font-bold text-rose-600">Grabando... {formatearTiempoGrabacion(tiempoGrabacion)}</span>
                </div>
              )}

              <div className="grid grid-cols-4 gap-2 mt-3 p-2 bg-slate-50 rounded-2xl">
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => ejecutarComandoEditor('bold')}
                  className="flex flex-col items-center gap-1 py-2 rounded-xl hover:bg-white transition-colors"
                >
                  <span className="text-sm font-black text-slate-600">Aa</span>
                  <span className="text-[9px] font-bold text-slate-400">Texto</span>
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => imagenInputRef.current?.click()}
                  className="flex flex-col items-center gap-1 py-2 rounded-xl hover:bg-white transition-colors"
                >
                  <span className="text-base">🖼️</span>
                  <span className="text-[9px] font-bold text-slate-400">Imagen</span>
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => ejecutarComandoEditor('insertUnorderedList')}
                  className="flex flex-col items-center gap-1 py-2 rounded-xl hover:bg-white transition-colors"
                >
                  <span className="text-sm text-slate-600">•≡</span>
                  <span className="text-[9px] font-bold text-slate-400">Lista</span>
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => (grabando ? detenerGrabacion() : iniciarGrabacion())}
                  className="flex flex-col items-center gap-1 py-2 rounded-xl hover:bg-white transition-colors"
                >
                  <span className={`text-base ${grabando ? 'animate-pulse' : ''}`}>🎙️</span>
                  <span className="text-[9px] font-bold text-slate-400">{grabando ? 'Detener' : 'Audio'}</span>
                </button>
              </div>
              <input ref={imagenInputRef} type="file" accept="image/*" className="hidden" onChange={manejarInsertarImagen} />

              <button
                onClick={() => setPanelAbierto(true)}
                className="mt-3 p-4 rounded-2xl bg-purple-50 flex items-center justify-between border border-purple-100 w-full hover:bg-purple-100/70 transition-colors"
              >
                <span className="text-xs font-bold text-purple-700">{estadoDia ? `Día ${estadoDia.label}` : 'Definir mi día (etiqueta)'}</span>
                <span className="text-xl">{estadoDia?.emoji ?? '💜'}</span>
              </button>

              <button
                onClick={guardarNota}
                disabled={cargando || !contenido.trim()}
                className="w-full py-3.5 bg-[#6B66B2] disabled:bg-slate-300 text-white rounded-2xl font-bold text-xs shadow-md mt-3 mb-6 hover:bg-[#5a5596] transition-colors"
              >
                {cargando ? 'Guardando...' : 'Guardar nota'}
              </button>
            </div>
          )}

          {vista === 'configuracion' && (
            <div className="pt-4 space-y-5">
              <div>
                <h4 className="text-sm font-bold text-[#2A3B50]">Etiquetas de tus notas</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Estas son las etiquetas de color con las que marcas cómo fue tu día. Se usan para organizar y filtrar tus notas.
                </p>
              </div>

              <div className="space-y-2.5">
                {opcionesEstado.map((op) => (
                  <div key={op.label} className="flex items-center gap-3 p-3.5 bg-white/90 border border-slate-100 rounded-2xl shadow-sm">
                    <span
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                      style={{ backgroundColor: `${op.color}20` }}
                    >
                      {op.emoji}
                    </span>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-[#2A3B50]">{op.label}</p>
                      <p className="text-[10px] text-slate-400">
                        {listaNotas.filter((n) => n.label_dia === op.label).length} notas con esta etiqueta
                      </p>
                    </div>
                    <span className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: op.color }} />
                  </div>
                ))}
                <div className="flex items-center gap-3 p-3.5 bg-white/90 border border-slate-100 rounded-2xl shadow-sm">
                  <span className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0 bg-slate-100">
                    🤍
                  </span>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-[#2A3B50]">Sin etiqueta</p>
                    <p className="text-[10px] text-slate-400">
                      {listaNotas.filter((n) => !n.label_dia).length} notas sin etiquetar
                    </p>
                  </div>
                  <span className="w-4 h-4 rounded-full flex-shrink-0 bg-slate-300" />
                </div>
              </div>

              <div className="pt-2">
                <h4 className="text-sm font-bold text-[#2A3B50]">Seguridad</h4>
                <button
                  onClick={manejarRestablecerPatron}
                  className="w-full mt-2 p-3.5 bg-white/90 border border-slate-100 rounded-2xl shadow-sm flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <span className="text-xs font-bold text-[#2A3B50]">Cambiar patrón de seguridad</span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 text-slate-300">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>

        {panelAbierto && (
          <div className="absolute inset-0 z-50 flex items-end bg-black/20" onClick={() => setPanelAbierto(false)}>
            <div className="w-full bg-white rounded-t-3xl p-6" onClick={(e) => e.stopPropagation()}>
              <h4 className="text-xs font-bold text-slate-800 mb-4">¿Cómo fue tu día?</h4>
              <div className="grid grid-cols-2 gap-3">
                {opcionesEstado.map((op) => (
                  <button
                    key={op.label}
                    onClick={() => { setEstadoDia(op); setPanelAbierto(false); }}
                    className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-purple-50"
                  >
                    <span className="text-xl">{op.emoji}</span>
                    <span className="text-xs font-bold text-slate-700">{op.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {vista === 'listaNotas' && (
          <button
            onClick={iniciarNotaNueva}
            className="absolute bottom-8 right-8 w-14 h-14 bg-[#6B66B2] text-white rounded-full shadow-xl flex items-center justify-center text-2xl z-20 hover:bg-[#5a5596]"
          >
            +
          </button>
        )}
      </div>

      <style jsx global>{`
        @keyframes fadeIn  { from { opacity: 0 }  to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(100%) } to { transform: translateY(0) } }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-8px); }
          40%, 80% { transform: translateX(8px); }
        }
        .animate-shake { animation: shake 0.4s ease-in-out; }
      `}</style>
    </div>
  );
}