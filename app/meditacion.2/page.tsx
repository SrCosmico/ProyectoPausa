"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation"; // Importamos el enrutador real

// --- TYPES AND INTERFACES ---
type FlowStep = "main_menu" | "config_session" | "active_session" | "completed_session";
type SessionType = "respiracion" | "meditacion";

export default function MeditacionRespiracionApp() {
  const router = useRouter(); // Instanciamos el enrutador para navegar entre archivos
  
  // Navigation Flow State
  const [step, setStep] = useState<FlowStep>("main_menu");
  const [sessionType, setSessionType] = useState<SessionType>("respiracion");
  
  // Configuration State
  const [selectedDuration, setSelectedDuration] = useState<number>(5); 
  
  // Active Session Engine State
  const [secondsLeft, setSecondsLeft] = useState<number>(0);
  const [totalSeconds, setTotalSeconds] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  
  // Real-Time Instructional Content
  const [currentInstruction, setCurrentInstruction] = useState<string>("");
  const [currentSubtext, setCurrentSubtext] = useState<string>("");
  const [visualPhase, setVisualPhase] = useState<string>("inhala"); 

  // Web Speech Synthesis Sync State
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const lastSpokenPhraseRef = useRef<string>("");

  // Initialize Speech engine safe for client-side
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis;
    }
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const speakInstruction = (text: string) => {
    if (!synthRef.current) return;
    if (lastSpokenPhraseRef.current === text) return; 
    
    synthRef.current.cancel(); 
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "es-ES";
    utterance.rate = 0.82;  
    utterance.pitch = 1.0;
    
    utterance.onend = () => {
      lastSpokenPhraseRef.current = text;
    };
    
    synthRef.current.speak(utterance);
  };

  // --- CORE TIME ENGINE & TEXT-TO-SPEECH CYCLES ---
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (step === "active_session" && !isPaused && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => {
          const nextSeconds = prev - 1;
          const timeElapsed = totalSeconds - nextSeconds;

          if (sessionType === "respiracion") {
            const cyclePosition = timeElapsed % 24;
            let instrText = "";
            let subText = "";
            let phase = "inhala";

            if (cyclePosition >= 0 && cyclePosition < 6) {
              instrText = "INHALA";
              subText = "Concentrate únicamente en tu respiración.";
              phase = "inhala";
            } else if (cyclePosition >= 6 && cyclePosition < 12) {
              instrText = "MANTÉN";
              subText = "Sostén el aire suavemente.";
              phase = "manten";
            } else if (cyclePosition >= 12 && cyclePosition < 18) {
              instrText = "EXHALA";
              subText = "Suelta el aire lentamente.";
              phase = "exhala";
            } else {
              instrText = "MANTÉN";
              subText = "Quédate en vacío un instante.";
              phase = "vacio";
            }

            setCurrentInstruction(instrText);
            setCurrentSubtext(subText);
            setVisualPhase(phase);

            if (cyclePosition === 0) speakInstruction("Inhala profundamente por la nariz durante 6 segundos. Llena tus pulmones.");
            if (cyclePosition === 6) speakInstruction("Mantén el aire retenido firmemente por 6 segundos.");
            if (cyclePosition === 12) speakInstruction("Exhala lentamente por la boca liberando la tensión en 6 segundos.");
            if (cyclePosition === 18) speakInstruction("Mantén tus pulmones vacíos en calma por 6 segundos.");

          } else if (sessionType === "meditacion") {
            const medFrases = [
              { title: "Lleva tu atención a tu respiración.", sub: "Siente el aire entrando y saliendo sin forzar el ritmo." },
              { title: "Observa los sonidos a tu alrededor.", sub: "No los juzgues, solo déjalos pasar como nubes." },
              { title: "Permite que los pensamientos pasen sin aferrarte a ellos.", sub: "Si tu mente se distrae, regresa amablemente al presente." },
              { title: "Relaja activamente tu cuerpo.", sub: "Suelta los hombros, destensa la frente y las manos." },
              { title: "Disfruta de este instante de quietud.", sub: "Estás aquí cuidando de tu bienestar mental." }
            ];

            const phaseIndex = Math.floor(timeElapsed / 12) % medFrases.length;
            const chosenPhrase = medFrases[phaseIndex];

            setCurrentInstruction(chosenPhrase.title);
            setCurrentSubtext(chosenPhrase.sub);

            if (timeElapsed % 12 === 0 || timeElapsed === 1) {
              speakInstruction(`${chosenPhrase.title} ${chosenPhrase.sub}`);
            }
          }

          return nextSeconds;
        });
      }, 1000);
    } else if (secondsLeft === 0 && step === "active_session") {
      if (synthRef.current) synthRef.current.cancel();
      speakInstruction("Excelente trabajo. Has completado con éxito tu tiempo dedicado al bienestar.");
      setStep("completed_session");
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step, isPaused, secondsLeft, totalSeconds, sessionType]);

  const handleSelectOption = (type: SessionType) => {
    setSessionType(type);
    setSelectedDuration(type === "respiracion" ? 5 : 10);
    setStep("config_session");
  };

  const handleStartSession = () => {
    const secs = selectedDuration * 60;
    setTotalSeconds(secs);
    setSecondsLeft(secs);
    setIsPaused(false);
    
    if (sessionType === "respiracion") {
      setCurrentInstruction("INHALA");
      setCurrentSubtext("Concentrate únicamente en tu respiración.");
      setVisualPhase("inhala");
      speakInstruction("Comenzamos con la respiración consciente. Inhala.");
    } else {
      setCurrentInstruction("Lleva tu atención a tu respiración.");
      setCurrentSubtext("Siente el aire entrando y saliendo sin forzar el ritmo.");
      speakInstruction("Comenzamos con la meditación guiada. Cierra tus ojos y lleva tu atención a tu respiración.");
    }

    setStep("active_session");
  };

  const handleCancelOrFinalize = () => {
    if (synthRef.current) synthRef.current.cancel();
    setStep("main_menu");
  };

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const getPercentageDone = () => {
    if (totalSeconds === 0) return 0;
    return Math.floor(((totalSeconds - secondsLeft) / totalSeconds) * 100);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-0 sm:p-4 font-sans select-none antialiased">
      <div className="w-full max-w-md h-screen sm:h-[840px] bg-white shadow-2xl flex flex-col justify-between relative sm:rounded-[40px] border border-slate-100 overflow-hidden pb-6">
        
        {/* --- HEADER --- */}
        <div className="px-6 pt-5 pb-3 flex items-center justify-between z-10 min-h-[60px]">
          <button 
            onClick={() => {
              if (step === "active_session") {
                handleCancelOrFinalize();
              } else if (step === "main_menu") {
                // REDIRECCIÓN REAL: Al pulsar la flecha desde el menú inicial, viaja a la pantalla home.2
                router.push("/home.2"); 
              } else {
                setStep("main_menu");
              }
            }}
            className="p-2 -ml-2 text-slate-700 hover:text-slate-900 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
          </button>
          
          <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 flex items-center justify-center border border-slate-300">
            <div className="w-full h-full bg-gradient-to-tr from-orange-300 to-amber-400 flex items-center justify-center text-xs font-bold text-white">JS</div>
          </div>
        </div>

        {/* --- SCREEN WORKSPACE WINDOWS --- */}
        <div className="flex-1 overflow-y-auto px-6 flex flex-col">
          
          {/* STEP 1: MAIN MENU SELECTION SCREEN (HOME INTERNO DEL MÓDULO) */}
          {step === "main_menu" && (
            <div className="space-y-6 flex-1 flex flex-col justify-between pt-2">
              <div className="space-y-5">
                <div>
                  <h2 className="text-2xl font-bold text-[#2A3B50]">Meditación y respiración</h2>
                  <p className="text-sm text-slate-400 font-medium mt-1">Encuentra unos minutos para reconectar contigo.</p>
                </div>

                <div 
                  onClick={() => handleSelectOption("respiracion")}
                  className="w-full flex items-center justify-between p-5 bg-[#EDF3FC] border border-blue-100/70 rounded-3xl cursor-pointer hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-3xl p-3 bg-white/90 rounded-2xl shadow-sm">🍃</span>
                    <div>
                      <h4 className="text-base font-bold text-[#2A3B50]">Respiración guiada</h4>
                      <p className="text-xs text-slate-500 font-medium mt-0.5 max-w-[210px] leading-relaxed">
                        Aprende a controlar el estrés mediante ejercicios respiratorios.
                      </p>
                      <span className="text-[11px] font-bold text-slate-400 mt-2 block">🕒 2 a 20 minutos</span>
                    </div>
                  </div>
                  <button className="bg-[#4A72A6] text-white p-2.5 rounded-full shadow-md group-hover:scale-105 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-4 h-4 translate-x-[1px]">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </button>
                </div>

                <div 
                  onClick={() => handleSelectOption("meditacion")}
                  className="w-full flex items-center justify-between p-5 bg-[#F6EDFA] border border-purple-100/70 rounded-3xl cursor-pointer hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-3xl p-3 bg-white/90 rounded-2xl shadow-sm">🧘‍♀️</span>
                    <div>
                      <h4 className="text-base font-bold text-[#2A3B50]">Meditación guiada</h4>
                      <p className="text-xs text-slate-500 font-medium mt-0.5 max-w-[210px] leading-relaxed">
                        Momentos de calma y atención plena para despejar tu mente.
                      </p>
                      <span className="text-[11px] font-bold text-slate-400 mt-2 block">🕒 5 a 20 minutes</span>
                    </div>
                  </div>
                  <button className="bg-purple-600 text-white p-2.5 rounded-full shadow-md group-hover:scale-105 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-4 h-4 translate-x-[1px]">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100 flex items-start gap-3.5 shadow-sm">
                <span className="text-2xl mt-0.5">💜</span>
                <div>
                  <h5 className="text-xs font-bold text-purple-900 uppercase tracking-wide">Recomendación personalizada</h5>
                  <p className="text-xs text-purple-700/90 font-medium mt-1 leading-relaxed">
                    Según tu evaluación reciente, te recomendamos una sesión de respiración de 5 minutos.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: SESSION DURATION CONFIGURATION */}
          {step === "config_session" && (
            <div className="flex-1 flex flex-col justify-between pt-2">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-[#2A3B50]">
                    {sessionType === "respiracion" ? "Respiración consciente" : "Meditación guiada"}
                  </h2>
                  <p className="text-sm text-slate-400 font-medium mt-1">Selecciona la duración de tu sesión</p>
                </div>

                <div className="w-full flex justify-center py-4">
                  <div className="w-48 h-48 rounded-full bg-slate-50 flex items-center justify-center relative border border-slate-100">
                    <span className="text-6xl animate-bounce duration-1000">
                      {sessionType === "respiracion" ? "🌬️" : "🧘‍♀️"}
                    </span>
                    <div className="absolute inset-4 rounded-full border border-dashed border-slate-300 animate-spin opacity-40"></div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Duración</label>
                  <div className="grid grid-cols-5 gap-2">
                    {[2, 5, 10, 15, 20].map((min) => {
                      const isSelected = selectedDuration === min;
                      return (
                        <button
                          key={min}
                          onClick={() => setSelectedDuration(min)}
                          className={`py-3 rounded-xl border flex flex-col items-center justify-center transition-all ${
                            isSelected
                              ? "bg-emerald-500 border-emerald-500 text-white font-bold shadow-md shadow-emerald-100"
                              : "bg-white border-slate-200 text-[#2A3B50] font-medium hover:bg-slate-50"
                          }`}
                        >
                          <span className="text-base">{min}</span>
                          <span className={`text-[10px] ${isSelected ? "text-emerald-100" : "text-slate-400"}`}>min</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Técnica recomendada</span>
                  <h4 className="text-xs font-bold text-[#2A3B50]">
                    {sessionType === "respiracion" ? "Respiración 6-6-6-6 (Box Breathing Expandido)" : "Atención Plena & Presencia"}
                  </h4>
                  <ul className="text-[11px] text-slate-500 font-medium mt-2 space-y-1 pl-1">
                    {sessionType === "respiracion" ? (
                      <>
                        <li>• Inhala 6 segundos</li>
                        <li>• Mantén 6 segundos</li>
                        <li>• Exhala 6 segundos</li>
                        <li>• Mantén 6 segundos</li>
                      </>
                    ) : (
                      <>
                        <li>• Escucha y guía por voz constante</li>
                        <li>• Foco en anclas corporales</li>
                        <li>• Observación abierta sin juicio</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>

              <button
                onClick={handleStartSession}
                className="w-full py-4 mt-6 bg-[#4A72A6] hover:bg-[#3d5e8a] text-white font-bold text-sm rounded-2xl shadow-lg transition-all transform active:scale-[0.99]"
              >
                Comenzar sesión
              </button>
            </div>
          )}

          {/* STEP 3: ACTIVE INTERACTIVE PLAYER */}
          {step === "active_session" && (
            <div className="flex-1 flex flex-col justify-between pt-2">
              <div className="text-center">
                <h2 className="text-lg font-bold text-[#2A3B50]">
                  {sessionType === "respiracion" ? "Respiración guiada" : "Meditación guiada"}
                </h2>
              </div>

              <div className="my-6 flex flex-col items-center justify-center flex-1">
                <div className="relative w-64 h-64 flex items-center justify-center">
                  <div className={`absolute inset-0 rounded-full border-8 opacity-20 transition-all duration-1000 ${
                    sessionType === "meditacion" ? "border-purple-500 scale-105 animate-pulse" :
                    visualPhase === "inhala" ? "border-emerald-500 scale-110" :
                    visualPhase === "manten" ? "border-indigo-500 scale-105" :
                    visualPhase === "exhala" ? "border-blue-400 scale-100" : "border-slate-400 scale-95"
                  }`} />

                  <div className="w-52 h-52 rounded-full bg-slate-50 shadow-inner flex flex-col items-center justify-center p-6 border border-slate-100 z-10 text-center">
                    <span className="text-2xl font-black tracking-wider text-[#2A3B50] uppercase transition-all duration-500">
                      {sessionType === "respiracion" ? currentInstruction : "MEDITA"}
                    </span>
                    <span className="text-xs font-semibold text-slate-400 mt-1">
                      {sessionType === "respiracion" ? "6 segundos" : "Bot de Voz Activo 🔊"}
                    </span>
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-2 text-slate-700 font-semibold bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
                  <span>⏳</span>
                  <span className="text-sm tracking-tight font-bold">{formatTime(secondsLeft)} restantes</span>
                </div>

                <div className="w-full mt-6 bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ${sessionType === "respiracion" ? "bg-emerald-500" : "bg-purple-600"}`} 
                    style={{ width: `${getPercentageDone()}%` }}
                  />
                </div>
                <div className="w-full flex justify-end text-[10px] font-bold text-slate-400 mt-1.5">
                  {getPercentageDone()}%
                </div>
              </div>

              <div className="w-full text-center bg-slate-50 border border-slate-200/60 p-4 min-h-[76px] flex items-center justify-center rounded-2xl mb-6">
                <p className="text-xs text-slate-600 font-bold leading-relaxed max-w-xs transition-all duration-300">
                  {currentInstruction ? (sessionType === "meditacion" ? currentInstruction : currentSubtext) : "Prepárate..."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setIsPaused(!isPaused)}
                  className="py-3.5 border-2 border-slate-200 text-slate-500 font-bold text-xs uppercase rounded-xl bg-white hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                >
                  {isPaused ? (<><span>▶</span> Reanudar</>) : (<><span>⏸</span> Pausar</>)}
                </button>
                <button
                  onClick={handleCancelOrFinalize}
                  className="py-3.5 bg-slate-800 text-white font-bold text-xs uppercase rounded-xl hover:bg-slate-900 transition-colors"
                >
                  ⏹ Finalizar
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: EXCELLENT WORK COMPLETED */}
          {step === "completed_session" && (
            <div className="flex-1 flex flex-col justify-between pt-2">
              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-[#4A72A6] text-white text-3xl font-bold flex items-center justify-center rounded-full shadow-lg shadow-blue-100 mx-auto mt-6">
                  ✓
                </div>

                <div className="space-y-1">
                  <h2 className="text-2xl font-black text-[#2A3B50]">¡Excelente trabajo!</h2>
                  <p className="text-xs text-slate-400 font-semibold">Has concluido tu práctica satisfactoriamente.</p>
                </div>

                <div className="p-6 bg-slate-50 border border-slate-200 rounded-3xl text-left space-y-4 relative overflow-hidden shadow-sm">
                  <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Registro de la sesión</h4>
                    <span className="text-xs font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">Completado</span>
                  </div>
                  
                  <div className="space-y-2.5 text-xs text-[#2A3B50] font-bold">
                    <p className="flex justify-between">
                      <span className="text-slate-400 font-medium">Práctica realizada:</span> 
                      <span>{sessionType === "respiracion" ? "Respiración Guiada (6-6-6-6)" : "Meditación Guiada"}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-slate-400 font-medium">Tiempo total dedicado:</span> 
                      <span>{selectedDuration} minutos</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-slate-400 font-medium">Fecha y hora:</span> 
                      <span>Hoy, {new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}</span>
                    </p>
                  </div>
                  <div className="absolute -bottom-2 -right-1 text-5xl opacity-10">🍃</div>
                </div>
              </div>

              <button
                onClick={() => setStep("main_menu")}
                className="w-full py-4 mt-6 bg-[#4A72A6] hover:bg-[#3d5e8a] text-white font-bold text-sm rounded-2xl shadow-md transition-colors"
              >
                Volver al inicio
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}