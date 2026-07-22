"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import type { IntervencionEmocional } from '@/lib/cronograma/vinculacionEmocional';

interface ModalIntervencionEmocionalProps {
  intervencion: IntervencionEmocional;
  onCerrar: () => void;
}

export default function ModalIntervencionEmocional({
  intervencion,
  onCerrar,
}: ModalIntervencionEmocionalProps) {
  const router = useRouter();

  const irARespiracion = () => {
    onCerrar();
    router.push('/meditacion');
  };

  const irACronograma = () => {
    onCerrar();
    router.push('/cronograma');
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-sm rounded-t-[30px] sm:rounded-[30px] p-6 shadow-2xl space-y-4 animate-slideUp max-h-[90vh] overflow-y-auto">
        <div className="flex items-center gap-3">
          <span className="text-2xl">💙</span>
          <h3 className="text-sm font-bold text-[#2A3B50]">Un momento para ti</h3>
        </div>

        <p className="text-xs text-slate-600 font-medium leading-relaxed bg-slate-50 border border-slate-100 rounded-2xl p-4">
          {intervencion.mensaje}
        </p>

        <button
          onClick={irARespiracion}
          className="w-full py-3.5 bg-[#4A72A6] hover:bg-[#3B5E8C] text-white text-xs font-bold rounded-2xl transition-colors flex items-center justify-center gap-2"
        >
          🌬️ Empezar respiración de 5 minutos
        </button>

        <div className="pt-2 border-t border-slate-100 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Después, prueba dividir tu estudio así:
          </p>
          {intervencion.bloquesSugeridos.map((bloque, idx) => (
            <div key={idx} className="flex items-start gap-3 bg-indigo-50/60 border border-indigo-100 rounded-2xl p-3">
              <span className="text-xs font-black text-indigo-500 flex-shrink-0 mt-0.5">{idx + 1}</span>
              <div>
                <p className="text-xs font-bold text-slate-700">
                  {bloque.titulo} <span className="text-slate-400 font-medium">· {bloque.duracionMinutos} min</span>
                </p>
                <p className="text-[11px] text-slate-500 leading-snug">{bloque.descripcion}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 pt-1">
          <button
            onClick={onCerrar}
            className="flex-1 py-3 border border-slate-200 text-slate-500 text-xs font-bold rounded-2xl hover:bg-slate-50 transition-colors"
          >
            Ahora no
          </button>
          <button
            onClick={irACronograma}
            className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl transition-colors"
          >
            Ver mi cronograma
          </button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .animate-slideUp { animation: slideUp 0.3s cubic-bezier(0.32,0.72,0,1) forwards; }
      `}</style>
    </div>
  );
}