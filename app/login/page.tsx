'use client';

import React, { FormEvent, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginView() {
  const router = useRouter();
  
  const [correo, setCorreo] = useState('');
  const [clave, setClave] = useState('');

  // Redirige al usuario logueado directamente al home real de la app
  useEffect(() => {
    const sesion = localStorage.getItem('sesionActiva');
    if (sesion === 'true') {
      router.push('/home.2');
    }
  }, [router]);

  const handleLogin = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 3. Usamos .trim() para evitar errores por espacios invisibles al escribir
    const correoRegistrado = localStorage.getItem('alumnoEmail')?.trim();
    const claveRegistrada = localStorage.getItem('alumnoClave')?.trim();

    if (correo.trim() !== correoRegistrado) {
      alert('El correo no está registrado o es incorrecto.');
      return;
    }

    if (clave.trim() !== claveRegistrada) {
      alert('La contraseña es incorrecta.');
      return;
    }

    localStorage.setItem('sesionActiva', 'true');
    router.push('/home.2');
  };

  return (
    <div className="min-h-screen bg-[#FCFBF8] flex flex-col relative overflow-hidden font-sans text-[#1E293B]">
      
      <div className="flex-1 flex flex-col px-6 pt-8 pb-20 max-w-md w-full mx-auto relative z-10">
        
        <button onClick={() => router.back()} className="mb-8 text-gray-800 w-fit">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </button>

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

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold mb-1.5 text-[#1E293B]">
              Correo institucional UCV
            </label>
            <input
              type="email"
              required
              placeholder="usuario@ucv.ve"
              className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-[#5B7A9A] focus:bg-white transition-all text-sm"
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
                placeholder="********"
                className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-[#5B7A9A] focus:bg-white transition-all text-sm"
                value={clave}
                onChange={(e) => setClave(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#5B7A9A] hover:bg-[#4A6480] text-white font-semibold py-3.5 rounded-full transition-all mt-6 shadow-sm"
          >
            Iniciar sesión
          </button>
        </form>

        <div className="mt-8 text-center space-y-4">
          <p className="text-sm text-gray-500">¿No tienes cuenta?</p>
          <button
            onClick={() => router.push('/register')}
            type="button"
            className="w-full bg-transparent border-2 border-[#5B7A9A] text-[#5B7A9A] hover:bg-gray-50 font-semibold py-3.5 rounded-full transition-all"
          >
            Crear cuenta
          </button>
        </div>
      </div>
    </div>
  );
}