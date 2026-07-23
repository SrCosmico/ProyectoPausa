'use client';

import React, { useState, useEffect, useCallback } from 'react';
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

// Interfaz local compatible con notas_diario (id es UUID string de Supabase)
interface NotaDiario {
  id: string;
  user_id: string;
  titulo: string;
  contenido: string;
  fecha: string;
  emoji_dia?: string | null;
  label_dia?: string | null;
}

type VistaDiario = 'bienvenida' | 'bloqueo' | 'listaNotas' | 'crearNota' | 'verNota';
type ModoBloqueo = 'cargando' | 'crear_dibujar' | 'crear_confirmar' | 'verificar';

const MIN_PUNTOS_PATRON = 4;

const opcionesEstado = [
  { emoji: '💜', label: 'Productivo' },
  { emoji: '💛', label: 'Cansado'    },
  { emoji: '💙', label: 'Tranquilo'  },
  { emoji: '💚', label: 'Aprendizaje'},
];

export default function DiarioPage() {
  const router = useRouter();
  const imagenInputRef = React.useRef<HTMLInputElement>(null);
  const editorRef = React.useRef<HTMLDivElement>(null);

  const [userId,      setUserId]      = useState<string>('');
  const [vista,       setVista]       = useState<VistaDiario>('bienvenida');
  const [listaNotas,  setListaNotas]  = useState<NotaDiario[]>([]);
  const [notaActiva,  setNotaActiva]  = useState<NotaDiario | null>(null);
  const [cargando,    setCargando]    = useState<boolean>(false);

  // ── NUEVO: filtro de notas por etiqueta/emoji ────────────────────────────
  const [filtroEtiqueta, setFiltroEtiqueta] = useState<string | null>(null); // null = "Todas"

  // NUEVO: fuerza que el editor enriquecido se vacíe visualmente al abrir una nota nueva
  const [editorKey, setEditorKey] = useState(0);

  // ── NUEVO: grabación de audio ─────────────────────────────────────────────
  const [grabando, setGrabando] = useState(false);
  const [tiempoGrabacion, setTiempoGrabacion] = useState(0);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const chunksAudioRef = React.useRef<Blob[]>([]);
  const timerGrabacionRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const MAX_SEGUNDOS_AUDIO = 120;

  // ── Estado del patrón de bloqueo ─────────────────────────────────────────
  const [modoBloqueo, setModoBloqueo] = useState<ModoBloqueo>('cargando');
  const [patronHashGuardado, setPatronHashGuardado] = useState<string | null>(null);
  const [puntosSeleccionados, setPuntosSeleccionados] = useState<number[]>([]);
  const [patronTemporal, setPatronTemporal] = useState<number[] | null>(null);
  const [errorPatron, setErrorPatron] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const [verificandoPatron, setVerificandoPatron] = useState(false);

  // Estados del formulario de creación
  const [titulo,       setTitulo]       = useState('');
  const [contenido,    setContenido]    = useState('');
  const [estadoDia,    setEstadoDia]    = useState<{ emoji: string; label: string } | null>(null);
  const [panelAbierto, setPanelAbierto] = useState(false);

  // ── Fetch de notas desde Supabase ────────────────────────────────────────
  const cargarNotas = useCallback(async (uid: string) => {
    if (!uid) return;
    setCargando(true);
    const { data, error } = await supabase
      .from('notas_diario')
      .select('*')
      .eq('user_id', uid)
      .order('fecha', { ascending: false });

    if (!error && data) setListaNotas(data as NotaDiario[]);
    setCargando(false);
  }, []);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      setUserId(user.id);
      await cargarNotas(user.id);
    };
    init();
  }, [router, cargarNotas]);

  // ── Cargar estado del patrón cada vez que entramos a la pantalla de bloqueo ──
  useEffect(() => {
    if (vista !== 'bloqueo' || !userId) return;

    const cargarPatron = async () => {
      setModoBloqueo('cargando');
      setPuntosSeleccionados([]);
      setPatronTemporal(null);
      setErrorPatron(null);

      const hash = await obtenerPatronGuardado(userId);
      setPatronHashGuardado(hash);
      setModoBloqueo(hash ? 'verificar' : 'crear_dibujar');
    };

    cargarPatron();
  }, [vista, userId]);

  // ── Interacción con los puntos del patrón ────────────────────────────────
  const alternarPunto = (idx: number) => {
    if (verificandoPatron) return;
    setErrorPatron(null);
    setPuntosSeleccionados((prev) => (prev.includes(idx) ? prev : [...prev, idx]));
  };

  const limpiarSeleccion = () => {
    setPuntosSeleccionados([]);
    setErrorPatron(null);
  };

  const dispararError = (mensaje: string) => {
    setErrorPatron(mensaje);
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const confirmarPatron = async () => {
    if (verificandoPatron) return;

    if (puntosSeleccionados.length < MIN_PUNTOS_PATRON) {
      setErrorPatron(`Tu patrón debe tener al menos ${MIN_PUNTOS_PATRON} puntos.`);
      return;
    }

    // Paso 1 de creación: guardamos el dibujo temporal y pedimos confirmarlo
    if (modoBloqueo === 'crear_dibujar') {
      setPatronTemporal(puntosSeleccionados);
      setPuntosSeleccionados([]);
      setModoBloqueo('crear_confirmar');
      return;
    }

    // Paso 2 de creación: comparamos con el dibujo temporal
    if (modoBloqueo === 'crear_confirmar') {
      const coincide =
        patronTemporal !== null &&
        JSON.stringify(patronTemporal) === JSON.stringify(puntosSeleccionados);

      if (!coincide) {
        dispararError('Los patrones no coinciden. Vuelve a intentarlo.');
        setPuntosSeleccionados([]);
        setPatronTemporal(null);
        setModoBloqueo('crear_dibujar');
        return;
      }

      setVerificandoPatron(true);
      const hash = await hashPatron(puntosSeleccionados);
      const { error } = await guardarPatronUsuario(userId, hash);
      setVerificandoPatron(false);

      if (error) {
        setErrorPatron('No se pudo guardar tu patrón. Intenta de nuevo.');
        return;
      }

      setVista('listaNotas');
      return;
    }

    // Verificación de patrón existente
    if (modoBloqueo === 'verificar') {
      setVerificandoPatron(true);
      const hashIntento = await hashPatron(puntosSeleccionados);
      setVerificandoPatron(false);

      if (hashIntento === patronHashGuardado) {
        setVista('listaNotas');
      } else {
        dispararError('Patrón incorrecto. Intenta de nuevo.');
        setPuntosSeleccionados([]);
      }
    }
  };

  const manejarRestablecerPatron = async () => {
    if (!confirm('Esto eliminará tu patrón actual y podrás crear uno nuevo. ¿Continuar?')) return;
    await eliminarPatronUsuario(userId);
    setPatronHashGuardado(null);
    setPuntosSeleccionados([]);
    setPatronTemporal(null);
    setErrorPatron(null);
    setModoBloqueo('crear_dibujar');
  };

  // ── NUEVO: insertar imagen como base64 dentro del editor enriquecido ─────
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
    document.execCommand('insertImage', false, base64);

    // Sincronizamos el estado con lo que quedó en el editor tras insertar la imagen
    if (editorRef.current) setContenido(editorRef.current.innerHTML);

    if (imagenInputRef.current) imagenInputRef.current.value = '';
  };

  // ── NUEVO: insertar imagen como base64 dentro del editor enriquecido ─────
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
    document.execCommand('insertImage', false, base64);
    if (editorRef.current) setContenido(editorRef.current.innerHTML);
    if (imagenInputRef.current) imagenInputRef.current.value = '';
  };

  // ── NUEVO: grabar audio y adjuntarlo a la nota como reproductor embebido ──
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
          `<audio controls src="${base64}" class="w-full my-2"></audio><br>`
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
        if (segundos >= MAX_SEGUNDOS_AUDIO) {
          detenerGrabacion();
        }
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

  // ── Guardar nota nueva en Supabase ───────────────────────────────────────
  const guardarNota = async () => {
    if (!userId) return;
    setCargando(true);

    const { error } = await insertarNotaDiario(
      userId,
      titulo || 'Sin título',
      contenido,
      estadoDia?.emoji  ?? null,
      estadoDia?.label  ?? null
    );

    if (!error) {
      setTitulo('');
      setContenido('');
      setEstadoDia(null);
      setEditorKey((k) => k + 1);
      await cargarNotas(userId);
      setVista('listaNotas');
    } else {
      console.error('Error al guardar nota:', error);
    }
    setCargando(false);
  };

  // ── Eliminar nota en Supabase ─────────────────────────────────────────────
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

  const abrirNota = (nota: NotaDiario) => {
    setNotaActiva(nota);
    setVista('verNota');
  };

  const manejarAtras = () => {
    if (vista === 'bienvenida')  router.push('/home');
    else if (vista === 'bloqueo')      setVista('bienvenida');
    else if (vista === 'listaNotas')   setVista('bloqueo');
    else if (vista === 'crearNota')    setVista('listaNotas');
    else if (vista === 'verNota')      setVista('listaNotas');
  };

  // ── NUEVO: notas filtradas según la etiqueta elegida ─────────────────────
  const notasFiltradas = filtroEtiqueta
    ? listaNotas.filter((n) => n.label_dia === filtroEtiqueta)
    : listaNotas;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-0 sm:p-4 font-sans text-slate-800">
      <div className="w-full max-w-md h-screen sm:h-[850px] bg-white shadow-2xl flex flex-col relative sm:rounded-[40px] overflow-hidden border border-slate-100">

        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between z-10 bg-white">
          <button onClick={manejarAtras} className="p-2 -ml-2 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
          </button>
          <h3 className="text-sm font-bold">
            {vista === 'crearNota' ? 'Nueva nota' : vista === 'verNota' ? 'Detalle' : 'Diario emocional'}
          </h3>
          <div className="w-5" />
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto px-6 py-2 relative">

          {/* ── Bienvenida ──────────────────────────────────────────── */}
          {vista === 'bienvenida' && (
            <div className="text-center pt-10 space-y-6">
              <div className="w-40 h-40 bg-purple-50 rounded-full mx-auto flex items-center justify-center text-6xl">📓</div>
              <h2 className="text-xl font-bold">Diario emocional</h2>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">Tu espacio seguro para escribir lo que sientes, sin filtros.</p>
              <button onClick={() => setVista('bloqueo')} className="w-full py-4 bg-[#6B66B2] text-white rounded-xl font-bold text-sm shadow-md hover:bg-[#5a5596]">
                Abrir mi diario
              </button>
            </div>
          )}

          {/* ── Bloqueo (patrón real, conectado a Supabase) ──────────────── */}
          {vista === 'bloqueo' && (
            <div className="flex flex-col items-center pt-10 space-y-5 px-2">
              <h2 className="text-lg font-bold text-center">
                {modoBloqueo === 'crear_dibujar' && 'Crea tu patrón de seguridad'}
                {modoBloqueo === 'crear_confirmar' && 'Confirma tu patrón'}
                {modoBloqueo === 'verificar' && 'Ingresa tu patrón'}
                {modoBloqueo === 'cargando' && 'Cargando...'}
              </h2>
              <p className="text-xs text-slate-400 text-center max-w-xs">
                {modoBloqueo === 'crear_dibujar' && `Toca al menos ${MIN_PUNTOS_PATRON} puntos, en el orden que quieras usar como tu patrón.`}
                {modoBloqueo === 'crear_confirmar' && 'Vuelve a tocar los mismos puntos en el mismo orden para confirmar.'}
                {modoBloqueo === 'verificar' && 'Toca tu patrón para desbloquear tu diario.'}
              </p>

              <div className={`grid grid-cols-3 gap-8 p-4 ${shake ? 'animate-shake' : ''}`}>
                {[...Array(9)].map((_, i) => {
                  const seleccionado = puntosSeleccionados.includes(i);
                  const orden = puntosSeleccionados.indexOf(i);
                  return (
                    <button
                      key={i}
                      onClick={() => alternarPunto(i)}
                      disabled={modoBloqueo === 'cargando' || verificandoPatron}
                      className={`relative w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all duration-150 ${
                        seleccionado
                          ? 'border-[#6B66B2] bg-[#6B66B2] text-white scale-110 shadow-md'
                          : 'border-slate-300 hover:border-[#6B66B2] disabled:opacity-50'
                      }`}
                    >
                      {seleccionado && <span className="text-xs font-bold">{orden + 1}</span>}
                    </button>
                  );
                })}
              </div>

              {errorPatron && (
                <p className="text-xs font-semibold text-rose-500 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2 text-center">
                  ⚠️ {errorPatron}
                </p>
              )}

              <div className="flex gap-3 w-full max-w-xs">
                <button
                  onClick={limpiarSeleccion}
                  disabled={verificandoPatron}
                  className="flex-1 py-3 border border-slate-200 text-slate-500 rounded-xl text-xs font-bold hover:bg-slate-50 disabled:opacity-50"
                >
                  Borrar
                </button>
                <button
                  onClick={confirmarPatron}
                  disabled={modoBloqueo === 'cargando' || verificandoPatron}
                  className="flex-1 py-3 bg-[#6B66B2] hover:bg-[#5a5596] text-white rounded-xl text-xs font-bold disabled:opacity-60"
                >
                  {verificandoPatron ? 'Verificando...' : 'Confirmar'}
                </button>
              </div>

              {modoBloqueo === 'verificar' && (
                <button
                  onClick={manejarRestablecerPatron}
                  className="text-[11px] text-slate-400 underline hover:text-slate-600"
                >
                  Olvidé mi patrón
                </button>
              )}
            </div>
          )}

          {/* ── Lista de notas ───────────────────────────────────────── */}
          {vista === 'listaNotas' && (
            <div className="space-y-4 pt-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Notas guardadas</p>

              {/* NUEVO: filtro por etiqueta/emoji */}
              <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
                <button
                  onClick={() => setFiltroEtiqueta(null)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all ${
                    filtroEtiqueta === null
                      ? 'bg-[#6B66B2] text-white border-[#6B66B2]'
                      : 'bg-white text-slate-500 border-slate-200 hover:border-[#6B66B2]/50'
                  }`}
                >
                  Todas
                </button>
                {opcionesEstado.map((op) => (
                  <button
                    key={op.label}
                    onClick={() => setFiltroEtiqueta(op.label)}
                    className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all ${
                      filtroEtiqueta === op.label
                        ? 'bg-[#6B66B2] text-white border-[#6B66B2]'
                        : 'bg-white text-slate-500 border-slate-200 hover:border-[#6B66B2]/50'
                    }`}
                  >
                    <span>{op.emoji}</span>
                    <span>{op.label}</span>
                  </button>
                ))}
              </div>

              {cargando && (
                <p className="text-xs text-slate-400 text-center py-6 animate-pulse">Cargando notas...</p>
              )}

              {!cargando && notasFiltradas.length === 0 && listaNotas.length > 0 && (
                <p className="text-xs text-slate-400 text-center py-6">No tienes notas con esta etiqueta todavía.</p>
              )}

              {!cargando && listaNotas.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-6">Aún no tienes notas. ¡Crea la primera!</p>
              )}

              {notasFiltradas.map((nota) => (
                <div key={nota.id} className="p-4 bg-white border border-slate-100 rounded-xl shadow-sm flex justify-between items-center cursor-pointer hover:border-[#6B66B2]"
                  onClick={() => abrirNota(nota)}>
                  <div>
                    <p className="text-xs font-bold">{nota.titulo}</p>
                    <p className="text-[10px] text-slate-400">{formatearFechaNota(nota.fecha)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{nota.emoji_dia ?? ''}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); eliminarNota(nota.id); }}
                      className="p-1 text-slate-300 hover:text-rose-500 transition-colors"
                      title="Eliminar nota"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Ver nota ─────────────────────────────────────────────── */}
          {vista === 'verNota' && notaActiva && (
            <div className="pt-4 space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{notaActiva.emoji_dia ?? ''}</span>
                <h2 className="text-lg font-bold text-[#6B66B2]">{notaActiva.titulo}</h2>
              </div>
              <p className="text-[10px] text-slate-400">{formatearFechaNota(notaActiva.fecha)} · {notaActiva.label_dia ?? ''}</p>
              <div
                className="text-xs text-slate-600 leading-relaxed [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_li]:mb-1 [&_img]:max-w-full [&_img]:rounded-xl [&_img]:my-2"
                dangerouslySetInnerHTML={{ __html: notaActiva.contenido }}
              />
              <button
                onClick={() => eliminarNota(notaActiva.id)}
                className="mt-4 w-full py-3 border border-rose-100 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold hover:bg-rose-100 transition-colors"
              >
                Eliminar nota
              </button>
            </div>
          )}

          {/* ── Crear nota ───────────────────────────────────────────── */}
          {vista === 'crearNota' && (
            <div className="h-full flex flex-col pt-2">
              <input
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Título"
                className="w-full text-xs font-bold p-2 focus:outline-none border-b border-slate-100 mb-2"
              />

              {/* Barra de herramientas del editor */}
              <div className="flex items-center gap-1.5 flex-wrap py-2 border-b border-slate-100 mb-2">
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => document.execCommand('bold')}
                  className="w-7 h-7 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-black flex items-center justify-center transition-colors"
                  title="Negrita"
                >
                  B
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => document.execCommand('italic')}
                  className="w-7 h-7 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs italic flex items-center justify-center transition-colors"
                  title="Cursiva"
                >
                  I
                </button>
                <span className="w-px h-5 bg-slate-200 mx-1" />
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => document.execCommand('insertUnorderedList')}
                  className="w-7 h-7 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 text-sm flex items-center justify-center transition-colors"
                  title="Lista con viñetas"
                >
                  •≡
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => document.execCommand('insertOrderedList')}
                  className="w-7 h-7 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 text-[10px] font-bold flex items-center justify-center transition-colors"
                  title="Lista numerada"
                >
                  1≡
                </button>
                <span className="w-px h-5 bg-slate-200 mx-1" />
                {['#1E293B', '#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'].map((color) => (
                  <button
                    key={color}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => document.execCommand('foreColor', false, color)}
                    className="w-5 h-5 rounded-full border border-slate-200 flex-shrink-0"
                    style={{ backgroundColor: color }}
                    title="Color de texto"
                  />
                ))}
                <span className="w-px h-5 bg-slate-200 mx-1" />
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => imagenInputRef.current?.click()}
                  className="w-7 h-7 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 text-sm flex items-center justify-center transition-colors"
                  title="Insertar imagen"
                >
                  🖼️
                </button>
                <input
                  ref={imagenInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={manejarInsertarImagen}
                />
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => (grabando ? detenerGrabacion() : iniciarGrabacion())}
                  className={`h-7 rounded-lg flex items-center justify-center transition-colors px-2 gap-1.5 ${
                    grabando ? 'bg-rose-500 text-white' : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
                  }`}
                  title={grabando ? 'Detener grabación' : 'Grabar audio'}
                >
                  <span className={grabando ? 'animate-pulse' : ''}>🎙️</span>
                  {grabando && (
                    <span className="text-[10px] font-bold tabular-nums">{formatearTiempoGrabacion(tiempoGrabacion)}</span>
                  )}
                </button>
              </div>

              <div
                key={editorKey}
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={(e) => setContenido((e.target as HTMLDivElement).innerHTML)}
                data-placeholder="¿Qué tienes en mente hoy?"
                className="w-full flex-1 p-2 text-xs text-slate-600 focus:outline-none overflow-y-auto empty:before:content-[attr(data-placeholder)] empty:before:text-slate-300 [&_img]:max-w-full [&_img]:rounded-xl [&_img]:my-2"
              />

              <button
                onClick={() => setPanelAbierto(true)}
                className="mb-4 mt-3 p-4 rounded-xl bg-purple-50 flex items-center justify-between border border-purple-100 w-full"
              >
                <span className="text-xs font-bold text-purple-700">{estadoDia ? `Día ${estadoDia.label}` : 'Definir mi día'}</span>
                <span className="text-xl">{estadoDia?.emoji ?? '💜'}</span>
              </button>

              <button
                onClick={guardarNota}
                disabled={cargando || !contenido.trim()}
                className="w-full py-3 bg-[#6B66B2] disabled:bg-slate-300 text-white rounded-xl font-bold text-xs shadow-md mb-6 hover:bg-[#5a5596] transition-colors"
              >
                {cargando ? 'Guardando...' : 'Guardar nota'}
              </button>
            </div>
          )}
        </div>

        {/* Panel de estados del día */}
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

        {/* FAB para crear nota */}
        {vista === 'listaNotas' && (
          <button
            onClick={() => setVista('crearNota')}
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