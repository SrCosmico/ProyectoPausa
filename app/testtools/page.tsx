import React from 'react';

// --- Interfaces ---
interface Tool {
  id: string;
  title: string;
  description: string;
  colorTheme: 'lavender' | 'sage' | 'blue';
  icon: React.ReactNode;
}

interface NavItem {
  id: string;
  label: string;
  isActive: boolean;
  icon: React.ReactNode;
}

// --- Icons (Inline SVGs) ---
const ChevronRight = () => (
  <svg className="w-5 h-5 opacity-50 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const MeditationIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm5.5 12c-1.25-2.05-3.23-3.5-5.5-3.5s-4.25 1.45-5.5 3.5c1.41 1.55 3.35 2.5 5.5 2.5s4.09-.95 5.5-2.5z" />
  </svg>
);

const StressIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m0-16c-2 0-4 1.5-4 3.5S10 11 12 11m0-7c2 0 4 1.5 4 3.5S14 11 12 11m0 0c-2.5 0-4.5 2-4.5 4.5S9.5 20 12 20m0-9c2.5 0 4.5 2 4.5 4.5S14.5 20 12 20" />
  </svg>
);

const BodyScanIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    <circle cx="12" cy="10" r="1.5" fill="currentColor" />
  </svg>
);

const MuscleIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.121 14.121L19 19m-4.879-4.879a3 3 0 10-4.242-4.242 3 3 0 004.242 4.242zM9.879 9.879L5 5" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 9l-6 6" />
  </svg>
);

const HeartIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const AlertIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const HomeNavIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const EvalNavIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ResourcesNavIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
  </svg>
);

const ProfileNavIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

// --- Dummy Data ---
const toolsData: Tool[] = [
  {
    id: '1',
    title: 'Meditación y respiración',
    description: 'Ejercicios para calmar tu mente',
    colorTheme: 'lavender',
    icon: <MeditationIcon />,
  },
  {
    id: '2',
    title: 'Tips anti-estrés',
    description: 'Pequeñas acciones, grandes cambios',
    colorTheme: 'sage',
    icon: <StressIcon />,
  },
  {
    id: '3',
    title: 'Escaneo corporal',
    description: 'Conecta con tu cuerpo',
    colorTheme: 'blue',
    icon: <BodyScanIcon />,
  },
  {
    id: '4',
    title: 'Relajación muscular progresiva',
    description: 'Libera la tensión',
    colorTheme: 'lavender',
    icon: <MuscleIcon />,
  },
  {
    id: '5',
    title: 'Frases motivacionales',
    description: 'Inspírate cada día',
    colorTheme: 'sage',
    icon: <HeartIcon />,
  },
  {
    id: '6',
    title: 'Modo crisis',
    description: 'Si necesitas ayuda inmediata',
    colorTheme: 'lavender',
    icon: <AlertIcon />,
  },
];

const navData: NavItem[] = [
  { id: 'inicio', label: 'Inicio', isActive: false, icon: <HomeNavIcon /> },
  { id: 'evaluacion', label: 'Evaluación', isActive: false, icon: <EvalNavIcon /> },
  { id: 'recursos', label: 'Recursos', isActive: true, icon: <ResourcesNavIcon /> },
  { id: 'perfil', label: 'Perfil', isActive: false, icon: <ProfileNavIcon /> },
];

// --- Theme Mapping Helpers ---
const getCardBgColor = (theme: Tool['colorTheme']) => {
  switch (theme) {
    case 'lavender': return 'bg-[#CDB4DB]/15';
    case 'sage': return 'bg-[#B8C4BB]/15';
    case 'blue': return 'bg-[#A2D2FF]/15';
  }
};

const getIconBgColor = (theme: Tool['colorTheme']) => {
  switch (theme) {
    case 'lavender': return 'bg-[#CDB4DB]/40 text-[#4A4E69]';
    case 'sage': return 'bg-[#B8C4BB]/40 text-[#4A4E69]';
    case 'blue': return 'bg-[#A2D2FF]/40 text-[#4A4E69]';
  }
};

// --- Main Component ---
export default function ToolsScreen() {
  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-center p-4">
      {/* Mobile Device Container - Cambiado a un crema más limpio/blanco (#FCFBF8) */}
      <div className="w-full max-w-[400px] h-[850px] max-h-[100vh] bg-[#FCFBF8] rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col border-[6px] border-white">
        
        {/* Header Section */}
        <div className="px-6 pt-12 pb-4">
          <h1 className="text-2xl font-bold text-[#4A4E69] tracking-tight">Herramientas</h1>
          <p className="text-[#4A4E69] opacity-80 mt-1 text-sm font-medium">Para tu bienestar diario</p>
        </div>

        {/* Scrollable Tools List */}
        <div className="flex-1 overflow-y-auto px-6 pb-24 no-scrollbar">
          <div className="space-y-3">
            {toolsData.map((tool) => (
              <button 
                key={tool.id}
                // Animaciones agregadas: group, transition-all, hover:-translate-y, hover:shadow, active:scale
                className={`group w-full flex items-center p-3 rounded-2xl transition-all duration-300 ease-out hover:shadow-md hover:-translate-y-0.5 active:scale-95 active:shadow-sm ${getCardBgColor(tool.colorTheme)}`}
              >
                {/* Icon Container - Animación de escala en hover */}
                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center mr-4 transition-transform duration-300 group-hover:scale-110 group-active:scale-95 ${getIconBgColor(tool.colorTheme)}`}>
                  {tool.icon}
                </div>
                
                {/* Text Content */}
                <div className="flex-1 text-left">
                  <h3 className="text-[#4A4E69] font-bold text-[15px] leading-tight mb-0.5">
                    {tool.title}
                  </h3>
                  <p className="text-[#4A4E69] opacity-70 text-xs">
                    {tool.description}
                  </p>
                </div>
                
                {/* Chevron - Animado hacia la derecha en hover (ver componente ChevronRight arriba) */}
                <div className="text-[#4A4E69] ml-2">
                  <ChevronRight />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Navigation - Cambiado al mismo crema limpio */}
        <div className="absolute bottom-0 w-full bg-[#FCFBF8] border-t border-[#4A4E69]/10 px-6 py-4 pb-8 flex justify-between items-center rounded-b-[2.5rem]">
          {navData.map((item) => (
            <button 
              key={item.id} 
              // Animación en el nav: hover y active scale
              className="flex flex-col items-center justify-center space-y-1 w-16 transition-all duration-200 hover:scale-105 active:scale-90 active:opacity-70"
            >
              <div className={`${item.isActive ? 'text-[#4A4E69]' : 'text-[#4A4E69]/40'}`}>
                {item.icon}
              </div>
              <span className={`text-[10px] font-semibold ${item.isActive ? 'text-[#4A4E69]' : 'text-[#4A4E69]/50'}`}>
                {item.label}
              </span>
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}