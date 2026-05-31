'use client';

import React from 'react';
import Link from 'next/link';

// --- TYPES & INTERFACES ---
interface HistoryPoint {
  dayLabel: string;
  dayInitial: string;
  statusEmoji: string;
  heightClass: string; 
  colorClass: string;
}

// --- Icons (Inline SVGs) ---
const NavIconHome = ({ active }: { active: boolean }) => (
  <svg className="w-6 h-6" fill={active ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={active ? 1.5 : 2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
);
const NavIconWellness = ({ active }: { active: boolean }) => (
  <svg className="w-6 h-6" fill={active ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={active ? 1.5 : 2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
);
const NavIconTools = ({ active }: { active: boolean }) => (
  <svg className="w-6 h-6" fill={active ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={active ? 1.5 : 2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
);

export default function BienestarView() {
  // Solución del error ts(2367): Tipado explícito a 'string'
  const currentPath: string = '/bienestar';
  
  // --- DUMMY DATA ---
  const historyData: HistoryPoint[] = [
    { dayLabel: 'Lunes', dayInitial: 'L', statusEmoji: '😐', heightClass: 'h-16', colorClass: 'bg-emerald-400' },
    { dayLabel: 'Martes', dayInitial: 'M', statusEmoji: '😕', heightClass: 'h-10', colorClass: 'bg-amber-400' },
    { dayLabel: 'Miércoles', dayInitial: 'X', statusEmoji: '😐', heightClass: 'h-16', colorClass: 'bg-emerald-400' },
    { dayLabel: 'Jueves', dayInitial: 'J', statusEmoji: '😫', heightClass: 'h-6', colorClass: 'bg-rose-400' },
    { dayLabel: 'Viernes', dayInitial: 'V', statusEmoji: '🙂', heightClass: 'h-24', colorClass: 'bg-sky-400' },
    { dayLabel: 'Sábado', dayInitial: 'S', statusEmoji: '😁', heightClass: 'h-32', colorClass: 'bg-indigo-400' },
    { dayLabel: 'Domingo', dayInitial: 'D', statusEmoji: '🙂', heightClass: 'h-24', colorClass: 'bg-sky-400' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center">
      <div className="w-full max-w-md bg-[#F9F7F2] min-h-screen relative shadow-lg overflow-hidden flex flex-col">
        
        {/* HEADER */}
        <header className="px-6 pt-12 pb-4">
          <h1 className="text-3xl font-extrabold text-[#4A4E69]">Mi Bienestar</h1>
          <p className="text-sm text-[#4A4E69]/70 mt-1">Historial emocional semanal</p>
        </header>

        {/* CONTENIDO PRINCIPAL */}
        <main className="flex-1 px-6 overflow-y-auto pb-24">
          
          {/* Card Gráfico */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mt-4">
            <h2 className="text-lg font-bold text-[#4A4E69] mb-8 text-center">Esta Semana</h2>
            
            <div className="flex justify-between items-end h-40 mt-4 border-b border-gray-100 pb-2">
              {historyData.map((point, idx) => (
                <div key={idx} className="flex flex-col items-center group cursor-pointer w-8">
                  {/* Emoji Flotante (Aparece en hover/activo idealmente, aquí lo mostramos estático) */}
                  <span className="text-xl mb-2 transition-transform transform group-hover:-translate-y-1">
                    {point.statusEmoji}
                  </span>
                  
                  {/* Barra Gráfica */}
                  <div className={`w-3 rounded-t-full ${point.heightClass} ${point.colorClass} opacity-80 group-hover:opacity-100 transition-all duration-300`}></div>
                  
                  {/* Etiqueta Día */}
                  <span className="text-[10px] font-bold text-gray-400 mt-3">{point.dayInitial}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Call to Action para Registrar Emoción */}
          <div className="mt-8 bg-[#4A4E69] p-6 rounded-3xl shadow-md text-white text-center relative overflow-hidden">
            <div className="absolute top-[-20px] right-[-20px] w-20 h-20 bg-white opacity-5 rounded-full blur-xl"></div>
            <h3 className="font-bold text-lg mb-2 relative z-10">¿Cómo te sientes ahora?</h3>
            <p className="text-xs opacity-80 mb-4 relative z-10">Registrar tus emociones te ayuda a reconocer patrones.</p>
            <button className="bg-white text-[#4A4E69] font-bold text-sm px-6 py-2.5 rounded-full shadow-sm hover:shadow-md transition-all active:scale-[0.98] relative z-10">
              Registrar emoción
            </button>
          </div>

        </main>

        {/* BOTTOM NAVIGATION */}
        <nav className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center z-50">
          <Link href="/homepage" className={`flex flex-col items-center justify-center space-y-1 w-16 transition-colors ${currentPath === '/homepage' ? 'text-[#4A4E69]' : 'text-gray-400 hover:text-[#4A4E69]/70'}`}>
            <NavIconHome active={currentPath === '/homepage'} />
            <span className="text-[10px] font-bold">Inicio</span>
          </Link>
          
          <Link href="/bienestar" className={`flex flex-col items-center justify-center space-y-1 w-16 transition-colors ${currentPath === '/bienestar' ? 'text-[#4A4E69]' : 'text-gray-400 hover:text-[#4A4E69]/70'}`}>
            <NavIconWellness active={currentPath === '/bienestar'} />
            <span className="text-[10px] font-bold">Bienestar</span>
          </Link>

          <Link href="/herramientas" className={`flex flex-col items-center justify-center space-y-1 w-16 transition-colors ${currentPath === '/herramientas' ? 'text-[#4A4E69]' : 'text-gray-400 hover:text-[#4A4E69]/70'}`}>
            <NavIconTools active={currentPath === '/herramientas'} />
            <span className="text-[10px] font-bold">Recursos</span>
          </Link>
        </nav>

      </div>
    </div>
  );
}