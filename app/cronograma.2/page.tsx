"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// DELATE
import { deleteSelectedDay } from '@/lib/supabase/cronograma';
import { deleteSelectedActivity } from '@/lib/supabase/cronograma';
import { deleteCronogramaActivity } from '@/lib/supabase/cronograma';

// ==========================================
// INTERFACES Y CONFIGURACIÓN DE DATOS
// ==========================================
type VistaId = 'paso1' | 'paso2' | 'paso3' | 'paso4' | 'paso5' | 'vistaSemanal' | 'agregarActividad' | 'detallesActividad';
type SubVistaCalendario = 'dia' | 'mes' | 'lista';

type TipoActividad = 'Clase' | 'Estudio' | 'Tarea' | 'Examen';

interface BloqueHorario {
  id: string;
  dia: string;       // "25".."29" — coincide con el selector de fechas
  tipo: TipoActividad;
  horaInicio: string; // valor crudo tipo "07:00 a. m." (de opcionesHoras)
  horaFin: string;
  titulo: string;
  ubicacion: string;
}

const opcionesHoras = [
  "05:00 a. m.", "06:00 a. m.", "07:00 a. m.", "08:00 a. m.", "09:00 a. m.", "10:00 a. m.", "11:00 a. m.",
  "12:00 p. m.", "01:00 p. m.", "02:00 p. m.", "03:00 p. m.", "04:00 p. m.", "05:00 p. m.", "06:00 p. m.",
  "07:00 p. m.", "08:00 p. m.", "09:00 p. m.", "10:00 p. m.", "11:00 p. m."
];

const diasDemo = [
  { d: "Lun", n: "25" },
  { d: "Mar", n: "26" },
  { d: "Mié", n: "27" },
  { d: "Jue", n: "28" },
  { d: "Vie", n: "29" }
];

// Cuadrícula real de Mayo 2026 (semanas de lunes a domingo). `null` = día fuera del mes.
const SEMANAS_MAYO_2026: (number | null)[][] = [
  [null, null, null, null, 1, 2, 3],
  [4, 5, 6, 7, 8, 9, 10],
  [11, 12, 13, 14, 15, 16, 17],
  [18, 19, 20, 21, 22, 23, 24],
  [25, 26, 27, 28, 29, 30, 31],
];

const DIAS_SEMANA_CORTO = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const tiposActividad: TipoActividad[] = ["Clase", "Estudio", "Tarea", "Examen"];

const coloresPorTipo: Record<TipoActividad, string> = {
  Clase: "bg-purple-50 text-purple-700 border-purple-200",
  Estudio: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Tarea: "bg-blue-50 text-blue-700 border-blue-200",
  Examen: "bg-orange-50 text-orange-700 border-orange-200"
};

// Convierte "07:00 a. m." / "01:00 p. m." a minutos desde medianoche, para ordenar y comparar horas.
const minutosDesdeHora = (hora: string): number => {
  const match = hora.match(/^(\d{2}):(\d{2}) (a|p)\. m\.$/);
  if (!match) return 0;
  let h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const meridiano = match[3];
  if (meridiano === 'p' && h !== 12) h += 12;
  if (meridiano === 'a' && h === 12) h = 0;
  return h * 60 + m;
};

