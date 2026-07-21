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
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-0 sm:p-4 font-sans selection:bg-blue-100 relative overflow-hidden">
      
      {/* TARJETA PRINCIPAL (con overflow-hidden para cortar las imágenes en el borde) */}
      <div className="w-full max-w-md h-screen sm:h-auto sm:min-h-[820px] sm:max-h-[900px] bg-[#FAF8F5] shadow-2xl overflow-hidden flex flex-col justify-between relative sm:rounded-[40px] border border-gray-100 z-10 animate-fade-in-up">
        
        {/* ESQUINA SUPERIOR IZQUIERDA (Ajustada con márgenes negativos para eliminar el borde transparente) */}
        <img 
          src="/images/forma_morada.png" 
          alt="" 
          className="absolute -top-4 -left-4 w-[65%] max-w-[280px] object-contain pointer-events-none z-0 scale-110 origin-top-left" 
        />
        
        {/* ESQUINA INFERIOR DERECHA (Ajustada con márgenes negativos) */}
        <img 
          src="/images/forma_verde.png" 
          alt="" 
          className="absolute -bottom-6 -right-6 w-[70%] max-w-[300px] object-contain pointer-events-none z-0 scale-110 origin-bottom-right" 
        />

        {/* ONDA DEL MEDIO */}
        <img 
          src="/images/onda_del_medio.png" 
          alt="" 
          className="absolute top-[42%] -left-2 w-[105%] object-cover pointer-events-none z-0 opacity-50" 
        />

        {/* RAMITAS LATERALES PEGADAS A LOS BORDES */}
        <img 
          src="/images/ramita_izquierda.png" 
          alt="" 
          className="absolute top-[50%] -left-2 w-14 sm:w-16 object-contain pointer-events-none z-0 opacity-80" 
        />
        <img 
          src="/images/ramita_derecha.png" 
          alt="" 
          className="absolute top-[44%] -right-2 w-16 sm:w-20 object-contain pointer-events-none z-0 opacity-80" 
        />

        {/* CONTENIDO PRINCIPAL */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 sm:px-8 pt-12 text-center z-10">
          
          {/* LOGO */}
          <div className="relative w-32 h-32 sm:w-36 sm:h-36 mb-3 flex items-center justify-center">
            <img 
              src="/images/logo sin letras.jpeg" 
              alt="Logo Pausa" 
              className="w-full h-full object-contain scale-125 mix-blend-multiply" 
            />
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-[#2A3B50] tracking-tight mb-1">{datosBienvenida.logo.nombre}</h1>
          <p className="text-[10px] sm:text-xs font-semibold text-[#8C9BAE] tracking-[0.2em] mb-8 sm:mb-10">{datosBienvenida.logo.tagline}</p>

          <div className="space-y-3 sm:space-y-4 max-w-sm">
            <h2 className="text-lg sm:text-xl font-bold text-[#334155] leading-snug px-2">{datosBienvenida.encabezado}</h2>
            <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed px-2 sm:px-4">{datosBienvenida.descripcion}</p>
          </div>
        </div>

        {/* BOTONES */}
        <div className="px-6 sm:px-8 pb-8 sm:pb-10 flex flex-col items-center gap-3 w-full z-10">
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
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fadeInUp 0.8s ease-out; }
      `}</style>
    </div>
  );
}