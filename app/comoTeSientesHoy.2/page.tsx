"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

// ==========================================
// INTERFACES Y DATOS PROPORCIONADOS POR EL USUARIO
// ==========================================

export type NivelEmocionalHoy = "Muy mal" | "Mal" | "Regular" | "Bien" | "Muy bien";

export interface OpcionEmocionalHoy {
  estado: NivelEmocionalHoy;
  emoji: string;
  seleccionado: boolean;
}

export interface HerramientaSugerida {
  id: string;
  nombre: string;
  descripcion: string;       // "Ejercicio de 5 minutos"
  icono?: string;
}

export interface PantallaComoTeSientesHoy {
  titulo: string;            // "¿Cómo te sientes hoy?"
  subtitulo: string;         // "Tu bienestar es importante"
  opciones: OpcionEmocionalHoy[];
  estadoSeleccionado?: NivelEmocionalHoy;
  campoAdicional: {
    label: string;           // "Cuéntanos más (opcional)"
    placeholder: string;
    texto: string;
    maxCaracteres: number;   // 200
  };
  herramientasRecomendadas: HerramientaSugerida[];
  botonGuardar: string;      // "Guardar mi estado"
}

export const opcionesEmocionalesData: Omit<OpcionEmocionalHoy, "seleccionado">[] = [
  { estado: "Muy mal",  emoji: "😩" },
  { estado: "Mal",      emoji: "😔" },
  { estado: "Regular",  emoji: "😐" },
  { estado: "Bien",     emoji: "😊" },
  { estado: "Muy bien", emoji: "😄" },
];

