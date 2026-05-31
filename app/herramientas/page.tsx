'use client';

import React from 'react';
import Link from 'next/link';

// --- Interfaces ---
interface Tool {
  id: string;
  title: string;
  description: string;
  badge?: string;
  iconBg: string;
  iconColor: string;
  icon: React.ReactNode;
}

// --- Icons (Inline SVGs) ---
const ChevronRight = () => (
  <svg className="w-5 h-5 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const NavIconHome = ({ active }: { active: boolean }) => (
  <svg className="w-6 h-6" fill={active ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={active ? 1.5 : 2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
);
const NavIconWellness = ({ active }: { active: boolean }) => (
  <svg className="w-6 h-6" fill={active ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={active ? 1.5 : 2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
);
const NavIconTools = ({ active }: { active: boolean }) => (
  <svg className="w-6 h-6" fill={active ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={active ? 1.5 : 2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
);

const toolsData: Tool[] = [
  {
    id: 'meditacion_1',
    title: 'Respiración 4-7-8',
    description: 'Técnica para reducir la ansiedad rápida',
    badge: 'Offline',
    iconBg: 'bg-indigo-100',
    iconColor: 'text-indigo-600',
    icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  },
  {
    id: 'meditacion_2',
    title: 'Atención Plena (Mindfulness)',
    description: 'Audio guiado de 5 minutos',
    badge: 'Offline',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  },
  {
    id: 'triaje_1',
    title: 'Triaje Psicológico',
    description: 'Test de riesgo (No es diagnóstico clínico)',
    iconBg: 'bg-rose-100',
    iconColor: 'text-rose-600',
    icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
  },
  {
    id: 'apoyo_1',
    title: 'Mapa de Apoyo UCV',
    description: 'Ubicaciones físicas de asistencia',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
  }
];

export default function HerramientasView() {
  // Solución del error ts(2367): Tipado explícito a 'string'
  const currentPath: string = '/herramientas';

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center">
      <div className="w-full max-w-md bg-[#F9F7F2] min-h-screen relative shadow-lg overflow-hidden flex flex-col">
        
        {/* Header */}
        <header className="px-6 pt-12 pb-6">
          <h1 className="text-3xl font-extrabold text-[#4A4E69]">Recursos</h1>
          <p className="text-sm text-[#4A4E69]/70 mt-1">Biblioteca de autogestión y meditación</p>
        </header>

        {/* Content */}
        <main className="flex-1 px-6 overflow-y-auto pb-24">
          <div className="space-y-4">
            {toolsData.map((tool) => (
              <button 
                key={tool.id}
                className="w-full bg-white rounded-2xl p-4 flex items-center shadow-sm border border-gray-100 hover:shadow-md transition-shadow active:scale-[0.98] text-left"
              >
                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 ${tool.iconBg} ${tool.iconColor}`}>
                  {tool.icon}
                </div>
                
                {/* Text Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-[#4A4E69] font-bold text-[15px] leading-tight">
                      {tool.title}
                    </h3>
                    {tool.badge && (
                      <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 text-[9px] font-bold uppercase rounded-md">
                        {tool.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[#4A4E69] opacity-70 text-xs">
                    {tool.description}
                  </p>
                </div>
                
                {/* Chevron */}
                <div className="text-[#4A4E69] ml-2">
                  <ChevronRight />
                </div>
              </button>
            ))}
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