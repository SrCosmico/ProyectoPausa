"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { deleteSelectedDay } from '@/lib/supabase/cronograma';
import { deleteSelectedActivity } from '@/lib/supabase/cronograma';
import { deleteCronogramaActivity } from '@/lib/supabase/cronograma';

// ==========================================
// INTERFACES Y CONFIGURACIÓN
// ==========================================
type VistaId = 'paso1' | 'paso2' | 'paso3' | 'paso4' | 'paso5' | 'vistaSemanal' | 'agregarActividad' | 'detallesActividad';
type SubVistaCalendario = 'dia' | 'mes' | 'lista';
type TipoActividad = 'Clase' | 'Estudio' | 'Tarea' | 'Examen';

interface BloqueHorario {
  id: string;
  // Ahora el día es una fecha completa ISO "YYYY-MM-DD" para soportar múltiples meses
  fecha: string;
  tipo: TipoActividad;
  horaInicio: string;
  horaFin: string;
  titulo: string;
  ubicacion: string;
}

const opcionesHoras = [
  "05:00 a. m.", "06:00 a. m.", "07:00 a. m.", "08:00 a. m.", "09:00 a. m.", "10:00 a. m.", "11:00 a. m.",
  "12:00 p. m.", "01:00 p. m.", "02:00 p. m.", "03:00 p. m.", "04:00 p. m.", "05:00 p. m.", "06:00 p. m.",
  "07:00 p. m.", "08:00 p. m.", "09:00 p. m.", "10:00 p. m.", "11:00 p. m."
];

const DIAS_SEMANA_CORTO = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const MESES_NOMBRE = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

const tiposActividad: TipoActividad[] = ["Clase", "Estudio", "Tarea", "Examen"];

const coloresPorTipo: Record<TipoActividad, string> = {
  Clase:   "bg-purple-50 text-purple-700 border-purple-200",
  Estudio: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Tarea:   "bg-blue-50 text-blue-700 border-blue-200",
  Examen:  "bg-orange-50 text-orange-700 border-orange-200",
};

const dotColorPorTipo: Record<TipoActividad, string> = {
  Clase:   "bg-purple-400",
  Estudio: "bg-emerald-400",
  Tarea:   "bg-blue-400",
  Examen:  "bg-orange-400",
};

// ─── Utilidades de hora ──────────────────────────────────────────────────────

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

