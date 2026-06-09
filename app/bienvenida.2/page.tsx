'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

// Interfaces originales
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
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-0 sm:p-4 font-sans selection:bg-blue-100 relative overflow-hidden">
      
      {/* TARJETA PRINCIPAL (Estructura original mantenida) */}
      <div className="w-full max-w-md min-h-screen sm:min-h-[850px] sm:max-h-[900px] bg-white shadow-2xl overflow-hidden flex flex-col justify-between relative sm:rounded-[40px] border border-gray-100 z-10 animate-fade-in-up">
        
        {/* ELEMENTOS PLASMÁTICOS DENTRO DEL CONTENEDOR */}
        <div className="absolute -top-[10%] -left-[20%] w-80 h-80 rounded-full bg-purple-100/60 blur-[80px] -z-10 animate-pulse-slow" />
        <div className="absolute top-[30%] -right-[20%] w-80 h-80 rounded-full bg-blue-100/60 blur-[80px] -z-10 animate-pulse-slower" />
        <div className="absolute -bottom-[5%] left-[10%] w-96 h-96 rounded-full bg-green-100/50 blur-[80px] -z-10 animate-float" />

        {/* CONTENIDO ORIGINAL */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 pt-12 text-center">
          <div className="relative w-28 h-28 mb-6 flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-200 via-emerald-100 to-blue-200 rounded-full opacity-70" />
            <div className="absolute w-20 h-20 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm">
              <svg viewBox="0 0 100 100" className="w-12 h-12 text-slate-400" fill="currentColor">
                <path d="M50 0C50 27.6 27.6 50 0 50C27.6 50 50 72.4 50 100C50 72.4 72.4 50 100 50C72.4 50 50 27.6 50 0Z" />
              </svg>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-[#2A3B50] tracking-tight mb-1">{datosBienvenida.logo.nombre}</h1>
          <p className="text-xs font-semibold text-[#8C9BAE] tracking-[0.2em] mb-12">{datosBienvenida.logo.tagline}</p>

          <div className="space-y-4 max-w-sm">
            <h2 className="text-xl font-bold text-[#334155] leading-snug px-2">{datosBienvenida.encabezado}</h2>
            <p className="text-sm text-[#64748B] leading-relaxed px-4">{datosBienvenida.descripcion}</p>
          </div>
        </div>

        <div className="px-8 pb-10 flex flex-col items-center gap-4 w-full">
          <button onClick={() => router.push('/motivos.2')} className="w-full bg-[#4A72A6] hover:bg-[#3B5E8C] text-white font-semibold py-4 px-6 rounded-2xl transition-all active:scale-[0.99]">{datosBienvenida.botones.primario}</button>
          <button onClick={() => router.push('/home.2')} className="text-[#7E8CA0] hover:text-[#4A72A6] font-semibold text-sm">{datosBienvenida.botones.secundario}</button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseSlow {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        @keyframes pulseSlower {
          0%, 100% { transform: scale(1.1); }
          50% { transform: scale(1); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        .animate-fade-in-up { animation: fadeInUp 0.8s ease-out; }
        .animate-pulse-slow { animation: pulseSlow 10s ease-in-out infinite; }
        .animate-pulse-slower { animation: pulseSlower 12s ease-in-out infinite; }
        .animate-float { animation: float 8s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
