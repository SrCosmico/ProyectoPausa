"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

// ==========================================
// CONFIGURACIÓN Y TIPOS DE LA ESCALA VALIDADA PSS-4
// ==========================================

export type FrecuenciaEstres = 
  | "Nunca" 
  | "Casi nunca" 
  | "A veces" 
  | "A menudo" 
  | "Muy a menudo";

export interface PreguntaPSS4 {
  id: string;
  enunciado: string;
  esInversa: boolean; 
}

export interface OpcionRespuestaEstres {
  texto: FrecuenciaEstres;
  puntosBase: number; 
}

export interface RecomendacionDinamica {
  icono: string;
  texto: string;
}

export const preguntasPSS4Data: PreguntaPSS4[] = [
  { 
    id: "p1", 
    enunciado: "En el último mes, ¿con qué frecuencia has sentido que no podías controlar las cosas importantes de tu vida?", 
    esInversa: false 
  },
  { 
    id: "p2", 
    enunciado: "En el último mes, ¿con qué frecuencia te has sentido seguro de tu capacidad para manejar tus problemas personales?", 
    esInversa: true 
  },
  { 
    id: "p3", 
    enunciado: "En el último mes, ¿con qué frecuencia has sentido que las cosas salían como tú querías?", 
    esInversa: true 
  },
  { 
    id: "p4", 
    enunciado: "En el último mes, ¿con qué frecuencia has sentido que las dificultades se acumulaban tanto que no podías superarlas?", 
    esInversa: false 
  },
];

export const opcionesPSS4Data: OpcionRespuestaEstres[] = [
  { texto: "Nunca", puntosBase: 0 },
  { texto: "Casi nunca", puntosBase: 1 },
  { texto: "A veces", puntosBase: 2 },
  { texto: "A menudo", puntosBase: 3 },
  { texto: "Muy a menudo", puntosBase: 4 },
];

