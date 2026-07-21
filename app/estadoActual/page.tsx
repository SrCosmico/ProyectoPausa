"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { guardarEstadoActualOnboarding } from '@/lib/supabase/onboarding';

export type EstadoEmocionalId =
  | "muy_mal"
  | "mal"
  | "regular"
  | "bien"
  | "muy_bien";

export interface OpcionEstadoActual {
  id: EstadoEmocionalId;
  label: string;
  descripcion: string;
  emoji: string;
  seleccionado: boolean;
}

export interface PantallaEstadoActual {
  paso: number;
  totalPasos: number;
  pregunta: string;
  instruccion: string;
  opciones: OpcionEstadoActual[];
  botonContinuar: string;
  botonVolver: string;
}

export const opcionesEstadoData: Omit<OpcionEstadoActual, "seleccionado">[] = [
  { id: "muy_mal",  label: "Muy mal",  descripcion: "Me siento abrumado/a",     emoji: "😩" },
  { id: "mal",      label: "Mal",      descripcion: "He tenido días difíciles", emoji: "😔" },
  { id: "regular",  label: "Regular",  descripcion: "Ni bien ni mal",           emoji: "😐" },
  { id: "bien",     label: "Bien",     descripcion: "Me he sentido bien",       emoji: "😊" },
  { id: "muy_bien", label: "Muy bien", descripcion: "Me siento excelente",      emoji: "😄" },
];

export default function EstadoActualPage() {
  const router = useRouter();

  // null = ninguna opción seleccionada al inicio
  const [seleccionadoId, setSeleccionadoId] = useState<EstadoEmocionalId | null>(null);

  const datosEstadoActual: PantallaEstadoActual = {
    paso: 2,
    totalPasos: 6,
    pregunta: "¿Cómo te has sentido últimamente?",
    instruccion: "Elige la opción que mejor te represente",
    opciones: opcionesEstadoData.map(opt => ({
      ...opt,
      seleccionado: seleccionadoId === opt.id,
    })),
    botonContinuar: "Continuar",
    botonVolver: "Volver",
  };

  const manejarContinuar = () => {
    if (!seleccionadoId) return;
    guardarEstadoActualOnboarding(seleccionadoId);
    router.push('/factoresImpacto');
  };

  const botonHabilitado = seleccionadoId !== null;

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-0 sm:p-4 font-sans selection:bg-blue-100">
      <div className="w-full max-w-md min-h-screen sm:min-h-[850px] sm:max-h-[900px] bg-white shadow-2xl overflow-y-auto flex flex-col justify-between relative sm:rounded-[40px] border border-gray-100 p-6">

        <div className="pt-4">

          <button
            onClick={() => router.push('/motivos')}
            className="p-2 -ml-2 text-[#7E8CA0] hover:text-[#4A72A6] transition-colors focus:outline-none"
            aria-label="Volver a la pantalla de motivos"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
          </button>

          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
            <div className="bg-[#4A72A6] h-full w-2/6 rounded-full" />
          </div>

          <p className="text-[11px] font-bold text-[#8C9BAE] tracking-wider mt-2">
            Paso {datosEstadoActual.paso} de {datosEstadoActual.totalPasos}
          </p>

          <h3 className="text-xl font-bold text-[#2A3B50] mt-4 leading-snug">
            {datosEstadoActual.pregunta}
          </h3>
          <p className="text-xs text-[#8C9BAE] mt-1">
            {datosEstadoActual.instruccion}
          </p>

          <div className="space-y-3 mt-6">
            {datosEstadoActual.opciones.map((opcion) => (
              <button
                key={opcion.id}
                onClick={() => setSeleccionadoId(opcion.id)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border text-left transition-all duration-150 active:scale-[0.99] ${
                  opcion.seleccionado
                    ? 'border-[#4A72A6] bg-[#4A72A6]/5 shadow-sm'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl select-none" role="img" aria-label={opcion.label}>
                    {opcion.emoji}
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-[#475569]">{opcion.label}</h4>
                    <p className="text-xs text-[#8C9BAE] mt-0.5">{opcion.descripcion}</p>
                  </div>
                </div>

                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                  opcion.seleccionado ? 'border-[#4A72A6]' : 'border-slate-300'
                }`}>
                  {opcion.seleccionado && (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#4A72A6]" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 pb-4">
          <button
            onClick={manejarContinuar}
            disabled={!botonHabilitado}
            className={`w-full font-semibold py-4 px-6 rounded-2xl shadow-lg transition-all active:scale-[0.99] text-base text-center
              ${botonHabilitado
                ? 'bg-[#4A72A6] hover:bg-[#3B5E8C] text-white shadow-blue-900/10 cursor-pointer'
                : 'bg-slate-200 text-slate-400 shadow-none cursor-not-allowed'
              }`}
          >
            {datosEstadoActual.botonContinuar}
          </button>
        </div>

      </div>
    </div>
  );
}