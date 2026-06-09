"use client";

import React, { useState } from 'react';
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

interface BloqueHorario {
  id: string;
  hora: string;
  titulo: string;
  subtitulo: string;
  color: string;
}

const opcionesHoras = [
  "05:00 a. m.", "06:00 a. m.", "07:00 a. m.", "08:00 a. m.", "09:00 a. m.", "10:00 a. m.", "11:00 a. m.",
  "12:00 p. m.", "01:00 p. m.", "02:00 p. m.", "03:00 p. m.", "04:00 p. m.", "05:00 p. m.", "06:00 p. m.",
  "07:00 p. m.", "08:00 p. m.", "09:00 p. m.", "10:00 p. m.", "11:00 p. m."
];

export default function CronogramaPage() {
  const router = useRouter();
  
  // Estado principal de navegación interna
  const [vista, setVista] = useState<VistaId>('paso1');
  
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

  // Bloques de ejemplo para simular la agenda
  const bloquesSemana: BloqueHorario[] = [
    { id: "1", hora: "07:00", titulo: "Cálculo diferencial", subtitulo: "Aula 201 (07:00 - 08:30)", color: "bg-purple-50 text-purple-700 border-purple-200" },
    { id: "2", hora: "09:00", titulo: "Física I", subtitulo: "Aula 102 (08:40 - 10:10)", color: "bg-blue-50 text-blue-700 border-blue-200" },
    { id: "3", hora: "10:30", titulo: "Estudio personal", subtitulo: "Repaso de ejercicios", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    { id: "4", hora: "12:00", titulo: "Almuerzo", subtitulo: "Descanso y comida", color: "bg-orange-50 text-orange-700 border-orange-200" },
    { id: "5", hora: "01:00", titulo: "Química general", subtitulo: "Laboratorio 3 (01:10 - 02:40)", color: "bg-purple-50 text-purple-700 border-purple-200" }
  ];

  // Diccionario de estilos dinámicos basados en la selección de color
  const mapaEstilos = {
    blue: { bg: "bg-blue-500", hoverBg: "hover:bg-blue-600", text: "text-blue-500", bgLight: "bg-blue-50", border: "border-blue-500" },
    purple: { bg: "bg-purple-500", hoverBg: "hover:bg-purple-600", text: "text-purple-500", bgLight: "bg-purple-50", border: "border-purple-500" },
    emerald: { bg: "bg-emerald-500", hoverBg: "hover:bg-emerald-600", text: "text-emerald-500", bgLight: "bg-emerald-50", border: "border-emerald-500" },
    orange: { bg: "bg-orange-500", hoverBg: "hover:bg-orange-600", text: "text-orange-500", bgLight: "bg-orange-50", border: "border-orange-500" },
    rose: { bg: "bg-rose-500", hoverBg: "hover:bg-rose-600", text: "text-rose-500", bgLight: "bg-rose-50", border: "border-rose-500" }
  };

  const estilosActuales = mapaEstilos[colorCronograma];

  const manejarFlechaAtras = () => {
    switch (vista) {
      case 'paso1': router.push('/home.2'); break;
      case 'paso2': setVista('paso1'); break;
      case 'paso3': setVista('paso2'); break;
      case 'paso4': setVista('paso3'); break;
      case 'paso5': setVista('paso4'); break;
      case 'vistaSemanal': setVista('paso5'); break;
      case 'agregarActividad': setVista('vistaSemanal'); break;
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
            {vista === 'agregarActividad' && "Agregar actividad"}
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
                    {[
                      { d: "Lun", n: "25" }, 
                      { d: "Mar", n: "26" }, 
                      { d: "Mié", n: "27" }, 
                      { d: "Jue", n: "28" }, 
                      { d: "Vie", n: "29" }
                    ].map((day) => {
                      const esDiaActivo = diaActivoNumero === day.n;
                      return (
                        <button 
                          key={day.n} 
                          onClick={() => setDiaActivoNumero(day.n)}
                          className={`flex flex-col items-center p-2 rounded-xl w-12 transition-all ${esDiaActivo ? `${estilosActuales.bg} text-white shadow-md scale-105` : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                          <span className="text-[10px] font-bold">{day.d}</span>
                          <span className="text-xs font-black mt-0.5">{day.n}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Bloques Horarios Principales */}
                  <div className="p-6 space-y-4 relative">
                    <p className="text-[10px] font-bold text-slate-400 mb-1">Mostrando actividades del día {diaActivoNumero} de Mayo</p>
                    {bloquesSemana.map((bloque) => (
                      <div key={bloque.id} onClick={() => { setBloqueSeleccionado(bloque); setVista('detallesActividad'); }} className="flex gap-4 items-start cursor-pointer group">
                        <span className="text-xs font-bold text-slate-400 pt-1 w-10">{bloque.hora}</span>
                        <div className={`flex-1 p-3.5 border-l-4 rounded-xl border transition-all group-hover:shadow-md ${bloque.color}`}>
                          <h5 className="text-xs font-bold">{bloque.titulo}</h5>
                          <p className="text-[10px] opacity-80 mt-0.5 font-medium">{bloque.subtitulo}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {subVista === 'mes' && (
                <div className="p-6 text-center space-y-3 animate-fadeIn">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <span className="text-2xl">📅</span>
                    <h5 className="text-xs font-bold text-slate-700 mt-2">Vista Mensual Activa</h5>
                    <p className="text-[11px] text-slate-400 mt-1">Aquí se desplegará el calendario completo en cuadrícula de Mayo 2026.</p>
                  </div>
                </div>
              )}

              {subVista === 'lista' && (
                <div className="p-6 space-y-3 animate-fadeIn">
                  <p className="text-[10px] font-bold text-slate-400">Próximos eventos en formato lista</p>
                  {bloquesSemana.map((bloque) => (
                    <div key={bloque.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
                      <div>
                        <h6 className="text-xs font-bold text-slate-800">{bloque.titulo}</h6>
                        <p className="text-[10px] text-slate-400">{bloque.subtitulo}</p>
                      </div>
                      <span className="text-[11px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-md shadow-sm">{bloque.hora}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* BOTÓN FLOTANTE "+" ADAPTATIVO AL COLOR */}
              <button onClick={() => setVista('agregarActividad')} className={`absolute bottom-4 right-6 w-12 h-12 ${estilosActuales.bg} text-white rounded-full shadow-xl flex items-center justify-center font-bold text-xl ${estilosActuales.hoverBg} transition-all transform active:scale-95 z-30`}>
                +
              </button>
            </div>
          )}

          {/* PANTALLA 9: AGREGAR ACTIVIDAD */}
          {vista === 'agregarActividad' && (
            <div className="p-6 space-y-4 animate-fadeIn">
              <div className="flex gap-2 justify-between">
                {["Clase", "Estudio", "Tarea", "Examen"].map((t) => (
                  <span key={t} className="text-[11px] font-bold px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 cursor-pointer hover:bg-slate-200">{t}</span>
                ))}
              </div>
              <div className="space-y-3 pt-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Título de la actividad</label>
                  <input type="text" placeholder="Ej. Cálculo diferencial" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Ubicación / Aula</label>
                  <input type="text" placeholder="Ej. Aula 201" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none" />
                </div>
              </div>
            </div>
          )}

          {/* PANTALLA 10: DETALLES DE ACTIVIDAD */}
          {vista === 'detallesActividad' && bloqueSeleccionado && (
            <div className="p-6 space-y-5 animate-fadeIn">
              <div className="p-5 bg-purple-50/70 border border-purple-100 rounded-2xl text-purple-950 space-y-1">
                <h4 className="text-sm font-black">{bloqueSeleccionado.titulo}</h4>
                <p className="text-xs font-bold text-purple-800">{bloqueSeleccionado.subtitulo}</p>
                <p className="text-[10px] text-purple-600/90 font-medium pt-1">Día {diaActivoNumero} de Mayo</p>
              </div>
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-700">Descripción</p>
                <p className="text-xs text-slate-500 leading-relaxed font-medium bg-slate-50 p-3 rounded-xl border border-slate-100">
                  Clase teórica estructurada conforme al cronograma guardado. Revisar temas de la semana.
                </p>
              </div>
              <button onClick={() => setVista('vistaSemanal')} className="w-full py-3 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl text-xs font-bold hover:bg-rose-100 transition-colors">
                Eliminar actividad
              </button>
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
                else if (vista === 'paso5') setVista('vistaSemanal');
                else if (vista === 'agregarActividad') setVista('vistaSemanal');
              }}
              className={`w-full py-3.5 ${estilosActuales.bg} ${estilosActuales.hoverBg} text-white rounded-2xl text-xs font-bold shadow-sm transition-all`}
            >
              {vista === 'paso1' ? "Crear mi cronograma" : vista === 'paso5' ? "Crear cronograma" : vista === 'agregarActividad' ? "Guardar actividad" : "Continuar"}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}