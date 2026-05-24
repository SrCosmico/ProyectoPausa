'use client';

import React, { useState } from 'react';

// ==========================================
// --- TYPES & INTERFACES ---
// ==========================================
type ScreenName = 'inicio' | 'herramientas' | 'bienestar' | 'perfil' | 'historial' | 'consejos' | 'registro' | 'ejercicio';

interface QuickAccessItem {
  id: string;
  title: string;
  description: string;
  iconBg: string;
  iconColor: string;
  svgIcon: React.ReactNode;
}

interface NavItem {
  id: 'inicio' | 'herramientas' | 'bienestar' | 'perfil';
  label: string;
  svgIcon: (isActive: boolean) => React.ReactNode;
}

interface HistoryPoint {
  dayLabel: string;
  dayInitial: string;
  statusEmoji: string;
  valueY: number; 
  dotColor: string;
}

interface EmotionOption {
  id: string;
  label: string;
  emoji: string;
  color: string;
  textColor: string;
}

// ==========================================
// --- CONSTANTS & DUMMY DATA ---
// ==========================================
const EMOTIONS: EmotionOption[] = [
  { id: 'muy-mal', label: 'Muy mal', emoji: '😭', color: 'bg-[#4A4E69]', textColor: 'text-white' },
  { id: 'mal', label: 'Mal', emoji: '😕', color: 'bg-[#CDB4DB]', textColor: 'text-[#4A4E69]' },
  { id: 'regular', label: 'Regular', emoji: '😐', color: 'bg-[#E5E0D8]', textColor: 'text-[#4A4E69]' },
  { id: 'bien', label: 'Bien', emoji: '😌', color: 'bg-[#B8C4BB]', textColor: 'text-[#4A4E69]' },
  { id: 'muy-bien', label: 'Muy bien', emoji: '😊', color: 'bg-[#A2D2FF]', textColor: 'text-[#4A4E69]' },
];

const HISTORY_DATA: HistoryPoint[] = [
  { dayLabel: 'L', dayInitial: 'L', statusEmoji: '😐', valueY: 45, dotColor: 'bg-[#CDB4DB]' },
  { dayLabel: 'M', dayInitial: 'M', statusEmoji: '😕', valueY: 65, dotColor: 'bg-[#A2D2FF]' },
  { dayLabel: 'M', dayInitial: 'M', statusEmoji: '😐', valueY: 55, dotColor: 'bg-[#A2D2FF]' },
  { dayLabel: 'J', dayInitial: 'J', statusEmoji: '😐', valueY: 35, dotColor: 'bg-[#B8C4BB]' },
  { dayLabel: 'V', dayInitial: 'V', statusEmoji: '😌', valueY: 50, dotColor: 'bg-[#4A4E69]' },
  { dayLabel: 'S', dayInitial: 'S', statusEmoji: '😊', valueY: 25, dotColor: 'bg-[#A2D2FF]' },
  { dayLabel: 'D', dayInitial: 'D', statusEmoji: '😐', valueY: 40, dotColor: 'bg-[#B8C4BB]' },
];

const TOOLS_LIST = [
  { id: 'respira', title: 'Respiración guiada', description: 'Ejercicios de calma para reducir los niveles de estrés.', colorTheme: 'lavender' as const },
  { id: 'medita', title: 'Meditación corta', description: 'Tómate 5 minutos para reconectar con el presente.', colorTheme: 'sage' as const },
  { id: 'foco', title: 'Música para enfocar', description: 'Sonidos diseñados para mejorar tu productividad académica.', colorTheme: 'blue' as const },
];

const SUGGESTIONS = [
  { id: 'tips', title: 'Consejos para el manejo de la ansiedad', time: 'Lectura de 3 min', emoji: '💡' },
  { id: 'comunidad', title: 'Foros de apoyo estudiantil UCV', time: 'Comunidad activa', emoji: '🏛️' },
];

