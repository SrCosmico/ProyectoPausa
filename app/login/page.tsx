import React from 'react';

export default function LoginScreen() {
  return (
    <div className="min-h-screen bg-[#F9F7F2] text-[#4A4E69] flex justify-center items-center font-sans sm:p-6">
      {/* Contenedor principal estilo móvil */}
      <div className="w-full max-w-[400px] h-[100dvh] sm:h-[800px] bg-[#F9F7F2] relative overflow-hidden flex flex-col sm:rounded-[40px] sm:shadow-2xl sm:border sm:border-[#E5E0D8]">
        
        {/* Cabecera y Navegación */}
        <div className="flex justify-between items-start pt-12 px-8">
          <button type="button" className="p-2 -ml-2 text-[#4A4E69] hover:opacity-70 transition-opacity">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          
          {/* Ícono de círculos superpuestos */}
          <div className="relative w-12 h-12 flex items-center justify-center">
            <div className="absolute top-0 right-1 w-[30px] h-[30px] rounded-full bg-[#B8C4BB] mix-blend-multiply opacity-80"></div>
            <div className="absolute bottom-1.5 left-1 w-[30px] h-[30px] rounded-full bg-[#A2D2FF] mix-blend-multiply opacity-80"></div>
            <div className="absolute bottom-1.5 right-1 w-[30px] h-[30px] rounded-full bg-[#CDB4DB] mix-blend-multiply opacity-80"></div>
            <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5 absolute z-10">
              <path d="M12 0l1.5 8.5L22 10l-8.5 1.5L12 20l-1.5-8.5L2 10l8.5-1.5z" />
            </svg>
          </div>
        </div>

        {/* Textos de bienvenida */}
        <div className="px-8 mt-6">
          <h1 className="text-[28px] font-bold leading-tight text-[#2B2D42]">Bienvenido de nuevo</h1>
          <p className="text-[15px] mt-1 text-[#4A4E69]">Nos alegra verte otra vez</p>
        </div>

        {/* Formulario */}
        <div className="px-8 mt-10 space-y-5 flex-1 z-10">
          
          {/* Input Correo */}
          <div className="flex flex-col space-y-2">
            <label className="text-[13px] font-bold text-[#4A4E69] ml-1">
              Correo institucional UCV
            </label>
            <input 
              type="email" 
              defaultValue="usuario@ucv.ve"
              className="w-full h-14 border border-[#E0DCD3] rounded-2xl px-4 bg-transparent text-[#4A4E69] outline-none focus:border-[#A2D2FF] focus:ring-1 focus:ring-[#A2D2FF] transition-all"
            />
          </div>

          {/* Input Contraseña */}
          <div className="flex flex-col space-y-2">
            <label className="text-[13px] font-bold text-[#4A4E69] ml-1">
              Contraseña
            </label>
            <div className="relative">
              <input 
                type="password" 
                defaultValue="********"
                className="w-full h-14 border border-[#E0DCD3] rounded-2xl px-4 bg-transparent text-[#4A4E69] outline-none focus:border-[#A2D2FF] focus:ring-1 focus:ring-[#A2D2FF] transition-all tracking-widest"
              />
              <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4A4E69] hover:text-[#A2D2FF] transition-colors">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </button>
            </div>
          </div>

          {/* Olvidaste tu contraseña */}
          <div className="pt-1">
            <a href="#" className="text-[13px] text-[#4A4E69] hover:underline opacity-90 ml-1">
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          {/* Botones de acción */}
          <div className="pt-6 space-y-6">
            <button 
              type="button" 
              className="w-full h-14 bg-[#5A82B8] text-white rounded-[20px] font-semibold text-[16px] shadow-sm hover:bg-[#4d71a1] transition-colors"
            >
              Iniciar sesión
            </button>
            
            <div className="space-y-3">
              <p className="text-center text-[13px] text-[#4A4E69] opacity-90">
                ¿No tienes cuenta?
              </p>
              <button 
                type="button" 
                className="w-full h-14 border border-[#A2D2FF] text-[#5A82B8] bg-transparent rounded-[20px] font-semibold text-[16px] hover:bg-[#A2D2FF]/10 transition-colors"
              >
                Crear cuenta
              </button>
            </div>
          </div>
        </div>

        {/* Ondas decorativas de fondo (Fondo inferior) */}
        <div className="absolute bottom-0 w-full pointer-events-none">
          <svg viewBox="0 0 1440 200" className="w-full h-auto block" preserveAspectRatio="none">
            <path 
              fill="#CDB4DB" 
              fillOpacity="0.4" 
              d="M0,128L48,133.3C96,139,192,149,288,144C384,139,480,117,576,106.7C672,96,768,96,864,112C960,128,1056,160,1152,165.3C1248,171,1344,149,1392,138.7L1440,128L1440,200L1392,200C1344,200,1248,200,1152,200C1056,200,960,200,864,200C768,200,672,200,576,200C480,200,384,200,288,200C192,200,96,200,48,200L0,200Z"
            ></path>
            <path 
              fill="#B8C4BB" 
              fillOpacity="0.5" 
              d="M0,160L60,149.3C120,139,240,117,360,117.3C480,117,600,139,720,149.3C840,160,960,160,1080,149.3C1200,139,1320,117,1380,106.7L1440,96L1440,200L1380,200C1320,200,1200,200,1080,200C960,200,840,200,720,200C600,200,480,200,360,200C240,200,120,200,60,200L0,200Z"
            ></path>
            <path 
              fill="#A2D2FF" 
              fillOpacity="0.3" 
              d="M0,192L80,181.3C160,171,320,149,480,144C640,139,800,149,960,149.3C1120,149,1280,139,1360,133.3L1440,128L1440,200L1360,200C1280,200,1120,200,960,200C800,200,640,200,480,200C320,200,160,200,80,200L0,200Z"
            ></path>
          </svg>
        </div>
      </div>
    </div>
  );
}