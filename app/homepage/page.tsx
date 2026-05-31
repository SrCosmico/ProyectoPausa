'use client';

import React from 'react';
import Link from 'next/link';

// === TYPES & INTERFACES ===
interface Leyenda {
  id: number;
  nivel: string;
  descripcion: string;
}

interface QuickAccessItem {
  id: string;
  title: string;
  description: string;
  iconBg: string;
  iconColor: string;
  href: string;
  svgIcon: React.ReactNode;
}

// === COMPONENTES INTERNOS (ICONOS) ===
const HomeIcon = ({ active }: { active: boolean }) => (
  <svg className="w-6 h-6" fill={active ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={active ? 1.5 : 2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const WellnessIcon = ({ active }: { active: boolean }) => (
  <svg className="w-6 h-6" fill={active ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={active ? 1.5 : 2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const ToolsIcon = ({ active }: { active: boolean }) => (
  <svg className="w-6 h-6" fill={active ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={active ? 1.5 : 2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

// === DUMMY DATA ===
const quickAccess: QuickAccessItem[] = [
  {
    id: 'triaje',
    title: 'Triaje Preventivo',
    description: 'Test rápido de riesgo',
    iconBg: 'bg-rose-100',
    iconColor: 'text-rose-600',
    href: '/herramientas',
    svgIcon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
  },
  {
    id: 'meditacion',
    title: 'Respiración',
    description: 'Ejercicios guiados offline',
    iconBg: 'bg-sky-100',
    iconColor: 'text-sky-600',
    href: '/herramientas',
    svgIcon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.52 22A1.98 1.98 0 014 20.02V8.5L12 2l8 6.5v11.52A1.98 1.98 0 0118.48 22H5.52z" /></svg>
  }
];

export default function HomeView() {
  // Solución del error ts(2367): Tipado explícito a 'string'
  const currentPath: string = '/homepage'; 

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center">
      <div className="w-full max-w-md bg-[#F9F7F2] min-h-screen relative shadow-lg overflow-hidden flex flex-col">
        
        {/* HEADER */}
        <header className="px-6 pt-12 pb-6 bg-white rounded-b-[2rem] shadow-sm relative z-10">
          <div className="flex justify-between items-center mb-6">
            <div>
              <p className="text-sm text-gray-500 font-medium">Buen día, alumno</p>
              <h1 className="text-2xl font-bold text-[#4A4E69]">¿Cómo te sientes hoy?</h1>
            </div>
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-[#4A4E69] font-bold text-xl">
              U
            </div>
          </div>

          {/* Frase Motivacional Diaria */}
          <div className="bg-[#4A4E69] rounded-2xl p-4 shadow-md text-white">
             <p className="text-sm italic opacity-90">"El éxito es la suma de pequeños esfuerzos repetidos día tras día."</p>
             <p className="text-xs mt-2 font-semibold opacity-75">- Recordatorio Pausa</p>
          </div>
        </header>

        {/* CONTENIDO PRINCIPAL */}
        <main className="flex-1 px-6 py-6 overflow-y-auto pb-24">
          <h2 className="text-lg font-bold text-[#4A4E69] mb-4">Acceso Rápido</h2>
          
          <div className="grid grid-cols-1 gap-4 mb-8">
            {quickAccess.map((item) => (
              <Link href={item.href} key={item.id}>
                <div className="bg-white p-4 rounded-2xl shadow-sm flex items-center gap-4 active:scale-[0.98] transition-transform border border-gray-100">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.iconBg} ${item.iconColor}`}>
                    {item.svgIcon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-[#4A4E69]">{item.title}</h3>
                    <p className="text-xs text-gray-500">{item.description}</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m9 5 7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>

          {/* Próximas Evaluaciones (Mock) */}
          <h2 className="text-lg font-bold text-[#4A4E69] mb-4">Cronograma Académico</h2>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-2 h-2 rounded-full bg-red-400"></div>
              <p className="text-sm font-semibold text-[#4A4E69]">Parcial de Física (Viernes)</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-amber-400"></div>
              <p className="text-sm font-semibold text-[#4A4E69]">Entrega TypeScript (Lunes)</p>
            </div>
          </div>
        </main>

        {/* BOTTOM NAVIGATION */}
        <nav className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center z-50">
          <Link href="/homepage" className={`flex flex-col items-center justify-center space-y-1 w-16 transition-colors ${currentPath === '/homepage' ? 'text-[#4A4E69]' : 'text-gray-400 hover:text-[#4A4E69]/70'}`}>
            <HomeIcon active={currentPath === '/homepage'} />
            <span className="text-[10px] font-bold">Inicio</span>
          </Link>
          
          <Link href="/bienestar" className={`flex flex-col items-center justify-center space-y-1 w-16 transition-colors ${currentPath === '/bienestar' ? 'text-[#4A4E69]' : 'text-gray-400 hover:text-[#4A4E69]/70'}`}>
            <WellnessIcon active={currentPath === '/bienestar'} />
            <span className="text-[10px] font-bold">Bienestar</span>
          </Link>

          <Link href="/herramientas" className={`flex flex-col items-center justify-center space-y-1 w-16 transition-colors ${currentPath === '/herramientas' ? 'text-[#4A4E69]' : 'text-gray-400 hover:text-[#4A4E69]/70'}`}>
            <ToolsIcon active={currentPath === '/herramientas'} />
            <span className="text-[10px] font-bold">Recursos</span>
          </Link>
        </nav>

      </div>
    </div>
  );
}