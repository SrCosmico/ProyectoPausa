"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
// DELATE
import { deleteItem } from '@/lib/supabase/preferenciasApoyo';
import { guardarPreferenciasOnboarding } from '@/lib/supabase/onboarding';

export type PreferenciaId =
  | "ejercicios_calma"
  | "tips_antistres"
  | "organizacion"
  | "motivacion_habitos"
  | "acompanamiento"
  | "chat_ia";

export interface OpcionPreferencia {
  id: PreferenciaId;
  label: string;
  icono?: string;
  seleccionado: boolean;
}

export interface PantallaPreferenciasApoyo {
  paso: number;
  totalPasos: number;
  pregunta: string;
  instruccion: string;
  opciones: OpcionPreferencia[];
  botonContinuar: string;
  botonVolver: string;
}

export const opcionesPreferenciasData: Omit<OpcionPreferencia, "seleccionado">[] = [
  { id: "ejercicios_calma",    label: "Ejercicios para calmarme" },
  { id: "tips_antistres",      label: "Consejos y tips anti-estrés" },
  { id: "organizacion",        label: "Organización académica" },
  { id: "motivacion_habitos",  label: "Motivación y hábitos" },
  { id: "acompanamiento",      label: "Acompañamiento emocional" },
  { id: "chat_ia",             label: "Hablar con alguien (IA)" },
];

const mapeoIconos: Record<PreferenciaId, string> = {
  ejercicios_calma: "🧘",
  tips_antistres: "💡",
  organizacion: "📅",
  motivacion_habitos: "🌱",
  acompanamiento: "🤝",
  chat_ia: "🤖"
};

export default function PreferenciasApoyoPage() {
  const router = useRouter();

  const [seleccionados, setSeleccionados] = useState<Record<PreferenciaId, boolean>>({
    ejercicios_calma: false,
    tips_antistres: false,
    organizacion: false,
    motivacion_habitos: false,
    acompanamiento: false,
    chat_ia: false,
  });

  const datosPreferencias: PantallaPreferenciasApoyo = {
    paso: 4,
    totalPasos: 6,
    pregunta: "¿Qué tipo de apoyo te gustaría recibir en Pausa?",
    instruccion: "Elige lo que más te gustaría usar",
    opciones: opcionesPreferenciasData.map(item => ({
      id: item.id,
      label: item.label,
      icono: mapeoIconos[item.id],
      seleccionado: seleccionados[item.id]
    })),
    botonContinuar: "Continuar",
    botonVolver: "Volver"
  };

  const toggleOpcionId = (id: PreferenciaId) => {
    setSeleccionados(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const manejarContinuar = () => {
    const preferenciasSeleccionadas = (Object.keys(seleccionados) as PreferenciaId[]).filter(
      (id) => seleccionados[id]
    );
    guardarPreferenciasOnboarding(preferenciasSeleccionadas);
    router.push('/frecuencia');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-0 sm:p-4 font-sans selection:bg-blue-100">
      <div className="w-full max-w-md min-h-screen sm:min-h-[850px] sm:max-h-[900px] bg-white shadow-2xl overflow-y-auto flex flex-col justify-between relative sm:rounded-[40px] border border-gray-100 p-6">
        
        <div className="pt-4">
          
          <button 
            onClick={() => router.push('/factoresImpacto')} 
            className="p-2 -ml-2 text-[#7E8CA0] hover:text-[#4A72A6] transition-colors focus:outline-none rounded-full hover:bg-slate-50 active:scale-95"
            aria-label="Regresar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
          </button>

          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
            <div className="bg-[#4A72A6] h-full w-4/6 rounded-full transition-all duration-300" />
          </div>
          <p className="text-[11px] font-bold text-[#8C9BAE] tracking-wider mt-2">
            Paso {datosPreferencias.paso} de {datosPreferencias.totalPasos}
          </p>

          <h3 className="text-xl font-bold text-[#2A3B50] mt-4 leading-snug">
            {datosPreferencias.pregunta}
          </h3>
          <p className="text-xs text-[#8C9BAE] mt-1">
            {datosPreferencias.instruccion}
          </p>
          
          <div className="space-y-3 mt-6">
            {datosPreferencias.opciones.map((opcion) => (
              <button
                key={opcion.id}
                onClick={() => toggleOpcionId(opcion.id)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border text-left transition-all duration-150 active:scale-[0.99] ${
                  opcion.seleccionado 
                    ? 'border-[#4A72A6] bg-[#4A72A6]/5 shadow-sm' 
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl opacity-90">{opcion.icono}</span>
                  <span className="text-sm font-medium text-[#475569]">{opcion.label}</span>
                </div>

                <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                  opcion.seleccionado ? 'bg-[#4A72A6] border-[#4A72A6]' : 'border-slate-300'
                }`}>
                  {opcion.seleccionado && (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="white" className="w-3 h-3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 pb-4 w-full">
          <button 
            onClick={manejarContinuar}
            className="w-full bg-[#4A72A6] hover:bg-[#3B5E8C] text-white font-semibold py-4 px-6 rounded-2xl shadow-lg shadow-blue-900/10 transition-all active:scale-[0.99] text-base text-center"
          >
            {datosPreferencias.botonContinuar}
          </button>
        </div>

      </div>
    </div>
  );
}