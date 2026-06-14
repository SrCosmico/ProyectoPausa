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
        router.push('/home.2');
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
      router.push('/home.2');
    }
  };

  return (
    <div className="min-h-screen bg-[#FCFBF8] flex flex-col relative overflow-hidden font-sans text-[#1E293B]">
      
      <div className="flex-1 flex flex-col px-6 pt-8 pb-20 max-w-md w-full mx-auto relative z-10">
        
        {/* BOTÓN REGRESAR */}
        <button 
          onClick={() => router.back()} 
          className="mb-8 text-gray-800 w-fit disabled:opacity-50 active:scale-95 transition-transform"
          disabled={loading}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </button>

        {/* ENCABEZADO */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#1E293B] mb-2">Bienvenido de nuevo</h1>
            <p className="text-sm text-gray-500">Nos alegra verte otra vez</p>
          </div>
          
          <div className="relative w-12 h-12 flex-shrink-0 mt-1">
            <div className="absolute top-0 right-0 w-8 h-8 bg-[#A7C7D8] rounded-full mix-blend-multiply opacity-80"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 bg-[#C2D6BA] rounded-full mix-blend-multiply opacity-80"></div>
            <div className="absolute bottom-0 right-2 w-8 h-8 bg-[#C3B1E1] rounded-full mix-blend-multiply opacity-80"></div>
            <svg className="absolute inset-0 m-auto w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L14.8 9.2L22 12L14.8 14.8L12 22L9.2 14.8L2 12L9.2 9.2L12 2Z" />
            </svg>
          </div>
        </div>

        {/* FORMULARIO DE LOGUEO */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold mb-1.5 text-[#1E293B]">
              Correo institucional UCV
            </label>
            <input
              type="email"
              required
              disabled={loading}
              placeholder="usuario@ucv.ve"
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
            className="w-full bg-[#5B7A9A] hover:bg-[#4A6480] text-white font-semibold py-3.5 rounded-full transition-all mt-6 shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed active:scale-[0.99]"
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </form>

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
            className="w-full block text-center bg-transparent border-2 border-[#5B7A9A] text-[#5B7A9A] hover:bg-[#5B7A9A] hover:text-white font-semibold py-3.5 rounded-full transition-all cursor-pointer relative z-50 shadow-sm active:scale-[0.99]"
          >
            Crear cuenta
          </a>
        </div>

      </div>
    </div>
  );
}