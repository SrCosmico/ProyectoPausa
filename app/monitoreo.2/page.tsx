"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// ==========================================
// INTERFACES Y DATOS DE SIMULACIÓN
// ==========================================

interface RegistroHistorico {
  dia: string;
  fecha: string;
  nivel: number; // Del 1 al 5
  emoji: string;
  estado: string;
}

interface TipAntiEstres {
  id: number;
  titulo: string;
  descripcion: string;
  icono: string;
}

// Historial de la semana actual (Gráfico)
const historialEmocionalInicial: RegistroHistorico[] = [
  { dia: "L", fecha: "25 Mayo", nivel: 2, emoji: "😔", estado: "Mal" },
  { dia: "M", fecha: "26 Mayo", nivel: 4, emoji: "😊", estado: "Bien" },
  { dia: "M", fecha: "27 Mayo", nivel: 3, emoji: "😐", estado: "Regular" },
  { dia: "J", fecha: "28 Mayo", nivel: 5, emoji: "🤩", estado: "Muy bien" },
  { dia: "V", fecha: "29 Mayo", nivel: 4, emoji: "😊", estado: "Bien" },
  { dia: "S", fecha: "30 Mayo", nivel: 3, emoji: "😐", estado: "Regular" },
  { dia: "D", fecha: "31 Mayo", nivel: 4, emoji: "😊", estado: "Bien" }, 
];

// Registros más antiguos (Ocultos inicialmente)
const registrosAnterioresSimulados: RegistroHistorico[] = [
  { dia: "Dom", fecha: "24 Mayo", nivel: 5, emoji: "🤩", estado: "Muy bien" },
  { dia: "Sáb", fecha: "23 Mayo", nivel: 4, emoji: "😊", estado: "Bien" },
  { dia: "Vie", fecha: "22 Mayo", nivel: 3, emoji: "😐", estado: "Regular" },
  { dia: "Jue", fecha: "21 Mayo", nivel: 1, emoji: "😩", estado: "Muy mal" },
  { dia: "Mié", fecha: "20 Mayo", nivel: 2, emoji: "😔", estado: "Mal" },
];

const bcoTipsAntiEstres: TipAntiEstres[] = [
  { id: 1, titulo: "Toma un respiro 4-7-8", descripcion: "Inhala durante 4 segundos, mantén 7 y exhala completamente en 8 segundos para calmar tu sistema nervioso.", icono: "🌬️" },
  { id: 2, titulo: "Estiramiento rápido", descripcion: "Levántate de la silla, estira tus brazos hacia el techo y rota los hombros hacia atrás durante 1 minuto.", icono: "🧘‍♀️" },
  { id: 3, titulo: "Desconexión digital", descripcion: "Aparta la vista de todas tus pantallas por los próximos 10 minutos. Deja que tus ojos y mente descansen.", icono: "📴" },
  { id: 4, titulo: "Un sorbo de calma", descripcion: "Bebe un vaso de agua despacio, saboreándolo y enfocándote únicamente en esa sensación física de hidratación.", icono: "💧" },
  { id: 5, titulo: "Escucha el entorno", descripcion: "Cierra los ojos e intenta identificar 3 sonidos diferentes a tu alrededor que normalmente ignoras.", icono: "🎧" }
];

