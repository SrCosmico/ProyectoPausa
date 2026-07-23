"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabase';
import {
  crearActividadCronograma,
  actualizarActividadCronograma,
  leerActividadesCronogramaUsuario,
  eliminarActividadCronograma,
  guardarConfiguracionCronograma,
  obtenerConfiguracionCronograma,
  type ActividadCronogramaGuardada,
} from '@/lib/supabase/cronograma';
import SemaforoEstres from '@/components/SemaforoEstres';
import GestionMateriasParciales from '@/components/GestionMateriasParciales';
import { leerParcialesConMateria } from '@/lib/supabase/materiasParciales';
import type { ParcialConMateria } from '@/models/cronogramaAcademico';
import {
  guardarCacheOffline,
  leerCacheOffline,
  tiempoDesdeSincronizacion,
} from '@/lib/cronograma/modoOffline';

type VistaId = 
  | 'paso1' | 'paso2' | 'paso3' | 'paso4' | 'paso5' 
  | 'vistaSemanal' | 'agregarActividad' | 'detallesActividad'
  | 'configuracionRapida'
  | 'materiasParciales';

type SubVistaCalendario = 'dia' | 'mes' | 'lista';

const opcionesHoras = [
  "05:00 a. m.", "06:00 a. m.", "07:00 a. m.", "08:00 a. m.", "09:00 a. m.", "10:00 a. m.", "11:00 a. m.",
  "12:00 p. m.", "01:00 p. m.", "02:00 p. m.", "03:00 p. m.", "04:00 p. m.", "05:00 p. m.", "06:00 p. m.",
  "07:00 p. m.", "08:00 p. m.", "09:00 p. m.", "10:00 p. m.", "11:00 p. m."
];

const tiposActividad = [
  { id: "clase", label: "Clase" },
  { id: "estudio", label: "Estudio" },
  { id: "tarea", label: "Tarea" },
  { id: "examen", label: "Examen" },
];