// ==========================================
// --- INLINE SVG ICONS ---
// ==========================================
const SvgHome = (isActive: boolean) => (
  <svg className="w-5 h-5" fill={isActive ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
  </svg>
);

const SvgTools = (isActive: boolean) => (
  <svg className="w-5 h-5" fill={isActive ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.83-5.83m0 0a2.652 2.652 0 1 1-3.753-3.753 2.652 2.652 0 0 1 3.753 3.753ZM9.054 9.054l-2.775 2.775a2.652 2.652 0 0 0 0 3.753l4.723 4.723a2.652 2.652 0 0 0 3.753 0l2.775-2.775M9.054 9.054l2.775-2.775a2.652 2.652 0 0 1 3.753 0l1.414 1.414M9.054 9.054 4.331 4.331a2.652 2.652 0 0 0-3.753 0 2.652 2.652 0 0 0 0 3.753l4.723 4.723" />
  </svg>
);

const SvgHeart = (isActive: boolean) => (
  <svg className="w-5 h-5" fill={isActive ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
  </svg>
);

const SvgUser = (isActive: boolean) => (
  <svg className="w-5 h-5" fill={isActive ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
  </svg>
);

const SvgChevronRight = () => (
  <svg className="w-5 h-5 opacity-60" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="m9 5 7 7-7 7" />
  </svg>
);

const SvgChevronLeft = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
  </svg>
);

// ==========================================
// --- MAIN CONTAINER COMPONENT ---
// ==========================================
export default function PausaApp() {
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('inicio');
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  const navigationItems: NavItem[] = [
    { id: 'inicio', label: 'Inicio', svgIcon: (act) => SvgHome(act) },
    { id: 'herramientas', label: 'Herramientas', svgIcon: (act) => SvgTools(act) },
    { id: 'bienestar', label: 'Bienestar', svgIcon: (act) => SvgHeart(act) },
    { id: 'perfil', label: 'Perfil', svgIcon: (act) => SvgUser(act) },
  ];

  const handleNavClick = (id: 'inicio' | 'herramientas' | 'bienestar' | 'perfil') => {
    setCurrentScreen(id);
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex justify-center items-center font-sans sm:p-4">
      {/* Contenedor estructural Mobile-First */}
      <div className="w-full max-w-[420px] h-[100dvh] sm:h-[840px] bg-[#F9F7F2] relative overflow-hidden flex flex-col sm:rounded-[40px] sm:shadow-2xl sm:border sm:border-gray-200">
        
        {/* Cuerpo Scrolleable Interno */}
        <div className="flex-1 overflow-y-auto pb-24 tokens-scroll">
          {currentScreen === 'inicio' && (
            <ScreenInicio 
              navigate={setCurrentScreen} 
              selectedMood={selectedMood} 
              setSelectedMood={setSelectedMood} 
            />
          )}
          {currentScreen === 'herramientas' && (
            <ScreenHerramientas navigate={setCurrentScreen} />
          )}
          {currentScreen === 'bienestar' && (
            <ScreenBienestar navigate={setCurrentScreen} />
          )}
          {currentScreen === 'perfil' && (
            <ScreenPerfil navigate={setCurrentScreen} />
          )}
          {currentScreen === 'historial' && (
            <ScreenHistorial navigate={setCurrentScreen} />
          )}
          {currentScreen === 'consejos' && (
            <ScreenConsejos navigate={setCurrentScreen} />
          )}
          {currentScreen === 'registro' && (
            <ScreenRegistroEociones navigate={setCurrentScreen} />
          )}
          {currentScreen === 'ejercicio' && (
            <ScreenEjercicioGuiado navigate={setCurrentScreen} />
          )}
        </div>

        {/* Barra de Navegación Global Inferior */}
        {['inicio', 'herramientas', 'bienestar', 'perfil'].includes(currentScreen) && (
          <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-2 flex justify-around items-center rounded-b-none sm:rounded-b-[40px] shadow-[0_-4px_16px_rgba(0,0,0,0.02)] z-30">
            {navigationItems.map((nav) => {
              const isActive = currentScreen === nav.id;
              return (
                <button
                  key={nav.id}
                  onClick={() => handleNavClick(nav.id)}
                  className="flex flex-col items-center justify-center py-1.5 w-16 transition-colors duration-200 focus:outline-none"
                >
                  <div className={`transition-transform duration-200 ${isActive ? 'text-[#4A4E69] scale-105' : 'text-[#4A4E69]/40 hover:text-[#4A4E69]/70'}`}>
                    {nav.svgIcon(isActive)}
                  </div>
                  <span className={`text-[10px] mt-1 font-bold tracking-tight transition-colors duration-200 ${isActive ? 'text-[#4A4E69]' : 'text-[#4A4E69]/40'}`}>
                    {nav.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// --- PANTALLA: INICIO ---
// ==========================================
interface ScreenProps {
  navigate: (screen: ScreenName) => void;
  selectedMood?: string | null;
  setSelectedMood?: (mood: string | null) => void;
}

function ScreenInicio({ navigate, selectedMood, setSelectedMood }: ScreenProps) {
  const quickAccessItems: QuickAccessItem[] = [
    {
      id: 'respira',
      title: 'Espacio de Respiración',
      description: 'Tómate un minuto para estabilizar tu ritmo.',
      iconBg: 'bg-[#A2D2FF]/20',
      iconColor: 'text-[#5A82B8]',
      svgIcon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18m9-9H3" /></svg>
    },
    {
      id: 'consejos',
      title: 'Lecturas de Soporte',
      description: 'Artículos rápidos sobre manejo del estrés universitario.',
      iconBg: 'bg-[#CDB4DB]/20',
      iconColor: 'text-[#8A6D96]',
      svgIcon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
    }
  ];

  return (
    <div className="px-6 pt-10 pb-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#2B2D42] tracking-tight">Hola, Comunidad Ucevista</h1>
        <p className="text-sm text-[#4A4E69]/70 mt-0.5">¿Cómo calificarías tu estado de ánimo actual?</p>
      </div>

      {/* Selector de Ánimo */}
      <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.015)]">
        <div className="grid grid-cols-5 gap-2">
          {EMOTIONS.map((emo) => {
            const isSelected = selectedMood === emo.id;
            return (
              <button
                key={emo.id}
                onClick={() => setSelectedMood && setSelectedMood(emo.id)}
                className={`flex flex-col items-center p-2 rounded-2xl transition-all duration-200 ${
                  isSelected ? `${emo.color} ${emo.textColor} scale-105 shadow-sm` : 'bg-[#F9F7F2]/60 hover:bg-[#F9F7F2] text-[#4A4E69]'
                }`}
              >
                <span className="text-2xl mb-1">{emo.emoji}</span>
                <span className="text-[10px] font-bold tracking-tight text-center leading-tight">{emo.label}</span>
              </button>
            );
          })}
        </div>

        {selectedMood && (
          <div className="mt-4 pt-3 border-t border-gray-50 flex justify-between items-center animate-fade-in">
            <p className="text-xs text-[#4A4E69]/80 font-medium">
              Seleccionaste: <span className="font-bold">
                {EMOTIONS.find(e => e.id === selectedMood)?.label}
              </span>
            </p>
            <button 
              onClick={() => navigate('registro')}
              className="text-xs font-bold text-[#5A82B8] hover:underline"
            >
              Completar registro ›
            </button>
          </div>
        )}
      </div>

      {/* Accesos Rápidos */}
      <div className="space-y-3">
        <h2 className="text-[15px] font-bold text-[#4A4E69] px-1">Acceso Rápido</h2>
        <div className="space-y-2.5">
          {quickAccessItems.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.id === 'respira' ? 'ejercicio' : 'consejos')}
              className="w-full bg-white hover:bg-gray-50/50 border border-gray-100 p-4 rounded-2xl flex items-center justify-between transition-all duration-200 shadow-[0_2px_12px_rgba(0,0,0,0.01)] group"
            >
              <div className="flex items-center space-x-4">
                <div className={`w-10 h-10 ${item.iconBg} ${item.iconColor} rounded-xl flex items-center justify-center flex-shrink-0 font-bold`}>
                  {item.svgIcon}
                </div>
                <div className="text-left">
                  <h3 className="text-sm font-bold text-[#4A4E69] group-hover:text-[#2B2D42] transition-colors">{item.title}</h3>
                  <p className="text-xs text-[#4A4E69]/60 mt-0.5 line-clamp-1">{item.description}</p>
                </div>
              </div>
              <SvgChevronRight />
            </button>
          ))}
        </div>
      </div>

      {/* Banner Informativo */}
      <div className="bg-[#B8C4BB]/20 rounded-3xl p-5 border border-[#B8C4BB]/30 flex items-start space-x-4">
        <span className="text-2xl mt-0.5">🏛️</span>
        <div>
          <h4 className="text-sm font-bold text-[#4A4E69]">¿Necesitas atención inmediata?</h4>
          <p className="text-xs text-[#4A4E69]/80 mt-1 leading-relaxed">
            El servicio de orientación y apoyo psicológico de la UCV cuenta con canales de atención directa en el campus central.
          </p>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// --- PANTALLA: HERRAMIENTAS ---
// ==========================================
function ScreenHerramientas({ navigate }: { navigate: (s: ScreenName) => void }) {
  const getThemeClasses = (theme: 'lavender' | 'sage' | 'blue') => {
    switch (theme) {
      case 'lavender': return 'bg-[#CDB4DB]/10 hover:bg-[#CDB4DB]/20 border-[#CDB4DB]/20 text-[#8A6D96]';
      case 'sage': return 'bg-[#B8C4BB]/10 hover:bg-[#B8C4BB]/20 border-[#B8C4BB]/20 text-[#6B8E78]';
      case 'blue': return 'bg-[#A2D2FF]/10 hover:bg-[#A2D2FF]/20 border-[#A2D2FF]/20 text-[#5A82B8]';
    }
  };

  const getEmoji = (theme: 'lavender' | 'sage' | 'blue') => {
    if (theme === 'lavender') return '🌬️';
    if (theme === 'sage') return '🧘';
    return '🎧';
  };

  return (
    <div className="px-6 pt-10 pb-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#2B2D42] tracking-tight">Herramientas</h1>
        <p className="text-sm text-[#4A4E69]/70 mt-0.5">Ejercicios interactivos de autocuidado y relajación.</p>
      </div>

      <div className="space-y-3">
        {TOOLS_LIST.map((tool) => (
          <button
            key={tool.id}
            onClick={() => navigate('ejercicio')}
            className={`w-full p-4 rounded-3xl border flex items-center space-x-4 transition-all duration-200 text-left ${getThemeClasses(tool.colorTheme)}`}
          >
            <div className="w-11 h-11 bg-white/80 rounded-xl flex items-center justify-center text-xl flex-shrink-0 shadow-sm">
              {getEmoji(tool.colorTheme)}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-[#4A4E69] font-bold text-[15px] leading-tight mb-0.5">
                {tool.title}
              </h3>
              <p className="text-[#4A4E69]/70 text-xs line-clamp-2">
                {tool.description}
              </p>
            </div>
            
            <div className="text-[#4A4E69]/80">
              <SvgChevronRight />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// --- PANTALLA: BIENESTAR (Métricas e Historial) ---
// ==========================================
function ScreenBienestar({ navigate }: { navigate: (s: ScreenName) => void }) {
  return (
    <div className="px-6 pt-10 pb-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#2B2D42] tracking-tight">Mi Bienestar</h1>
        <p className="text-sm text-[#4A4E69]/70 mt-0.5">Balance y constancia en tu registro emocional.</p>
      </div>

      {/* Gráfico Analítico Lineal Customizado */}
      <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.015)]">
        <div className="flex justify-between items-center mb-6">
          <span className="text-xs font-bold text-[#4A4E69] bg-[#F9F7F2] px-3 py-1.5 rounded-full">
            Esta semana
          </span>
          <button 
            onClick={() => navigate('historial')}
            className="text-xs font-bold text-[#5A82B8] hover:underline"
          >
            Ver historial completo
          </button>
        </div>

        {/* Eje y Área del Gráfico SVG */}
        <div className="h-32 w-full relative mt-2">
          <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
            {/* Líneas Guía Horizontales */}
            <line x1="0" y1="20" x2="100%" y2="20" stroke="#F1EFE9" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="0" y1="65" x2="100%" y2="65" stroke="#F1EFE9" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="0" y1="110" x2="100%" y2="110" stroke="#F1EFE9" strokeWidth="1" strokeDasharray="4 4" />

            {/* Trazo Polilineal Conectando los Puntos */}
            <polyline
              fill="none"
              stroke="#A2D2FF"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={HISTORY_DATA.map((pt, idx) => {
                const step = 100 / (HISTORY_DATA.length - 1);
                return `${idx * step}%,${pt.valueY}`;
              }).join(' ')}
              className="w-full"
            />
          </svg>

          {/* Nodos de Intersección Flotantes Absolutos */}
          <div className="absolute inset-0 flex justify-between pointer-events-none">
            {HISTORY_DATA.map((pt, idx) => (
              <div 
                key={idx} 
                className="h-full flex flex-col justify-none items-center relative"
                style={{ width: `${100 / HISTORY_DATA.length}%` }}
              >
                <div 
                  className={`w-2.5 h-2.5 rounded-full ${pt.dotColor} border-2 border-white absolute shadow-sm`}
                  style={{ top: `${pt.valueY}px`, transform: 'translateY(-50%)' }}
                />
                <span 
                  className="absolute text-xs"
                  style={{ top: `${pt.valueY - 22}px`, transform: 'translateY(-50%)' }}
                >
                  {pt.statusEmoji}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Etiquetas Inferiores del Eje X */}
        <div className="flex justify-between items-center mt-3 px-1">
          {HISTORY_DATA.map((pt, idx) => (
            <span key={idx} className="text-xs font-bold text-[#4A4E69]/50 w-full text-center">
              {pt.dayInitial}
            </span>
          ))}
        </div>
      </div>

      {/* Tarjetas de Sugerencias */}
      <div className="space-y-3">
        <h3 className="text-[15px] font-bold text-[#4A4E69] px-1">Recomendado para ti</h3>
        <div className="space-y-2.5">
          {SUGGESTIONS.map((sug) => (
            <div
              key={sug.id}
              onClick={() => navigate('consejos')}
              className="bg-white border border-gray-100 p-4 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-gray-50/60 transition-all duration-200"
            >
              <div className="flex items-center space-x-3.5">
                <span className="text-xl">{sug.emoji}</span>
                <div>
                  <h4 className="text-sm font-bold text-[#4A4E69] leading-snug">{sug.title}</h4>
                  <p className="text-[11px] text-[#4A4E69]/50 font-medium mt-0.5">{sug.time}</p>
                </div>
              </div>
              <SvgChevronRight />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// --- PANTALLA: PERFIL DE USUARIO ---
// ==========================================
function ScreenPerfil({ navigate }: { navigate: (s: ScreenName) => void }) {
  return (
    <div className="px-6 pt-10 pb-4 space-y-6">
      <div className="text-center py-4 flex flex-col items-center">
        <div className="w-20 h-20 bg-[#4A4E69] text-[#F9F7F2] font-bold text-2xl flex items-center justify-center rounded-full shadow-inner mb-3">
          UCV
        </div>
        <h2 className="text-xl font-bold text-[#2B2D42]">Estudiante de Computación</h2>
        <p className="text-xs text-[#4A4E69]/60 font-medium mt-0.5">comunidad.ucv@ucv.ve</p>
      </div>

      <div className="bg-white rounded-3xl p-4 border border-gray-100 space-y-1">
        <div className="flex justify-between items-center p-2.5 hover:bg-gray-50 rounded-xl cursor-pointer" onClick={() => navigate('historial')}>
          <span className="text-sm font-bold text-[#4A4E69]">Mi Historial de Registros</span>
          <SvgChevronRight />
        </div>
        <div className="h-[1px] bg-gray-50 mx-2" />
        <div className="flex justify-between items-center p-2.5 hover:bg-gray-50 rounded-xl cursor-pointer" onClick={() => navigate('consejos')}>
          <span className="text-sm font-bold text-[#4A4E69]">Artículos Guardados</span>
          <SvgChevronRight />
        </div>
      </div>

      <div className="bg-white rounded-3xl p-5 border border-gray-100 space-y-3">
        <h3 className="text-xs font-bold text-[#4A4E69]/40 uppercase tracking-wider">Estadísticas de Pausa</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#F9F7F2]/80 p-3.5 rounded-2xl text-center">
            <span className="block text-xl font-bold text-[#4A4E69]">5 días</span>
            <span className="text-[11px] text-[#4A4E69]/60 font-medium mt-0.5 block">Racha de calma</span>
          </div>
          <div className="bg-[#F9F7F2]/80 p-3.5 rounded-2xl text-center">
            <span className="block text-xl font-bold text-[#4A4E69]">14</span>
            <span className="text-[11px] text-[#4A4E69]/60 font-medium mt-0.5 block">Sesiones totales</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// --- PANTALLA: HISTORIAL DETALLADO ---
// ==========================================
function ScreenHistorial({ navigate }: { navigate: (s: ScreenName) => void }) {
  const mockLogs = [
    { id: 1, date: 'Hoy, 2:15 PM', emoji: '😌', label: 'Bien', note: 'Saliendo de clases en la facultad, me dio tiempo de almorzar con tranquilidad.' },
    { id: 2, date: 'Ayer, 6:00 PM', emoji: '😐', label: 'Regular', note: 'Estudiando para el examen práctico, algo cansado por las horas de código.' },
    { id: 3, date: '21 de Mayo', emoji: '😕', label: 'Mal', note: 'Mucha cola para abordar el transporte, llegué un poco tarde a casa.' },
  ];

  return (
    <div className="px-6 pt-8 pb-4 space-y-6">
      <div className="flex items-center space-x-3">
        <button onClick={() => navigate('bienestar')} className="p-1 hover:bg-white rounded-xl transition-colors">
          <SvgChevronLeft />
        </button>
        <h1 className="text-xl font-bold text-[#2B2D42]">Historial completo</h1>
      </div>

      <div className="space-y-3.5">
        {mockLogs.map((log) => (
          <div key={log.id} className="bg-white border border-gray-100 p-4 rounded-3xl space-y-2.5 shadow-[0_2px_12px_rgba(0,0,0,0.005)]">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span className="text-xl">{log.emoji}</span>
                <span className="text-sm font-bold text-[#4A4E69]">{log.label}</span>
              </div>
              <span className="text-xs text-[#4A4E69]/40 font-semibold">{log.date}</span>
            </div>
            {log.note && (
              <p className="text-xs text-[#4A4E69]/80 leading-relaxed bg-[#F9F7F2]/50 p-3 rounded-xl border border-gray-50">
                {log.note}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// --- PANTALLA: ARTÍCULOS / CONSEJOS ---
// ==========================================
function ScreenConsejos({ navigate }: { navigate: (s: ScreenName) => void }) {
  return (
    <div className="px-6 pt-8 pb-4 space-y-6">
      <div className="flex items-center space-x-3">
        <button onClick={() => navigate('bienestar')} className="p-1 hover:bg-white rounded-xl transition-colors">
          <SvgChevronLeft />
        </button>
        <h1 className="text-xl font-bold text-[#2B2D42]">Consejos de Soporte</h1>
      </div>

      <div className="bg-white border border-gray-100 rounded-3xl p-5 space-y-4 shadow-[0_4px_20px_rgba(0,0,0,0.015)]">
        <div className="h-40 bg-[#CDB4DB]/20 rounded-2xl flex items-center justify-center text-4xl">
          🧠
        </div>
        <div className="space-y-2">
          <h2 className="text-base font-bold text-[#2B2D42] leading-snug">
            Gestión Inteligente del Estrés durante la Época de Parciales
          </h2>
          <p className="text-xs text-[#4A4E69]/40 font-semibold">Lectura de 3 minutos • Por Soporte Estudiantil</p>
        </div>
        <hr className="border-gray-100" />
        <div className="text-xs text-[#4A4E69]/80 space-y-3 leading-relaxed">
          <p>
            La carga académica en carreras exigentes dentro de la UCV suele gatillar picos de estrés elevados. El primer paso consiste en reconocer los síntomas corporales como la tensión muscular u opresión del pecho.
          </p>
          <p className="font-bold text-[#4A4E69]">La Regla de los 5 Minutos:</p>
          <p>
            Cuando te sientas completamente bloqueado frente a un problema o entrega pesada, desconéctate por completo. Usa herramientas de respiración rítmica o camina distancias cortas por el pasillo antes de retomar la actividad.
          </p>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// --- PANTALLA: REGISTRO EMOCIONAL COMPLETO ---
// ==========================================
function ScreenRegistroEociones({ navigate }: { navigate: (s: ScreenName) => void }) {
  return (
    <div className="px-6 pt-8 pb-4 space-y-6">
      <div className="flex items-center space-x-3">
        <button onClick={() => navigate('inicio')} className="p-1 hover:bg-white rounded-xl transition-colors">
          <SvgChevronLeft />
        </button>
        <h1 className="text-xl font-bold text-[#2B2D42]">Completar Registro</h1>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-bold text-[#4A4E69]/70 ml-1">¿Qué factores influyeron en tu estado actual?</label>
          <div className="flex flex-wrap gap-2">
            {['Exámenes', 'Proyectos', 'Clima', 'Transporte', 'Salud', 'Social'].map((tag) => (
              <span key={tag} className="text-xs font-bold bg-white border border-gray-100 text-[#4A4E69] px-3 py-2 rounded-xl cursor-pointer hover:bg-[#A2D2FF]/20 transition-colors">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-[#4A4E69]/70 ml-1">Notas personales o pensamientos</label>
          <textarea
            rows={4}
            placeholder="Escribe brevemente cómo te sientes (opcional)..."
            className="w-full text-xs p-4 rounded-2xl border border-gray-100 bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#A2D2FF] text-[#4A4E69] resize-none leading-relaxed"
          />
        </div>

        <button
          onClick={() => navigate('inicio')}
          className="w-full h-12 bg-[#4A4E69] text-white rounded-2xl text-sm font-bold hover:bg-[#3d4057] transition-colors shadow-sm mt-2"
        >
          Guardar Estado Emocional
        </button>
      </div>
    </div>
  );
}

// ==========================================
// --- PANTALLA: EJERCICIO GUIADO (RESPIRACIÓN) ---
// ==========================================
function ScreenEjercicioGuiado({ navigate }: { navigate: (s: ScreenName) => void }) {
  const [isAnimating, setIsAnimating] = useState(false);

  return (
    <div className="px-6 pt-8 pb-4 h-full flex flex-col justify-between">
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <button onClick={() => navigate('herramientas')} className="p-1 hover:bg-white rounded-xl transition-colors">
            <SvgChevronLeft />
          </button>
          <h1 className="text-xl font-bold text-[#2B2D42]">Respiración Guiada</h1>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100 text-center space-y-6 shadow-[0_4px_20px_rgba(0,0,0,0.015)]">
          <p className="text-xs text-[#4A4E69]/70 font-medium">
            Sigue el ritmo visual para sincronizar e inhalar de forma profunda.
          </p>

          {/* Orbe de respiración interactivo */}
          <div className="py-8 flex justify-center items-center">
            <div className={`w-32 h-32 rounded-full bg-[#A2D2FF]/40 border-4 border-[#A2D2FF] flex items-center justify-center transition-all duration-[4000ms] ease-in-out ${
              isAnimating ? 'scale-125 bg-[#CDB4DB]/40 border-[#CDB4DB]' : 'scale-100'
            }`}>
              <span className="text-xs font-bold text-[#4A4E69]">
                {isAnimating ? 'Exhala...' : 'Inhala...'}
              </span>
            </div>
          </div>

          <p className="text-sm font-bold text-[#4A4E69] h-6">
            {isAnimating ? 'Suelte el aire despacio' : 'Llene sus pulmones'}
          </p>
        </div>
      </div>

      <button
        onClick={() => setIsAnimating(!isAnimating)}
        className={`w-full h-12 rounded-2xl text-sm font-bold transition-colors shadow-sm mb-4 ${
          isAnimating ? 'bg-[#CDB4DB] text-[#4A4E69]' : 'bg-[#5A82B8] text-white hover:bg-[#4d71a1]'
        }`}
      >
        {isAnimating ? 'Pausar Ejercicio' : 'Comenzar Ciclo'}
      </button>
    </div>
  );
}