export default function MonitoreoPage() {
  const router = useRouter();
  const [tipDelDia, setTipDelDia] = useState<TipAntiEstres>(bcoTipsAntiEstres[0]);
  const [mostrarAnteriores, setMostrarAnteriores] = useState(false);

  useEffect(() => {
    cambiarTipAleatorio();
  }, []);

  const cambiarTipAleatorio = () => {
    const indiceAleatorio = Math.floor(Math.random() * bcoTipsAntiEstres.length);
    setTipDelDia(bcoTipsAntiEstres[indiceAleatorio]);
  };

  // Mapeo preciso de alturas porcentuales para posicionar el emoji en el eje Y
  const obtenerAlturaGrafica = (nivel: number): string => {
    const mapeoAlturas: Record<number, string> = {
      1: "bottom-[5%]",
      2: "bottom-[26%]",
      3: "bottom-[48%]",
      4: "bottom-[70%]",
      5: "bottom-[90%]",
    };
    return mapeoAlturas[nivel] || "bottom-[50%]";
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-0 sm:p-4 font-sans selection:bg-blue-100">
      
      {/* Contenedor Estilo Mobile-First */}
      <div className="w-full max-w-md h-screen sm:h-[850px] bg-slate-50 shadow-2xl flex flex-col justify-between relative sm:rounded-[40px] border border-gray-100 overflow-hidden">
        
        {/* ÁREA CON SCROLL PARA EL CONTENIDO */}
        <div className="flex-1 overflow-y-auto pb-6 custom-scrollbar">
          
          {/* BARRA SUPERIOR CON RETORNO DIRECTO A HOME.2 */}
          <div className="px-6 pt-5 pb-3 flex items-center justify-between bg-white z-10 border-b border-slate-100">
            <button 
              onClick={() => router.push('/home.2')} 
              className="p-2 -ml-2 text-slate-700 hover:text-slate-900 transition-colors flex items-center justify-center rounded-xl hover:bg-slate-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
              </svg>
            </button>
            <h3 className="text-sm font-bold text-[#2A3B50]">Monitoreo de Bienestar</h3>
            <div className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-tr from-purple-500 to-indigo-400 p-0.5 shadow-sm flex items-center justify-center">
              <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-[11px] font-black text-indigo-500">JS</div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            
            {/* ENCABEZADO DE ESTADO ACTUAL */}
            <div>
              <p className="text-xs font-bold text-[#8C9BAE] tracking-wider uppercase">Tu estado actual</p>
              <div className="mt-2 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-center gap-4">
                <span className="text-4xl">😊</span>
                <div>
                  <h4 className="text-base font-bold text-[#334155]">Bien</h4>
                  <p className="text-xs font-medium text-emerald-500 mt-0.5">¡Vas por buen camino!</p>
                </div>
              </div>
            </div>

            {/* SECCIÓN 1: HISTORIAL EMOCIONAL CON EMOJIS EN EL GRÁFICO */}
            <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-[#2A3B50]">Historial emocional</h4>
                  <p className="text-[11px] text-[#8C9BAE] font-medium">Últimos 7 días</p>
                </div>
                <span className="text-xs font-bold text-indigo-500 bg-indigo-50 px-2.5 py-1 rounded-lg">Mayo</span>
              </div>

              {/* Contenedor Visual de la Gráfica */}
              <div className="h-48 w-full bg-slate-50/70 rounded-2xl p-4 border border-slate-100 flex flex-col justify-between relative mt-2">
                
                {/* Líneas horizontales de guía de fondo */}
                <div className="absolute inset-x-4 top-[10%] border-b border-dashed border-slate-200/50"></div>
                <div className="absolute inset-x-4 top-[32%] border-b border-dashed border-slate-200/50"></div>
                <div className="absolute inset-x-4 top-[54%] border-b border-dashed border-slate-200/50"></div>
                <div className="absolute inset-x-4 top-[76%] border-b border-dashed border-slate-200/50"></div>
                <div className="absolute inset-x-4 top-[95%] border-b border-dashed border-slate-200/50"></div>

                {/* Eje de Nodos con Emojis */}
                <div className="flex-1 w-full flex justify-between items-end relative px-1.5">
                  <svg className="absolute inset-0 w-full h-full p-2" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path d="M 5,70 L 20,26 L 35,48 L 50,5 L 65,26 L 80,48 L 95,26" fill="none" stroke="#E2E8F0" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>

                  {historialEmocionalInicial.map((item, idx) => (
                    <div key={idx} className="flex flex-col items-center justify-end h-full z-10 w-7">
                      {/* Aquí se inyecta el emoji directamente sobre la coordenada del gráfico */}
                      <div className={`absolute ${obtenerAlturaGrafica(item.nivel)} transition-all duration-500 transform hover:scale-125 cursor-pointer`}>
                        <span className="text-xl bg-white shadow-md rounded-full w-7 h-7 flex items-center justify-center border border-slate-100 select-none">
                          {item.emoji}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Etiquetas de los días */}
                <div className="w-full flex justify-between px-1 pt-2 border-t border-slate-100 mt-1">
                  {historialEmocionalInicial.map((item, idx) => (
                    <span key={idx} className="text-[10px] font-black text-[#8C9BAE] w-7 text-center">
                      {item.dia}
                    </span>
                  ))}
                </div>
              </div>

              {/* BOTÓN REVERSIBLE PARA REGISTROS ANTERIORES */}
              <div className="pt-2">
                <button
                  onClick={() => setMostrarAnteriores(!mostrarAnteriores)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/60 text-xs font-bold text-[#4A72A6] transition-all"
                >
                  <span>{mostrarAnteriores ? "Ocultar historial viejo" : "Ver registros anteriores"}</span>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    strokeWidth={2.5} 
                    stroke="currentColor" 
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${mostrarAnteriores ? 'rotate-180' : ''}`}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>

                {/* Sub-lista desplegable con transiciones limpias */}
                {mostrarAnteriores && (
                  <div className="mt-3 space-y-2 max-h-44 overflow-y-auto pr-1 custom-scrollbar animate-fadeIn">
                    {registrosAnterioresSimulados.map((reg, index) => (
                      <div key={index} className="flex items-center justify-between p-2.5 bg-slate-50/50 rounded-xl border border-slate-100 text-xs">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{reg.emoji}</span>
                          <div>
                            <p className="font-bold text-[#334155]">{reg.estado}</p>
                            <p className="text-[10px] text-[#8C9BAE] font-medium">{reg.fecha}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-500">
                          Nivel {reg.nivel}/5
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* SECCIÓN 2: TIPS ANTI-ESTRÉS DINÁMICOS */}
            <div className="bg-gradient-to-br from-[#F6EDFA] to-[#EDF3FC] border border-purple-100/50 p-5 rounded-3xl shadow-sm space-y-4 relative overflow-hidden">
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <h4 className="text-xs font-bold text-purple-900 uppercase tracking-wider">Tips anti-estrés para hoy</h4>
                  <p className="text-[11px] text-purple-700/80 font-medium">Acciones pequeñas para aliviar la carga mental</p>
                </div>
                
                <button 
                  onClick={cambiarTipAleatorio}
                  className="p-1.5 bg-white text-purple-600 hover:text-purple-800 rounded-full shadow-sm hover:shadow active:scale-95 transition-all"
                  title="Mostrar otro tip"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                </button>
              </div>

              <div className="bg-white/90 backdrop-blur-sm border border-white rounded-2xl p-4 flex items-start gap-4 relative z-10 transition-all duration-300">
                <span className="text-3xl p-2 bg-purple-50 rounded-xl flex-shrink-0 shadow-sm">
                  {tipDelDia.icono}
                </span>
                <div className="space-y-0.5">
                  <h5 className="text-xs font-bold text-[#2A3B50]">{tipDelDia.titulo}</h5>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                    {tipDelDia.descripcion}
                  </p>
                </div>
              </div>

              <div className="absolute -bottom-6 -right-6 text-7xl opacity-5 select-none pointer-events-none">🧘</div>
            </div>

          </div>
        </div>

        {/* NAVEGACIÓN INFERIOR COMPLETAMENTE FIJA */}
        <div className="bg-white border-t border-slate-100 px-6 py-3.5 flex justify-around items-center sm:rounded-b-[40px] z-30 shadow-[0_-6px_20px_rgba(0,0,0,0.03)] flex-shrink-0">
          {[
            { id: "inicio", label: "Inicio", ruta: "/home.2", activo: false },
            { id: "evaluacion", label: "Evaluación", ruta: "/evaluacion.2", activo: false },
            { id: "perfil", label: "Perfil", ruta: "/perfil", activo: false }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => router.push(tab.ruta)}
              className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl transition-all active:scale-95 ${
                tab.activo ? 'text-[#4A72A6]' : 'text-[#8C9BAE] hover:text-[#4A72A6]'
              }`}
            >
              {tab.id === 'inicio' && (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M11.47 3.822a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 0 1-1.06 1.06L20 13.061v6.189a1.75 1.75 0 0 1-1.75 1.75H15.25a.75.75 0 0 1-.75-.75V16.5a.5.5 0 0 0-.5-.5h-2a.5.5 0 0 0-.5.5v3.75a.75.75 0 0 1-.75.75H5.75A1.75 1.75 0 0 1 4 19.25v-6.19l-.56.56a.75.75 0 0 1-1.06-1.06l8.69-8.69Z" />
                </svg>
              )}
              {tab.id === 'evaluacion' && (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M10.5 3.75a.75.75 0 0 0-1.5 0v16.5a.75.75 0 0 0 1.5 0V3.75ZM6 6.75a.75.75 0 0 0-1.5 0v10.5a.75.75 0 0 0 1.5 0V6.75ZM19.5 9.75a.75.75 0 0 0-1.5 0v4.5a.75.75 0 0 0 1.5 0v-4.5ZM15 8.25a.75.75 0 0 0-1.5 0v7.5a.75.75 0 0 0 1.5 0v-7.5Z" />
                </svg>
              )}
              {tab.id === 'perfil' && (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
                </svg>
              )}
              <span className="text-[10px] font-bold tracking-wide">{tab.label}</span>
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}