export default function EvaluacionFlujoPage() {
  const router = useRouter();

  // --- ESTADOS LOCALES ---
  const [pasoActual, setPasoActual] = useState<number>(0); 
  const [respuestas, setRespuestas] = useState<Record<string, number>>({});
  const [animarCambio, setAnimarCambio] = useState<boolean>(false);

  const preguntaActual = preguntasPSS4Data[pasoActual - 1];

  // --- MANEJADORES DE FLUJO INTERNOS ---
  const cambiarPasoSeguro = (nuevoPaso: number) => {
    setAnimarCambio(true);
    setTimeout(() => {
      setPasoActual(nuevoPaso);
      setAnimarCambio(false);
    }, 200);
  };

  const seleccionarOpcion = (puntos: number) => {
    setRespuestas({ ...respuestas, [preguntaActual.id]: puntos });
  };

  const avanzarPregunta = () => {
    if (respuestas[preguntaActual.id] === undefined) return;
    cambiarPasoSeguro(pasoActual + 1);
  };

  const retrocederPaso = () => {
    if (pasoActual === 0 || pasoActual === 1) {
      cambiarPasoSeguro(0);
    } else {
      cambiarPasoSeguro(pasoActual - 1);
    }
  };

  // --- CÁLCULO DE RESULTADOS CON RECOMENDACIONES CONDICIONALES ---
  const calcularResultadoEstres = () => {
    let puntajeTotal = 0;
    preguntasPSS4Data.forEach((p) => {
      const puntosAsignados = respuestas[p.id] || 0;
      puntajeTotal += p.esInversa ? (4 - puntosAsignados) : puntosAsignados;
    });

    if (puntajeTotal <= 5) {
      return { 
        puntaje: puntajeTotal,
        nivel: "Bajo", 
        colorText: "text-emerald-600",
        colorBg: "bg-emerald-50/60 border-emerald-100", 
        porcentajeBarra: "15%",
        mensaje: "Estás experimentando un nivel bajo de estrés percibido. Te sientes con control de tus actividades diarias.",
        emoji: "😊",
        recomendaciones: [
          { icono: "🌱", texto: "Registra tu gratitud de hoy en tu diario personal" },
          { icono: "🚀", texto: "¡Gran balance! Sigue manteniendo tus hábitos actuales" }
        ] as RecomendacionDinamica[]
      };
    } else if (puntajeTotal <= 12) {
      return { 
        puntaje: puntajeTotal,
        nivel: "Moderado", 
        colorText: "text-indigo-900",
        colorBg: "bg-purple-50 border-purple-100", 
        porcentajeBarra: "52%",
        mensaje: "Estás experimentando un nivel moderado de estrés. Es normal sentirse así ocasionalmente, pero es importante prestar atención a tu bienestar.",
        emoji: "😐",
        // Vinculado exactamente a tu mockup original
        recomendaciones: [
          { icono: "🧘", texto: "Prueba una meditación de 5 minutos" },
          { icono: "🍃", texto: "Revisa tus técnicas anti-estrés" }
        ] as RecomendacionDinamica[]
      };
    } else {
      return { 
        puntaje: puntajeTotal,
        nivel: "Alto", 
        colorText: "text-rose-600",
        colorBg: "bg-rose-50 border-rose-100", 
        porcentajeBarra: "88%",
        mensaje: "Tus niveles de estrés percibido son elevados. Te recomendamos tomar pausas regulares y apoyarte en nuestras herramientas de contención.",
        emoji: "😩",
        recomendaciones: [
          { icono: "😮‍💨", texto: "Realiza una respiración consciente profunda ahora" },
          { icono: "🚨", texto: "Prueba el modo crisis para asistencia inmediata" }
        ] as RecomendacionDinamica[]
      };
    }
  };

  const infoResultado = pasoActual === 5 ? calcularResultadoEstres() : null;

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-0 sm:p-4 font-sans selection:bg-blue-100">
      
      {/* Contenedor Mockup Mobile */}
      <div className="w-full max-w-md h-screen sm:h-[850px] bg-white shadow-2xl flex flex-col justify-between relative sm:rounded-[40px] border border-gray-100 overflow-hidden">
        
        {/* ZONA CENTRAL CON SCROLL INDEPENDIENTE */}
        <div className={`flex-1 overflow-y-auto p-6 transition-all duration-200 ${animarCambio ? 'opacity-0 scale-[0.99]' : 'opacity-100 scale-100'}`}>
          
          {/* ========================================================= */}
          {/* PANTALLA 2 (INTRO/BIENVENIDA AL TEST)                     */}
          {/* ========================================================= */}
          {pasoActual === 0 && (
            <div className="flex flex-col h-full justify-between">
              <div>
                <button onClick={() => router.push('/home.2')} className="p-1 -ml-1 text-slate-400 hover:text-slate-600">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                  </svg>
                </button>

                <h2 className="text-xl font-bold text-[#2A3B50] mt-3">Evaluación rápida</h2>
                <p className="text-xs font-semibold text-purple-500 mt-0.5">Test de Estrés Percibido (PSS-4)</p>

                <h3 className="text-[21px] font-extrabold text-[#2A3B50] leading-tight mt-5">
                  ¿Cómo ha sido tu nivel de estrés últimamente?
                </h3>

                <div className="my-6 flex justify-center">
                  <div className="relative w-40 h-40 bg-purple-50 rounded-full flex items-center justify-center">
                    <svg viewBox="0 0 200 200" className="w-32 h-32 text-indigo-400" fill="currentColor">
                      <circle cx="100" cy="90" r="32" className="text-purple-300" />
                      <path d="M50 160c0-35 25-50 50-50s50 15 50 50v10H50v-10z" className="text-purple-400" />
                      <path d="M90 95l10 12 10-12" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
                    </svg>
                    <span className="absolute top-4 right-6 text-purple-300 text-lg">✦</span>
                    <span className="absolute bottom-6 left-4 text-purple-400 text-xl">✦</span>
                    <span className="absolute top-16 left-2 text-indigo-300 text-sm">🍃</span>
                    <span className="absolute bottom-10 right-2 text-indigo-300 text-sm">🍃</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 font-medium leading-relaxed mb-5">
                  El PSS-4 es un cuestionario validado que mide cuán estresado te has sentido durante el último mes.
                </p>

                <div className="space-y-3">
                  {[
                    "Solo 4 preguntas",
                    "Toma 1-2 minutos",
                    "Resultados al instante",
                    "100% confidencial"
                  ].map((text, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-purple-100 rounded-md flex items-center justify-center text-purple-600 flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                          <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-xs font-bold text-[#334155]">{text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 text-center">
                <button
                  onClick={() => cambiarPasoSeguro(1)}
                  className="w-full bg-[#4A72A6] hover:bg-[#3B5E8C] text-white font-semibold py-4 rounded-2xl shadow-md transition-transform active:scale-[0.99] text-sm"
                >
                  Comenzar test
                </button>
                <p className="text-[10px] text-slate-400 font-medium mt-3">
                  Tus respuestas son privadas y se usan solo para tu bienestar.
                </p>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* PANTALLAS 3 Y 4 (PREGUNTAS DINÁMICAS)                     */}
          {/* ========================================================= */}
          {pasoActual >= 1 && pasoActual <= 4 && (
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-[#2A3B50]">PSS-4</h2>
                <span className="text-[11px] font-bold text-slate-400">Pregunta {pasoActual} de 4</span>
              </div>

              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                <div 
                  className="bg-purple-400 h-full rounded-full transition-all duration-300"
                  style={{ width: `${(pasoActual / 4) * 100}%` }}
                />
              </div>

              <div className="mt-8 min-h-[80px]">
                <h3 className="text-base font-extrabold text-[#2A3B50] leading-relaxed">
                  {preguntaActual.enunciado}
                </h3>
              </div>

              <div className="mt-6 space-y-3">
                {opcionesPSS4Data.map((opcion) => {
                  const seleccionado = respuestas[preguntaActual.id] === opcion.puntosBase;
                  return (
                    <button
                      key={opcion.texto}
                      onClick={() => seleccionarOpcion(opcion.puntosBase)}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl border text-left transition-all text-xs font-bold ${
                        seleccionado 
                          ? 'bg-blue-50/40 border-[#4A72A6] text-[#4A72A6]' 
                          : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-base">
                          {opcion.puntosBase === 0 && "😊"}
                          {opcion.puntosBase === 1 && "🙂"}
                          {opcion.puntosBase === 2 && "😐"}
                          {opcion.puntosBase === 3 && "🙁"}
                          {opcion.puntosBase === 4 && "😩"}
                        </span>
                        <span>{opcion.texto}</span>
                      </div>
                      
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        seleccionado ? 'border-[#4A72A6]' : 'border-slate-300'
                      }`}>
                        {seleccionado && <div className="w-2 h-2 rounded-full bg-[#4A72A6]" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-8 text-center space-y-4">
                <button
                  onClick={avanzarPregunta}
                  disabled={respuestas[preguntaActual.id] === undefined}
                  className={`w-full font-semibold py-4 rounded-2xl transition-all text-sm ${
                    respuestas[preguntaActual.id] !== undefined
                      ? 'bg-[#4A72A6] text-white hover:bg-[#3B5E8C]' 
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {pasoActual === 4 ? "Ver mis resultados" : "Siguiente"}
                </button>

                <button 
                  onClick={retrocederPaso} 
                  className="text-xs font-bold text-slate-500 hover:text-slate-700 flex items-center justify-center gap-1 mx-auto"
                >
                  ← Volver
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* PANTALLA 5 (PANTALLA DE RESULTADOS ACTUALIZADA CONDICIONAL)*/}
          {/* ========================================================= */}
          {pasoActual === 5 && infoResultado && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <button onClick={() => cambiarPasoSeguro(0)} className="p-1 -ml-1 text-slate-400 hover:text-slate-600">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                  </svg>
                </button>
                <h2 className="text-xl font-bold text-[#2A3B50] mt-2">Resultados PSS-4</h2>
              </div>

              <div className={`p-5 rounded-3xl border flex items-center justify-between ${infoResultado.colorBg}`}>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Tu nivel de estrés percibido es:</p>
                  <h3 className={`text-2xl font-extrabold mt-1 ${infoResultado.colorText}`}>
                    {infoResultado.nivel}
                  </h3>
                </div>
                <span className="text-4xl bg-white p-2 rounded-2xl shadow-sm">{infoResultado.emoji}</span>
              </div>

              <div className="bg-white border border-slate-100 rounded-2xl p-4">
                <div className="flex justify-between items-center text-[11px] font-bold text-slate-500 mb-2">
                  <span>Tu puntuación:</span>
                  <span className="text-indigo-900">{infoResultado.puntaje} de 16</span>
                </div>
                
                <div className="relative w-full h-3 bg-slate-100 rounded-full mt-3">
                  <div className="absolute inset-0 flex rounded-full overflow-hidden">
                    <div className="w-[31%] h-full bg-emerald-400/80" /> 
                    <div className="w-[44%] h-full bg-amber-400/80 border-x border-white" /> 
                    <div className="w-[25%] h-full bg-rose-400/80" /> 
                  </div>
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-indigo-900 rounded-full border-2 border-white shadow transition-all duration-500"
                    style={{ left: infoResultado.porcentajeBarra }}
                  />
                </div>
                
                <div className="grid grid-cols-3 text-[10px] font-bold text-slate-400 mt-2 text-center">
                  <div>Bajo <span className="block font-medium">0-5</span></div>
                  <div className="border-x border-slate-100">Moderado <span className="block font-medium">6-12</span></div>
                  <div>Alto <span className="block font-medium">13-16</span></div>
                </div>
              </div>

              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-[#2A3B50] uppercase tracking-wider">¿Qué significa?</h4>
                <p className="text-xs text-slate-600 font-medium leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  {infoResultado.mensaje}
                </p>
              </div>

              {/* RENDERIZADO CONDICIONAL DE RECOMENDACIONES SEGÚN EL ESTADO */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#2A3B50] uppercase tracking-wider">Recomendaciones para ti</h4>
                
                <div className="space-y-2">
                  {infoResultado.recomendaciones.map((recom, index) => (
                    <div key={index} className="flex items-center gap-3 p-3.5 bg-slate-50/50 border border-slate-100 rounded-xl transition-all duration-300 animate-fade-in">
                      <span className="text-lg">{recom.icono}</span>
                      <p className="text-xs font-bold text-slate-700">{recom.texto}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 space-y-2.5">
                <button 
                  onClick={() => router.push('/home.2')}
                  className="w-full bg-[#4A72A6] hover:bg-[#3B5E8C] text-white font-semibold py-4 rounded-2xl shadow-sm text-sm"
                >
                  Guardar resultado
                </button>
                <button 
                  onClick={() => cambiarPasoSeguro(0)}
                  className="w-full bg-white border border-slate-200 text-slate-500 hover:text-slate-700 font-semibold py-3.5 rounded-2xl text-xs"
                >
                  Volver al inicio
                </button>
              </div>
            </div>
          )}

        </div>

        {/* NAVEGACIÓN INFERIOR COMPLEMENTARIA */}
        <div className="border-t border-slate-100 px-6 py-3.5 flex justify-around items-center sm:rounded-b-[40px] shadow-[0_-6px_20px_rgba(0,0,0,0.01)] bg-white flex-shrink-0 z-30">
          <button onClick={() => router.push('/home.2')} className="flex flex-col items-center gap-1 py-1 px-4 text-slate-400 hover:text-[#4A72A6]">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M11.47 3.822a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 0 1-1.06 1.06L20 13.061v6.189a1.75 1.75 0 0 1-1.75 1.75H15.25a.75.75 0 0 1-.75-.75V16.5a.5.5 0 0 0-.5-.5h-2a.5.5 0 0 0-.5.5v3.75a.75.75 0 0 1-.75.75H5.75A1.75 1.75 0 0 1 4 19.25v-6.19l-.56.56a.75.75 0 0 1-1.06-1.06l8.69-8.69Z" />
            </svg>
            <span className="text-[10px] font-bold">Inicio</span>
          </button>

          <button onClick={() => cambiarPasoSeguro(0)} className="flex flex-col items-center gap-1 py-1 px-4 text-[#4A72A6]">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M10.5 3.75a.75.75 0 0 0-1.5 0v16.5a.75.75 0 0 0 1.5 0V3.75ZM6 6.75a.75.75 0 0 0-1.5 0v10.5a.75.75 0 0 0 1.5 0V6.75ZM19.5 9.75a.75.75 0 0 0-1.5 0v4.5a.75.75 0 0 0 1.5 0v-4.5ZM15 8.25a.75.75 0 0 0-1.5 0v7.5a.75.75 0 0 0 1.5 0v-7.5Z" />
            </svg>
            <span className="text-[10px] font-bold">Evaluación</span>
          </button>

          <button onClick={() => router.push('/perfil')} className="flex flex-col items-center gap-1 py-1 px-4 text-slate-400 hover:text-[#4A72A6]">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
            </svg>
            <span className="text-[10px] font-bold">Perfil</span>
          </button>
        </div>

      </div>
    </div>
  );
}