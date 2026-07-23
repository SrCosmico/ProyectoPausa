"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabase';
import { insertarResultadoEvaluacionEstres } from '@/lib/supabase/evaluacion';

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

// Tipo explícito del nivel de estrés (usado también por insertarResultadoEvaluacionEstres)
export type NivelEstresPSS4 = "Bajo" | "Moderado" | "Alto";

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

// ==========================================
// TRIAJE: UMBRAL DE CLASIFICACIÓN PSS-4
// ==========================================
const UMBRAL_MODERADO = 6;
const UMBRAL_ALTO = 13;

function clasificarNivelEstres(puntajeTotal: number): NivelEstresPSS4 {
  if (puntajeTotal >= UMBRAL_ALTO) return "Alto";
  if (puntajeTotal >= UMBRAL_MODERADO) return "Moderado";
  return "Bajo";
}

export default function EvaluacionFlujoPage() {
  const router = useRouter();

  const [pasoActual, setPasoActual] = useState<number>(0); 
  const [respuestas, setRespuestas] = useState<Record<string, number>>({});
  const [animarCambio, setAnimarCambio] = useState<boolean>(false);

  const [guardando, setGuardando] = useState<boolean>(false);
  const [errorGuardado, setErrorGuardado] = useState<string | null>(null);
  const [exitoGuardado, setExitoGuardado] = useState<boolean>(false);

  const preguntaActual = preguntasPSS4Data[pasoActual - 1];

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

  const calcularResultadoEstres = () => {
    let puntajeTotal = 0;
    preguntasPSS4Data.forEach((p) => {
      const puntosAsignados = respuestas[p.id] || 0;
      puntajeTotal += p.esInversa ? (4 - puntosAsignados) : puntosAsignados;
    });

    const nivel = clasificarNivelEstres(puntajeTotal);

    if (nivel === "Bajo") {
      return { 
        puntaje: puntajeTotal,
        nivel, 
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
    } else if (nivel === "Moderado") {
      return { 
        puntaje: puntajeTotal,
        nivel, 
        colorText: "text-indigo-900",
        colorBg: "bg-purple-50 border-purple-100", 
        porcentajeBarra: "52%",
        mensaje: "Estás experimentando un nivel moderado de estrés. Es normal sentirse así ocasionalmente, pero es importante prestar atención a tu bienestar.",
        emoji: "😐",
        recomendaciones: [
          { icono: "🧘", texto: "Prueba una meditación de 5 minutos" },
          { icono: "🍃", texto: "Revisa tus técnicas anti-estrés" }
        ] as RecomendacionDinamica[]
      };
    } else {
      return { 
        puntaje: puntajeTotal,
        nivel, 
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

  const handleGuardarResultado = async () => {
    if (!infoResultado || guardando) return;

    setGuardando(true);
    setErrorGuardado(null);

    try {
      const { data: { user }, error: errorAuth } = await supabase.auth.getUser();

      if (errorAuth || !user) {
        setErrorGuardado('Debes iniciar sesión para guardar tu resultado.');
        setGuardando(false);
        return;
      }

      const resultadoGuardado = await insertarResultadoEvaluacionEstres(
        user.id,
        infoResultado.puntaje,
        infoResultado.nivel,
        respuestas
      );

      if (!resultadoGuardado || resultadoGuardado.length === 0) {
        throw new Error('No se pudo confirmar el guardado del resultado.');
      }

      setExitoGuardado(true);

      setTimeout(() => {
        router.push('/home');
      }, 900);

    } catch (err) {
      console.error('Error al guardar la evaluación PSS-4:', err);
      setErrorGuardado('Hubo un problema al guardar tu resultado. Intenta de nuevo.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-0 sm:p-4 font-sans selection:bg-blue-100">

      <div className="relative w-full max-w-md h-screen sm:h-[850px] bg-[#F8FAFC] shadow-2xl flex flex-col justify-between sm:rounded-[40px] border border-slate-100 overflow-hidden">

        {/* FONDO DECORATIVO — distribución propia de esta pantalla */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <img
            src="/images/forma_morada.png"
            alt=""
            aria-hidden="true"
            className="absolute -top-16 -right-14 w-64 h-auto opacity-45 select-none -rotate-6"
          />
          <img
            src="/images/ramita_izquierda.png"
            alt=""
            aria-hidden="true"
            className="absolute top-[30%] -left-10 w-28 sm:w-32 h-auto opacity-40 select-none rotate-[18deg]"
          />
          <img
            src="/images/onda_del_medio.png"
            alt=""
            aria-hidden="true"
            className="absolute top-[58%] left-1/2 -translate-x-1/2 w-[135%] max-w-none h-auto opacity-30 select-none"
          />
          <img
            src="/images/ramita_derecha.png"
            alt=""
            aria-hidden="true"
            className="absolute bottom-0 -right-12 w-36 h-auto opacity-45 select-none -rotate-12"
          />
        </div>

        {/* ZONA CENTRAL CON SCROLL INDEPENDIENTE */}
        <div className={`relative z-10 flex-1 overflow-y-auto p-6 transition-all duration-200 ${animarCambio ? 'opacity-0 scale-[0.99]' : 'opacity-100 scale-100'}`}>
          
          {/* PANTALLA 0 — INTRO */}
          {pasoActual === 0 && (
            <div className="flex flex-col h-full justify-between">
              <div>
                <button
                  onClick={() => router.push('/home')}
                  className="p-2.5 -ml-1 rounded-full bg-white/80 backdrop-blur-sm shadow-sm text-slate-600 hover:text-slate-800 transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                  </svg>
                </button>

                <h2 className="text-xl font-bold text-[#2A3B50] mt-4">Evaluación rápida</h2>
                <p className="text-xs font-semibold text-purple-500 mt-0.5">Test de Estrés Percibido (PSS-4)</p>

                <h3 className="text-[21px] font-extrabold text-[#2A3B50] leading-tight mt-5">
                  ¿Cómo ha sido tu nivel de estrés últimamente?
                </h3>

                <div className="my-6 flex justify-center">
                  <div className="relative w-40 h-40 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm border border-purple-100/60">
                    <svg viewBox="0 0 200 200" className="w-28 h-28">
                      {/* Arco de fondo del medidor */}
                      <path
                        d="M 40 140 A 70 70 0 0 1 160 140"
                        fill="none"
                        stroke="#EDE9FE"
                        strokeWidth="14"
                        strokeLinecap="round"
                      />
                      {/* Arco de color: verde -> amarillo -> rojo */}
                      <path d="M 40 140 A 70 70 0 0 1 78 76" fill="none" stroke="#34D399" strokeWidth="14" strokeLinecap="round" />
                      <path d="M 82 73 A 70 70 0 0 1 118 73" fill="none" stroke="#FBBF24" strokeWidth="14" strokeLinecap="round" />
                      <path d="M 122 76 A 70 70 0 0 1 160 140" fill="none" stroke="#FB7185" strokeWidth="14" strokeLinecap="round" />
                      {/* Aguja apuntando a nivel moderado */}
                      <line x1="100" y1="140" x2="128" y2="95" stroke="#4C1D95" strokeWidth="5" strokeLinecap="round" />
                      <circle cx="100" cy="140" r="9" fill="#4C1D95" />
                    </svg>
                    <span className="absolute top-4 right-6 text-purple-300 text-lg">✦</span>
                    <span className="absolute bottom-6 left-4 text-purple-400 text-xl">✦</span>
                    <span className="absolute top-16 left-2 text-indigo-300 text-sm">🍃</span>
                    <span className="absolute bottom-10 right-2 text-indigo-300 text-sm">🍃</span>
                  </div>
                </div>

                {/* AVISO: NO ES UN DIAGNÓSTICO PROFESIONAL */}
                <div className="mb-5 p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2.5">
                  <span className="text-base flex-shrink-0">ℹ️</span>
                  <p className="text-[11px] font-semibold text-amber-800 leading-relaxed">
                    Este test es una guía de autoconocimiento y <strong>no constituye un diagnóstico profesional</strong>.
                    Si sientes que necesitas apoyo, habla con un profesional de salud mental.
                  </p>
                </div>

                <p className="text-xs text-slate-600 font-medium leading-relaxed mb-5">
                  El PSS-4 es un cuestionario validado que mide cuán estresado te has sentido durante el último mes.
                </p>

                <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 p-4 space-y-3">
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
                  className="w-full bg-[#4A72A6] hover:bg-[#3B5E8C] text-white font-semibold py-4 rounded-2xl shadow-md shadow-blue-100 transition-transform active:scale-[0.99] text-sm"
                >
                  Comenzar test
                </button>
                <p className="text-[10px] text-slate-400 font-medium mt-3">
                  Tus respuestas son privadas y se usan solo para tu bienestar.
                </p>
              </div>
            </div>
          )}

          {/* PANTALLAS 1 A 4 — PREGUNTAS */}
          {pasoActual >= 1 && pasoActual <= 4 && (
            <div>
              <div className="flex items-center justify-between bg-white/80 backdrop-blur-sm rounded-2xl px-4 py-3 border border-slate-100 shadow-sm">
                <h2 className="text-sm font-bold text-[#2A3B50]">PSS-4</h2>
                <span className="text-[11px] font-bold text-slate-400">Pregunta {pasoActual} de 4</span>
              </div>

              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                <div 
                  className="bg-purple-400 h-full rounded-full transition-all duration-300"
                  style={{ width: `${(pasoActual / 4) * 100}%` }}
                />
              </div>

              <div className="mt-8 min-h-[80px] bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-slate-100 shadow-sm">
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
                      className={`w-full flex items-center justify-between p-4 rounded-2xl border text-left transition-all text-xs font-bold shadow-sm ${
                        seleccionado 
                          ? 'bg-blue-50/70 backdrop-blur-sm border-[#4A72A6] text-[#4A72A6]' 
                          : 'bg-white/80 backdrop-blur-sm border-slate-100 text-slate-600 hover:bg-white'
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
                      ? 'bg-[#4A72A6] text-white hover:bg-[#3B5E8C] shadow-md shadow-blue-100' 
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

          {/* PANTALLA 5 — RESULTADOS */}
          {pasoActual === 5 && infoResultado && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <button
                  onClick={() => cambiarPasoSeguro(0)}
                  className="p-2.5 -ml-1 rounded-full bg-white/80 backdrop-blur-sm shadow-sm text-slate-600 hover:text-slate-800 transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                  </svg>
                </button>
                <h2 className="text-xl font-bold text-[#2A3B50] mt-3">Resultados PSS-4</h2>
              </div>

              <div className={`p-5 rounded-3xl border flex items-center justify-between shadow-sm ${infoResultado.colorBg}`}>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Tu nivel de estrés percibido es:</p>
                  <h3 className={`text-2xl font-extrabold mt-1 ${infoResultado.colorText}`}>
                    {infoResultado.nivel}
                  </h3>
                </div>
                <span className="text-4xl bg-white p-2 rounded-2xl shadow-sm">{infoResultado.emoji}</span>
              </div>

              <div className="bg-white/90 backdrop-blur-sm border border-slate-100 rounded-2xl p-4 shadow-sm">
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
                <p className="text-xs text-slate-600 font-medium leading-relaxed bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-slate-100 shadow-sm">
                  {infoResultado.mensaje}
                </p>
              </div>

              {/* AVISO: NO ES UN DIAGNÓSTICO PROFESIONAL */}
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2.5">
                <span className="text-base flex-shrink-0">ℹ️</span>
                <p className="text-[11px] font-semibold text-amber-800 leading-relaxed">
                  Este resultado es orientativo y <strong>no reemplaza una evaluación profesional</strong>.
                  Si necesitas apoyo, considera hablar con un especialista en salud mental.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#2A3B50] uppercase tracking-wider">Recomendaciones para ti</h4>
                
                <div className="space-y-2">
                  {infoResultado.recomendaciones.map((recom, index) => (
                    <div key={index} className="flex items-center gap-3 p-3.5 bg-white/80 backdrop-blur-sm border border-slate-100 rounded-xl shadow-sm transition-all duration-300 animate-fade-in">
                      <span className="text-lg">{recom.icono}</span>
                      <p className="text-xs font-bold text-slate-700">{recom.texto}</p>
                    </div>
                  ))}
                </div>
              </div>

              {errorGuardado && (
                <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-semibold rounded-xl">
                  ⚠️ {errorGuardado}
                </div>
              )}
              {exitoGuardado && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-semibold rounded-xl">
                  ✅ Resultado guardado. Redirigiendo...
                </div>
              )}

              <div className="pt-2 space-y-2.5">
                <button 
                  onClick={handleGuardarResultado}
                  disabled={guardando || exitoGuardado}
                  className={`w-full font-semibold py-4 rounded-2xl shadow-sm text-sm flex items-center justify-center gap-2 transition-all ${
                    guardando || exitoGuardado
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      : 'bg-[#4A72A6] hover:bg-[#3B5E8C] text-white active:scale-[0.99] shadow-md shadow-blue-100'
                  }`}
                >
                  {guardando && (
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {guardando ? 'Guardando...' : exitoGuardado ? 'Guardado ✓' : 'Guardar resultado'}
                </button>
                <button 
                  onClick={() => cambiarPasoSeguro(0)}
                  disabled={guardando}
                  className="w-full bg-white/80 backdrop-blur-sm border border-slate-200 text-slate-500 hover:text-slate-700 font-semibold py-3.5 rounded-2xl text-xs disabled:opacity-50"
                >
                  Volver al inicio
                </button>
              </div>
            </div>
          )}

        </div>

        {/* NAVEGACIÓN INFERIOR */}
        <div className="relative z-10 border-t border-slate-100 px-6 py-3.5 flex justify-around items-center sm:rounded-b-[40px] shadow-[0_-6px_20px_rgba(0,0,0,0.01)] bg-white/95 backdrop-blur-md flex-shrink-0">
          <button onClick={() => router.push('/home')} className="flex flex-col items-center gap-1 py-1 px-4 text-slate-400 hover:text-[#4A72A6]">
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