// app/cronograma.2/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabase';
import {
  crearActividadCronograma,
  leerActividadesCronogramaUsuario,
  eliminarActividadCronograma,
  type ActividadCronogramaGuardada,
} from '@/lib/supabase/cronograma';

type VistaId = 'paso1' | 'paso2' | 'paso3' | 'paso4' | 'paso5' | 'vistaSemanal' | 'agregarActividad' | 'detallesActividad';
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

function obtenerFechaISO(d: Date): string {
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offset).toISOString().split('T')[0];
}

function generarDiasVisibles() {
  const abreviaturas = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const hoy = new Date();
  const dias = [];
  for (let i = -2; i <= 2; i++) {
    const d = new Date(hoy);
    d.setDate(hoy.getDate() + i);
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

  const [fechaSeleccionadaVista, setFechaSeleccionadaVista] = useState<string>(obtenerFechaISO(new Date()));
  const [bloqueSeleccionado, setBloqueSeleccionado] = useState<ActividadCronogramaGuardada | null>(null);

  const [tituloNuevaActividad, setTituloNuevaActividad] = useState("");
  const [ubicacionNuevaActividad, setUbicacionNuevaActividad] = useState("");
  const [tipoNuevaActividad, setTipoNuevaActividad] = useState<string>("clase");
  const [fechaNuevaActividad, setFechaNuevaActividad] = useState<string>(obtenerFechaISO(new Date()));
  const [horaInicioActividad, setHoraInicioActividad] = useState("07:00 a. m.");
  const [horaFinActividad, setHoraFinActividad] = useState("08:00 a. m.");
  const [guardandoActividad, setGuardandoActividad] = useState(false);
  const [errorActividad, setErrorActividad] = useState<string | null>(null);

  const mapaEstilos = {
    blue: { bg: "bg-blue-500", hoverBg: "hover:bg-blue-600", text: "text-blue-500", bgLight: "bg-blue-50", border: "border-blue-500" },
    purple: { bg: "bg-purple-500", hoverBg: "hover:bg-purple-600", text: "text-purple-500", bgLight: "bg-purple-50", border: "border-purple-500" },
    emerald: { bg: "bg-emerald-500", hoverBg: "hover:bg-emerald-600", text: "text-emerald-500", bgLight: "bg-emerald-50", border: "border-emerald-500" },
    orange: { bg: "bg-orange-500", hoverBg: "hover:bg-orange-600", text: "text-orange-500", bgLight: "bg-orange-50", border: "border-orange-500" },
    rose: { bg: "bg-rose-500", hoverBg: "hover:bg-rose-600", text: "text-rose-500", bgLight: "bg-rose-50", border: "border-rose-500" }
  };

  const estilosActuales = mapaEstilos[colorCronograma];

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
      setCargandoSesion(false);
      await refrescarActividades(session.user.id);
      if (vista === 'paso1') setVista('vistaSemanal');
    };
    inicializar();
  }, [router, refrescarActividades, vista]);

  const manejarFlechaAtras = () => {
    switch (vista) {
      case 'paso1': router.push('/home.2'); break;
      case 'paso2': setVista('paso1'); break;
      case 'paso3': setVista('paso2'); break;
      case 'paso4': setVista('paso3'); break;
      case 'paso5': setVista('paso4'); break;
      case 'vistaSemanal': router.push('/home.2'); break;
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

    const { error } = await crearActividadCronograma({
      user_id: userId,
      titulo: tituloNuevaActividad,
      ubicacion: ubicacionNuevaActividad,
      tipo_actividad: tipoNuevaActividad,
      fecha: fechaNuevaActividad,
      hora_inicio: horaInicioActividad,
      hora_fin: horaFinActividad,
      dias_semana: diasSeleccionados,
    });

    if (error) {
      setErrorActividad("No se pudo guardar la actividad. Intenta de nuevo.");
      setGuardandoActividad(false);
      return;
    }

    setTituloNuevaActividad("");
    setUbicacionNuevaActividad("");
    setTipoNuevaActividad("clase");
    setHoraInicioActividad("07:00 a. m.");
    setHoraFinActividad("08:00 a. m.");
    setFechaNuevaActividad(obtenerFechaISO(new Date()));
    setGuardandoActividad(false);
    setFechaSeleccionadaVista(fechaNuevaActividad);

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

  const actividadesDelDia = actividadesGuardadas.filter(a => a.fecha === fechaSeleccionadaVista);
  const actividadesOrdenadasLista = [...actividadesGuardadas].sort((a, b) =>
    a.fecha === b.fecha ? a.hora_inicio.localeCompare(b.hora_inicio) : a.fecha.localeCompare(b.fecha)
  );

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
            {vista === 'agregarActividad' && "Agregar actividad"}
            {vista === 'detallesActividad' && "Detalles de actividad"}
          </h3>

          <div className="w-5 h-5" />
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

          {vista === 'vistaSemanal' && (
            <div className="animate-fadeIn relative pb-16">
              <div className="px-6 pt-3 flex justify-between items-center bg-slate-50/60 pb-3 border-b border-slate-100">
                <div className="flex bg-slate-200/70 p-1 rounded-xl w-full max-w-[240px]">
                  <button onClick={() => setSubVista('dia')} className={`flex-1 text-center text-[11px] font-bold py-1.5 rounded-lg transition-all ${subVista === 'dia' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}>Día</button>
                  <button onClick={() => setSubVista('lista')} className={`flex-1 text-center text-[11px] font-bold py-1.5 rounded-lg transition-all ${subVista === 'lista' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}>Lista</button>
                </div>
              </div>

              {subVista === 'dia' && (
                <>
                  <div className="px-6 py-3 flex justify-between border-b border-slate-100 bg-white">
                    {generarDiasVisibles().map((day) => {
                      const esDiaActivo = fechaSeleccionadaVista === day.iso;
                      return (
                        <button key={day.iso} onClick={() => setFechaSeleccionadaVista(day.iso)} className={`flex flex-col items-center p-2 rounded-xl w-12 transition-all ${esDiaActivo ? `${estilosActuales.bg} text-white shadow-md scale-105` : 'text-slate-600 hover:bg-slate-50'}`}>
                          <span className="text-[10px] font-bold">{day.abbr}</span>
                          <span className="text-xs font-black mt-0.5">{day.num}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="p-6 space-y-4 relative">
                    <p className="text-[10px] font-bold text-slate-400 mb-1">{formatearFechaLegible(fechaSeleccionadaVista)}</p>
                    {cargandoActividades && <p className="text-xs text-slate-400">Cargando actividades...</p>}
                    {!cargandoActividades && actividadesDelDia.length === 0 && (
                      <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-400">
                        No tienes actividades este día.
                      </div>
                    )}
                    {actividadesDelDia.map((actividad) => (
                      <div key={actividad.id} onClick={() => { setBloqueSeleccionado(actividad); setVista('detallesActividad'); }} className="flex gap-4 items-start cursor-pointer group">
                        <span className="text-xs font-bold text-slate-400 pt-1 w-14">{actividad.hora_inicio.slice(0, 5)}</span>
                        <div className="flex-1 p-3.5 border-l-4 rounded-xl border transition-all group-hover:shadow-md bg-purple-50 text-purple-700 border-purple-200">
                          <h5 className="text-xs font-bold">{actividad.titulo}</h5>
                          <p className="text-[10px] opacity-80 mt-0.5 font-medium">
                            {actividad.ubicacion ? `${actividad.ubicacion} · ` : ''}{actividad.hora_inicio.slice(0, 5)} - {actividad.hora_fin.slice(0, 5)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {subVista === 'lista' && (
                <div className="p-6 space-y-3 animate-fadeIn">
                  <p className="text-[10px] font-bold text-slate-400">Todas tus actividades guardadas</p>
                  {actividadesOrdenadasLista.length === 0 && (
                    <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-400">
                      Aún no has agregado actividades.
                    </div>
                  )}
                  {actividadesOrdenadasLista.map((actividad) => (
                    <div key={actividad.id} onClick={() => { setBloqueSeleccionado(actividad); setVista('detallesActividad'); }} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center cursor-pointer hover:bg-slate-100">
                      <div>
                        <h6 className="text-xs font-bold text-slate-800">{actividad.titulo}</h6>
                        <p className="text-[10px] text-slate-400">{formatearFechaLegible(actividad.fecha)}</p>
                      </div>
                      <span className="text-[11px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-md shadow-sm">{actividad.hora_inicio.slice(0, 5)}</span>
                    </div>
                  ))}
                </div>
              )}

              <button onClick={() => setVista('agregarActividad')} className={`absolute bottom-4 right-6 w-12 h-12 ${estilosActuales.bg} text-white rounded-full shadow-xl flex items-center justify-center font-bold text-xl ${estilosActuales.hoverBg} transition-all transform active:scale-95 z-30`}>
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
              <div className="p-5 bg-purple-50/70 border border-purple-100 rounded-2xl text-purple-950 space-y-1">
                <h4 className="text-sm font-black">{bloqueSeleccionado.titulo}</h4>
                <p className="text-xs font-bold text-purple-800">
                  {bloqueSeleccionado.hora_inicio.slice(0, 5)} - {bloqueSeleccionado.hora_fin.slice(0, 5)}
                  {bloqueSeleccionado.ubicacion ? ` · ${bloqueSeleccionado.ubicacion}` : ''}
                </p>
                <p className="text-[10px] text-purple-600/90 font-medium pt-1">{formatearFechaLegible(bloqueSeleccionado.fecha)}</p>
              </div>
              <button onClick={handleEliminarActividad} className="w-full py-3 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl text-xs font-bold hover:bg-rose-100 transition-colors">
                Eliminar actividad
              </button>
            </div>
          )}

        </div>

        {['paso2', 'paso3', 'paso4', 'paso5', 'agregarActividad'].includes(vista) && (
          <div className="p-6 bg-white border-t border-slate-100 sm:rounded-b-[40px] z-20">
            <button
              disabled={vista === 'agregarActividad' && guardandoActividad}
              onClick={() => {
                if (vista === 'paso2') setVista('paso3');
                else if (vista === 'paso3') setVista('paso4');
                else if (vista === 'paso4') setVista('paso5');
                else if (vista === 'paso5') setVista('vistaSemanal');
                else if (vista === 'agregarActividad') handleGuardarActividad();
              }}
              className={`w-full py-3.5 ${estilosActuales.bg} ${estilosActuales.hoverBg} text-white rounded-2xl text-xs font-bold shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              {vista === 'paso5'
                ? "Crear cronograma"
                : vista === 'agregarActividad'
                ? (guardandoActividad ? "Guardando..." : "Guardar actividad")
                : "Continuar"}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}