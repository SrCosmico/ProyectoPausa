"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
//DELATE
import { deleteItem } from '@/lib/supabase/motivos';
import { guardarMotivosOnboarding } from '@/lib/supabase/onboarding';

export type MotivoId =
  | "estres"
  | "bienestar"
  | "dormir"
  | "academico"
  | "motivacion"
  | "otro";

export interface OpcionMotivo {
  id: MotivoId;
  label: string;
  icono?: string;
  seleccionado: boolean;
}

export interface PantallaMotivos {
  paso: number;
  totalPasos: number;
  pregunta: string;
  instruccion: string;
  opciones: OpcionMotivo[];
  otroTexto: string;
  botonContinuar: string;
}

export const opcionesMotivosData: Omit<OpcionMotivo, "seleccionado">[] = [
  { id: "estres",      label: "Manejar el estrés" },
  { id: "bienestar",   label: "Mejorar mi bienestar emocional" },
  { id: "dormir",      label: "Dormir mejor" },
  { id: "academico",   label: "Organizarme mejor académicamente" },
  { id: "motivacion",  label: "Sentirme más motivado/a" },
  { id: "otro",        label: "Otro (especificar)" },
];

const mapeoIconos: Record<MotivoId, string> = {
  estres: "🧘",
  bienestar: "🌸",
  dormir: "🌙",
  academico: "📚",
  motivacion: "✨",
  otro: "✏️"
};

export default function MotivosPage() {
  const router = useRouter();

  const [seleccionados, setSeleccionados] = useState<Record<MotivoId, boolean>>({
    estres: true,
    bienestar: false,
    dormir: false,
    academico: false,
    motivacion: false,
    otro: false
  });

  const [otroTexto, setOtroTexto] = useState<string>('');
  const [simulacionEnvioOtro, setSimulacionEnvioOtro] = useState<boolean>(false);

  const datosMotivos: PantallaMotivos = {
    paso: 1,
    totalPasos: 6,
    pregunta: "¿Cuál es tu principal motivo para usar Pausa?",
    instruccion: "Puedes elegir más de una opción",
    opciones: opcionesMotivosData.map(item => ({
      id: item.id,
      label: item.label,
      icono: mapeoIconos[item.id],
      seleccionado: seleccionados[item.id]
    })),
    otroTexto: otroTexto,
    botonContinuar: "Continuar"
  };

  const toggleOpcionId = (id: MotivoId) => {
    setSeleccionados(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleOtroSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (otroTexto.trim() !== '') {
        setSimulacionEnvioOtro(true);
        setTimeout(() => {
          setSimulacionEnvioOtro(false);
        }, 3000);
      }
    }
  };

  // Persiste las opciones elegidas y avanza al siguiente paso del cuestionario
  const manejarContinuar = () => {
    const motivosSeleccionados = (Object.keys(seleccionados) as MotivoId[]).filter(
      (id) => seleccionados[id]
    );
    guardarMotivosOnboarding(motivosSeleccionados, otroTexto);
    router.push('/estadoActual');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-0 sm:p-4 font-sans selection:bg-blue-100">
      <div className="w-full max-w-md min-h-screen sm:min-h-[850px] sm:max-h-[900px] bg-white shadow-2xl overflow-y-auto flex flex-col justify-between relative sm:rounded-[40px] border border-gray-100 p-6">
        
        <div className="pt-4">
          
          <button 
            onClick={() => router.push('/bienvenida')} 
            className="p-2 -ml-2 text-[#7E8CA0] hover:text-[#4A72A6] transition-colors focus:outline-none"
            aria-label="Volver a la pantalla de bienvenida"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
          </button>

          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
            <div className="bg-[#4A72A6] h-full w-1/6 rounded-full transition-all duration-300" />
          </div>
          <p className="text-[11px] font-bold text-[#8C9BAE] tracking-wider mt-2">
            Paso {datosMotivos.paso} de {datosMotivos.totalPasos}
          </p>

          <h3 className="text-xl font-bold text-[#2A3B50] mt-4 leading-snug">
            {datosMotivos.pregunta}
          </h3>
          <p className="text-xs text-[#8C9BAE] mt-1">
            {datosMotivos.instruccion}
          </p>
          
          <div className="space-y-3 mt-6">
            {datosMotivos.opciones.map((opcion) => {
              if (opcion.id === "otro") return null;
              
              return (
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
              );
            })}

            {(() => {
              const opcionOtro = datosMotivos.opciones.find(o => o.id === "otro");
              if (!opcionOtro) return null;

              return (
                <div className={`w-full rounded-2xl border p-4 transition-all duration-150 ${
                  opcionOtro.seleccionado ? 'border-[#4A72A6] bg-[#4A72A6]/5' : 'border-slate-200 bg-white'
                }`}>
                  <button 
                    onClick={() => toggleOpcionId("otro")} 
                    className="w-full flex items-center justify-between text-left focus:outline-none"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl opacity-90">{opcionOtro.icono}</span>
                      <span className="text-sm font-medium text-[#475569]">{opcionOtro.label}</span>
                    </div>
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                      opcionOtro.seleccionado ? 'bg-[#4A72A6] border-[#4A72A6]' : 'border-slate-300'
                    }`}>
                      {opcionOtro.seleccionado && (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="white" className="w-3 h-3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                      )}
                    </div>
                  </button>

                  {opcionOtro.seleccionado && (
                    <div className="mt-3 relative">
                      <input
                        type="text"
                        value={otroTexto}
                        onChange={(e) => setOtroTexto(e.target.value)}
                        onKeyDown={handleOtroSubmit}
                        placeholder="Escribe tu motivo y presiona Enter..."
                        className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#4A72A6] text-slate-700 transition-colors"
                      />
                      {simulacionEnvioOtro && (
                        <p className="text-[11px] text-emerald-600 font-semibold mt-2 flex items-center gap-1 bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                          ✨ ¡Mensaje enviado con éxito! (Simulación)
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>

        <div className="mt-8 pb-4">
          <button 
            onClick={manejarContinuar}
            className="w-full bg-[#4A72A6] hover:bg-[#3B5E8C] text-white font-semibold py-4 px-6 rounded-2xl shadow-lg shadow-blue-900/10 transition-all active:scale-[0.99] text-base text-center"
          >
            {datosMotivos.botonContinuar}
          </button>
        </div>

      </div>
    </div>
  );
}