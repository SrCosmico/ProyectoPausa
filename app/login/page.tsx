'use client';

import React, { FormEvent, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabase'; 
import { iniciarSesion } from '@/app/services/authService';

export default function LoginView() {
  const router = useRouter();
  
  const [correo, setCorreo] = useState('');
  const [clave, setClave] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirige al usuario si ya cuenta con una sesión activa en Supabase
  useEffect(() => {
    const verificarSesion = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/home');
      }
    };
    verificarSesion();
  }, [router]);

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    // Ejecuta la autenticación real en Supabase
    const { data, error } = await iniciarSesion(correo.trim(), clave.trim());

    setLoading(false);

    if (error) {
      alert(`Error al iniciar sesión: ${error.message}`);
      return;
    }

    // Si el usuario es válido, se le redirige al Home
    if (data?.user) {
      router.push('/home');
    }
  };

  return (
    <div className="min-h-screen bg-[#FCFBF8] flex items-center justify-center p-0 sm:p-4 font-sans text-[#1E293B]">

      <div className="relative w-full max-w-md min-h-screen sm:min-h-[780px] bg-[#FCFBF8] shadow-2xl sm:rounded-[40px] border border-slate-100 overflow-hidden flex flex-col">

        {/* FONDO DECORATIVO */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <img
            src="/images/onda_del_medio.png"
            alt=""
            aria-hidden="true"
            className="absolute top-[8%] left-1/2 -translate-x-1/2 w-[130%] max-w-none h-auto opacity-40 select-none"
          />
          <img
            src="/images/ramita_izquierda.png"
            alt=""
            aria-hidden="true"
            className="absolute top-[2%] -left-10 w-32 sm:w-36 h-auto opacity-50 select-none -rotate-12"
          />
          <img
            src="/images/ramita_derecha.png"
            alt=""
            aria-hidden="true"
            className="absolute top-[48%] -right-10 w-32 sm:w-36 h-auto opacity-45 select-none rotate-6"
          />
          <img
            src="/images/forma_grande.png"
            alt=""
            aria-hidden="true"
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[120%] max-w-none h-auto opacity-70 select-none"
          />
        </div>

        {/* CONTENIDO */}
        <div className="relative z-10 flex-1 flex flex-col px-6 pt-8 pb-10 w-full">

          {/* BOTÓN REGRESAR */}
          <button 
            onClick={() => router.back()} 
            className="mb-6 p-2.5 -ml-2 w-fit rounded-full bg-white/80 backdrop-blur-sm shadow-sm text-slate-700 disabled:opacity-50 active:scale-95 transition-all"
            disabled={loading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>

          {/* LOGO */}
          <div className="flex justify-center mb-6">
            <div className="w-60 h-60 rounded-[32px] bg-white shadow-md border border-slate-100 flex items-center justify-center p-2">
              <img
                src="/images/logo.png"
                alt="Pausa"
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* ENCABEZADO */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#1E293B] mb-2">Bienvenido de nuevo</h1>
            <p className="text-sm text-gray-500">Nos alegra verte otra vez</p>
          </div>

          {/* TARJETA DEL FORMULARIO */}
          <div className="bg-white/90 backdrop-blur-sm border border-slate-100 rounded-[32px] shadow-sm p-6">
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-[#1E293B]">
                  Correo institucional UCV
                </label>
                <input
                  type="email"
                  required
                  disabled={loading}
                  placeholder="usuario@gmail.com"
                  className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-[#5B7A9A] focus:bg-white transition-all text-sm disabled:opacity-50"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1.5 text-[#1E293B]">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    disabled={loading}
                    placeholder="********"
                    className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-[#5B7A9A] focus:bg-white transition-all text-sm disabled:opacity-50"
                    value={clave}
                    onChange={(e) => setClave(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#5B7A9A] hover:bg-[#4A6480] text-white font-semibold py-3.5 rounded-full transition-all mt-2 shadow-md shadow-slate-200 disabled:bg-gray-400 disabled:cursor-not-allowed active:scale-[0.99]"
              >
                {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
              </button>
            </form>
          </div>

          {/* SECCIÓN DE REGISTRO (CON SOLUCIÓN DE BLOQUEO) */}
          <div className="mt-8 text-center space-y-4">
            <p className="text-sm text-gray-500">¿No tienes cuenta?</p>
            
            <a
              href="/registro"
              onClick={(e) => {
                // Rompe cualquier congelamiento de Next.js forzando recarga nativa en el navegador
                e.preventDefault();
                window.location.href = '/registro'; 
              }}
              className="w-full block text-center bg-white/90 backdrop-blur-sm border-2 border-[#5B7A9A] text-[#5B7A9A] hover:bg-[#5B7A9A] hover:text-white font-semibold py-3.5 rounded-full transition-all cursor-pointer relative z-50 shadow-sm active:scale-[0.99]"
            >
              Crear cuenta
            </a>
          </div>

        </div>
      </div>
    </div>
  );
}