const formatoHora24 = (hora: string): string => {
  const total = minutosDesdeHora(hora);
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

// ─── Utilidades de calendario ────────────────────────────────────────────────

/** Devuelve la cuadrícula del mes (lunes→domingo). Cada semana es array de 7: Date | null */
const calcularSemanasMes = (year: number, month: number): (Date | null)[][] => {
  const primerDia = new Date(year, month, 1);
  // getDay(): 0=Dom … 6=Sáb → convertir a lunes=0
  const offsetLunes = (primerDia.getDay() + 6) % 7;
  const diasEnMes = new Date(year, month + 1, 0).getDate();

  const celdas: (Date | null)[] = [
    ...Array(offsetLunes).fill(null),
    ...Array.from({ length: diasEnMes }, (_, i) => new Date(year, month, i + 1)),
  ];
  // Rellenar hasta múltiplo de 7
  while (celdas.length % 7 !== 0) celdas.push(null);

  const semanas: (Date | null)[][] = [];
  for (let i = 0; i < celdas.length; i += 7) semanas.push(celdas.slice(i, i + 7));
  return semanas;
};

const fechaISO = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const hoy = new Date();
const HOY_ISO = fechaISO(hoy);

// ─── Actividades de ejemplo (con fecha ISO) ──────────────────────────────────

const actividadesDeEjemplo: BloqueHorario[] = [
  { id: "1", fecha: "2026-05-27", tipo: "Clase",   horaInicio: "07:00 a. m.", horaFin: "08:30 a. m.", titulo: "Cálculo diferencial", ubicacion: "Aula 201" },
  { id: "2", fecha: "2026-05-27", tipo: "Clase",   horaInicio: "08:40 a. m.", horaFin: "10:10 a. m.", titulo: "Física I",             ubicacion: "Aula 102" },
  { id: "3", fecha: "2026-05-27", tipo: "Estudio", horaInicio: "10:30 a. m.", horaFin: "11:30 a. m.", titulo: "Estudio personal",    ubicacion: "Repaso de ejercicios" },
  { id: "4", fecha: "2026-05-27", tipo: "Tarea",   horaInicio: "12:00 p. m.", horaFin: "01:00 p. m.", titulo: "Almuerzo",            ubicacion: "Descanso y comida" },
  { id: "5", fecha: "2026-05-27", tipo: "Clase",   horaInicio: "01:10 p. m.", horaFin: "02:40 p. m.", titulo: "Química general",    ubicacion: "Laboratorio 3" },
  { id: "6", fecha: "2026-05-29", tipo: "Examen",  horaInicio: "09:00 a. m.", horaFin: "11:00 a. m.", titulo: "Examen parcial Física", ubicacion: "Aula Magna" },
];

// ─── Persistencia localStorage ───────────────────────────────────────────────

const CRONOGRAMA_CONFIGURADO_KEY = 'cronograma_configurado';
const ACTIVIDADES_KEY = 'cronograma_actividades_v2'; // v2 para no mezclar con datos viejos

const esPrimeraVezCronograma = (): boolean => {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem(CRONOGRAMA_CONFIGURADO_KEY) !== 'true';
};
const marcarCronogramaConfigurado = () => localStorage.setItem(CRONOGRAMA_CONFIGURADO_KEY, 'true');

const leerActividadesGuardadas = (): BloqueHorario[] => {
  if (typeof window === 'undefined') return actividadesDeEjemplo;
  const raw = localStorage.getItem(ACTIVIDADES_KEY);
  if (!raw) return actividadesDeEjemplo;
  try { return JSON.parse(raw) as BloqueHorario[]; } catch { return actividadesDeEjemplo; }
};
const guardarActividadesEnStorage = (lista: BloqueHorario[]) =>
  localStorage.setItem(ACTIVIDADES_KEY, JSON.stringify(lista));

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

export default function CronogramaPage() {
  const router = useRouter();

  const [vista, setVista] = useState<VistaId>('paso1');
  const [cargando, setCargando] = useState(true);
  const [primeraVezEnEstaSesion, setPrimeraVezEnEstaSesion] = useState(true);

  // Calendario
  const [subVista, setSubVista] = useState<SubVistaCalendario>('dia');
  const [mesActual, setMesActual] = useState({ year: hoy.getFullYear(), month: hoy.getMonth() });
  const [pickerAbierto, setPickerAbierto] = useState(false);
  const [pickerYear, setPickerYear] = useState(hoy.getFullYear());
  const [fechaActiva, setFechaActiva] = useState<string>(HOY_ISO);

  // Onboarding
  const [diasSeleccionados, setDiasSeleccionados] = useState<string[]>(["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"]);
  const [horaInicio, setHoraInicio] = useState("07:00 a. m.");
  const [horaFin, setHoraFin] = useState("10:00 p. m.");
  const [actividades, setActividades] = useState<string[]>(["Clases", "Estudio personal", "Tareas"]);
  const [nombreCronograma, setNombreCronograma] = useState("Semestre Mayo - Julio 2026");
  const [colorCronograma, setColorCronograma] = useState<"blue" | "purple" | "emerald" | "orange" | "rose">("blue");
  const [recordatorios, setRecordatorios] = useState(true);

  // Actividades
  const [actividadesGuardadas, setActividadesGuardadas] = useState<BloqueHorario[]>([]);
  const [bloqueSeleccionado, setBloqueSeleccionado] = useState<BloqueHorario | null>(null);

  // Formulario nueva actividad
  const [tipoNuevo, setTipoNuevo] = useState<TipoActividad>("Clase");
  const [tituloNuevo, setTituloNuevo] = useState("");
  const [ubicacionNuevo, setUbicacionNuevo] = useState("");
  const [horaInicioNuevo, setHoraInicioNuevo] = useState("07:00 a. m.");
  const [horaFinNuevo, setHoraFinNuevo] = useState("08:00 a. m.");
  const [fechaNueva, setFechaNueva] = useState<string>(HOY_ISO);
  const [errorNuevaActividad, setErrorNuevaActividad] = useState<string | null>(null);
  const [actividadEditando, setActividadEditando] = useState<BloqueHorario | null>(null);

  // Estilos dinámicos
  const mapaEstilos = {
    blue:    { bg: "bg-blue-500",    hoverBg: "hover:bg-blue-600",    text: "text-blue-500",    bgLight: "bg-blue-50",    border: "border-blue-500",    dot: "bg-blue-500" },
    purple:  { bg: "bg-purple-500",  hoverBg: "hover:bg-purple-600",  text: "text-purple-500",  bgLight: "bg-purple-50",  border: "border-purple-500",  dot: "bg-purple-500" },
    emerald: { bg: "bg-emerald-500", hoverBg: "hover:bg-emerald-600", text: "text-emerald-500", bgLight: "bg-emerald-50", border: "border-emerald-500", dot: "bg-emerald-500" },
    orange:  { bg: "bg-orange-500",  hoverBg: "hover:bg-orange-600",  text: "text-orange-500",  bgLight: "bg-orange-50",  border: "border-orange-500",  dot: "bg-orange-500" },
    rose:    { bg: "bg-rose-500",    hoverBg: "hover:bg-rose-600",    text: "text-rose-500",    bgLight: "bg-rose-50",    border: "border-rose-500",    dot: "bg-rose-500" },
  };
  const estilos = mapaEstilos[colorCronograma];

  // ─── Init ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    const esPrimera = esPrimeraVezCronograma();
    setPrimeraVezEnEstaSesion(esPrimera);
    setVista(esPrimera ? 'paso1' : 'vistaSemanal');
    setActividadesGuardadas(leerActividadesGuardadas());
    // Sincronizar mes actual con hoy
    setMesActual({ year: hoy.getFullYear(), month: hoy.getMonth() });
    setFechaActiva(HOY_ISO);
    setFechaNueva(HOY_ISO);
    setCargando(false);
  }, []);

  // ─── Semanas del mes actual ───────────────────────────────────────────────

  const semanasMes = useMemo(
    () => calcularSemanasMes(mesActual.year, mesActual.month),
    [mesActual]
  );

  // Días de la semana que contiene la fecha activa (para la barra de día)
  const diasBarraDia = useMemo(() => {
    const d = new Date(fechaActiva + 'T00:00:00');
    const dow = (d.getDay() + 6) % 7; // lunes=0
    const lunes = new Date(d);
    lunes.setDate(d.getDate() - dow);
    return Array.from({ length: 7 }, (_, i) => {
      const dd = new Date(lunes);
      dd.setDate(lunes.getDate() + i);
      return dd;
    });
  }, [fechaActiva]);

  // ─── Actividades filtradas ────────────────────────────────────────────────

  const actividadesDelDia = useMemo(() =>
    actividadesGuardadas
      .filter(a => a.fecha === fechaActiva)
      .sort((a, b) => minutosDesdeHora(a.horaInicio) - minutosDesdeHora(b.horaInicio)),
    [actividadesGuardadas, fechaActiva]
  );

  const actividadesOrdenadas = useMemo(() =>
    [...actividadesGuardadas].sort((a, b) => {
      if (a.fecha !== b.fecha) return a.fecha.localeCompare(b.fecha);
      return minutosDesdeHora(a.horaInicio) - minutosDesdeHora(b.horaInicio);
    }),
    [actividadesGuardadas]
  );

  // Set de fechas con actividades (para puntos en calendario)
  const fechasConActividad = useMemo(() =>
    new Set(actividadesGuardadas.map(a => a.fecha)),
    [actividadesGuardadas]
  );

  // Tipos de actividades en una fecha (para dots de colores)
  const tiposPorFecha = useMemo(() => {
    const map: Record<string, Set<TipoActividad>> = {};
    actividadesGuardadas.forEach(a => {
      if (!map[a.fecha]) map[a.fecha] = new Set();
      map[a.fecha].add(a.tipo);
    });
    return map;
  }, [actividadesGuardadas]);

  // ─── Navegación de mes ────────────────────────────────────────────────────

  const irMesAnterior = () => {
    setMesActual(prev => {
      const d = new Date(prev.year, prev.month - 1, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  };

  const irMesSiguiente = () => {
    setMesActual(prev => {
      const d = new Date(prev.year, prev.month + 1, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  };

  const irMesHoy = () => {
    setMesActual({ year: hoy.getFullYear(), month: hoy.getMonth() });
    setFechaActiva(HOY_ISO);
  };

  // ─── CRUD actividades ─────────────────────────────────────────────────────

  const guardarActividad = () => {
    if (!tituloNuevo.trim()) { setErrorNuevaActividad('Ponle un título a la actividad.'); return; }
    if (minutosDesdeHora(horaFinNuevo) <= minutosDesdeHora(horaInicioNuevo)) {
      setErrorNuevaActividad('La hora de fin debe ser después de la hora de inicio.'); return;
    }

    if (actividadEditando) {
      const actualizadas = actividadesGuardadas.map(a =>
        a.id === actividadEditando.id
          ? { ...a, fecha: fechaNueva, tipo: tipoNuevo, horaInicio: horaInicioNuevo, horaFin: horaFinNuevo, titulo: tituloNuevo.trim(), ubicacion: ubicacionNuevo.trim() }
          : a
      );
      setActividadesGuardadas(actualizadas);
      guardarActividadesEnStorage(actualizadas);
      setBloqueSeleccionado(actualizadas.find(a => a.id === actividadEditando.id) ?? null);
      setActividadEditando(null);
      setFechaActiva(fechaNueva);
      setVista('detallesActividad');
    } else {
      const nueva: BloqueHorario = {
        id: Date.now().toString(),
        fecha: fechaNueva,
        tipo: tipoNuevo,
        horaInicio: horaInicioNuevo,
        horaFin: horaFinNuevo,
        titulo: tituloNuevo.trim(),
        ubicacion: ubicacionNuevo.trim(),
      };
      const actualizadas = [...actividadesGuardadas, nueva];
      setActividadesGuardadas(actualizadas);
      guardarActividadesEnStorage(actualizadas);
      setFechaActiva(fechaNueva);
      setVista('vistaSemanal');
    }
    setErrorNuevaActividad(null);
    setTituloNuevo(''); setUbicacionNuevo(''); setTipoNuevo('Clase');
  };

  const abrirEdicionActividad = () => {
    if (!bloqueSeleccionado) return;
    setActividadEditando(bloqueSeleccionado);
    setTipoNuevo(bloqueSeleccionado.tipo);
    setTituloNuevo(bloqueSeleccionado.titulo);
    setUbicacionNuevo(bloqueSeleccionado.ubicacion);
    setHoraInicioNuevo(bloqueSeleccionado.horaInicio);
    setHoraFinNuevo(bloqueSeleccionado.horaFin);
    setFechaNueva(bloqueSeleccionado.fecha);
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

  // ─── Helpers UI ──────────────────────────────────────────────────────────

  const toggleSelection = (item: string, list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>) => {
    setList(list.includes(item) ? list.filter(i => i !== item) : [...list, item]);
  };

  const seleccionarFechaYIrDia = (iso: string) => {
    setFechaActiva(iso);
    // Sincronizar mes visible si el día seleccionado es de otro mes
    const d = new Date(iso + 'T00:00:00');
    setMesActual({ year: d.getFullYear(), month: d.getMonth() });
    setSubVista('dia');
  };

  const manejarFlechaAtras = () => {
    switch (vista) {
      case 'paso1': router.push('/home.2'); break;
      case 'paso2': setVista('paso1'); break;
      case 'paso3': setVista('paso2'); break;
      case 'paso4': setVista('paso3'); break;
      case 'paso5': setVista('paso4'); break;
      case 'vistaSemanal':
        primeraVezEnEstaSesion ? setVista('paso5') : router.push('/home.2'); break;
      case 'agregarActividad':
        setTituloNuevo(''); setUbicacionNuevo(''); setTipoNuevo('Clase'); setErrorNuevaActividad(null);
        actividadEditando ? (setActividadEditando(null), setVista('detallesActividad')) : setVista('vistaSemanal');
        break;
      case 'detallesActividad': setVista('vistaSemanal'); break;
      default: router.push('/home.2');
    }
  };

  // Formatea "YYYY-MM-DD" → "27 may."
  const formatearFechaCorta = (iso: string) => {
    const d = new Date(iso + 'T00:00:00');
    return `${d.getDate()} ${MESES_NOMBRE[d.getMonth()].slice(0, 3).toLowerCase()}.`;
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
      <div className="w-full max-w-md h-screen sm:h-[850px] bg-white shadow-2xl flex flex-col justify-between relative sm:rounded-[40px] border border-gray-100 overflow-hidden pb-4">

        {/* HEADER */}
        <div className="px-6 pt-5 pb-3 flex items-center justify-between border-b border-slate-100 bg-white z-20">
          <button onClick={manejarFlechaAtras} className="p-2 -ml-2 text-slate-700 hover:text-slate-900 transition-colors rounded-xl hover:bg-slate-50">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
          </button>
          <h3 className="text-sm font-bold text-[#2A3B50]">
            {vista === 'paso1' && "Cronograma académico"}
            {['paso2','paso3','paso4','paso5'].includes(vista) && "Crear cronograma"}
            {vista === 'vistaSemanal' && "Mi cronograma"}
            {vista === 'agregarActividad' && (actividadEditando ? "Editar actividad" : "Agregar actividad")}
            {vista === 'detallesActividad' && "Detalles de actividad"}
          </h3>
          <div className="w-5 h-5 text-slate-400 text-[10px] flex items-center justify-center border border-slate-300 rounded-full font-bold select-none">i</div>
        </div>

        {/* BARRA DE PROGRESO */}
        {['paso2','paso3','paso4','paso5'].includes(vista) && (
          <div className="px-6 py-2 bg-slate-50 flex flex-col gap-1 border-b border-slate-100">
            <div className={`text-[10px] font-bold ${estilos.text}`}>
              Paso {vista === 'paso2' ? '1' : vista === 'paso3' ? '2' : vista === 'paso4' ? '3' : '4'} de 4
            </div>
            <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden flex gap-0.5">
              {[1,2,3,4].map(n => {
                const pasoActual = vista === 'paso2' ? 1 : vista === 'paso3' ? 2 : vista === 'paso4' ? 3 : 4;
                return <div key={n} className={`h-full flex-1 ${n <= pasoActual ? estilos.bg : 'bg-slate-200'}`} />;
              })}
            </div>
          </div>
        )}

        {/* CONTENIDO */}
        <div className="flex-1 overflow-y-auto bg-white">

          {/* PASO 1 */}
          {vista === 'paso1' && (
            <div className="p-6 space-y-6 animate-fadeIn">
              <div className="text-center space-y-2 py-4">
                <div className="w-44 h-44 bg-[#F0F4F8] rounded-3xl mx-auto flex items-center justify-center text-7xl shadow-inner">📅</div>
                <p className="text-xs font-semibold text-[#8C9BAE] max-w-xs mx-auto leading-relaxed pt-2">Organiza tu semana y cumple tus metas con equilibrio.</p>
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

          {/* PASO 2 */}
          {vista === 'paso2' && (
            <div className="p-6 space-y-4 animate-fadeIn">
              <div>
                <h4 className="text-base font-bold text-[#2A3B50]">¿Qué días quieres planificar?</h4>
                <p className="text-xs text-slate-400 mt-0.5">Selecciona los días de la semana que deseas incluir.</p>
              </div>
              <div className="bg-slate-50 rounded-2xl p-2 border border-slate-100 divide-y divide-slate-200/60">
                {["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"].map(dia => {
                  const elegido = diasSeleccionados.includes(dia);
                  return (
                    <button key={dia} onClick={() => toggleSelection(dia, diasSeleccionados, setDiasSeleccionados)} className="w-full flex items-center justify-between p-3.5 text-xs font-bold text-slate-700">
                      <span>{dia}</span>
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${elegido ? `${estilos.bg} ${estilos.border} text-white` : 'border-slate-300 bg-white'}`}>
                        {elegido && <span className="text-[10px]">✓</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* PASO 3 */}
          {vista === 'paso3' && (
            <div className="p-6 space-y-5 animate-fadeIn">
              <div>
                <h4 className="text-base font-bold text-[#2A3B50]">¿A qué hora inician y terminan tus actividades?</h4>
                <p className="text-xs text-slate-400 mt-0.5">Define el rango de horas para tu día.</p>
              </div>
              <div className="space-y-4">
                {[
                  { label: "Hora de inicio", icon: "🕒", value: horaInicio, onChange: setHoraInicio },
                  { label: "Hora de finalización", icon: "🌙", value: horaFin, onChange: setHoraFin },
                ].map(({ label, icon, value, onChange }) => (
                  <div key={label} className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500">{label}</label>
                    <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1">
                      <span className="text-base mr-2">{icon}</span>
                      <select value={value} onChange={e => onChange(e.target.value)} className="w-full py-2.5 bg-transparent text-xs text-slate-700 font-bold focus:outline-none cursor-pointer appearance-none">
                        {opcionesHoras.map(h => <option key={h} value={h}>{h}</option>)}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-4 flex gap-3 text-xs">
                <span className="text-lg">💡</span>
                <div>
                  <p className="font-bold text-indigo-950">Recomendación</p>
                  <p className="text-indigo-800/90 leading-relaxed mt-0.5">Planificar bloques de 50 min y descansos de 10 min mejora tu concentración.</p>
                </div>
              </div>
            </div>
          )}

          {/* PASO 4 */}
          {vista === 'paso4' && (
            <div className="p-6 space-y-4 animate-fadeIn">
              <div>
                <h4 className="text-base font-bold text-[#2A3B50]">¿Qué actividades quieres agregar?</h4>
                <p className="text-xs text-slate-400 mt-0.5">Puedes agregar clases, estudio, tareas y más.</p>
              </div>
              <div className="space-y-2">
                {[
                  { name: "Clases", icon: "🏫" }, { name: "Estudio personal", icon: "📖" },
                  { name: "Tareas", icon: "📝" }, { name: "Exámenes", icon: "🎯" },
                  { name: "Lectura", icon: "📚" }, { name: "Actividad personal", icon: "🏃" }
                ].map(act => {
                  const sel = actividades.includes(act.name);
                  return (
                    <button key={act.name} onClick={() => toggleSelection(act.name, actividades, setActividades)} className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-xs font-bold transition-all ${sel ? `${estilos.bgLight} ${estilos.border} ${estilos.text}` : 'border-slate-100 bg-white shadow-sm'}`}>
                      <div className="flex items-center gap-3"><span>{act.icon}</span><span>{act.name}</span></div>
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${sel ? `${estilos.bg} ${estilos.border} text-white` : 'border-slate-300'}`}>
                        {sel && <span className="text-[10px]">✓</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* PASO 5 */}
          {vista === 'paso5' && (
            <div className="p-6 space-y-5 animate-fadeIn">
              <div>
                <h4 className="text-base font-bold text-[#2A3B50]">¡Último paso!</h4>
                <p className="text-xs text-slate-400 mt-0.5">Ponle un nombre a tu cronograma.</p>
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Nombre de tu cronograma</label>
                  <input value={nombreCronograma} onChange={e => setNombreCronograma(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Color del cronograma</label>
                  <div className="flex gap-3 pt-1">
                    {(["blue","purple","emerald","orange","rose"] as const).map(c => (
                      <button key={c} onClick={() => setColorCronograma(c)} className={`w-7 h-7 rounded-full border-2 ${c === 'blue' ? 'bg-blue-500' : c === 'purple' ? 'bg-purple-500' : c === 'emerald' ? 'bg-emerald-500' : c === 'orange' ? 'bg-orange-400' : 'bg-rose-400'} ${colorCronograma === c ? 'border-slate-800 scale-110 shadow' : 'border-transparent opacity-80'}`} />
                    ))}
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-700">Activar recordatorios</p>
                    <p className="text-[10px] text-slate-400">Notificar 15 min antes</p>
                  </div>
                  <button onClick={() => setRecordatorios(!recordatorios)} className={`w-10 h-6 rounded-full p-0.5 transition-colors ${recordatorios ? estilos.bg : 'bg-slate-300'}`}>
                    <div className={`bg-white w-5 h-5 rounded-full shadow-sm transform transition-transform ${recordatorios ? 'translate-x-4' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* VISTA SEMANAL */}
          {vista === 'vistaSemanal' && (
            <div className="animate-fadeIn relative pb-16">

              {/* TABS + mes */}
              <div className="px-6 pt-3 pb-3 flex justify-between items-center bg-slate-50/60 border-b border-slate-100">
                <div className="flex bg-slate-200/70 p-1 rounded-xl w-full max-w-[240px]">
                  {(['dia','mes','lista'] as SubVistaCalendario[]).map(sv => (
                    <button key={sv} onClick={() => setSubVista(sv)} className={`flex-1 text-center text-[11px] font-bold py-1.5 rounded-lg transition-all capitalize ${subVista === sv ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}>
                      {sv === 'dia' ? 'Día' : sv === 'mes' ? 'Mes' : 'Lista'}
                    </button>
                  ))}
                </div>
                <span className={`text-xs font-bold ${estilos.text} ${estilos.bgLight} px-3 py-1 rounded-lg`}>
                  {MESES_NOMBRE[mesActual.month]}
                </span>
              </div>

              {/* ── SUB-VISTA DÍA ── */}
              {subVista === 'dia' && (
                <>
                  {/* Barra de días de la semana activa */}
                  <div className="px-4 py-3 border-b border-slate-100 bg-white">
                    <div className="flex justify-between items-center mb-2">
                      <button onClick={() => {
                        const d = new Date(fechaActiva + 'T00:00:00');
                        d.setDate(d.getDate() - 7);
                        setFechaActiva(fechaISO(d));
                        setMesActual({ year: d.getFullYear(), month: d.getMonth() });
                      }} className="p-1 text-slate-400 hover:text-slate-600 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                        </svg>
                      </button>
                      <span className="text-[10px] font-bold text-slate-500">
                        {(() => {
                          const d = new Date(fechaActiva + 'T00:00:00');
                          const dow = (d.getDay() + 6) % 7;
                          const lun = new Date(d); lun.setDate(d.getDate() - dow);
                          const dom = new Date(lun); dom.setDate(lun.getDate() + 6);
                          return `${lun.getDate()} – ${dom.getDate()} ${MESES_NOMBRE[dom.getMonth()].slice(0,3)}`;
                        })()}
                      </span>
                      <button onClick={() => {
                        const d = new Date(fechaActiva + 'T00:00:00');
                        d.setDate(d.getDate() + 7);
                        setFechaActiva(fechaISO(d));
                        setMesActual({ year: d.getFullYear(), month: d.getMonth() });
                      }} className="p-1 text-slate-400 hover:text-slate-600 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                        </svg>
                      </button>
                    </div>

                    <div className="flex justify-between">
                      {diasBarraDia.map(dd => {
                        const iso = fechaISO(dd);
                        const esActivo = fechaActiva === iso;
                        const esHoyReal = iso === HOY_ISO;
                        const tieneActs = fechasConActividad.has(iso);
                        return (
                          <button key={iso} onClick={() => setFechaActiva(iso)}
                            className={`relative flex flex-col items-center p-2 rounded-xl w-11 transition-all ${esActivo ? `${estilos.bg} text-white shadow-md scale-105` : esHoyReal ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:bg-slate-50'}`}>
                            <span className="text-[9px] font-bold">{DIAS_SEMANA_CORTO[(dd.getDay() + 6) % 7]}</span>
                            <span className="text-xs font-black mt-0.5">{dd.getDate()}</span>
                            {tieneActs && !esActivo && (
                              <span className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${estilos.dot}`} />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Actividades del día */}
                  <div className="p-5 space-y-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {(() => {
                        const d = new Date(fechaActiva + 'T00:00:00');
                        return d.toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' });
                      })()}
                    </p>

                    {actividadesDelDia.length === 0 ? (
                      <div className="text-center pt-10 space-y-3">
                        <span className="text-4xl">🗓️</span>
                        <p className="text-xs text-slate-400">Sin actividades este día.</p>
                        <button
                          onClick={() => { setFechaNueva(fechaActiva); setActividadEditando(null); setTituloNuevo(''); setUbicacionNuevo(''); setTipoNuevo('Clase'); setHoraInicioNuevo('07:00 a. m.'); setHoraFinNuevo('08:00 a. m.'); setErrorNuevaActividad(null); setVista('agregarActividad'); }}
                          className={`text-xs font-bold ${estilos.text} hover:underline`}
                        >
                          + Agregar actividad
                        </button>
                      </div>
                    ) : (
                      actividadesDelDia.map(bloque => (
                        <div key={bloque.id} onClick={() => { setBloqueSeleccionado(bloque); setVista('detallesActividad'); }} className="flex gap-4 items-start cursor-pointer group">
                          <span className="text-xs font-bold text-slate-400 pt-1 w-10 flex-shrink-0">{formatoHora24(bloque.horaInicio)}</span>
                          <div className={`flex-1 p-3.5 border-l-4 rounded-xl border transition-all group-hover:shadow-md ${coloresPorTipo[bloque.tipo]}`}>
                            <h5 className="text-xs font-bold">{bloque.titulo}</h5>
                            <p className="text-[10px] opacity-80 mt-0.5 font-medium">
                              {bloque.ubicacion ? `${bloque.ubicacion} · ` : ''}{formatoHora24(bloque.horaInicio)} – {formatoHora24(bloque.horaFin)}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}

              {/* ── SUB-VISTA MES ── */}
              {subVista === 'mes' && (
                <div className="p-5 space-y-4 animate-fadeIn">

                  {/* Navegación de mes */}
                  <div className="flex items-center justify-between">
                    <button onClick={irMesAnterior} className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-500">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                      </svg>
                    </button>

                    {/* Título clickeable → abre picker */}
                    <button
                      onClick={() => { setPickerYear(mesActual.year); setPickerAbierto(true); }}
                      className={`flex items-center gap-1.5 text-sm font-bold text-[#2A3B50] hover:${estilos.text} transition-colors px-2 py-1 rounded-xl hover:bg-slate-50`}
                    >
                      {MESES_NOMBRE[mesActual.month]} {mesActual.year}
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3 text-slate-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                      </svg>
                    </button>

                    <button onClick={irMesSiguiente} className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-500">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                      </svg>
                    </button>
                  </div>

                  {/* Cabecera días */}
                  <div className="grid grid-cols-7 gap-1 text-center">
                    {DIAS_SEMANA_CORTO.map(d => (
                      <span key={d} className="text-[9px] font-bold text-slate-400">{d}</span>
                    ))}
                  </div>

                  {/* Cuadrícula dinámica */}
                  <div className="space-y-1">
                    {semanasMes.map((semana, i) => (
                      <div key={i} className="grid grid-cols-7 gap-1">
                        {semana.map((fecha, j) => {
                          if (!fecha) return <div key={j} />;
                          const iso = fechaISO(fecha);
                          const esActivo = fechaActiva === iso;
                          const esHoyReal = iso === HOY_ISO;
                          const tipos = tiposPorFecha[iso] ? [...tiposPorFecha[iso]] : [];

                          return (
                            <button key={j} onClick={() => seleccionarFechaYIrDia(iso)}
                              className={`relative aspect-square rounded-xl flex flex-col items-center justify-center text-[11px] font-bold transition-all
                                ${esActivo ? `${estilos.bg} text-white shadow-md` : esHoyReal ? `border-2 ${estilos.border} ${estilos.text}` : 'text-slate-700 hover:bg-slate-100'}`}
                            >
                              {fecha.getDate()}
                              {/* Dots de colores por tipo */}
                              {tipos.length > 0 && !esActivo && (
                                <div className="absolute bottom-1 flex gap-0.5">
                                  {tipos.slice(0, 3).map(t => (
                                    <span key={t} className={`w-1 h-1 rounded-full ${dotColorPorTipo[t as TipoActividad]}`} />
                                  ))}
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>

                  {/* Leyenda + botón Hoy */}
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-x-4 gap-y-1 items-center justify-between">
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                      {tiposActividad.map(t => (
                        <div key={t} className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${dotColorPorTipo[t]}`} />
                          <span className="text-[9px] text-slate-500 font-medium">{t}</span>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={irMesHoy}
                      className={`text-[10px] font-bold ${estilos.text} border ${estilos.border} ${estilos.bgLight} px-2.5 py-1 rounded-lg transition-colors`}
                    >
                      Hoy
                    </button>
                  </div>
                </div>
              )}

              {/* ── PICKER MES/AÑO ── */}
              {pickerAbierto && (
                <div
                  className="absolute inset-0 z-50 flex items-end bg-black/30 animate-fadeIn"
                  onClick={() => setPickerAbierto(false)}
                >
                  <div
                    className="w-full bg-white rounded-t-3xl p-5 pb-8 animate-slideUp"
                    onClick={e => e.stopPropagation()}
                  >
                    {/* Handle */}
                    <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-4" />

                    {/* Selector de año */}
                    <div className="flex items-center justify-between mb-4">
                      <button
                        onClick={() => setPickerYear(y => y - 1)}
                        className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                        </svg>
                      </button>
                      <span className="text-base font-black text-[#2A3B50]">{pickerYear}</span>
                      <button
                        onClick={() => setPickerYear(y => y + 1)}
                        className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                        </svg>
                      </button>
                    </div>

                    {/* Grid de meses */}
                    <div className="grid grid-cols-4 gap-2">
                      {MESES_NOMBRE.map((nombre, idx) => {
                        const esSeleccionado = mesActual.month === idx && mesActual.year === pickerYear;
                        const esHoyMes = hoy.getMonth() === idx && hoy.getFullYear() === pickerYear;
                        return (
                          <button
                            key={nombre}
                            onClick={() => {
                              setMesActual({ year: pickerYear, month: idx });
                              setPickerAbierto(false);
                            }}
                            className={`py-2.5 rounded-xl text-xs font-bold transition-all
                              ${esSeleccionado
                                ? `${estilos.bg} text-white shadow-md`
                                : esHoyMes
                                  ? `border-2 ${estilos.border} ${estilos.text}`
                                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                              }`}
                          >
                            {nombre.slice(0, 3)}
                          </button>
                        );
                      })}
                    </div>

                    {/* Ir a hoy */}
                    <button
                      onClick={() => { irMesHoy(); setPickerAbierto(false); }}
                      className={`mt-4 w-full py-3 ${estilos.bgLight} ${estilos.text} rounded-2xl text-xs font-bold border ${estilos.border} transition-colors`}
                    >
                      Ir a hoy — {MESES_NOMBRE[hoy.getMonth()]} {hoy.getFullYear()}
                    </button>
                  </div>
                </div>
              )}

              {/* ── SUB-VISTA LISTA ── */}
              {subVista === 'lista' && (
                <div className="p-5 space-y-3 animate-fadeIn">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Todas las actividades</p>
                  {actividadesOrdenadas.length === 0 ? (
                    <div className="text-center pt-10 space-y-2">
                      <span className="text-4xl">🗓️</span>
                      <p className="text-xs text-slate-400">Aún no has agregado actividades.</p>
                    </div>
                  ) : (
                    (() => {
                      // Agrupar por fecha
                      const grupos: Record<string, BloqueHorario[]> = {};
                      actividadesOrdenadas.forEach(a => {
                        if (!grupos[a.fecha]) grupos[a.fecha] = [];
                        grupos[a.fecha].push(a);
                      });
                      return Object.entries(grupos).map(([fecha, acts]) => (
                        <div key={fecha}>
                          <p className="text-[10px] font-bold text-slate-400 mb-2 capitalize">
                            {new Date(fecha + 'T00:00:00').toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' })}
                          </p>
                          <div className="space-y-2">
                            {acts.map(bloque => (
                              <div key={bloque.id} onClick={() => { setBloqueSeleccionado(bloque); setFechaActiva(bloque.fecha); setVista('detallesActividad'); }}
                                className={`p-3 rounded-xl border flex justify-between items-center cursor-pointer hover:shadow-sm transition-all ${coloresPorTipo[bloque.tipo]}`}>
                                <div>
                                  <h6 className="text-xs font-bold">{bloque.titulo}</h6>
                                  <p className="text-[10px] opacity-70 font-medium">{bloque.ubicacion || bloque.tipo}</p>
                                </div>
                                <span className="text-[11px] font-bold bg-white/70 px-2 py-0.5 rounded-lg">{formatoHora24(bloque.horaInicio)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ));
                    })()
                  )}
                </div>
              )}

              {/* FAB */}
              <button
                onClick={() => {
                  setActividadEditando(null);
                  setFechaNueva(fechaActiva);
                  setTipoNuevo('Clase');
                  setTituloNuevo('');
                  setUbicacionNuevo('');
                  setHoraInicioNuevo('07:00 a. m.');
                  setHoraFinNuevo('08:00 a. m.');
                  setErrorNuevaActividad(null);
                  setVista('agregarActividad');
                }}
                className={`absolute bottom-4 right-6 w-12 h-12 ${estilos.bg} text-white rounded-full shadow-xl flex items-center justify-center font-bold text-xl ${estilos.hoverBg} transition-all active:scale-95 z-30`}
              >
                +
              </button>
            </div>
          )}

          {/* AGREGAR / EDITAR ACTIVIDAD */}
          {vista === 'agregarActividad' && (
            <div className="p-6 space-y-4 animate-fadeIn">
              {/* Tipo */}
              <div className="flex gap-2">
                {tiposActividad.map(t => (
                  <button key={t} onClick={() => setTipoNuevo(t)}
                    className={`flex-1 text-[11px] font-bold px-2 py-1.5 rounded-xl border transition-colors ${tipoNuevo === t ? coloresPorTipo[t] : 'bg-slate-100 text-slate-600 border-transparent hover:bg-slate-200'}`}>
                    {t}
                  </button>
                ))}
              </div>

              {/* Selector de fecha con mini-calendario */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">Fecha</label>

                {/* Barra de días de la semana de la fecha nueva */}
                {(() => {
                  const d = new Date(fechaNueva + 'T00:00:00');
                  const dow = (d.getDay() + 6) % 7;
                  const lun = new Date(d); lun.setDate(d.getDate() - dow);
                  const dias7 = Array.from({ length: 7 }, (_, i) => { const dd = new Date(lun); dd.setDate(lun.getDate() + i); return dd; });
                  return (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <button onClick={() => { const prev = new Date(fechaNueva + 'T00:00:00'); prev.setDate(prev.getDate() - 7); setFechaNueva(fechaISO(prev)); }} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg>
                        </button>
                        <span className="text-[10px] font-bold text-slate-500">
                          {lun.getDate()} – {dias7[6].getDate()} {MESES_NOMBRE[dias7[6].getMonth()].slice(0,3)}
                        </span>
                        <button onClick={() => { const next = new Date(fechaNueva + 'T00:00:00'); next.setDate(next.getDate() + 7); setFechaNueva(fechaISO(next)); }} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
                        </button>
                      </div>
                      <div className="flex justify-between">
                        {dias7.map(dd => {
                          const iso = fechaISO(dd);
                          const sel = fechaNueva === iso;
                          const esHoyReal = iso === HOY_ISO;
                          return (
                            <button key={iso} onClick={() => setFechaNueva(iso)}
                              className={`flex flex-col items-center p-2 rounded-xl w-11 transition-all text-[9px] font-bold ${sel ? `${estilos.bg} text-white shadow-md scale-105` : esHoyReal ? `border ${estilos.border} ${estilos.text}` : 'text-slate-500 hover:bg-slate-50'}`}>
                              <span>{DIAS_SEMANA_CORTO[(dd.getDay() + 6) % 7]}</span>
                              <span className="text-xs font-black mt-0.5">{dd.getDate()}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Título y ubicación */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Título de la actividad</label>
                  <input value={tituloNuevo} onChange={e => setTituloNuevo(e.target.value)} placeholder="Ej. Cálculo diferencial"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Ubicación / Aula</label>
                  <input value={ubicacionNuevo} onChange={e => setUbicacionNuevo(e.target.value)} placeholder="Ej. Aula 201"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Hora de inicio", value: horaInicioNuevo, onChange: setHoraInicioNuevo },
                    { label: "Hora de fin",    value: horaFinNuevo,    onChange: setHoraFinNuevo },
                  ].map(({ label, value, onChange }) => (
                    <div key={label} className="space-y-1">
                      <label className="text-xs font-bold text-slate-500">{label}</label>
                      <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1">
                        <select value={value} onChange={e => onChange(e.target.value)} className="w-full py-2.5 bg-transparent text-xs text-slate-700 font-bold focus:outline-none cursor-pointer appearance-none">
                          {opcionesHoras.map(h => <option key={h} value={h}>{h}</option>)}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
                {errorNuevaActividad && (
                  <div className="bg-rose-50 border border-rose-200 rounded-2xl px-4 py-3 text-xs text-rose-700 font-medium text-center">{errorNuevaActividad}</div>
                )}
              </div>
            </div>
          )}

          {/* DETALLES ACTIVIDAD */}
          {vista === 'detallesActividad' && bloqueSeleccionado && (
            <div className="p-6 space-y-5 animate-fadeIn">
              <div className={`p-5 rounded-2xl space-y-1 border ${coloresPorTipo[bloqueSeleccionado.tipo]}`}>
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">{bloqueSeleccionado.tipo}</span>
                <h4 className="text-sm font-black">{bloqueSeleccionado.titulo}</h4>
                {bloqueSeleccionado.ubicacion && <p className="text-xs font-bold opacity-90">{bloqueSeleccionado.ubicacion}</p>}
                <p className="text-[10px] opacity-80 font-medium pt-1">
                  {new Date(bloqueSeleccionado.fecha + 'T00:00:00').toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' })} · {formatoHora24(bloqueSeleccionado.horaInicio)} – {formatoHora24(bloqueSeleccionado.horaFin)}
                </p>
              </div>
              <div className="flex gap-3">
                <button onClick={abrirEdicionActividad} className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
                  </svg>
                  Editar
                </button>
                <button onClick={() => { if (window.confirm('¿Seguro que quieres eliminar esta actividad?')) eliminarActividadSeleccionada(); }}
                  className="flex-1 py-3 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl text-xs font-bold hover:bg-rose-100 transition-colors">
                  Eliminar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* BOTÓN INFERIOR */}
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
              className={`w-full py-3.5 ${estilos.bg} ${estilos.hoverBg} text-white rounded-2xl text-xs font-bold shadow-sm transition-all`}
            >
              {vista === 'paso1' ? "Crear mi cronograma" : vista === 'paso5' ? "Crear cronograma" : vista === 'agregarActividad' ? (actividadEditando ? "Guardar cambios" : "Guardar actividad") : "Continuar"}
            </button>
          </div>
        )}
      </div>

      <style jsx global>{`
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .animate-slideUp { animation: slideUp 0.3s cubic-bezier(0.32,0.72,0,1); }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
      `}</style>
    </div>
  );
}