"use client";

import React from 'react';
import { useRouter } from 'next/navigation'; // Importamos el router de Next.js

// Interfaces proporcionadas por el usuario
export interface LogoApp {
  nombre: string;        // "Pausa."
  tagline: string;       // "TU REFUGIO MENTAL"
  iconoUrl?: string;
}

export interface PantallaBienvenida {
  logo: LogoApp;
  encabezado: string;          // "Antes de comenzar, queremos conocerte un poco"
  descripcion: string;         // "Tus respuestas son privadas y nos ayudarán..."
  duracionEstimada: string;    // "Solo tomará 2 minutos"
  botones: {
    primario: string;          // "Comenzar"
    secundario: string;        // "Ahora no"
  };
  avisoPrivacidad: string;     // "Tu información está segura y nunca será compartida"
}

export default function PausaApp() {
  const router = useRouter(); // Inicializamos el router para la navegación física

  // Datos locales estructurados según las interfaces elegidas
  const datosBienvenida: PantallaBienvenida = {
    logo: {
      nombre: "Pausa.",
      tagline: "TU REFUGIO MENTAL"
    },
    encabezado: "Antes de comenzar, queremos conocerte un poco",
    descripcion: "Tus respuestas son privadas y nos ayudarán a brindarte una experiencia más personalizada.",
    duracionEstimada: "Solo tomará 2 minutos",
    botones: {
      primario: "Comenzar",
      secundario: "Ahora no"
    },
    avisoPrivacidad: "Tu información está segura y nunca será compartida"
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-0 sm:p-4 font-sans selection:bg-blue-100">
      {/* Contenedor con enfoque Mobile-First */}
      <div className="w-full max-w-md min-h-screen sm:min-h-[850px] sm:max-h-[900px] bg-white shadow-2xl overflow-y-auto flex flex-col justify-between relative sm:rounded-[40px] border border-gray-100">
        
        {/* Elementos decorativos orgánicos de fondo */}
        <div className="absolute top-[-10%] left-[-20%] w-72 h-72 rounded-full bg-purple-200/40 blur-3xl pointer-events-none" />
        <div className="absolute top-[20%] right-[-20%] w-72 h-72 rounded-full bg-green-100/50 blur-3xl pointer-events-none" />
        <div className="absolute bottom-[10%] left-[-10%] w-80 h-80 rounded-full bg-blue-100/40 blur-3xl pointer-events-none" />

        {/* Bloque Superior */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 pt-12 text-center z-10">
          
          {/* Isotipo */}
          <div className="relative w-28 h-28 mb-6 flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-200 via-emerald-100 to-blue-200 rounded-full opacity-70" />
            <div className="absolute w-20 h-20 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm">
              <svg viewBox="0 0 100 100" className="w-12 h-12 text-slate-400" fill="currentColor">
                <path d="M50 0C50 27.6 27.6 50 0 50C27.6 50 50 72.4 50 100C50 72.4 72.4 50 100 50C72.4 50 50 27.6 50 0Z" />
              </svg>
            </div>
          </div>

          {/* Marca */}
          <h1 className="text-4xl font-bold text-[#2A3B50] tracking-tight mb-1">
            {datosBienvenida.logo.nombre}
          </h1>
          <p className="text-xs font-semibold text-[#8C9BAE] tracking-[0.2em] mb-12">
            {datosBienvenida.logo.tagline}
          </p>

          {/* Información */}
          <div className="space-y-4 max-w-sm">
            <h2 className="text-xl font-bold text-[#334155] leading-snug px-2">
              {datosBienvenida.encabezado}
            </h2>
            <p className="text-sm text-[#64748B] leading-relaxed px-4">
              {datosBienvenida.descripcion}
            </p>
          </div>

          {/* Duración */}
          <div className="mt-6 flex items-center justify-center gap-2 text-[#7E8CA0] bg-slate-50/80 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-100 text-xs font-medium shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 text-purple-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
            </svg>
            {datosBienvenida.duracionEstimada}
          </div>
        </div>

        {/* Bloque Inferior */}
        <div className="px-8 pb-10 flex flex-col items-center gap-4 z-10 w-full">
          
          {/* Botón Comenzar: Redirige físicamente a la url /motivos */}
          <button
            onClick={() => router.push('/motivos.2')}
            className="w-full bg-[#4A72A6] hover:bg-[#3B5E8C] text-white font-semibold py-4 px-6 rounded-2xl shadow-lg shadow-blue-900/10 transition-all active:scale-[0.99] duration-150 text-base text-center"
          >
            {datosBienvenida.botones.primario}
          </button>

          {/* Botón Ahora no: Redirige físicamente al Home de la aplicación */}
          <button
            onClick={() => router.push('home.2')}
            className="text-[#7E8CA0] hover:text-[#4A72A6] font-semibold text-sm py-2 transition-colors duration-150"
          >
            {datosBienvenida.botones.secundario}
          </button>

          <div className="mt-4 flex items-center justify-center gap-2 max-w-[280px] text-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-[#A0AEC0] flex-shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
            <p className="text-[11px] text-[#A0AEC0] leading-tight">
              {datosBienvenida.avisoPrivacidad}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}