"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
// DELATE
import { deleteItem } from '@/lib/supabase/factoresImpacto';
import { guardarFactoresOnboarding } from '@/lib/supabase/onboarding';

export type FactorId =
  | "estres_academico"
  | "sobrecarga_tareas"
  | "falta_tiempo"
  | "problemas_personales"
  | "ansiedad"
  | "motivacion_baja"
  | "otro";

export interface OpcionFactor {
  id: FactorId;
  label: string;
  icono?: string;
  seleccionado: boolean;
}

export interface PantallaFactoresImpacto {
  paso: number;
  totalPasos: number;
  pregunta: string;
  instruccion: string;
  opciones: OpcionFactor[];
  otroTexto: string;
  botonContinuar: string;
  botonVolver: string;
}

export const opcionesFactoresData: Omit<OpcionFactor, "seleccionado">[] = [
  { id: "estres_academico",     label: "Estrés académico" },
  { id: "sobrecarga_tareas",    label: "Sobrecarga de tareas" },
  { id: "falta_tiempo",         label: "Falta de tiempo" },
  { id: "problemas_personales", label: "Problemas personales" },
  { id: "ansiedad",             label: "Ansiedad / Preocupación" },
  { id: "motivacion_baja",      label: "Motivación baja" },
  { id: "otro",                 label: "Otro (especificar)" },
];

const mapeoIconos: Record<FactorId, string> = {
  estres_academico:     "🎓",
  sobrecarga_tareas:    "📝",
  falta_tiempo:         "⏳",
  problemas_personales: "👥",
  ansiedad:             "🧠",
  motivacion_baja:      "📉",
  otro:                 "✏️",
};

export default function FactoresImpactoPage() {
  const router = useRouter();

  const [seleccionados, setSeleccionados] = useState<Record<FactorId, boolean>>({
    estres_academico:     false,
    sobrecarga_tareas:    false,
    falta_tiempo:         false,
    problemas_personales: false,
    ansiedad:             false,
    motivacion_baja:      false,
    otro:                 false,
  });
  const [otroTexto, setOtroTexto]         = useState<string>('');
  const [envioSimulado, setEnvioSimulado] = useState<boolean>(false);

  const datosFactores: PantallaFactoresImpacto = {
    paso: 3,
    totalPasos: 6,
    pregunta: "¿Qué situaciones afectan más tu bienestar?",
    instruccion: "Puedes elegir más de una opción",
    opciones: opcionesFactoresData.map(item => ({
      id: item.id,
      label: item.label,
      icono: mapeoIconos[item.id],
      seleccionado: seleccionados[item.id],
    })),
    otroTexto,
    botonContinuar: "Continuar",
    botonVolver: "Volver",
  };

  // Al menos una opción seleccionada para habilitar el botón
  const haySeleccion = (Object.values(seleccionados) as boolean[]).some(Boolean);

  const toggleOpcionId = (id: FactorId) => {
    setSeleccionados(prev => ({ ...prev, [id]: !prev[id] }));
    if (id === 'otro' && seleccionados['otro']) {
      setEnvioSimulado(false);
    }
  };

  const manejarEnvioSimulado = () => {
    if (otroTexto.trim() !== '') setEnvioSimulado(true);
  };

  const manejarContinuar = () => {
    if (!haySeleccion) return;
    const factoresSeleccionados = (Object.keys(seleccionados) as FactorId[]).filter(
      id => seleccionados[id]
    );
    guardarFactoresOnboarding(factoresSeleccionados, otroTexto);
    router.push('/preferenciasApoyo');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-0 sm:p-4 font-sans selection:bg-blue-100">
      <div className="w-full max-w-md min-h-screen sm:min-h-[850px] sm:max-h-[900px] bg-white shadow-2xl overflow-y-auto flex flex-col justify-between relative sm:rounded-[40px] border border-gray-100 p-6">

        <div className="pt-4">

          <button
            onClick={() => router.push('/estadoActual')}
            className="p-2 -ml-2 text-[#7E8CA0] hover:text-[#4A72A6] transition-colors focus:outline-none rounded-full hover:bg-slate-50 active:scale-95"
            aria-label="Regresar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
          </button>

          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
            <div className="bg-[#4A72A6] h-full w-3/6 rounded-full transition-all duration-300" />
          </div>
          <p className="text-[11px] font-bold text-[#8C9BAE] tracking-wider mt-2">
            Paso {datosFactores.paso} de {datosFactores.totalPasos}
          </p>

          <h3 className="text-xl font-bold text-[#2A3B50] mt-4 leading-snug">
            {datosFactores.pregunta}
          </h3>
          <p className="text-xs text-[#8C9BAE] mt-1">
            {datosFactores.instruccion}
          </p>

          <div className="space-y-3 mt-6">
            {datosFactores.opciones.map((opcion) => (
              <div key={opcion.id} className="w-full">
                <button
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

                {opcion.id === 'otro' && opcion.seleccionado && (
                  <div className="mt-2 px-1 space-y-2 dynamic-input-animation">
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        value={datosFactores.otroTexto}
                        onChange={(e) => {
                          setOtroTexto(e.target.value);
                          if (envioSimulado) setEnvioSimulado(false);
                        }}
                        onKeyDown={(e) => { if (e.key === 'Enter') manejarEnvioSimulado(); }}
                        placeholder="Escribe aquí tu situación..."
                        className="w-full pl-4 pr-12 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#4A72A6] focus:bg-white text-slate-700 transition-colors placeholder:text-slate-400"
                      />
                      <button
                        onClick={manejarEnvioSimulado}
                        className="absolute right-2 p-2 text-[#4A72A6] hover:text-[#3B5E8C] transition-colors rounded-lg hover:bg-slate-200/50"
                        title="Enviar respuesta"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                        </svg>
                      </button>
                    </div>

                    {envioSimulado && (
                      <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 pl-1 transition-all">
                        ✨ ¡Especificación guardada con éxito!
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 pb-4 w-full">
          <button
            onClick={manejarContinuar}
            disabled={!haySeleccion}
            className={`w-full font-semibold py-4 px-6 rounded-2xl shadow-lg transition-all active:scale-[0.99] text-base text-center
              ${haySeleccion
                ? 'bg-[#4A72A6] hover:bg-[#3B5E8C] text-white shadow-blue-900/10 cursor-pointer'
                : 'bg-slate-200 text-slate-400 shadow-none cursor-not-allowed'
              }`}
          >
            {datosFactores.botonContinuar}
          </button>
        </div>

      </div>
    </div>
  );
}