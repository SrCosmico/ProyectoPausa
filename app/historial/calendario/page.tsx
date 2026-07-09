'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabase';
import {
  leerHistorialEmocionalPorRango,
  type RegistroEmocionalCalendario,
} from '@/lib/supabase/historial';

const NOMBRES_MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

function obtenerFechaISO(d: Date): string {
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offset).toISOString().split('T')[0];
}

function obtenerColorPorNivel(nivel: number) {
  switch (nivel) {
    case 5: return 'bg-emerald-100 border-emerald-200';
    case 4: return 'bg-lime-100 border-lime-200';
    case 3: return 'bg-yellow-100 border-yellow-200';
    case 2: return 'bg-orange-100 border-orange-200';
    case 1: return 'bg-rose-100 border-rose-200';
    default: return 'bg-slate-100 border-slate-200';
  }
}

export default function CalendarioEmocionalPage() {
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);
  const [fechaCalendario, setFechaCalendario] = useState(new Date());
  const [registros, setRegistros] = useState<RegistroEmocionalCalendario[]>([]);
  const [cargando, setCargando] = useState(true);
  const [registroSeleccionado, setRegistroSeleccionado] = useState<RegistroEmocionalCalendario | null>(null);

  const cargarMes = useCallback(async (uid: string, fecha: Date) => {
    setCargando(true);
    const primerDia = new Date(fecha.getFullYear(), fecha.getMonth(), 1);
    const ultimoDia = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0);
    const datos = await leerHistorialEmocionalPorRango(
      uid,
      obtenerFechaISO(primerDia),
      obtenerFechaISO(ultimoDia)
    );
    setRegistros(datos);
    setCargando(false);
  }, []);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      setUserId(user.id);
      await cargarMes(user.id, fechaCalendario);
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (userId) cargarMes(userId, fechaCalendario);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fechaCalendario]);

  const registrosPorDia: Record<string, RegistroEmocionalCalendario> = {};
  registros.forEach((r) => { registrosPorDia[r.dia] = r; });

  const cambiarMes = (delta: number) => {
    setFechaCalendario(new Date(fechaCalendario.getFullYear(), fechaCalendario.getMonth() + delta, 1));
  };

  const nombreDiaCompleto = (fechaStr: string) => {
    const nombres = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const d = new Date(fechaStr + 'T12:00:00');
    return `${nombres[d.getDay()]}, ${d.getDate()} de ${NOMBRES_MESES[d.getMonth()]}`;
  };

  const diasEnMes = new Date(fechaCalendario.getFullYear(), fechaCalendario.getMonth() + 1, 0).getDate();
  const offsetInicio = new Date(fechaCalendario.getFullYear(), fechaCalendario.getMonth(), 1).getDay();

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-0 sm:p-4 font-sans">
      <div className="w-full max-w-md h-screen sm:h-[850px] bg-slate-50 shadow-2xl flex flex-col relative sm:rounded-[40px] border border-gray-100 overflow-hidden">

        <div className="px-6 pt-6 pb-4 flex items-center justify-between bg-white border-b border-slate-100 flex-shrink-0">
          <button
            onClick={() => router.push('/historial')}
            className="p-2 -ml-2 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
          </button>
          <h3 className="text-sm font-bold text-[#2A3B50]">Calendario emocional</h3>
          <div className="w-9" />
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">

          <div className="flex justify-between items-center bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
            <button onClick={() => cambiarMes(-1)} className="p-1 text-slate-400 hover:text-slate-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-sm font-bold text-[#2A3B50] capitalize">
              {NOMBRES_MESES[fechaCalendario.getMonth()]} {fechaCalendario.getFullYear()}
            </span>
            <button onClick={() => cambiarMes(1)} className="p-1 text-slate-400 hover:text-slate-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <div className="grid grid-cols-7 gap-1 mb-2 text-center">
              {['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'].map((d) => (
                <span key={d} className="text-[10px] font-bold text-slate-400">{d}</span>
              ))}
            </div>

            {cargando ? (
              <p className="text-xs text-slate-400 text-center py-10 animate-pulse">Cargando calendario...</p>
            ) : (
              <div className="grid grid-cols-7 gap-1 text-center">
                {Array.from({ length: offsetInicio }).map((_, i) => (
                  <div key={`blank-${i}`} className="p-2" />
                ))}
                {Array.from({ length: diasEnMes }).map((_, i) => {
                  const day = i + 1;
                  const dateISO = `${fechaCalendario.getFullYear()}-${String(fechaCalendario.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const registro = registrosPorDia[dateISO];
                  const esHoy = obtenerFechaISO(new Date()) === dateISO;

                  return (
                    <button
                      key={day}
                      onClick={() => registro && setRegistroSeleccionado(registro)}
                      disabled={!registro}
                      className={`relative p-1.5 flex flex-col items-center justify-center rounded-xl text-xs transition-all w-full aspect-square border ${
                        registro
                          ? `${obtenerColorPorNivel(registro.nivel)} cursor-pointer hover:scale-105`
                          : esHoy
                            ? 'bg-slate-100 border-slate-200 font-bold text-[#2A3B50]'
                            : 'bg-white border-transparent text-slate-400'
                      }`}
                    >
                      {registro ? (
                        <span className="text-base leading-none">{registro.emoji}</span>
                      ) : (
                        <span className="font-medium">{day}</span>
                      )}
                      {registro && (
                        <span className="text-[8px] font-bold mt-0.5 text-slate-500">{day}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2 justify-center pt-1">
            {[
              { n: 5, l: 'Muy bien' }, { n: 4, l: 'Bien' }, { n: 3, l: 'Regular' },
              { n: 2, l: 'Mal' }, { n: 1, l: 'Muy mal' },
            ].map((it) => (
              <span key={it.n} className={`text-[9px] font-bold px-2 py-1 rounded-full border ${obtenerColorPorNivel(it.n)}`}>
                {it.l}
              </span>
            ))}
          </div>
        </div>

        {registroSeleccionado && (
          <div
            className="absolute inset-0 z-50 bg-slate-900/40 flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setRegistroSeleccionado(null)}
          >
            <div
              className="bg-white w-full sm:max-w-sm rounded-t-[30px] sm:rounded-[30px] p-6 shadow-2xl space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {nombreDiaCompleto(registroSeleccionado.dia)}
                </p>
                <button onClick={() => setRegistroSeleccionado(null)} className="text-slate-400 hover:text-slate-600 text-xl font-bold leading-none">&times;</button>
              </div>

              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-5xl">{registroSeleccionado.emoji}</span>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cómo te sentiste</p>
                  <p className="text-lg font-black text-[#2A3B50] mt-0.5">{registroSeleccionado.estado}</p>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Tu nota</p>
                {registroSeleccionado.nota ? (
                  <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 max-h-36 overflow-y-auto">
                    <p className="text-sm text-slate-600 font-medium leading-relaxed break-words whitespace-pre-wrap">
                      "{registroSeleccionado.nota}"
                    </p>
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-4 text-center">
                    <p className="text-xs text-slate-400 italic">No dejaste ninguna nota este día.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}