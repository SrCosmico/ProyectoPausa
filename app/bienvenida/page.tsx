'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export interface LogoApp {
  nombre: string;
  tagline: string;
  iconoUrl?: string;
}

export interface PantallaBienvenida {
  logo: LogoApp;
  encabezado: string;
  descripcion: string;
  duracionEstimada: string;
  botones: {
    primario: string;
    secundario: string;
  };
  avisoPrivacidad: string;
}

export default function PausaApp() {
  const router = useRouter();

  const datosBienvenida: PantallaBienvenida = {
    logo: { nombre: "Pausa.", tagline: "TU REFUGIO MENTAL" },
    encabezado: "Antes de comenzar, queremos conocerte un poco",
    descripcion: "Tus respuestas son privadas y nos ayudarán a brindarte una experiencia más personalizada.",
    duracionEstimada: "Solo tomará 2 minutos",
    botones: { primario: "Comenzar", secundario: "Ahora no" },
    avisoPrivacidad: "Tu información está segura y nunca será compartida"
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-0 sm:p-4 font-sans selection:bg-blue-100">

      {/* TARJETA PRINCIPAL */}
      <div className="w-full max-w-md h-screen sm:h-auto sm:min-h-[820px] sm:max-h-[900px] bg-[#FAF8F5] shadow-2xl flex flex-col justify-between relative sm:rounded-[40px] border border-gray-100 overflow-hidden animate-fade-in-up">

        {/* ── IMÁGENES DECORATIVAS ── */}

        {/* Forma morada: esquina superior izquierda */}
        <img
          src="/images/forma_morada.png"
          alt=""
          aria-hidden="true"
          className="absolute -top-2 -left-2 w-[65%] max-w-[280px] object-contain pointer-events-none select-none z-0"
        />

        {/* Forma verde: esquina inferior derecha */}
        <img
          src="/images/forma_verde.png"
          alt=""
          aria-hidden="true"
          className="absolute -bottom-2 -right-2 w-[65%] max-w-[280px] object-contain pointer-events-none select-none z-0"
        />

        {/* Onda del medio: lateral izquierdo */}
        <img
          src="/images/onda_del_medio.png"
          alt=""
          aria-hidden="true"
          className="absolute top-1/2 h-[65%] w-auto object-contain pointer-events-none select-none z-0 opacity-30"
          style={{ transform: 'translateY(-50%) rotate(90deg)', left: '-18%' }}
        />

        {/* Ramita izquierda */}
        <img
          src="/images/ramita_izquierda.png"
          alt=""
          aria-hidden="true"
          className="absolute top-[46%] -left-3 w-32 sm:w-36 object-contain pointer-events-none select-none z-0 opacity-85"
        />

        {/* Ramita derecha */}
        <img
          src="/images/ramita_derecha.png"
          alt=""
          aria-hidden="true"
          className="absolute top-[40%] -right-3 w-24 sm:w-28 object-contain pointer-events-none select-none z-0 opacity-85"
        />

        {/* ── CONTENIDO PRINCIPAL ── */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 sm:px-8 pt-12 text-center relative z-10">

          {/* LOGO */}
          <div className="relative w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] mb-0 flex items-center justify-center">
            <img
              src="/images/logo.png"
              alt="Logo Pausa"
              className="w-full h-full object-contain"
            />
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-[#2A3B50] tracking-tight mb-0.5" style={{ marginTop: '-120px' }}>
            {datosBienvenida.logo.nombre}
          </h1>
          <p className="text-[10px] sm:text-xs font-semibold text-[#8C9BAE] tracking-[0.2em] mb-10 sm:mb-12">
            {datosBienvenida.logo.tagline}
          </p>

          <div className="space-y-3 sm:space-y-4 max-w-sm">
            <h2 className="text-lg sm:text-xl font-bold text-[#334155] leading-snug px-2">
              {datosBienvenida.encabezado}
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed px-2 sm:px-4">
              {datosBienvenida.descripcion}
            </p>
          </div>
        </div>

        {/* ── BOTONES ── */}
        <div className="px-6 sm:px-8 pb-8 sm:pb-10 flex flex-col items-center gap-3 w-full relative z-10">
          <button
            onClick={() => router.push('/motivos')}
            className="w-full bg-[#4A72A6] hover:bg-[#3B5E8C] text-white font-semibold py-3.5 sm:py-4 px-6 rounded-2xl transition-all active:scale-[0.99] shadow-md"
          >
            {datosBienvenida.botones.primario}
          </button>
          <button
            onClick={() => router.push('/home')}
            className="text-[#7E8CA0] hover:text-[#4A72A6] font-semibold text-xs sm:text-sm py-1 transition-colors"
          >
            {datosBienvenida.botones.secundario}
          </button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fadeInUp 0.8s ease-out; }
      `}</style>
    </div>
  );
}