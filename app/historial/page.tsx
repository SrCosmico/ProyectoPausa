'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export default function HistorialPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-0 sm:p-4 font-sans">
      <div className="w-full max-w-md h-screen sm:h-[850px] bg-slate-50 shadow-2xl flex flex-col relative sm:rounded-[40px] border border-gray-100 overflow-hidden">

        {/* HEADER */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between bg-white border-b border-slate-100 flex-shrink-0">
          <button
            onClick={() => router.push('/perfil')}
            className="p-2 -ml-2 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
          </button>
          <h3 className="text-sm font-bold text-[#2A3B50]">Historial emocional</h3>
          <div className="w-9" />
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <p className="text-xs text-slate-400 font-medium mb-2">
            Elige qué quieres revisar de tu bienestar.
          </p>

          <button
            onClick={() => router.push('/historial/calendario')}
            className="w-full text-left p-5 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md hover:border-indigo-200 transition-all active:scale-[0.99] flex items-center gap-4"
          >
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-2xl flex-shrink-0">
              📅
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-[#2A3B50]">Calendario emocional</h4>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                Revisa día a día cómo te has sentido.
              </p>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 text-slate-300 flex-shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </button>

          <button
            onClick={() => router.push('/historial/evaluaciones')}
            className="w-full text-left p-5 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md hover:border-purple-200 transition-all active:scale-[0.99] flex items-center gap-4"
          >
            <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center text-2xl flex-shrink-0">
              📊
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-[#2A3B50]">Evaluaciones guardadas</h4>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                Consulta los resultados de tus tests PSS-4.
              </p>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 text-slate-300 flex-shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}