// Convierte "07:00 a. m." a formato 24h corto "07:00" para mostrar en los bloques.
const formatoHora24 = (hora: string): string => {
  const total = minutosDesdeHora(hora);
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

// ─── Persistencia de onboarding del cronograma ───────────────────────────────
// TODO: migrar a Supabase — guardar este flag en la tabla del usuario para que
// funcione entre dispositivos en vez de quedar solo en este navegador.

const CRONOGRAMA_CONFIGURADO_KEY = 'cronograma_configurado';

const esPrimeraVezCronograma = (): boolean => {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem(CRONOGRAMA_CONFIGURADO_KEY) !== 'true';
};

const marcarCronogramaConfigurado = () => {
  localStorage.setItem(CRONOGRAMA_CONFIGURADO_KEY, 'true');
};

// ─── Persistencia de actividades del cronograma ──────────────────────────────
// TODO: migrar a Supabase (insertarActividad / eliminarActividad en
// lib/supabase/cronograma) para que las actividades vivan en la base de datos
// y no solo en este navegador.

const ACTIVIDADES_KEY = 'cronograma_actividades';

const actividadesDeEjemplo: BloqueHorario[] = [
  { id: "1", dia: "27", tipo: "Clase", horaInicio: "07:00 a. m.", horaFin: "08:30 a. m.", titulo: "Cálculo diferencial", ubicacion: "Aula 201" },
  { id: "2", dia: "27", tipo: "Clase", horaInicio: "08:40 a. m.", horaFin: "10:10 a. m.", titulo: "Física I", ubicacion: "Aula 102" },
  { id: "3", dia: "27", tipo: "Estudio", horaInicio: "10:30 a. m.", horaFin: "11:30 a. m.", titulo: "Estudio personal", ubicacion: "Repaso de ejercicios" },
  { id: "4", dia: "27", tipo: "Tarea", horaInicio: "12:00 p. m.", horaFin: "01:00 p. m.", titulo: "Almuerzo", ubicacion: "Descanso y comida" },
  { id: "5", dia: "27", tipo: "Clase", horaInicio: "01:10 p. m.", horaFin: "02:40 p. m.", titulo: "Química general", ubicacion: "Laboratorio 3" }
];

const leerActividadesGuardadas = (): BloqueHorario[] => {
  if (typeof window === 'undefined') return actividadesDeEjemplo;
  const raw = localStorage.getItem(ACTIVIDADES_KEY);
  if (!raw) return actividadesDeEjemplo;
  try {
    return JSON.parse(raw) as BloqueHorario[];
  } catch {
    return actividadesDeEjemplo;
  }
};

const guardarActividadesEnStorage = (lista: BloqueHorario[]) => {
  localStorage.setItem(ACTIVIDADES_KEY, JSON.stringify(lista));
};

export default function CronogramaPage() {
  const router = useRouter();
  
  // Estado principal de navegación interna
  const [vista, setVista] = useState<VistaId>('paso1');
  const [cargando, setCargando] = useState(true);
  const [primeraVezEnEstaSesion, setPrimeraVezEnEstaSesion] = useState(true);
  
  // ESTADOS DE INTERACTIVIDAD INTERNA DEL CRONOGRAMA
  const [subVista, setSubVista] = useState<SubVistaCalendario>('dia');
  const [diaActivoNumero, setDiaActivoNumero] = useState<string>("27");

  // Estados del Formulario de Creación
  const [diasSeleccionados, setDiasSeleccionados] = useState<string[]>(["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"]);
  const [horaInicio, setHoraInicio] = useState("07:00 a. m.");
  const [horaFin, setHoraFin] = useState("10:00 p. m.");
  const [actividades, setActividades] = useState<string[]>(["Clases", "Estudio personal", "Tareas"]);
  const [nombreCronograma, setNombreCronograma] = useState("Semestre Mayo - Julio 2026");
  
  // Color Dinámico elegido por el usuario
  const [colorCronograma, setColorCronograma] = useState<"blue" | "purple" | "emerald" | "orange" | "rose">("blue");
  const [recordatorios, setRecordatorios] = useState(true);

  // Estados para añadir/ver detalles
  const [bloqueSeleccionado, setBloqueSeleccionado] = useState<BloqueHorario | null>(null);

  // Actividades reales del cronograma (antes eran datos fijos de ejemplo)
  const [actividadesGuardadas, setActividadesGuardadas] = useState<BloqueHorario[]>([]);

  // Estados del formulario para agregar una nueva actividad
  const [tipoNuevo, setTipoNuevo] = useState<TipoActividad>("Clase");
  const [tituloNuevo, setTituloNuevo] = useState("");
  const [ubicacionNuevo, setUbicacionNuevo] = useState("");
  const [horaInicioNuevo, setHoraInicioNuevo] = useState("07:00 a. m.");
  const [horaFinNuevo, setHoraFinNuevo] = useState("08:00 a. m.");
  const [diaNuevo, setDiaNuevo] = useState("27");
  const [errorNuevaActividad, setErrorNuevaActividad] = useState<string | null>(null);
  const [actividadEditando, setActividadEditando] = useState<BloqueHorario | null>(null);

  // Diccionario de estilos dinámicos basados en la selección de color
  const mapaEstilos = {
    blue: { bg: "bg-blue-500", hoverBg: "hover:bg-blue-600", text: "text-blue-500", bgLight: "bg-blue-50", border: "border-blue-500" },
    purple: { bg: "bg-purple-500", hoverBg: "hover:bg-purple-600", text: "text-purple-500", bgLight: "bg-purple-50", border: "border-purple-500" },
    emerald: { bg: "bg-emerald-500", hoverBg: "hover:bg-emerald-600", text: "text-emerald-500", bgLight: "bg-emerald-50", border: "border-emerald-500" },
    orange: { bg: "bg-orange-500", hoverBg: "hover:bg-orange-600", text: "text-orange-500", bgLight: "bg-orange-50", border: "border-orange-500" },
    rose: { bg: "bg-rose-500", hoverBg: "hover:bg-rose-600", text: "text-rose-500", bgLight: "bg-rose-50", border: "border-rose-500" }
  };

  const estilosActuales = mapaEstilos[colorCronograma];

  // ─── Al montar: decide si mostrar el onboarding o ir directo al cronograma ──

  useEffect(() => {
    const esPrimeraVez = esPrimeraVezCronograma();
    setPrimeraVezEnEstaSesion(esPrimeraVez);
    setVista(esPrimeraVez ? 'paso1' : 'vistaSemanal');
    setActividadesGuardadas(leerActividadesGuardadas());
    setCargando(false);
  }, []);

  // Actividades del día seleccionado, ordenadas por hora de inicio
  const actividadesDelDia = actividadesGuardadas
    .filter(a => a.dia === diaActivoNumero)
    .sort((a, b) => minutosDesdeHora(a.horaInicio) - minutosDesdeHora(b.horaInicio));

  // Todas las actividades, ordenadas por día y luego por hora (para la vista de lista)
  const actividadesOrdenadas = [...actividadesGuardadas].sort((a, b) => {
    if (a.dia !== b.dia) return a.dia.localeCompare(b.dia);
    return minutosDesdeHora(a.horaInicio) - minutosDesdeHora(b.horaInicio);
  });

  const guardarActividad = () => {
    if (!tituloNuevo.trim()) {
      setErrorNuevaActividad('Ponle un título a la actividad.');
      return;
    }
    if (minutosDesdeHora(horaFinNuevo) <= minutosDesdeHora(horaInicioNuevo)) {
      setErrorNuevaActividad('La hora de fin debe ser después de la hora de inicio.');
      return;
    }

    if (actividadEditando) {
      // Editando una actividad existente
      const actualizadas = actividadesGuardadas.map((a) =>
        a.id === actividadEditando.id
          ? {
              ...a,
              dia: diaNuevo,
              tipo: tipoNuevo,
              horaInicio: horaInicioNuevo,
              horaFin: horaFinNuevo,
              titulo: tituloNuevo.trim(),
              ubicacion: ubicacionNuevo.trim(),
            }
          : a
      );
      setActividadesGuardadas(actualizadas);
      guardarActividadesEnStorage(actualizadas);
      setBloqueSeleccionado(actualizadas.find((a) => a.id === actividadEditando.id) ?? null);
      setErrorNuevaActividad(null);
      setActividadEditando(null);
      setDiaActivoNumero(diaNuevo);
      setVista('detallesActividad');
    } else {
      // Creando una actividad nueva
      const nueva: BloqueHorario = {
        id: Date.now().toString(),
        dia: diaNuevo,
        tipo: tipoNuevo,
        horaInicio: horaInicioNuevo,
        horaFin: horaFinNuevo,
        titulo: tituloNuevo.trim(),
        ubicacion: ubicacionNuevo.trim(),
      };
      const actualizadas = [...actividadesGuardadas, nueva];
      setActividadesGuardadas(actualizadas);
      guardarActividadesEnStorage(actualizadas);
      setErrorNuevaActividad(null);
      setTituloNuevo('');
      setUbicacionNuevo('');
      setTipoNuevo('Clase');
      setDiaActivoNumero(diaNuevo);
      setVista('vistaSemanal');
    }
  };

  const abrirEdicionActividad = () => {
    if (!bloqueSeleccionado) return;
    setActividadEditando(bloqueSeleccionado);
    setTipoNuevo(bloqueSeleccionado.tipo);
    setTituloNuevo(bloqueSeleccionado.titulo);
    setUbicacionNuevo(bloqueSeleccionado.ubicacion);
    setHoraInicioNuevo(bloqueSeleccionado.horaInicio);
    setHoraFinNuevo(bloqueSeleccionado.horaFin);
    setDiaNuevo(bloqueSeleccionado.dia);
    setErrorNuevaActividad(null);
    setVista('agregarActividad');
  };

  const eliminarActividadSeleccionada = () => {
    if (!bloqueSeleccionado) return;
    const actualizadas = actividadesGuardadas.filter(a => a.id !== bloqueSeleccionado.id);
    setActividadesGuardadas(actualizadas);
    guardarActividadesEnStorage(actualizadas);
    setBloqueSeleccionado(null);
    setVista('vistaSemanal');
  };

  const manejarFlechaAtras = () => {
    switch (vista) {
      case 'paso1': router.push('/home.2'); break;
      case 'paso2': setVista('paso1'); break;
      case 'paso3': setVista('paso2'); break;
      case 'paso4': setVista('paso3'); break;
      case 'paso5': setVista('paso4'); break;
      case 'vistaSemanal':
        if (primeraVezEnEstaSesion) {
          setVista('paso5');
        } else {
          router.push('/home.2');
        }
        break;
      case 'agregarActividad':
        setTituloNuevo(''); setUbicacionNuevo(''); setTipoNuevo('Clase'); setErrorNuevaActividad(null);
        if (actividadEditando) {
          setActividadEditando(null);
          setVista('detallesActividad');
        } else {
          setVista('vistaSemanal');
        }
        break;
      case 'detallesActividad': setVista('vistaSemanal'); break;
      default: router.push('/home.2');
    }
  };

  const toggleSelection = (item: string, list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-0 sm:p-4 font-sans selection:bg-slate-200">
      
      {/* Contenedor Base Estilo Dispositivo */}
      <div className="w-full max-w-md h-screen sm:h-[850px] bg-white shadow-2xl flex flex-col justify-between relative sm:rounded-[40px] border border-gray-100 overflow-hidden pb-4">
        
        {/* HEADER DE LA PANTALLA */}
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
            {vista === 'agregarActividad' && (actividadEditando ? "Editar actividad" : "Agregar actividad")}
            {vista === 'detallesActividad' && "Detalles de actividad"}
          </h3>
          
          <div className="w-5 h-5 text-slate-400 text-[10px] flex items-center justify-center border border-slate-300 rounded-full font-bold select-none">
            i
          </div>
        </div>

        {/* LÍNEA DE PROGRESO */}
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

        {/* ÁREA DE CONTENIDO VARIABLE */}
        <div className="flex-1 overflow-y-auto bg-white custom-scrollbar">

          {/* PANTALLA 1: INICIO */}
          {vista === 'paso1' && (
            <div className="p-6 space-y-6 animate-fadeIn">
              <div className="text-center space-y-2 py-4">
                <div className="w-44 h-44 bg-[#F0F4F8] rounded-3xl mx-auto flex items-center justify-center text-7xl shadow-inner">📅</div>
                <p className="text-xs font-semibold text-[#8C9BAE] max-w-xs mx-auto leading-relaxed pt-2">
                  Organiza tu semana y cumple tus metas con equilibrio.
                </p>
              </div>
              <div className="space-y-2.5">
                {[
                  { icon: "📉", text: "Planifica tus clases y tareas" },
                  { icon: "⏰", text: "Establece recordatorios" },
                  { icon: "📊", text: "Visualiza tu progreso" },
                  { icon: "🧘", text: "Reduce el estrés académico" }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-3.5 bg-slate-50 border border-slate-100 rounded-2xl">
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-xs font-bold text-slate-700">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PANTALLA 2: SELECCIÓN DE DÍAS */}
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

          {/* PANTALLA 3: RANGO DE HORARIOS (CON COMPONENTES CORREGIDOS) */}
          {vista === 'paso3' && (
            <div className="p-6 space-y-5 animate-fadeIn">
              <div>
                <h4 className="text-base font-bold text-[#2A3B50]">¿A qué hora inician y terminan tus actividades?</h4>
                <p className="text-xs text-slate-400 mt-0.5">Define el rango de horas para tu día.</p>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">Hora de inicio</label>
                  <div className={`flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1 shadow-sm focus-within:ring-1 focus-within:${estilosActuales.border}`}>
                    <span className="text-base select-none mr-2">🕒</span>
                    <select 
                      value={horaInicio}
                      onChange={(e) => setHoraInicio(e.target.value)}
                      className="w-full py-2.5 bg-transparent text-xs text-slate-700 font-bold focus:outline-none cursor-pointer appearance-none"
                    >
                      {opcionesHoras.map((hora) => (
                        <option key={hora} value={hora}>{hora}</option>
                      ))}
                    </select>
                    <span className="text-[9px] text-slate-400 ml-2 select-none">▼</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">Hora de finalización</label>
                  <div className={`flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1 shadow-sm focus-within:ring-1 focus-within:${estilosActuales.border}`}>
                    <span className="text-base select-none mr-2">🌙</span>
                    <select 
                      value={horaFin}
                      onChange={(e) => setHoraFin(e.target.value)}
                      className="w-full py-2.5 bg-transparent text-xs text-slate-700 font-bold focus:outline-none cursor-pointer appearance-none"
                    >
                      {opcionesHoras.map((hora) => (
                        <option key={hora} value={hora}>{hora}</option>
                      ))}
                    </select>
                    <span className="text-[9px] text-slate-400 ml-2 select-none">▼</span>
                  </div>
                </div>
              </div>

              <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-4 flex gap-3 text-xs mt-4">
                <span className="text-lg">💡</span>
                <div>
                  <p className="font-bold text-indigo-950">Recomendación</p>
                  <p className="text-indigo-800/90 leading-relaxed mt-0.5">Planificar bloques de 50 min y descansos de 10 min mejora tu concentración y rendimiento.</p>
                </div>
              </div>
            </div>
          )}

          {/* PANTALLA 4: TIPOS DE ACTIVIDADES */}
          {vista === 'paso4' && (
            <div className="p-6 space-y-4 animate-fadeIn">
              <div>
                <h4 className="text-base font-bold text-[#2A3B50]">¿Qué actividades quieres agregar?</h4>
                <p className="text-xs text-slate-400 mt-0.5">Puedes agregar clases, estudio, tareas y más.</p>
              </div>
              <div className="space-y-2">
                {[
                  { name: "Clases", icon: "🏫" },
                  { name: "Estudio personal", icon: "📖" },
                  { name: "Tareas", icon: "📝" },
                  { name: "Exámenes", icon: "🎯" },
                  { name: "Lectura", icon: "📚" },
                  { name: "Actividad personal", icon: "🏃" }
                ].map((act) => {
                  const seleccionado = actividades.includes(act.name);
                  return (
                    <button key={act.name} onClick={() => toggleSelection(act.name, actividades, setActividades)} className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-xs font-bold transition-all ${seleccionado ? `${estilosActuales.bgLight} ${estilosActuales.border} ${estilosActuales.text}` : 'border-slate-100 bg-white shadow-sm'}`}>
                      <div className="flex items-center gap-3"><span>{act.icon}</span><span>{act.name}</span></div>
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${seleccionado ? `${estilosActuales.bg} ${estilosActuales.border} text-white` : 'border-slate-300'}`}>
                        {seleccionado && <span className="text-[10px]">✓</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* PANTALLA 5: NOMBRE Y PREFERENCIAS */}
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
                      <button key={c} onClick={() => setColorCronograma(c)} className={`w-7 h-7 rounded-full border-2 ${c === 'blue' ? 'bg-blue-500' : c === 'purple' ? 'bg-purple-500' : c === 'emerald' ? 'bg-emerald-500' : c === 'orange' ? 'bg-orange-400' : 'bg-rose-400'} ${colorCronograma === c ? 'border-slate-800 scale-110 shadow' : 'border-transparent opacity-80'}`} />
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

          {/* PANTALLA 6: CRONOGRAMA INTERACTIVO (SIN BARRA INFERIOR) */}
          {vista === 'vistaSemanal' && (
            <div className="animate-fadeIn relative pb-16">
              
              {/* TABS SUPERIORES TOTALMENTE INTERACTIVOS (Día / Mes / Lista) */}
              <div className="px-6 pt-3 flex justify-between items-center bg-slate-50/60 pb-3 border-b border-slate-100">
                <div className="flex bg-slate-200/70 p-1 rounded-xl w-full max-w-[240px]">
                  <button 
                    onClick={() => setSubVista('dia')}
                    className={`flex-1 text-center text-[11px] font-bold py-1.5 rounded-lg transition-all ${subVista === 'dia' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Día
                  </button>
                  <button 
                    onClick={() => setSubVista('mes')}
                    className={`flex-1 text-center text-[11px] font-bold py-1.5 rounded-lg transition-all ${subVista === 'mes' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Mes
                  </button>
                  <button 
                    onClick={() => setSubVista('lista')}
                    className={`flex-1 text-center text-[11px] font-bold py-1.5 rounded-lg transition-all ${subVista === 'lista' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Lista
                  </button>
                </div>
                <span className={`text-xs font-bold ${estilosActuales.text} ${estilosActuales.bgLight} px-3 py-1 rounded-lg`}>Mayo</span>
              </div>

              {/* RENDERIZADO CONDICIONAL SEGÚN LA SUB-VISTA SELECCIONADA */}
              {subVista === 'dia' && (
                <>
                  {/* SELECTOR DE FECHAS DE ABAJO INTERACTIVO */}
                  <div className="px-6 py-3 flex justify-between border-b border-slate-100 bg-white">
                    {diasDemo.map((day) => {
                      const esDiaActivo = diaActivoNumero === day.n;
                      const tieneActividades = actividadesGuardadas.some(a => a.dia === day.n);
                      return (
                        <button 
                          key={day.n} 
                          onClick={() => setDiaActivoNumero(day.n)}
                          className={`relative flex flex-col items-center p-2 rounded-xl w-12 transition-all ${esDiaActivo ? `${estilosActuales.bg} text-white shadow-md scale-105` : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                          <span className="text-[10px] font-bold">{day.d}</span>
                          <span className="text-xs font-black mt-0.5">{day.n}</span>
                          {tieneActividades && !esDiaActivo && (
                            <span className={`absolute bottom-1 w-1 h-1 rounded-full ${estilosActuales.bg}`} />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Bloques Horarios Principales */}
                  <div className="p-6 space-y-4 relative">
                    <p className="text-[10px] font-bold text-slate-400 mb-1">Mostrando actividades del día {diaActivoNumero} de Mayo</p>
                    {actividadesDelDia.length === 0 && (
                      <div className="text-center pt-10 space-y-2">
                        <span className="text-3xl">🗓️</span>
                        <p className="text-xs text-slate-400">No tienes actividades este día.</p>
                      </div>
                    )}
                    {actividadesDelDia.map((bloque) => (
                      <div key={bloque.id} onClick={() => { setBloqueSeleccionado(bloque); setVista('detallesActividad'); }} className="flex gap-4 items-start cursor-pointer group">
                        <span className="text-xs font-bold text-slate-400 pt-1 w-10">{formatoHora24(bloque.horaInicio)}</span>
                        <div className={`flex-1 p-3.5 border-l-4 rounded-xl border transition-all group-hover:shadow-md ${coloresPorTipo[bloque.tipo]}`}>
                          <h5 className="text-xs font-bold">{bloque.titulo}</h5>
                          <p className="text-[10px] opacity-80 mt-0.5 font-medium">
                            {bloque.ubicacion ? `${bloque.ubicacion} ` : ''}({formatoHora24(bloque.horaInicio)} - {formatoHora24(bloque.horaFin)})
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {subVista === 'mes' && (
                <div className="p-6 space-y-3 animate-fadeIn">
                  <div className="grid grid-cols-7 gap-1 text-center">
                    {DIAS_SEMANA_CORTO.map((d) => (
                      <span key={d} className="text-[9px] font-bold text-slate-400">{d}</span>
                    ))}
                  </div>
                  <div className="space-y-1">
                    {SEMANAS_MAYO_2026.map((semana, i) => (
                      <div key={i} className="grid grid-cols-7 gap-1">
                        {semana.map((dia, j) => {
                          if (dia === null) return <div key={j} />;
                          const diaStr = dia.toString();
                          const esSeleccionable = diasDemo.some((d) => d.n === diaStr);
                          const tieneActividades = actividadesGuardadas.some((a) => a.dia === diaStr);
                          const esActivo = esSeleccionable && diaActivoNumero === diaStr;
                          return (
                            <button
                              key={j}
                              type="button"
                              disabled={!esSeleccionable}
                              onClick={() => { setDiaActivoNumero(diaStr); setSubVista('dia'); }}
                              className={`relative aspect-square rounded-lg flex items-center justify-center text-[11px] font-bold transition-all
                                ${esActivo
                                  ? `${estilosActuales.bg} text-white shadow-md`
                                  : esSeleccionable
                                    ? 'text-slate-700 hover:bg-slate-100 cursor-pointer'
                                    : 'text-slate-300 cursor-default'}`}
                            >
                              {dia}
                              {tieneActividades && !esActivo && (
                                <span className={`absolute bottom-1 w-1 h-1 rounded-full ${estilosActuales.bg}`} />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-400 text-center pt-2">
                    Por ahora el cronograma admite actividades de lunes 25 a viernes 29 de mayo. Toca un día con punto para ver sus actividades.
                  </p>
                </div>
              )}

              {subVista === 'lista' && (
                <div className="p-6 space-y-3 animate-fadeIn">
                  <p className="text-[10px] font-bold text-slate-400">Próximos eventos en formato lista</p>
                  {actividadesOrdenadas.length === 0 && (
                    <div className="text-center pt-10 space-y-2">
                      <span className="text-3xl">🗓️</span>
                      <p className="text-xs text-slate-400">Aún no has agregado actividades.</p>
                    </div>
                  )}
                  {actividadesOrdenadas.map((bloque) => (
                    <div
                      key={bloque.id}
                      onClick={() => { setBloqueSeleccionado(bloque); setDiaActivoNumero(bloque.dia); setVista('detallesActividad'); }}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center cursor-pointer hover:border-slate-300 transition-colors"
                    >
                      <div>
                        <h6 className="text-xs font-bold text-slate-800">{bloque.titulo}</h6>
                        <p className="text-[10px] text-slate-400">{bloque.ubicacion || bloque.tipo} · Día {bloque.dia} de Mayo</p>
                      </div>
                      <span className="text-[11px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-md shadow-sm">{formatoHora24(bloque.horaInicio)}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* BOTÓN FLOTANTE "+" ADAPTATIVO AL COLOR */}
              <button
                onClick={() => {
                  setActividadEditando(null);
                  setDiaNuevo(diaActivoNumero);
                  setTipoNuevo('Clase');
                  setTituloNuevo('');
                  setUbicacionNuevo('');
                  setHoraInicioNuevo('07:00 a. m.');
                  setHoraFinNuevo('08:00 a. m.');
                  setErrorNuevaActividad(null);
                  setVista('agregarActividad');
                }}
                className={`absolute bottom-4 right-6 w-12 h-12 ${estilosActuales.bg} text-white rounded-full shadow-xl flex items-center justify-center font-bold text-xl ${estilosActuales.hoverBg} transition-all transform active:scale-95 z-30`}
              >
                +
              </button>
            </div>
          )}

          {/* PANTALLA 9: AGREGAR ACTIVIDAD */}
          {vista === 'agregarActividad' && (
            <div className="p-6 space-y-4 animate-fadeIn">
              {/* Tipo de actividad */}
              <div className="flex gap-2 justify-between">
                {tiposActividad.map((t) => {
                  const elegido = tipoNuevo === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTipoNuevo(t)}
                      className={`flex-1 text-[11px] font-bold px-2 py-1.5 rounded-xl border transition-colors ${elegido ? coloresPorTipo[t] : 'bg-slate-100 text-slate-600 border-transparent hover:bg-slate-200'}`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>

              {/* Día de la actividad */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">Día</label>
                <div className="flex justify-between">
                  {diasDemo.map((day) => {
                    const elegido = diaNuevo === day.n;
                    return (
                      <button
                        key={day.n}
                        type="button"
                        onClick={() => setDiaNuevo(day.n)}
                        className={`flex flex-col items-center p-2 rounded-xl w-12 transition-all ${elegido ? `${estilosActuales.bg} text-white shadow-md scale-105` : 'text-slate-600 hover:bg-slate-50 bg-slate-50'}`}
                      >
                        <span className="text-[10px] font-bold">{day.d}</span>
                        <span className="text-xs font-black mt-0.5">{day.n}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3 pt-1">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Título de la actividad</label>
                  <input
                    type="text"
                    value={tituloNuevo}
                    onChange={(e) => setTituloNuevo(e.target.value)}
                    placeholder="Ej. Cálculo diferencial"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Ubicación / Aula</label>
                  <input
                    type="text"
                    value={ubicacionNuevo}
                    onChange={(e) => setUbicacionNuevo(e.target.value)}
                    placeholder="Ej. Aula 201"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Hora de inicio</label>
                    <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1">
                      <select
                        value={horaInicioNuevo}
                        onChange={(e) => setHoraInicioNuevo(e.target.value)}
                        className="w-full py-2.5 bg-transparent text-xs text-slate-700 font-bold focus:outline-none cursor-pointer appearance-none"
                      >
                        {opcionesHoras.map((hora) => (
                          <option key={hora} value={hora}>{hora}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Hora de fin</label>
                    <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1">
                      <select
                        value={horaFinNuevo}
                        onChange={(e) => setHoraFinNuevo(e.target.value)}
                        className="w-full py-2.5 bg-transparent text-xs text-slate-700 font-bold focus:outline-none cursor-pointer appearance-none"
                      >
                        {opcionesHoras.map((hora) => (
                          <option key={hora} value={hora}>{hora}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {errorNuevaActividad && (
                  <div className="bg-rose-50 border border-rose-200 rounded-2xl px-4 py-3 text-xs text-rose-700 font-medium text-center">
                    {errorNuevaActividad}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PANTALLA 10: DETALLES DE ACTIVIDAD */}
          {vista === 'detallesActividad' && bloqueSeleccionado && (
            <div className="p-6 space-y-5 animate-fadeIn">
              <div className={`p-5 rounded-2xl space-y-1 border ${coloresPorTipo[bloqueSeleccionado.tipo]}`}>
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">{bloqueSeleccionado.tipo}</span>
                <h4 className="text-sm font-black">{bloqueSeleccionado.titulo}</h4>
                {bloqueSeleccionado.ubicacion && (
                  <p className="text-xs font-bold opacity-90">{bloqueSeleccionado.ubicacion}</p>
                )}
                <p className="text-[10px] opacity-80 font-medium pt-1">
                  Día {bloqueSeleccionado.dia} de Mayo · {formatoHora24(bloqueSeleccionado.horaInicio)} - {formatoHora24(bloqueSeleccionado.horaFin)}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={abrirEdicionActividad}
                  className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                  </svg>
                  Editar
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('¿Seguro que quieres eliminar esta actividad?')) {
                      eliminarActividadSeleccionada();
                    }
                  }}
                  className="flex-1 py-3 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl text-xs font-bold hover:bg-rose-100 transition-colors"
                >
                  Eliminar actividad
                </button>
              </div>
            </div>
          )}

        </div>

        {/* BOTÓN CONTINUAR/GUARDAR INFERIOR (Solo en pasos de configuración o formularios) */}
        {vista !== 'vistaSemanal' && vista !== 'detallesActividad' && (
          <div className="p-6 bg-white border-t border-slate-100 sm:rounded-b-[40px] z-20">
            <button
              onClick={() => {
                if (vista === 'paso1') setVista('paso2');
                else if (vista === 'paso2') setVista('paso3');
                else if (vista === 'paso3') setVista('paso4');
                else if (vista === 'paso4') setVista('paso5');
                else if (vista === 'paso5') { marcarCronogramaConfigurado(); setVista('vistaSemanal'); }
                else if (vista === 'agregarActividad') guardarActividad();
              }}
              className={`w-full py-3.5 ${estilosActuales.bg} ${estilosActuales.hoverBg} text-white rounded-2xl text-xs font-bold shadow-sm transition-all`}
            >
              {vista === 'paso1' ? "Crear mi cronograma" : vista === 'paso5' ? "Crear cronograma" : vista === 'agregarActividad' ? (actividadEditando ? "Guardar cambios" : "Guardar actividad") : "Continuar"}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}