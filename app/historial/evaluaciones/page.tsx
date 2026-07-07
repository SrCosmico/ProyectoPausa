'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabase';
import {
  leerHistorialEvaluacionesEstres,
  type ResultadoEvaluacionDB,
} from '@/lib/supabase/evaluacion';

function estiloPorNivel(nivel: string) {
  switch (nivel) {
    case 'Bajo':
      return { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-700', emoji: '😊' };
    case 'Moderado':
      return { bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-700', emoji: '😐' };
    case 'Alto':
      return { bg: 'bg-rose-50', border: 'border-rose-100', text: 'text-rose-700', badge: 'bg-rose-100 text-rose-700', emoji: '😩' };
    default:
      return { bg: 'bg-slate-50', border: 'border-slate-100', text: 'text-slate-700', badge: 'bg-slate-100 text-slate-700', emoji: '📋' };
  }
}

function formatearFecha(iso: string): string {
  const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const d = new Date(iso);
  return `${d.getDate()} de ${meses[d.getMonth()]}, ${d.getFullYear()}`;
}

export default function EvaluacionesGuardadasPage() {
  const router = useRouter();
  const [evaluaciones, setEvaluaciones] = useState<ResultadoEvaluacionDB[]>([]);
  const [cargando, setCargando] = useState(true);
  const [expandidoId, setExpandidoId] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const datos = await leerHistorialEvaluacionesEstres(user.id);
      setEvaluaciones(datos);
      setCargando(false);
    };
    init();
  }, [router]);

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
          <h3 className="text-sm font-bold text-[#2A3B50]">Evaluaciones guardadas</h3>
          <div className="w-9" />
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {cargando && (
            <p className="text-xs text-slate-400 text-center py-10 animate-pulse">Cargando evaluaciones...</p>
          )}

          {!cargando && evaluaciones.length === 0 && (
            <div className="p-6 bg-white border border-dashed border-slate-200 rounded-2xl text-center">
              <p className="text-xs text-slate-400">Aún no tienes evaluaciones guardadas.</p>
              <button
                onClick={() => router.push('/evaluacion')}
                className="mt-3 text-xs font-bold text-[#4A72A6] bg-blue-50 border border-blue-100 rounded-full px-4 py-2 hover:bg-blue-100 transition-colors"
              >
                Hacer una evaluación
              </button>
            </div>
          )}

          {evaluaciones.map((ev) => {
            const estilo = estiloPorNivel(ev.nivel_estres);
            const expandido = expandidoId === ev.id;
            return (
              <div
                key={ev.id}
                className={`rounded-2xl border overflow-hidden shadow-sm ${estilo.bg} ${estilo.border}`}
              >
                <button
                  onClick={() => setExpandidoId(expandido ? null : ev.id)}
                  className="w-full flex items-center justify-between p-4 text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{estilo.emoji}</span>
                    <div>
                      <p className={`text-sm font-bold ${estilo.text}`}>Nivel {ev.nivel_estres}</p>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">{formatearFecha(ev.creado_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${estilo.badge}`}>
                      {ev.puntaje_total}/16
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={`w-4 h-4 text-slate-400 transition-transform ${expandido ? 'rotate-180' : ''}`}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
                  </div>
                </button>

                {expandido && (
                  <div className="px-4 pb-4 space-y-2">
                    <div className="relative w-full h-3 bg-white/70 rounded-full">
                      <div className="absolute inset-0 flex rounded-full overflow-hidden">
                        <div className="w-[31%] h-full bg-emerald-400/70" />
                        <div className="w-[44%] h-full bg-amber-400/70 border-x border-white" />
                        <div className="w-[25%] h-full bg-rose-400/70" />
                      </div>
                      <div
                        className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-slate-800 rounded-full border-2 border-white shadow"
                        style={{ left: `${Math.min(100, (ev.puntaje_total / 16) * 100)}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium">
                      Puntaje total: <strong>{ev.puntaje_total} de 16</strong> según el test PSS-4.
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}