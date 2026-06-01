"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegistroEmocionalPage() {
  const router = useRouter();
  const [emocionSeleccionada, setEmocionSeleccionada] = useState<string | null>(null);

  const emociones = [
    { emoji: "😊", label: "Feliz" },
    { emoji: "😐", label: "Neutral" },
    { emoji: "😔", label: "Triste" },
    { emoji: "😰", label: "Ansioso" },
    { emoji: "😡", label: "Enojado" },
    { emoji: "😴", label: "Cansado" }
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md h-[850px] bg-white shadow-2xl flex flex-col relative rounded-[40px] border border-gray-100 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 pt-10 pb-6">
          <h2 className="text-xl font-black text-slate-800">¿Cómo te sientes hoy?</h2>
          <p className="text-xs text-slate-400 mt-1">Registra tu estado emocional para tu seguimiento.</p>
        </div>

        {/* Selector de Emociones */}
        <div className="flex-1 px-6">
          <div className="grid grid-cols-2 gap-4">
            {emociones.map((emocion) => (
              <button
                key={emocion.label}
                onClick={() => setEmocionSeleccionada(emocion.label)}
                className={`p-6 rounded-3xl border-2 flex flex-col items-center gap-3 transition-all ${
                  emocionSeleccionada === emocion.label 
                    ? "border-[#4A72A6] bg-blue-50" 
                    : "border-slate-100 bg-slate-50 hover:border-slate-200"
                }`}
              >
                <span className="text-4xl">{emocion.emoji}</span>
                <span className="text-xs font-bold text-slate-700">{emocion.label}</span>
              </button>
            ))}
          </div>

          {/* Campo adicional opcional */}
          <div className="mt-8">
            <label className="text-xs font-bold text-slate-500 mb-2 block">¿Algo más que quieras anotar?</label>
            <textarea 
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-medium text-slate-700 focus:outline-none focus:border-[#4A72A6]"
              rows={3}
              placeholder="Hoy me siento..."
            />
          </div>
        </div>

        {/* Botón de acción */}
        <div className="p-6 border-t border-slate-100">
          <button
            onClick={() => router.push('/monitoreo.2')}
            disabled={!emocionSeleccionada}
            className={`w-full py-4 rounded-2xl text-xs font-bold text-white transition-all ${
              emocionSeleccionada 
                ? "bg-[#4A72A6] hover:bg-[#3b5e8c]" 
                : "bg-slate-300 cursor-not-allowed"
            }`}
          >
            Guardar y ver monitoreo
          </button>
        </div>

      </div>
    </div>
  );
}