function obtenerEstiloPorTipo(tipo: string) {
  switch (tipo?.toLowerCase()) {
    case 'tarea':
      return { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200/80", badge: "bg-orange-100 text-orange-800" };
    case 'estudio':
      return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200/80", badge: "bg-emerald-100 text-emerald-800" };
    case 'examen':
      return { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200/80", badge: "bg-rose-100 text-rose-800" };
    case 'clase':
    default:
      return { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200/80", badge: "bg-purple-100 text-purple-800" };
  }
}

function convertir24a12h(hora24: string): string {
  if (!hora24) return "07:00 a. m.";
  const partes = hora24.split(':');
  let horas = parseInt(partes[0], 10);
  const minutos = partes[1] || '00';
  const ampm = horas >= 12 ? 'p. m.' : 'a. m.';
  if (horas > 12) horas -= 12;
  if (horas === 0) horas = 12;
  return `${String(horas).padStart(2, '0')}:${minutos} ${ampm}`;
}

function obtenerFechaISO(d: Date): string {
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offset).toISOString().split('T')[0];
}

function generarDiasVisibles(fechaBase: Date = new Date()) {
  const abreviaturas = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const dias = [];
  for (let i = -2; i <= 2; i++) {
    const d = new Date(fechaBase);
    d.setDate(fechaBase.getDate() + i);
    dias.push({
      iso: obtenerFechaISO(d),
      abbr: abreviaturas[d.getDay()],
      num: String(d.getDate()).padStart(2, '0'),
    });
  }
  return dias;
}

function formatearFechaLegible(iso: string): string {
  const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const [anio, mes, dia] = iso.split('-').map(Number);
  return `${dia} de ${meses[mes - 1]} de ${anio}`;
}

export default function CronogramaPage() {
  const router = useRouter();

  const [vista, setVista] = useState<VistaId>('paso1');
  const [subVista, setSubVista] = useState<SubVistaCalendario>('dia');

  const [diasSeleccionados, setDiasSeleccionados] = useState<string[]>(["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"]);
  const [horaInicio, setHoraInicio] = useState("07:00 a. m.");
  const [horaFin, setHoraFin] = useState("10:00 p. m.");
  const [actividadesPreferidas, setActividadesPreferidas] = useState<string[]>(["Clases", "Estudio personal", "Tareas"]);
  const [nombreCronograma, setNombreCronograma] = useState("Semestre Mayo - Julio 2026");

  const [colorCronograma, setColorCronograma] = useState<"blue" | "purple" | "emerald" | "orange" | "rose">("blue");
  const [recordatorios, setRecordatorios] = useState(true);

  const [userId, setUserId] = useState<string | null>(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);
  const [actividadesGuardadas, setActividadesGuardadas] = useState<ActividadCronogramaGuardada[]>([]);
  const [cargandoActividades, setCargandoActividades] = useState(false);
  const [guardandoAjustes, setGuardandoAjustes] = useState(false);
  const [errorAjustes, setErrorAjustes] = useState<string | null>(null);

  const [fechaSeleccionadaVista, setFechaSeleccionadaVista] = useState<string>(obtenerFechaISO(new Date()));
  const [centroVistaDia, setCentroVistaDia] = useState<Date>(new Date());
  const [fechaCalendario, setFechaCalendario] = useState(new Date());
  const [bloqueSeleccionado, setBloqueSeleccionado] = useState<ActividadCronogramaGuardada | null>(null);

  const [idActividadEditando, setIdActividadEditando] = useState<string | null>(null);
  const [tituloNuevaActividad, setTituloNuevaActividad] = useState("");
  const [ubicacionNuevaActividad, setUbicacionNuevaActividad] = useState("");
  const [tipoNuevaActividad, setTipoNuevaActividad] = useState<string>("clase");
  const [fechaNuevaActividad, setFechaNuevaActividad] = useState<string>(obtenerFechaISO(new Date()));
  const [horaInicioActividad, setHoraInicioActividad] = useState("07:00 a. m.");
  const [horaFinActividad, setHoraFinActividad] = useState("08:00 a. m.");
  const [guardandoActividad, setGuardandoActividad] = useState(false);
  const [errorActividad, setErrorActividad] = useState<string | null>(null);
  const [parciales, setParciales] = useState<ParcialConMateria[]>([]);
  const [ultimaSincronizacion, setUltimaSincronizacion] = useState<string | null>(null);

  // Borrador de edición de Ajustes: mientras el usuario edita aquí, los valores
  // REALES (nombreCronograma, colorCronograma, etc.) no se tocan. Solo se
  // aplican cuando el usuario presiona "Confirmar cambios".
  const [draftAjustes, setDraftAjustes] = useState<{
    nombre: string;
    color: "blue" | "purple" | "emerald" | "orange" | "rose";
    dias: string[];
  } | null>(null);

  const mapaEstilos = {
    blue: { bg: "bg-blue-400", hoverBg: "hover:bg-blue-500", text: "text-blue-500", bgLight: "bg-blue-50/70", border: "border-blue-200" },
    purple: { bg: "bg-purple-400", hoverBg: "hover:bg-purple-500", text: "text-purple-500", bgLight: "bg-purple-50/70", border: "border-purple-200" },
    emerald: { bg: "bg-emerald-400", hoverBg: "hover:bg-emerald-500", text: "text-emerald-500", bgLight: "bg-emerald-50/70", border: "border-emerald-200" },
    orange: { bg: "bg-orange-400", hoverBg: "hover:bg-orange-500", text: "text-orange-500", bgLight: "bg-orange-50/70", border: "border-orange-200" },
    rose: { bg: "bg-rose-400", hoverBg: "hover:bg-rose-500", text: "text-rose-500", bgLight: "bg-rose-50/70", border: "border-rose-200" }
  };

  const estilosActuales = mapaEstilos[colorCronograma] || mapaEstilos.blue;
  const nombresMeses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  const refrescarActividades = useCallback(async (idUsuario: string) => {
    setCargandoActividades(true);
    const datos = await leerActividadesCronogramaUsuario(idUsuario);
    setActividadesGuardadas(datos);
    setCargandoActividades(false);
  }, []);

  useEffect(() => {
    const inicializar = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      setUserId(session.user.id);

      const { data: config } = await obtenerConfiguracionCronograma(session.user.id);
      if (config) {
        if (config.nombre) setNombreCronograma(config.nombre);
        if (config.color) setColorCronograma(config.color as any);
        if (config.dias_activos) setDiasSeleccionados(config.dias_activos);
        if (config.hora_inicio) setHoraInicio(config.hora_inicio);
        if (config.hora_fin) setHoraFin(config.hora_fin);
        if (config.actividades_preferidas) setActividadesPreferidas(config.actividades_preferidas);
        if (config.recordatorios !== null) setRecordatorios(config.recordatorios);
      }

      await refrescarActividades(session.user.id);
      const parcialesUsuario = await leerParcialesConMateria(session.user.id);
      setParciales(parcialesUsuario);

      guardarCacheOffline(session.user.id, {
        actividades: await (async () => {
          return actividadesGuardadas;
        })(),
        parciales: parcialesUsuario,
      });

      const cache = leerCacheOffline(session.user.id);
      if (cache) setUltimaSincronizacion(cache.sincronizadoEn);

      setCargandoSesion(false);
      
      if (vista === 'paso1') setVista('vistaSemanal');
    };
    inicializar();
  }, [router, refrescarActividades, vista]);

  const manejarFlechaAtras = () => {
    switch (vista) {
      case 'paso1': router.push('/home'); break;
      case 'paso2': setVista('paso1'); break;
      case 'paso3': setVista('paso2'); break;
      case 'paso4': setVista('paso3'); break;
      case 'paso5': setVista('paso4'); break;
      case 'vistaSemanal': router.push('/home'); break;
      case 'agregarActividad': 
        limpiarFormularioActividad();
        setVista('vistaSemanal'); 
        break;
      case 'detallesActividad': setVista('vistaSemanal'); break;
      case 'configuracionRapida': {
        const hayBorradorConCambios =
          draftAjustes &&
          (draftAjustes.nombre !== nombreCronograma ||
            draftAjustes.color !== colorCronograma ||
            JSON.stringify(draftAjustes.dias) !== JSON.stringify(diasSeleccionados));

        if (hayBorradorConCambios) {
          const confirmarSalida = window.confirm(
            '¿Salir sin guardar los cambios? Los ajustes que hiciste se perderán si no presionas "Confirmar cambios".'
          );
          if (!confirmarSalida) break;
        }
        // Descartamos el borrador: el estado real (nombreCronograma, colorCronograma,
        // diasSeleccionados) nunca fue tocado, así que no hay nada que revertir.
        setDraftAjustes(null);
        setVista('vistaSemanal');
        break;
      }
      case 'materiasParciales': setVista('vistaSemanal'); break;
      default: router.push('/home');
    }
  };

  const toggleSelection = (item: string, list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const limpiarFormularioActividad = () => {
    setIdActividadEditando(null);
    setTituloNuevaActividad("");
    setUbicacionNuevaActividad("");
    setTipoNuevaActividad("clase");
    setHoraInicioActividad("07:00 a. m.");
    setHoraFinActividad("08:00 a. m.");
    setFechaNuevaActividad(obtenerFechaISO(new Date()));
  };

  const iniciarEdicionActividad = (actividad: ActividadCronogramaGuardada, e: React.MouseEvent) => {
    e.stopPropagation(); 
    setIdActividadEditando(actividad.id);
    setTituloNuevaActividad(actividad.titulo);
    setUbicacionNuevaActividad(actividad.ubicacion || "");
    setTipoNuevaActividad(actividad.tipo_actividad);
    setFechaNuevaActividad(actividad.fecha);
    setHoraInicioActividad(convertir24a12h(actividad.hora_inicio));
    setHoraFinActividad(convertir24a12h(actividad.hora_fin));
    setVista('agregarActividad');
  };

  const handleGuardarActividad = async () => {
    setErrorActividad(null);

    if (!tituloNuevaActividad.trim()) {
      setErrorActividad("Ponle un título a tu actividad antes de guardar.");
      return;
    }
    if (!fechaNuevaActividad) {
      setErrorActividad("Selecciona una fecha para la actividad.");
      return;
    }
    if (!userId) {
      setErrorActividad("Debes iniciar sesión para guardar actividades.");
      return;
    }

    setGuardandoActividad(true);

    const payloadActividad = {
      user_id: userId,
      titulo: tituloNuevaActividad,
      ubicacion: ubicacionNuevaActividad,
      tipo_actividad: tipoNuevaActividad,
      fecha: fechaNuevaActividad,
      hora_inicio: horaInicioActividad,
      hora_fin: horaFinActividad,
      dias_semana: diasSeleccionados,
    };

    let resultado;
    if (idActividadEditando) {
      resultado = await actualizarActividadCronograma(idActividadEditando, payloadActividad);
    } else {
      resultado = await crearActividadCronograma(payloadActividad);
    }

    if (resultado.error) {
      setErrorActividad("No se pudo procesar la actividad. Intenta de nuevo.");
      setGuardandoActividad(false);
      return;
    }

    const fechaDestino = fechaNuevaActividad;
    limpiarFormularioActividad();
    setGuardandoActividad(false);
    setFechaSeleccionadaVista(fechaDestino);

    await refrescarActividades(userId);
    setVista('vistaSemanal');
  };

  const handleEliminarActividad = async () => {
    if (!bloqueSeleccionado || !userId) return;
    const exito = await eliminarActividadCronograma(bloqueSeleccionado.id);
    if (exito) {
      await refrescarActividades(userId);
      setBloqueSeleccionado(null);
      setVista('vistaSemanal');
    }
  };

  const procesarGuardadoConfiguracion = async () => {
    if (!userId) return;

    const nombreFinal = draftAjustes?.nombre ?? nombreCronograma;
    const colorFinal = draftAjustes?.color ?? colorCronograma;
    const diasFinal = draftAjustes?.dias ?? diasSeleccionados;

    setGuardandoAjustes(true);
    setErrorAjustes(null);

    const resultado = await guardarConfiguracionCronograma(userId, {
      nombre: nombreFinal,
      color: colorFinal,
      dias: diasFinal,
      horaInicio: horaInicio,
      horaFin: horaFin,
      actividades: actividadesPreferidas,
      recordatorios: recordatorios
    });

    setGuardandoAjustes(false);

    if (resultado?.error) {
      console.error('Error al guardar configuración del cronograma:', resultado.error);
      setErrorAjustes('No se pudo guardar. Verifica tu conexión o los permisos de la base de datos.');
      return; // No aplicamos el borrador ni cambiamos de vista si falló
    }

    if (draftAjustes) {
      setNombreCronograma(draftAjustes.nombre);
      setColorCronograma(draftAjustes.color);
      setDiasSeleccionados(draftAjustes.dias);
    }

    setDraftAjustes(null);
    setVista('vistaSemanal');
  };

  const actividadesDelDia = actividadesGuardadas.filter(a => a.fecha === fechaSeleccionadaVista);
  const parcialesDelDia = parciales.filter(p => p.fecha === fechaSeleccionadaVista);
  const actividadesOrdenadasLista = [...actividadesGuardadas].sort((a, b) =>
    a.fecha === b.fecha ? a.hora_inicio.localeCompare(b.hora_inicio) : a.fecha.localeCompare(b.fecha)
  );
  const fechasConParcial = new Set(parciales.map(p => p.fecha));

  if (cargandoSesion) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <p className="text-xs font-bold text-slate-400">Cargando tu cronograma...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-0 sm:p-4 font-sans selection:bg-slate-200">
      <div className="w-full max-w-md h-screen sm:h-[850px] bg-white shadow-2xl flex flex-col justify-between relative sm:rounded-[40px] border border-gray-100 overflow-hidden pb-4">

        <div className="px-6 pt-5 pb-3 flex items-center justify-between border-b border-slate-100 bg-white z-20">
          <button onClick={manejarFlechaAtras} className="p-2 -ml-2 text-slate-700 hover:text-slate-900 transition-colors rounded-xl hover:bg-slate-50">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
          </button>

          <h3 className="text-sm font-bold text-[#2A3B50]">
            {vista === 'paso1' && "Cronograma académico"}
            {(vista === 'paso2' || vista === 'paso3' || vista === 'paso4' || vista === 'paso5') && "Crear cronograma"}
            {vista === 'vistaSemanal' && "Mi cronograma"}
            {vista === 'agregarActividad' && (idActividadEditando ? "Editar actividad" : "Agregar actividad")}
            {vista === 'detallesActividad' && "Detalles de actividad"}
            {vista === 'configuracionRapida' && "Ajustes del calendario"}
          </h3>

          {vista === 'vistaSemanal' ? (
            <button 
              onClick={() => {
                setDraftAjustes({
                  nombre: nombreCronograma,
                  color: colorCronograma,
                  dias: diasSeleccionados,
                });
                setVista('configuracionRapida');
              }} 
              className="p-2 -mr-2 text-slate-500 hover:text-slate-800 transition-colors rounded-xl hover:bg-slate-50"
              title="Ajustes de Cronograma"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.43l-1.003.767c-.293.224-.438.613-.431.983.001.066.002.132.002.198 0 .066-.001.132-.002.198-.007.37.138.76.431.983l1.003.767a1.125 1.125 0 0 1 .26 1.43l-1.296 2.247a1.125 1.125 0 0 1-1.37.49l-1.216-.456a1.125 1.125 0 0 0-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281a1.125 1.125 0 0 0-.644-.87a6.52 6.52 0 0 1-.22-.127a1.125 1.125 0 0 0-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.37-.49l-1.296-2.247a1.125 1.125 0 0 1 .26-1.43l1.003-.767c.293-.224.438-.613.431-.983a6.53 6.53 0 0 1-.002-.198c0-.066.001-.132.002-.198.007-.37-.138-.76-.431-.983l-1.003-.767a1.125 1.125 0 0 1-.26-1.43l1.296-2.247a1.125 1.125 0 0 1 1.37-.49l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128c.332-.183.582-.495.644-.869l.214-1.28Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
            </button>
          ) : (
            <div className="w-5 h-5" />
          )}
        </div>

        {['paso2', 'paso3', 'paso4', 'paso5'].includes(vista) && (
          <div className="px-6 py-2 bg-slate-50 flex flex-col gap-1 border-b border-slate-100">
            <div className={`text-[10px] font-bold ${estilosActuales.text}`}>
              <span>Paso {vista === 'paso2' ? '1' : vista === 'paso3' ? '2' : vista === 'paso4' ? '3' : '4'} de 4</span>
            </div>
            <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden flex gap-0.5">
              <div className={`h-full flex-1 ${['paso2','paso3','paso4','paso5'].includes(vista) ? estilosActuales.bg : 'bg-slate-200'}`}></div>
              <div className={`h-full flex-1 ${['paso3','paso4','paso5'].includes(vista) ? estilosActuales.bg : 'bg-slate-200'}`}></div>
              <div className={`h-full flex-1 ${['paso4','paso5'].includes(vista) ? estilosActuales.bg : 'bg-slate-200'}`}></div>
              <div className={`h-full flex-1 ${vista === 'paso5' ? estilosActuales.bg : 'bg-slate-200'}`}></div>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto bg-white custom-scrollbar">

          {vista === 'paso2' && (
            <div className="p-6 space-y-4 animate-fadeIn">
              <div>
                <h4 className="text-base font-bold text-[#2A3B50]">¿Qué días quieres planificar?</h4>
                <p className="text-xs text-slate-400 mt-0.5">Selecciona los días de la semana que deseas incluir.</p>
              </div>
              <div className="bg-slate-50 rounded-2xl p-2 border border-slate-100 divide-y divide-slate-200/60">
                {["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"].map((dia) => {
                  const elegido = diasSeleccionados.includes(dia);
                  return (
                    <button key={dia} onClick={() => toggleSelection(dia, diasSeleccionados, setDiasSeleccionados)} className="w-full flex items-center justify-between p-3.5 text-xs font-bold text-slate-700">
                      <span>{dia}</span>
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${elegido ? `${estilosActuales.bg} ${estilosActuales.border} text-white` : 'border-slate-300 bg-white'}`}>
                        {elegido && <span className="text-[10px]">✓</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {vista === 'paso3' && (
            <div className="p-6 space-y-5 animate-fadeIn">
              <div>
                <h4 className="text-base font-bold text-[#2A3B50]">¿A qué hora inician y terminan tus actividades?</h4>
                <p className="text-xs text-slate-400 mt-0.5">Define el rango de horas para tu día.</p>
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">Hora de inicio</label>
                  <select value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none">
                    {opcionesHoras.map((hora) => (<option key={hora} value={hora}>{hora}</option>))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">Hora de finalización</label>
                  <select value={horaFin} onChange={(e) => setHoraFin(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none">
                    {opcionesHoras.map((hora) => (<option key={hora} value={hora}>{hora}</option>))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {vista === 'paso4' && (
            <div className="p-6 space-y-4 animate-fadeIn">
              <div>
                <h4 className="text-base font-bold text-[#2A3B50]">¿Qué actividades quieres agregar?</h4>
                <p className="text-xs text-slate-400 mt-0.5">Puedes agregar clases, estudio, tareas y más.</p>
              </div>
              <div className="space-y-2">
                {["Clases", "Estudio personal", "Tareas", "Exámenes", "Lectura", "Actividad personal"].map((nombre) => {
                  const seleccionado = actividadesPreferidas.includes(nombre);
                  return (
                    <button key={nombre} onClick={() => toggleSelection(nombre, actividadesPreferidas, setActividadesPreferidas)} className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-xs font-bold transition-all ${seleccionado ? `${estilosActuales.bgLight} ${estilosActuales.border} ${estilosActuales.text}` : 'border-slate-100 bg-white shadow-sm'}`}>
                      <span>{nombre}</span>
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${seleccionado ? `${estilosActuales.bg} ${estilosActuales.border} text-white` : 'border-slate-300'}`}>
                        {seleccionado && <span className="text-[10px]">✓</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {vista === 'paso5' && (
            <div className="p-6 space-y-5 animate-fadeIn">
              <div>
                <h4 className="text-base font-bold text-[#2A3B50]">¡Último paso!</h4>
                <p className="text-xs text-slate-400 mt-0.5">Ponle un nombre a tu cronograma.</p>
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Nombre de tu cronograma</label>
                  <input type="text" value={nombreCronograma} onChange={(e) => setNombreCronograma(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Color del cronograma</label>
                  <div className="flex gap-3 pt-1">
                    {(["blue", "purple", "emerald", "orange", "rose"] as const).map((c) => (
                      <button key={c} onClick={() => setColorCronograma(c)} className={`w-7 h-7 rounded-full border-2 ${c === 'blue' ? 'bg-blue-300' : c === 'purple' ? 'bg-purple-300' : c === 'emerald' ? 'bg-emerald-300' : c === 'orange' ? 'bg-orange-300' : 'bg-rose-300'} ${colorCronograma === c ? 'border-slate-800 scale-110 shadow' : 'border-transparent opacity-80'}`} />
                    ))}
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-700">Activar recordatorios</p>
                    <p className="text-[10px] text-slate-400">Notificar 15 min antes</p>
                  </div>
                  <button onClick={() => setRecordatorios(!recordatorios)} className={`w-10 h-6 rounded-full p-0.5 transition-colors ${recordatorios ? estilosActuales.bg : 'bg-slate-300'}`}>
                    <div className={`bg-white w-5 h-5 rounded-full shadow-sm transform transition-transform ${recordatorios ? 'translate-x-4' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {vista === 'materiasParciales' && (
            <div className="p-6 animate-fadeIn">
              <GestionMateriasParciales
                userId={userId!}
                onDatosActualizados={(nuevosParciales) => setParciales(nuevosParciales)}
              />
            </div>
          )}

          {vista === 'vistaSemanal' && (
            <div className="animate-fadeIn relative pb-16">
              <div className="px-6 pt-4 pb-2 bg-white space-y-3">
                <SemaforoEstres parciales={parciales} />

                <button
                  onClick={() => setVista('materiasParciales')}
                  className="w-full py-2.5 bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-100 transition-colors"
                >
                  📚 Materias y parciales
                </button>

                {ultimaSincronizacion && (
                  <p className="text-[10px] text-slate-400 text-center">
                    Última sincronización: {tiempoDesdeSincronizacion(ultimaSincronizacion)}
                  </p>
                )}
              </div>

              <div className="px-6 pt-3 flex justify-between items-center bg-slate-50/60 pb-3 border-b border-slate-100">
                <div className="flex bg-slate-200/70 p-1 rounded-xl w-full max-w-[300px]">
                  <button onClick={() => setSubVista('dia')} className={`flex-1 text-center text-[11px] font-bold py-1.5 rounded-lg transition-all ${subVista === 'dia' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}>Día</button>
                  <button onClick={() => setSubVista('mes')} className={`flex-1 text-center text-[11px] font-bold py-1.5 rounded-lg transition-all ${subVista === 'mes' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}>Mes</button>
                  <button onClick={() => setSubVista('lista')} className={`flex-1 text-center text-[11px] font-bold py-1.5 rounded-lg transition-all ${subVista === 'lista' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}>Lista</button>
                </div>
              </div>

              {subVista === 'dia' && (
                <>
                  <div className="px-6 py-3 flex items-center gap-1 border-b border-slate-100 bg-white">
                    <button
                      onClick={() => setCentroVistaDia(new Date(centroVistaDia.getFullYear(), centroVistaDia.getMonth(), centroVistaDia.getDate() - 5))}
                      className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <div className="flex justify-between flex-1">
                      {generarDiasVisibles(centroVistaDia).map((day) => {
                        const esDiaActivo = fechaSeleccionadaVista === day.iso;
                        const tieneActividad = actividadesGuardadas.some(a => a.fecha === day.iso);
                        return (
                          <button key={day.iso} onClick={() => setFechaSeleccionadaVista(day.iso)} className={`relative flex flex-col items-center p-2 rounded-xl w-12 transition-all pb-3.5 ${esDiaActivo ? `${estilosActuales.bg} text-white shadow-md scale-105` : 'text-slate-600 hover:bg-slate-50'}`}>
                            <span className="text-[10px] font-bold">{day.abbr}</span>
                            <span className="text-xs font-black mt-0.5">{day.num}</span>
                            {tieneActividad && (
                              <span className={`w-1 h-1 rounded-full absolute bottom-1 ${esDiaActivo ? 'bg-white' : estilosActuales.bg}`} />
                            )}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => setCentroVistaDia(new Date(centroVistaDia.getFullYear(), centroVistaDia.getMonth(), centroVistaDia.getDate() + 5))}
                      className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>

                  <div className="p-6 space-y-4 relative">
                    <p className="text-[10px] font-bold text-slate-400 mb-1">{formatearFechaLegible(fechaSeleccionadaVista)}</p>
                    {cargandoActividades && <p className="text-xs text-slate-400">Cargando actividades...</p>}
                    {!cargandoActividades && actividadesDelDia.length === 0 && parcialesDelDia.length === 0 && (
                      <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-400">
                        No tienes actividades este día.
                      </div>
                    )}

                    {parcialesDelDia.map((p) => (
                      <div key={`parcial-${p.id}`} className="flex gap-4 items-center">
                        <span className="text-xs font-bold text-slate-400 w-14">📌</span>
                        <div
                          className="flex-1 p-3.5 border-l-4 rounded-xl border flex justify-between items-center bg-rose-50 text-rose-700 border-rose-200/80"
                        >
                          <div>
                            <h5 className="text-xs font-bold">{p.materia.nombre} — {p.titulo}</h5>
                            <p className="text-[10px] opacity-80 mt-0.5 font-medium">Evaluación registrada</p>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-100 text-rose-800">
                            {p.tipo}
                          </span>
                        </div>
                      </div>
                    ))}

                    {actividadesDelDia.map((actividad) => {
                      const estiloTipo = obtenerEstiloPorTipo(actividad.tipo_actividad);
                      return (
                        <div key={actividad.id} onClick={() => { setBloqueSeleccionado(actividad); setVista('detallesActividad'); }} className="flex gap-4 items-center cursor-pointer group">
                          <span className="text-xs font-bold text-slate-400 w-14">{actividad.hora_inicio.slice(0, 5)}</span>
                          <div className={`flex-1 p-3.5 border-l-4 rounded-xl border flex justify-between items-center transition-all group-hover:shadow-md ${estiloTipo.bg} ${estiloTipo.text} ${estiloTipo.border}`}>
                            <div>
                              <h5 className="text-xs font-bold">{actividad.titulo}</h5>
                              <p className="text-[10px] opacity-80 mt-0.5 font-medium">
                                {actividad.ubicacion ? `${actividad.ubicacion} · ` : ''}{actividad.hora_inicio.slice(0, 5)} - {actividad.hora_fin.slice(0, 5)}
                              </p>
                            </div>
                            <button 
                              onClick={(e) => iniciarEdicionActividad(actividad, e)}
                              className="p-1.5 rounded-lg hover:bg-white/60 transition-colors text-slate-400 hover:text-slate-700"
                              title="Editar actividad"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {subVista === 'mes' && (
                <div className="p-6 space-y-4 animate-fadeIn">
                  <div className="flex justify-between items-center bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
                    <button 
                      onClick={() => setFechaCalendario(new Date(fechaCalendario.getFullYear(), fechaCalendario.getMonth() - 1, 1))} 
                      className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-[#2A3B50] capitalize">
                        {nombresMeses[fechaCalendario.getMonth()]}
                      </span>
                      <input
                        type="number"
                        value={fechaCalendario.getFullYear()}
                        onChange={(e) => {
                          const anio = Number(e.target.value);
                          if (!isNaN(anio) && e.target.value.length <= 5) {
                            setFechaCalendario(new Date(anio, fechaCalendario.getMonth(), 1));
                          }
                        }}
                        className="text-sm font-bold text-[#2A3B50] bg-transparent border-none outline-none w-16 text-center [appearance:textfield]"
                      />
                    </div>
                    <button 
                      onClick={() => setFechaCalendario(new Date(fechaCalendario.getFullYear(), fechaCalendario.getMonth() + 1, 1))} 
                      className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>

                  <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                    <div className="grid grid-cols-7 gap-1 mb-2 text-center">
                      {['Do','Lu','Ma','Mi','Ju','Vi','Sá'].map(d => (
                        <span key={d} className="text-[10px] font-bold text-slate-400">{d}</span>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center">
                      {Array.from({ length: new Date(fechaCalendario.getFullYear(), fechaCalendario.getMonth(), 1).getDay() }).map((_, i) => (
                        <div key={`blank-${i}`} className="p-2"></div>
                      ))}
                      {Array.from({ length: new Date(fechaCalendario.getFullYear(), fechaCalendario.getMonth() + 1, 0).getDate() }).map((_, i) => {
                        const day = i + 1;
                        const dateISO = `${fechaCalendario.getFullYear()}-${String(fechaCalendario.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        const hasActivity = actividadesGuardadas.some(a => a.fecha === dateISO) || fechasConParcial.has(dateISO);
                        const isSelected = fechaSeleccionadaVista === dateISO;
                        const isToday = obtenerFechaISO(new Date()) === dateISO;

                        return (
                          <button
                            key={day}
                            onClick={() => { setFechaSeleccionadaVista(dateISO); setSubVista('dia'); }}
                            className={`relative p-2 flex flex-col items-center justify-center rounded-xl text-xs transition-all w-full aspect-square
                              ${isSelected ? `${estilosActuales.bg} text-white font-bold shadow-md` : 
                                isToday ? `bg-slate-100 text-[#2A3B50] font-bold` : `text-slate-600 hover:bg-slate-50 font-medium`}
                            `}
                          >
                            <span>{day}</span>
                            {hasActivity && (
                              <span className={`w-1 h-1 rounded-full absolute bottom-1.5 ${isSelected ? 'bg-white' : estilosActuales.bg}`}></span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {subVista === 'lista' && (
                <div className="p-6 space-y-3 animate-fadeIn">
                  <p className="text-[10px] font-bold text-slate-400">Todas tus actividades guardadas</p>
                  {actividadesOrdenadasLista.length === 0 && parciales.length === 0 && (
                    <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-400">
                      Aún no has agregado actividades.
                    </div>
                  )}

                  {[...parciales]
                    .sort((a, b) => a.fecha.localeCompare(b.fecha))
                    .map((p) => (
                      <div
                        key={`parcial-lista-${p.id}`}
                        className="p-3.5 rounded-xl border flex justify-between items-center bg-rose-50 border-rose-200/80 text-rose-700"
                      >
                        <div className="flex flex-col">
                          <h6 className="text-xs font-bold opacity-95">{p.materia.nombre} — {p.titulo}</h6>
                          <p className="text-[10px] opacity-75 font-medium mt-0.5">{formatearFechaLegible(p.fecha)}</p>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-100 text-rose-800">
                          {p.tipo}
                        </span>
                      </div>
                    ))}

                  {actividadesOrdenadasLista.map((actividad) => {
                    const estiloTipo = obtenerEstiloPorTipo(actividad.tipo_actividad);
                    return (
                      <div 
                        key={actividad.id} 
                        onClick={() => { setBloqueSeleccionado(actividad); setVista('detallesActividad'); }} 
                        className={`p-3.5 rounded-xl border flex justify-between items-center cursor-pointer hover:shadow-md transition-all group ${estiloTipo.bg} ${estiloTipo.border} ${estiloTipo.text}`}
                      >
                        <div className="flex flex-col">
                          <h6 className="text-xs font-bold opacity-95">{actividad.titulo}</h6>
                          <p className="text-[10px] opacity-75 font-medium mt-0.5">{formatearFechaLegible(actividad.fecha)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${estiloTipo.badge}`}>
                            {actividad.tipo_actividad}
                          </span>
                          <span className="text-[10px] font-bold bg-white/70 px-2 py-0.5 rounded-md opacity-90">{actividad.hora_inicio.slice(0, 5)}</span>
                          
                          <button 
                            onClick={(e) => iniciarEdicionActividad(actividad, e)}
                            className="p-1 rounded-md hover:bg-white/70 text-slate-400 hover:text-slate-800 transition-colors ml-1"
                            title="Editar actividad"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <button onClick={() => { limpiarFormularioActividad(); setVista('agregarActividad'); }} className={`absolute bottom-4 right-6 w-12 h-12 ${estilosActuales.bg} text-white rounded-full shadow-xl flex items-center justify-center font-bold text-xl ${estilosActuales.hoverBg} transition-all transform active:scale-95 z-30`}>
                +
              </button>
            </div>
          )}

          {vista === 'agregarActividad' && (
            <div className="p-6 space-y-4 animate-fadeIn">
              <div className="flex gap-2 justify-between">
                {tiposActividad.map((t) => {
                  const seleccionado = tipoNuevaActividad === t.id;
                  return (
                    <button key={t.id} onClick={() => setTipoNuevaActividad(t.id)} className={`text-[11px] font-bold px-3 py-1.5 rounded-xl transition-all ${seleccionado ? `${estilosActuales.bg} text-white` : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                      {t.label}
                    </button>
                  );
                })}
              </div>

              <div className="space-y-3 pt-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Título de la actividad</label>
                  <input type="text" value={tituloNuevaActividad} onChange={(e) => setTituloNuevaActividad(e.target.value)} placeholder="Ej. Cálculo diferencial" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Ubicación / Aula</label>
                  <input type="text" value={ubicacionNuevaActividad} onChange={(e) => setUbicacionNuevaActividad(e.target.value)} placeholder="Ej. Aula 201" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Fecha</label>
                  <input type="date" value={fechaNuevaActividad} onChange={(e) => setFechaNuevaActividad(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Hora inicio</label>
                    <select value={horaInicioActividad} onChange={(e) => setHoraInicioActividad(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none">
                      {opcionesHoras.map((hora) => (<option key={hora} value={hora}>{hora}</option>))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Hora fin</label>
                    <select value={horaFinActividad} onChange={(e) => setHoraFinActividad(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none">
                      {opcionesHoras.map((hora) => (<option key={hora} value={hora}>{hora}</option>))}
                    </select>
                  </div>
                </div>

                {errorActividad && (
                  <p className="text-[11px] font-semibold text-rose-600 bg-rose-50 border border-rose-100 rounded-xl p-3">
                    ⚠️ {errorActividad}
                  </p>
                )}
              </div>
            </div>
          )}

          {vista === 'detallesActividad' && bloqueSeleccionado && (
            <div className="p-6 space-y-5 animate-fadeIn">
              {(() => {
                const estiloTipo = obtenerEstiloPorTipo(bloqueSeleccionado.tipo_actividad);
                return (
                  <div className={`p-5 border rounded-2xl space-y-1.5 ${estiloTipo.bg} ${estiloTipo.border} ${estiloTipo.text}`}>
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-black">{bloqueSeleccionado.titulo}</h4>
                      <span className={`text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md ${estiloTipo.badge}`}>
                        {bloqueSeleccionado.tipo_actividad}
                      </span>
                    </div>
                    <p className="text-xs font-bold opacity-90">
                      {bloqueSeleccionado.hora_inicio.slice(0, 5)} - {bloqueSeleccionado.hora_fin.slice(0, 5)}
                      {bloqueSeleccionado.ubicacion ? ` · ${bloqueSeleccionado.ubicacion}` : ''}
                    </p>
                    <p className="text-[10px] opacity-75 font-medium pt-1">{formatearFechaLegible(bloqueSeleccionado.fecha)}</p>
                  </div>
                );
              })()}
              
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={(e) => iniciarEdicionActividad(bloqueSeleccionado, e)}
                  className="py-3 bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors"
                >
                  Editar parámetros
                </button>
                <button onClick={handleEliminarActividad} className="w-full py-3 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl text-xs font-bold hover:bg-rose-100 transition-colors">
                  Eliminar actividad
                </button>
              </div>
            </div>
          )}

          {vista === 'configuracionRapida' && draftAjustes && (
            <div className="p-6 space-y-6 animate-fadeIn">
              <div>
                <h4 className="text-base font-bold text-[#2A3B50]">Ajustes del calendario</h4>
                <p className="text-xs text-slate-400 mt-0.5">Personaliza los parámetros globales de tu organizador sin perder tus eventos.</p>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl">
                <p className="text-[11px] font-semibold text-amber-700">
                  ⚠️ Recuerda presionar "Confirmar cambios" al final. Si sales con la flecha de regreso sin confirmar, tus cambios no se guardarán.
                </p>
              </div>

              {errorAjustes && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl">
                  <p className="text-[11px] font-semibold text-rose-600">❌ {errorAjustes}</p>
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">Nombre del cronograma</label>
                  <input 
                    type="text" 
                    value={draftAjustes.nombre} 
                    onChange={(e) => setDraftAjustes({ ...draftAjustes, nombre: e.target.value })} 
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none" 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500">Color principal (Pastel)</label>
                  <div className="flex gap-3 pt-1">
                    {(["blue", "purple", "emerald", "orange", "rose"] as const).map((c) => (
                      <button 
                        key={c} 
                        onClick={() => setDraftAjustes({ ...draftAjustes, color: c })} 
                        className={`w-8 h-8 rounded-full border-2 ${
                          c === 'blue' ? 'bg-blue-300' : 
                          c === 'purple' ? 'bg-purple-300' : 
                          c === 'emerald' ? 'bg-emerald-300' : 
                          c === 'orange' ? 'bg-orange-300' : 'bg-rose-300'
                        } ${draftAjustes.color === c ? 'border-slate-800 scale-110 shadow' : 'border-transparent opacity-80'}`} 
                      />
                    ))}
                  </div>
                </div>

                <div className="pt-2 space-y-2">
                  <label className="text-xs font-bold text-slate-500">Días activos en semana</label>
                  <div className="flex flex-wrap gap-1.5">
                    {["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"].map((dia) => {
                      const elegido = draftAjustes.dias.includes(dia);
                      return (
                        <button
                          key={dia}
                          onClick={() => {
                            const nuevasDias = elegido
                              ? draftAjustes.dias.filter(d => d !== dia)
                              : [...draftAjustes.dias, dia];
                            setDraftAjustes({ ...draftAjustes, dias: nuevasDias });
                          }}
                          className={`text-[11px] font-bold px-3 py-1.5 rounded-xl transition-all ${
                            elegido ? `${estilosActuales.bg} text-white shadow-sm` : 'bg-slate-50 border border-slate-200 text-slate-600'
                          }`}
                        >
                          {dia.slice(0, 3)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {['paso2', 'paso3', 'paso4', 'paso5', 'agregarActividad', 'configuracionRapida'].includes(vista) && (
          <div className="p-6 bg-white border-t border-slate-100 sm:rounded-b-[40px] z-20">
            <button
              disabled={(vista === 'agregarActividad' && guardandoActividad) || (vista === 'configuracionRapida' && guardandoAjustes)}
              onClick={async () => {
                if (vista === 'paso2') setVista('paso3');
                else if (vista === 'paso3') setVista('paso4');
                else if (vista === 'paso4') setVista('paso5');
                else if (vista === 'paso5') {
                  await procesarGuardadoConfiguracion();
                }
                else if (vista === 'agregarActividad') handleGuardarActividad();
                else if (vista === 'configuracionRapida') {
                  await procesarGuardadoConfiguracion();
                }
              }}
              className={`w-full py-3.5 ${estilosActuales.bg} ${estilosActuales.hoverBg} text-white rounded-2xl text-xs font-bold shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              {vista === 'paso5'
                ? "Crear cronograma"
                : vista === 'agregarActividad'
                ? (guardandoActividad ? "Guardando..." : (idActividadEditando ? "Guardar cambios" : "Guardar actividad"))
                : vista === 'configuracionRapida'
                ? (guardandoAjustes ? "Guardando..." : "Confirmar cambios")
                : "Continuar"}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}