export default function ComoTeSientesHoyPage() {
  const router = useRouter();

  // --- ESTADOS LOCALES ---
  const [estadoSeleccionado, setEstadoSeleccionado] = useState<NivelEmocionalHoy | null>(null);
  const [textoComentario, setTextoComentario] = useState<string>("");
  const [mostrarExito, setMostrarExito] = useState<boolean>(false);

  // --- MAPEO DE DATOS A TU INTERFAZ ---
  const datosPantalla: PantallaComoTeSientesHoy = {
    titulo: "¿Cómo te sientes hoy?",
    subtitulo: "Tu bienestar es importante",
    opciones: opcionesEmocionalesData.map(opt => ({
      ...opt,
      seleccionado: opt.estado === estadoSeleccionado
    })),
    estadoSeleccionado: estadoSeleccionado || undefined,
    campoAdicional: {
      label: "Cuéntanos más (opcional)",
      placeholder: "¿Hay algo en particular que esté influyendo en tu día o que quieras desahogar?",
      texto: textoComentario,
      maxCaracteres: 200
    },
    herramientasRecomendadas: [], // Se limpia según la instrucción de quitar respiración consciente
    botonGuardar: "Guardar mi estado"
  };

  // Manejador del guardado
  const manejarGuardar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!estadoSeleccionado) return;

    // Activa la animación del mensaje de éxito
    setMostrarExito(true);

    // Redirige al Home.2 de forma automática tras 2 segundos
    setTimeout(() => {
      router.push('/home.2');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-0 sm:p-4 font-sans selection:bg-purple-100 relative overflow-hidden">
      
      {/* ALERTA GLOBAL DE ÉXITO (Toast animado superior) */}
      {mostrarExito && (
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-50 w-11/12 max-w-xs bg-emerald-500 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-fade-in-down border border-emerald-400">
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          </div>
          <span className="text-sm font-bold tracking-wide">¡Guardado exitosamente!</span>
        </div>
      )}

      {/* Contenedor Mobile-First */}
      <div className="w-full max-w-md h-screen sm:h-[850px] bg-white shadow-2xl flex flex-col justify-between relative sm:rounded-[40px] border border-gray-100 p-6 overflow-y-auto">
        
        {/* BLOQUE SUPERIOR: Navegación y Encabezados */}
        <div>
          {/* Botón de retroceso hacia el Home */}
          <button 
            onClick={() => router.push('/home.2')} 
            className="p-2 -ml-2 text-[#7E8CA0] hover:text-[#4A72A6] transition-colors focus:outline-none rounded-full hover:bg-slate-50 active:scale-95"
            aria-label="Regresar al inicio"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
          </button>

          {/* Textos Principales */}
          <div className="mt-4">
            <h2 className="text-2xl font-extrabold text-[#2A3B50] tracking-tight">
              {datosPantalla.titulo}
            </h2>
            <p className="text-xs font-semibold text-[#8C9BAE] mt-1">
              {datosPantalla.subtitulo}
            </p>
          </div>

          {/* REJILLA DE SELECCIÓN EMOCIONAL */}
          <div className="mt-8 bg-slate-50/60 border border-slate-100 rounded-3xl p-5">
            <div className="flex justify-between items-center gap-2">
              {datosPantalla.opciones.map((opcion) => (
                <button
                  key={opcion.estado}
                  type="button"
                  onClick={() => setEstadoSeleccionado(opcion.estado)}
                  className="flex flex-col items-center flex-1 focus:outline-none group relative"
                >
                  {/* Círculo contenedor del Emoji */}
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                    opcion.seleccionado 
                      ? 'bg-[#4A72A6] text-white shadow-md shadow-blue-900/10 scale-110 z-10' 
                      : 'bg-white border border-slate-100 hover:border-slate-300 group-hover:scale-105 group-hover:animate-bounce'
                  }`}>
                    <span className="text-3xl select-none transform transition-transform active:scale-90">
                      {opcion.emoji}
                    </span>
                  </div>
                  
                  {/* Etiqueta del estado (aparece sutilmente o resalta si está activa) */}
                  <span className={`text-[10px] font-bold mt-2 tracking-wide transition-colors duration-200 ${
                    opcion.seleccionado ? 'text-[#4A72A6]' : 'text-slate-400 group-hover:text-slate-600'
                  }`}>
                    {opcion.estado}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* FORMULARIO / CAMPO ADICIONAL (Opcional) */}
          <div className="mt-8 flex flex-col">
            <div className="flex justify-between items-center mb-2 px-1">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                {datosPantalla.campoAdicional.label}
              </label>
              
              {/* Contador de caracteres dinámico */}
              <span className={`text-[10px] font-bold ${
                textoComentario.length >= datosPantalla.campoAdicional.maxCaracteres ? 'text-rose-500' : 'text-[#8C9BAE]'
              }`}>
                {textoComentario.length} / {datosPantalla.campoAdicional.maxCaracteres}
              </span>
            </div>

            <textarea
              maxLength={datosPantalla.campoAdicional.maxCaracteres}
              value={textoComentario}
              onChange={(e) => setTextoComentario(e.target.value)}
              placeholder={datosPantalla.campoAdicional.placeholder}
              rows={5}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-medium text-slate-700 placeholder-slate-400 outline-none focus:border-[#4A72A6] focus:bg-white focus:shadow-inner resize-none transition-all duration-200"
            />
          </div>
        </div>

        {/* BLOQUE INFERIOR: Acción Principal */}
        <div className="mt-8 pb-2 w-full">
          <button
            type="button"
            onClick={manejarGuardar}
            disabled={!estadoSeleccionado || mostrarExito}
            className={`w-full font-semibold py-4 px-6 rounded-2xl shadow-lg transition-all active:scale-[0.99] text-base text-center ${
              estadoSeleccionado && !mostrarExito
                ? 'bg-[#4A72A6] hover:bg-[#3B5E8C] text-white shadow-blue-900/10 cursor-pointer' 
                : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
            }`}
          >
            {mostrarExito ? "Procesando..." : datosPantalla.botonGuardar}
          </button>
        </div>

      </div>

      {/* ESTILOS CSS INLINE EXTRAS PARA ANIMACIONES TIPO APP NATIVA */}
      <style jsx global>{`
        @keyframes fadeInDown {
          0% { opacity: 0; transform: translate(-50%, -20px); }
          100% { opacity: 1; transform: translate(-50%, 0); }
        }
        .animate-fade-in-down {
          animation: fadeInDown 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}