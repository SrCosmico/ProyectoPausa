"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabase';
import { leerHistorialEmocionalSemanal } from '@/app/services/emocionesService';
import { leerHistorialEvaluacionesEstres, type ResultadoEvaluacionDB } from '@/lib/supabase/evaluacion';

type Pestana = 'registros' | 'evaluaciones';

interface RegistroEmocional {
  fecha: string;
  nivel: number;
  emoji: string;
  estado: string;
  nota: string | null;
}

const NOMBRES_MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const COLOR_POR_NIVEL: Record<number, string> = {
  1: 'bg-rose-400',
  2: 'bg-orange-400',
  3: 'bg-yellow-400',
  4: 'bg-lime-400',
  5: 'bg-emerald-400',
};

const COLOR_NIVEL_ESTRES: Record<string, { bg: string; text: string; barra: string; mensaje: string }> = {
  Bajo: {
    bg: 'bg-emerald-50 border-emerald-100',
    text: 'text-emerald-700',
    barra: '15%',
    mensaje: 'Ese día tenías un nivel bajo de estrés percibido. Te sentías con control de tus actividades.',
  },
  Moderado: {
    bg: 'bg-amber-50 border-amber-100',
    text: 'text-amber-700',
    barra: '52%',
    mensaje: 'Ese día tenías un nivel moderado de estrés. Es normal sentirse así ocasionalmente.',
  },
  Alto: {
    bg: 'bg-rose-50 border-rose-100',
    text: 'text-rose-700',
    barra: '88%',
    mensaje: 'Ese día tus niveles de estrés percibido eran elevados.',
  },
};

// Preguntas y opciones del PSS-4, usadas solo para mostrar el detalle de una evaluación pasada
const PREGUNTAS_PSS4: { id: string; enunciado: string }[] = [
  { id: 'p1', enunciado: '¿Sentías que no podías controlar las cosas importantes de tu vida?' },
  { id: 'p2', enunciado: '¿Te sentías seguro de tu capacidad para manejar tus problemas personales?' },
  { id: 'p3', enunciado: '¿Sentías que las cosas salían como tú querías?' },
  { id: 'p4', enunciado: '¿Sentías que las dificultades se acumulaban tanto que no podías superarlas?' },
];

const OPCIONES_PSS4: Record<number, string> = {
  0: 'Nunca',
  1: 'Casi nunca',
  2: 'A veces',
  3: 'A menudo',
  4: 'Muy a menudo',
};

