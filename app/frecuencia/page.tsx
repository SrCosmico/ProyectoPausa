"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { guardarFrecuenciaOnboarding } from '@/lib/supabase/onboarding';

export type FrecuenciaId =
  | "todos_los_dias"
  | "varias_semana"
  | "algunas_mes"
  | "rara_vez"
  | "casi_nunca";

export interface OpcionFrecuencia {
  id: FrecuenciaId;
  label: string;
  seleccionado: boolean;
}

export interface PantallaFrecuencia {
  paso: number;
  totalPasos: number;
  pregunta: string;
  instruccion: string;
  opciones: OpcionFrecuencia[];
  botonContinuar: string;
  botonVolver: string;
}

export const opcionesFrecuenciaData: Omit<OpcionFrecuencia, "seleccionado">[] = [
  { id: "todos_los_dias", label: "Todos los días" },
  { id: "varias_semana",  label: "Varias veces por semana" },
  { id: "algunas_mes",    label: "Algunas veces al mes" },
  { id: "rara_vez",       label: "Rara vez" },
  { id: "casi_nunca",     label: "Casi nunca" },
];

export default function FrecuenciaPage() {
  const router = useRouter();

  const [seleccionadoId, setSeleccionadoId] = useState<FrecuenciaId | null>(null);

  const datosFrecuencia: PantallaFrecuencia = {
    paso: 5,
    totalPasos: 6,
    pregunta: "¿Con qué frecuencia sientes estrés o ansiedad?",
    instruccion: "Elige la opción que mejor te represente",
    opciones: opcionesFrecuenciaData.map(item => ({
      ...item,
      seleccionado: item.id === seleccionadoId
    })),
    botonContinuar: "Continuar",
    botonVolver: "Volver"
  };

  const seleccionarOpcion = (id: FrecuenciaId) => {
    setSeleccionadoId(id);
  };

  const manejarContinuar = () => {
    if (!seleccionadoId) return;
    guardarFrecuenciaOnboarding(seleccionadoId);
    router.push('/confirmacion');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-0 sm:p-4 font-sans selection:bg-blue-100">
      <div className="w-full max-w-md min-h-screen sm:min-h-[850px] sm:max-h-[900px] bg-white shadow-2xl overflow-y-auto flex flex-col justify-between relative sm:rounded-[40px] border border-gray-100 p-6">
        
        <div className="pt-4">
          
          <button 
            onClick={() => router.push('/preferenciasApoyo')} 
            className="p-2 -ml-2 text-[#7E8CA0] hover:text-[#4A72A6] transition-colors focus:outline-none rounded-full hover:bg-slate-50 active:scale-95"
            aria-label="Regresar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
          </button>

          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
            <div className="bg-[#4A72A6] h-full w-5/6 rounded-full transition-all duration-300" />
          </div>
          <p className="text-[11px] font-bold text-[#8C9BAE] tracking-wider mt-2">
            Paso {datosFrecuencia.paso} de {datosFrecuencia.totalPasos}
          </p>

          <h3 className="text-xl font-bold text-[#2A3B50] mt-4 leading-snug">
            {datosFrecuencia.pregunta}
          </h3>
          <p className="text-xs text-[#8C9BAE] mt-1">
            {datosFrecuencia.instruccion}
          </p>
          
          <div className="space-y-3 mt-6">
            {datosFrecuencia.opciones.map((opcion) => (
              <button
                key={opcion.id}
                onClick={() => seleccionarOpcion(opcion.id)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border text-left transition-all duration-150 active:scale-[0.99] ${
                  opcion.seleccionado 
                    ? 'border-[#4A72A6] bg-[#4A72A6]/5 shadow-sm' 
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <span className="text-sm font-medium text-[#475569]">
                  {opcion.label}
                </span>

                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                  opcion.seleccionado ? 'border-[#4A72A6]' : 'border-slate-300'
                }`}>
                  {opcion.seleccionado && (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#4A72A6] animate-scaleIn" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 pb-4 w-full">
          <button 
            disabled={!seleccionadoId}
            onClick={manejarContinuar}
            className={`w-full font-semibold py-4 px-6 rounded-2xl shadow-lg transition-all active:scale-[0.99] text-base text-center ${
              seleccionadoId 
                ? 'bg-[#4A72A6] hover:bg-[#3B5E8C] text-white shadow-blue-900/10' 
                : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
            }`}
          >
            {datosFrecuencia.botonContinuar}
          </button>
        </div>

      </div>
    </div>
  );
}