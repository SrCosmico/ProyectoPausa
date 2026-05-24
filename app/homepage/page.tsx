const leyenda: Leyenda[] = [
    { id: 1, nivel: "Muy mal", descripcion: "Te sientes abrumado, triste o desesperanzado." },
    { id: 2, nivel: "Mal", descripcion: "Te sientes decaído o con dificultades." },
    { id: 3, nivel: "Regular", descripcion: "Ni bien ni mal, un día promedio." },
    { id: 4, nivel: "Bien", descripcion: "Te sientes tranquilo y positivo." },
    { id: 5, nivel: "Muy bien", descripcion: "Te sientes excelente, lleno de energía." },
]

"use client";

import { Leyenda } from '@/models/home';
import React, { useState } from 'react';

// === TYPES & INTERFACES ===
interface QuickAccessItem {
  id: string;
  title: string;
  description: string;
  iconBg: string;
  iconColor: string;
  svgIcon: React.ReactNode;
}

interface NavItem {
  id: 'inicio' | 'evaluacion' | 'recursos' | 'perfil';
  label: string;
  svgIcon: (isActive: boolean) => React.ReactNode;
}

export default function HomeView() {
  // State for active bottom navigation tab
  const [activeTab, setActiveTab] = useState<'inicio' | 'evaluacion' | 'recursos' | 'perfil'>('inicio');
  
  // State for mood selection tracking
  const [selectedMood, setSelectedMood] = useState<number | null>(null);

  // === LOCAL DUMMY DATA ===
  const moods = [
    { id: 1, emoji: '🙁', label: 'Mal' },
    { id: 2, emoji: '😐', label: 'Neutral' },
    { id: 3, emoji: '🙂', label: 'Bien' },
    { id: 4, emoji: '😀', label: 'Muy bien' },
    { id: 5, emoji: '😍', label: 'Excelente' },
  ];

  const quickAccessList: QuickAccessItem[] = [
    {
      id: 'evaluacion',
      title: 'Evaluación rápida',
      description: 'Conoce tu bienestar',
      iconBg: 'bg-[#B8C4BB]/20',
      iconColor: 'text-[#4A4E69]',
      svgIcon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.03 0 1.9.693 2.166 1.638m-7.377 0A48.536 48.536 0 0 1 12 3m0 0c2.917 0 5.747.294 8.5.862m-21 10.398c0-.552.448-1 1-1h6.25a1 1 0 0 1 1 1v3.83a1 1 0 0 1-1 1H2.5a1 1 0 0 1-1-1v-3.83Z" />
        </svg>
      ),
    },
    {
      id: 'meditacion',
      title: 'Meditación y respiración',
      description: 'Encuentra tu calma',
      iconBg: 'bg-[#CDB4DB]/30',
      iconColor: 'text-[#4A4E69]',
      svgIcon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a5.078 5.078 0 0 1-3.91-1.804M12 21a5.078 5.078 0 0 0 3.91-1.804M12 21V11m0 0a3 3 0 1 0-3-3M12 11a3 3 0 1 1 3-3M9.09 19.196a8.966 8.966 0 0 1-2.329-5.223m0 0A5.252 5.252 0 0 1 12 8.25m-5.239 5.723a5.248 5.248 0 0 0 3.486 4.673M14.91 19.196a8.966 8.966 0 0 0 2.329-5.223m0 0A5.252 5.252 0 0 0 12 8.25m5.239 5.723a5.248 5.248 0 0 1-3.486 4.673" />
        </svg>
      ),
    },
    {
      id: 'tips',
      title: 'Tips anti-estrés',
      description: 'Pequeñas acciones grandes cambios',
      iconBg: 'bg-[#A2D2FF]/30',
      iconColor: 'text-[#4A4E69]',
      svgIcon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.468 5.99 5.99 0 0 0-1.925 3.547 5.975 5.975 0 0 1-2.14 4.084A3.75 3.75 0 0 0 12 18Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.942 12.486a4.5 4.5 0 0 0-2.848 5.323 8.964 8.964 0 0 0 11.786 0 4.5 4.5 0 0 0-2.848-5.323c-.317-.105-.66-.16-1.014-.16-.355 0-.698.055-1.014.16a4.5 4.5 0 0 1-4.062 0Z" />
        </svg>
      ),
    },
    {
      id: 'cronograma',
      title: 'Cronograma académico',
      description: 'Organiza tu semana',
      iconBg: 'bg-[#B8C4BB]/20',
      iconColor: 'text-[#4A4E69]',
      svgIcon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
        </svg>
      ),
    },
    {
      id: 'registro',
      title: 'Registro emocional',
      description: 'Tu espacio personal',
      iconBg: 'bg-[#CDB4DB]/20',
      iconColor: 'text-[#4A4E69]',
      svgIcon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
        </svg>
      ),
    },
  ];

  const navigationItems: NavItem[] = [
    {
      id: 'inicio',
      label: 'Inicio',
      svgIcon: (isActive) => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={isActive ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
      ),
    },
    {
      id: 'evaluacion',
      label: 'Evaluación',
      svgIcon: (isActive) => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={isActive ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" />
        </svg>
      ),
    },
    {
      id: 'recursos',
      label: 'Recursos',
      svgIcon: (isActive) => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={isActive ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a5.078 5.078 0 0 1-3.91-1.804M12 21a5.078 5.078 0 0 0 3.91-1.804M12 21V11m0 0a3 3 0 1 0-3-3M12 11a3 3 0 1 1 3-3M9.09 19.196a8.966 8.966 0 0 1-2.329-5.223m0 0A5.252 5.252 0 0 1 12 8.25m-5.239 5.723a5.248 5.248 0 0 0 3.486 4.673M14.91 19.196a8.966 8.966 0 0 0 2.329-5.223m0 0A5.252 5.252 0 0 0 12 8.25m5.239 5.723a5.248 5.248 0 0 1-3.486 4.673" />
        </svg>
      ),
    },
    {
      id: 'perfil',
      label: 'Perfil',
      svgIcon: (isActive) => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={isActive ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[#F9F7F2] flex justify-center items-start antialiased font-sans p-0 sm:p-4 md:p-8">
      {/* Container simulating mobile viewport framework */}
      <div className="w-full max-w-md bg-[#F9F7F2] min-h-screen sm:min-h-[850px] sm:rounded-[40px] sm:shadow-2xl overflow-hidden relative border border-gray-100 flex flex-col justify-between">
        
        {/* Main Scrollable Content */}
        <div className="px-6 pt-8 pb-24 overflow-y-auto flex-1">
          
          {/* Header Section */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-[28px] font-bold text-[#4A4E69] flex items-center gap-1.5 tracking-tight">
                Hola, Valeria <span className="animate-bounce origin-bottom-right inline-block">👋</span>
              </h1>
              <p className="text-[#4A4E69]/70 text-[15px] font-medium mt-0.5">
                Nos alegra que estés aquí
              </p>
            </div>
            
            {/* Avatar Profile Placeholder */}
            <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-200 bg-[#CDB4DB]/40 flex items-center justify-center shrink-0 shadow-sm">
              <div className="relative w-full h-full bg-[#4A4E69]/10 flex items-center justify-center">
                {/* Visual rendering of profile avatar silhouette or mock face matching image */}
                <div className="w-7 h-7 bg-[#4A4E69]/60 rounded-full absolute top-2"></div>
                <div className="w-10 h-6 bg-[#4A4E69]/50 rounded-b-full absolute bottom-0"></div>
              </div>
            </div>
          </div>

          {/* Mood Selector Module Card */}
          <div className="bg-[#4A4E69]/5 rounded-3xl p-5 mb-8 border border-[#4A4E69]/5">
            <h2 className="text-[#4A4E69] text-base font-semibold text-center mb-1">
              ¿Cómo te sientes hoy?
            </h2>
            <p className="text-[#4A4E69]/60 text-xs text-center mb-5 font-medium">
              Registra tu estado emocional
            </p>
            
            {/* Emojis Dynamic Grid Mapping */}
            <div className="flex justify-between items-center px-2">
              {moods.map((mood) => {
                const isSelected = selectedMood === mood.id;
                return (
                  <button
                    key={mood.id}
                    onClick={() => setSelectedMood(mood.id)}
                    className={`text-3xl transition-transform duration-200 focus:outline-none ${
                      isSelected 
                        ? 'scale-125 filter drop-shadow-md brightness-110' 
                        : 'hover:scale-110 opacity-80 hover:opacity-100'
                    }`}
                    title={mood.label}
                    aria-label={`Sentirse ${mood.label}`}
                  >
                    {mood.emoji}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Access Title */}
          <div className="mb-4">
            <h3 className="text-[#4A4E69] text-lg font-bold tracking-tight">
              Accesos rápidos
            </h3>
          </div>

          {/* Action Cards List View Stack */}
          <div className="space-y-3">
            {quickAccessList.map((item) => (
              <button
                key={item.id}
                className="w-full bg-white rounded-2xl p-3.5 flex items-center justify-between text-left shadow-[0_2px_8px_rgba(74,78,105,0.04)] border border-gray-50/50 hover:bg-gray-50/80 active:scale-[0.99] transition-all duration-150"
              >
                <div className="flex items-center gap-4">
                  {/* Icon Container with Custom Dynamic Background Mixes */}
                  <div className={`w-12 h-12 rounded-xl ${item.iconBg} ${item.iconColor} flex items-center justify-center shrink-0`}>
                    {item.svgIcon}
                  </div>
                  
                  {/* Item Text Descriptors */}
                  <div>
                    <h4 className="text-[#4A4E69] text-[15px] font-bold leading-snug">
                      {item.title}
                    </h4>
                    <p className="text-[#4A4E69]/60 text-xs mt-0.5 font-medium">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Subtle Right Access Chevron Arrow */}
                <div className="text-[#4A4E69]/30 pr-1">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m9 5 7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}
          </div>

        </div>

        {/* Global Bottom Navigation Interface Fixed Anchor */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-2 flex justify-around items-center rounded-b-none sm:rounded-b-[40px] shadow-[0_-4px_16px_rgba(0,0,0,0.02)]">
          {navigationItems.map((nav) => {
            const isActive = activeTab === nav.id;
            return (
              <button
                key={nav.id}
                onClick={() => setActiveTab(nav.id)}
                className="flex flex-col items-center justify-center py-1.5 w-16 transition-colors duration-200 focus:outline-none"
              >
                <div className={`transition-transform duration-200 ${isActive ? 'text-[#4A4E69] scale-105' : 'text-[#4A4E69]/40 hover:text-[#4A4E69]/70'}`}>
                  {nav.svgIcon(isActive)}
                </div>
                <span className={`text-[10px] mt-1 font-semibold transition-colors duration-200 ${isActive ? 'text-[#4A4E69]' : 'text-[#4A4E69]/40'}`}>
                  {nav.label}
                </span>
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
}