export default function HistorialPage() {
  const router = useRouter();

  const [pestana, setPestana] = useState<Pestana>('registros');
  const [cargando, setCargando] = useState(true);

  const [registros, setRegistros] = useState<RegistroEmocional[]>([]);
  const [evaluaciones, setEvaluaciones] = useState<ResultadoEvaluacionDB[]>([]);

  const [fechaCalendario, setFechaCalendario] = useState(new Date());
  const [diaSeleccionado, setDiaSeleccionado] = useState<RegistroEmocional | null>(null);
  const [evaluacionSeleccionada, setEvaluacionSeleccionada] = useState<ResultadoEvaluacionDB | null>(null);

  const cargarDatos = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login'); return; }

    const [datosEmocionales, datosEvaluaciones] = await Promise.all([
      leerHistorialEmocionalSemanal(user.id),
      leerHistorialEvaluacionesEstres(user.id),
    ]);

    const formateados = (datosEmocionales as any[]).map((item) => ({
      fecha: item.dia ?? item.fecha,
      nivel: item.nivel,
      emoji: item.emoji,
      estado: item.estado,
      nota: item.nota ?? null,
    }));

    setRegistros(formateados);
    setEvaluaciones(datosEvaluaciones);
    setCargando(false);
  }, [router]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const registroDelDia = (fechaISO: string) => registros.find(r => r.fecha === fechaISO);

  const formatearFechaCorta = (iso: string) => {
    const [anio, mes, dia] = iso.split('-').map(Number);
    return `${dia} de ${NOMBRES_MESES[mes - 1]} de ${anio}`;
  };

  const formatearFechaEvaluacion = (isoConHora: string) => {
    const d = new Date(isoConHora);
    return `${d.getDate()} de ${NOMBRES_MESES[d.getMonth()]} de ${d.getFullYear()}`;
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-0 sm:p-4 font-sans">
      <div className="w-full max-w-md h-screen sm:h-[850px] bg-slate-50 shadow-2xl flex flex-col relative sm:rounded-[40px] border border-gray-100 overflow-hidden">

        {/* HEADER */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between bg-white border-b border-slate-100 flex-shrink-0">
          <button onClick={() => router.push('/perfil')} className="p-2 -ml-2 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
          </button>
          <h3 className="text-sm font-bold text-[#2A3B50]">Historial y evaluaciones</h3>
          <div className="w-9" />
        </div>

        {/* TABS */}
        <div className="px-6 pt-4 pb-2 bg-white border-b border-slate-100">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setPestana('registros')}
              className={`flex-1 text-center text-xs font-bold py-2 rounded-lg transition-all ${
                pestana === 'registros' ? 'bg-white shadow-sm text-[#2A3B50]' : 'text-slate-500'
              }`}
            >
              📅 Registro emocional
            </button>
            <button
              onClick={() => setPestana('evaluaciones')}
              className={`flex-1 text-center text-xs font-bold py-2 rounded-lg transition-all ${
                pestana === 'evaluaciones' ? 'bg-white shadow-sm text-[#2A3B50]' : 'text-slate-500'
              }`}
            >
              📊 Evaluaciones
            </button>
          </div>
        </div>

        {/* CONTENIDO */}
        <div className="flex-1 overflow-y-auto p-6">
          {cargando ? (
            <div className="flex justify-center pt-10">
              <div className="w-8 h-8 border-4 border-[#4A72A6] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : pestana === 'registros' ? (
            <div className="space-y-4">
              {/* Navegación de mes */}
              <div className="flex justify-between items-center bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
                <button
                  onClick={() => setFechaCalendario(new Date(fechaCalendario.getFullYear(), fechaCalendario.getMonth() - 1, 1))}
                  className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <span className="text-sm font-bold text-[#2A3B50] capitalize">
                  {NOMBRES_MESES[fechaCalendario.getMonth()]} {fechaCalendario.getFullYear()}
                </span>
                <button
                  onClick={() => setFechaCalendario(new Date(fechaCalendario.getFullYear(), fechaCalendario.getMonth() + 1, 1))}
                  className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Calendario mensual */}
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                <div className="grid grid-cols-7 gap-1 mb-2 text-center">
                  {['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'].map(d => (
                    <span key={d} className="text-[10px] font-bold text-slate-400">{d}</span>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1 text-center">
                  {Array.from({ length: new Date(fechaCalendario.getFullYear(), fechaCalendario.getMonth(), 1).getDay() }).map((_, i) => (
                    <div key={`blank-${i}`} className="p-2" />
                  ))}
                  {Array.from({ length: new Date(fechaCalendario.getFullYear(), fechaCalendario.getMonth() + 1, 0).getDate() }).map((_, i) => {
                    const dia = i + 1;
                    const dateISO = `${fechaCalendario.getFullYear()}-${String(fechaCalendario.getMonth() + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
                    const registro = registroDelDia(dateISO);

                    return (
                      <button
                        key={dia}
                        onClick={() => registro && setDiaSeleccionado(registro)}
                        className={`relative p-1.5 flex flex-col items-center justify-center rounded-xl text-xs w-full aspect-square transition-all ${
                          registro ? 'hover:scale-105 cursor-pointer' : 'text-slate-300'
                        }`}
                      >
                        <span className="font-medium">{dia}</span>
                        {registro && (
                          <span className={`w-1.5 h-1.5 rounded-full mt-0.5 ${COLOR_POR_NIVEL[registro.nivel] ?? 'bg-slate-300'}`} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Leyenda */}
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-wrap gap-3 justify-center">
                {[
                  { n: 5, l: 'Muy bien' },
                  { n: 4, l: 'Bien' },
                  { n: 3, l: 'Regular' },
                  { n: 2, l: 'Mal' },
                  { n: 1, l: 'Muy mal' },
                ].map((item) => (
                  <div key={item.n} className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${COLOR_POR_NIVEL[item.n]}`} />
                    <span className="text-[10px] font-medium text-slate-500">{item.l}</span>
                  </div>
                ))}
              </div>

              {registros.length === 0 && (
                <div className="p-4 bg-white border border-dashed border-slate-200 rounded-2xl text-center text-xs text-slate-400">
                  Aún no tienes registros emocionales.
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {evaluaciones.length === 0 ? (
                <div className="p-4 bg-white border border-dashed border-slate-200 rounded-2xl text-center text-xs text-slate-400">
                  Aún no has completado ninguna evaluación PSS-4.
                </div>
              ) : (
                evaluaciones.map((ev) => {
                  const estilo = COLOR_NIVEL_ESTRES[ev.nivel_estres] ?? COLOR_NIVEL_ESTRES.Moderado;
                  return (
                    <button
                      key={ev.id}
                      onClick={() => setEvaluacionSeleccionada(ev)}
                      className={`w-full text-left p-4 rounded-2xl border shadow-sm hover:shadow-md active:scale-[0.99] transition-all ${estilo.bg}`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                            {formatearFechaEvaluacion(ev.creado_at)}
                          </p>
                          <p className={`text-sm font-black mt-0.5 ${estilo.text}`}>
                            Nivel {ev.nivel_estres}
                          </p>
                        </div>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full bg-white/70 ${estilo.text}`}>
                          {ev.puntaje_total} / 16
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* MODAL DETALLE DEL DÍA */}
        {diaSeleccionado && (
          <div
            className="absolute inset-0 z-50 bg-slate-900/40 flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setDiaSeleccionado(null)}
          >
            <div
              className="bg-white w-full sm:max-w-sm rounded-t-[30px] sm:rounded-[30px] p-6 shadow-2xl space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {formatearFechaCorta(diaSeleccionado.fecha)}
                </p>
                <button onClick={() => setDiaSeleccionado(null)} className="text-slate-400 hover:text-slate-600 text-xl font-bold leading-none">&times;</button>
              </div>

              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-5xl">{diaSeleccionado.emoji}</span>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cómo te sentiste</p>
                  <p className="text-lg font-black text-[#2A3B50] mt-0.5">{diaSeleccionado.estado}</p>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Tu nota</p>
                {diaSeleccionado.nota ? (
                  <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 max-h-36 overflow-y-auto">
                    <p className="text-sm text-slate-600 font-medium leading-relaxed break-words whitespace-pre-wrap">
                      "{diaSeleccionado.nota}"
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

        {/* MODAL DETALLE DE LA EVALUACIÓN */}
        {evaluacionSeleccionada && (() => {
          const estilo = COLOR_NIVEL_ESTRES[evaluacionSeleccionada.nivel_estres] ?? COLOR_NIVEL_ESTRES.Moderado;
          const respuestas = evaluacionSeleccionada.respuestas ?? {};

          return (
            <div
              className="absolute inset-0 z-50 bg-slate-900/40 flex items-end sm:items-center justify-center p-0 sm:p-4"
              onClick={() => setEvaluacionSeleccionada(null)}
            >
              <div
                className="bg-white w-full sm:max-w-sm rounded-t-[30px] sm:rounded-[30px] p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    {formatearFechaEvaluacion(evaluacionSeleccionada.creado_at)}
                  </p>
                  <button onClick={() => setEvaluacionSeleccionada(null)} className="text-slate-400 hover:text-slate-600 text-xl font-bold leading-none">&times;</button>
                </div>

                <div className={`p-4 rounded-2xl border flex items-center justify-between ${estilo.bg}`}>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Nivel de estrés</p>
                    <p className={`text-xl font-extrabold mt-0.5 ${estilo.text}`}>{evaluacionSeleccionada.nivel_estres}</p>
                  </div>
                  <span className={`text-sm font-black px-3 py-1.5 rounded-xl bg-white/80 ${estilo.text}`}>
                    {evaluacionSeleccionada.puntaje_total} / 16
                  </span>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                  <div className="relative w-full h-3 bg-slate-100 rounded-full">
                    <div className="absolute inset-0 flex rounded-full overflow-hidden">
                      <div className="w-[31%] h-full bg-emerald-400/80" />
                      <div className="w-[44%] h-full bg-amber-400/80 border-x border-white" />
                      <div className="w-[25%] h-full bg-rose-400/80" />
                    </div>
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-indigo-900 rounded-full border-2 border-white shadow"
                      style={{ left: estilo.barra }}
                    />
                  </div>
                  <div className="grid grid-cols-3 text-[10px] font-bold text-slate-400 mt-2 text-center">
                    <div>Bajo <span className="block font-medium">0-5</span></div>
                    <div className="border-x border-slate-100">Moderado <span className="block font-medium">6-12</span></div>
                    <div>Alto <span className="block font-medium">13-16</span></div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 font-medium leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  {estilo.mensaje}
                </p>

                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tus respuestas</p>
                  {PREGUNTAS_PSS4.map((p) => {
                    const valor = respuestas[p.id];
                    if (valor === undefined) return null;
                    return (
                      <div key={p.id} className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                        <p className="text-[11px] font-semibold text-slate-600">{p.enunciado}</p>
                        <p className="text-xs font-bold text-[#4A72A6] mt-1">{OPCIONES_PSS4[valor] ?? valor}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}