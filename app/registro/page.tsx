'use client';

import React, { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface AlumnoRegistro {
  nombre: string;
  correo: string;
  facultad: string;
  clave: string;
  confirmarClave: string;
  terminos: boolean;
}

export default function RegisterView() {
  const router = useRouter();
  
  const [formData, setFormData] = useState<AlumnoRegistro>({
    nombre: '',
    correo: '',
    facultad: '',
    clave: '',
    confirmarClave: '',
    terminos: false
  });

  useEffect(() => {
    const sesion = localStorage.getItem('sesionActiva');
    if (sesion === 'true') {
      router.push('/home.2');
    }
  }, [router]);

  const handleRegistro = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (formData.clave !== formData.confirmarClave) {
      alert('Las contraseñas no coinciden.');
      return;
    }

    if (formData.terminos === false) {
      alert('Debes aceptar los términos y condiciones.');
      return;
    }

    // Guardamos los datos en localStorage y activamos la sesión de inmediato
    localStorage.setItem('alumnoEmail', formData.correo.trim());
    localStorage.setItem('alumnoClave', formData.clave.trim());
    localStorage.setItem('alumnoNombre', formData.nombre.trim());
    localStorage.setItem('sesionActiva', 'true');
    
    // Redirigimos al usuario nuevo a la pantalla de bienvenida
    router.push('/bienvenida.2');
  };

  return (
    <div className="min-h-screen bg-[#FCFBF8] flex justify-center items-center p-4 font-sans text-[#1E293B]">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-sm border border-gray-100 p-6 relative">
        
        <button onClick={() => router.back()} className="mb-6 text-gray-800">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#1E293B] mb-1">Crea tu cuenta</h1>
          <p className="text-sm text-gray-500">Estás a un paso de tu refugio mental</p>
        </div>

        <form onSubmit={handleRegistro} className="space-y-4">
          
          <div>
            <label className="block text-sm font-semibold mb-1.5 text-[#1E293B]">Nombre completo</label>
            <input
              type="text"
              required
              placeholder="Ej: Valeria López"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-[#5B7A9A] focus:bg-white transition-all text-sm"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5 text-[#1E293B]">Correo institucional UCV</label>
            <input
              type="email"
              required
              placeholder="ejemplo@ucv.ve"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-[#5B7A9A] focus:bg-white transition-all text-sm"
              value={formData.correo}
              onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5 text-[#1E293B]">Facultad / Escuela</label>
            <div className="relative">
              <select
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-[#5B7A9A] focus:bg-white transition-all text-sm appearance-none"
                value={formData.facultad}
                onChange={(e) => setFormData({ ...formData, facultad: e.target.value })}
              >
                <option value="" disabled>Selecciona tu facultad</option>
                <option value="Agronomía">Agronomía</option>
                <option value="Arquitectura y Urbanismo">Arquitectura y Urbanismo</option>
                <option value="Ciencias">Ciencias</option>
                <option value="Ciencias Económicas y Sociales">Ciencias Económicas y Sociales (FACES)</option>
                <option value="Ciencias Jurídicas y Políticas">Ciencias Jurídicas y Políticas</option>
                <option value="Ciencias Veterinarias">Ciencias Veterinarias</option>
                <option value="Farmacia">Farmacia</option>
                <option value="Humanidades y Educación">Humanidades y Educación</option>
                <option value="Ingeniería">Ingeniería</option>
                <option value="Medicina">Medicina</option>
                <option value="Odontología">Odontología</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5 text-[#1E293B]">Contraseña</label>
            <input
              type="password"
              required
              placeholder="********"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-[#5B7A9A] focus:bg-white transition-all text-sm"
              value={formData.clave}
              onChange={(e) => setFormData({ ...formData, clave: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5 text-[#1E293B]">Confirmar contraseña</label>
            <input
              type="password"
              required
              placeholder="********"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-[#5B7A9A] focus:bg-white transition-all text-sm"
              value={formData.confirmarClave}
              onChange={(e) => setFormData({ ...formData, confirmarClave: e.target.value })}
            />
          </div>

          <div className="flex items-start gap-2 pt-2 pb-2">
            <input
              type="checkbox"
              className="mt-1 w-4 h-4 rounded border-gray-300 accent-[#5B7A9A]"
              checked={formData.terminos}
              onChange={(e) => setFormData({ ...formData, terminos: e.target.checked })}
            />
            <label className="text-xs text-gray-600 leading-relaxed">
              Acepto los términos y condiciones y la política de privacidad
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-[#5B7A9A] hover:bg-[#4A6480] text-white font-semibold py-3.5 rounded-full transition-all mt-2"
          >
            Crear cuenta
          </button>

        </form>
      </div>
    </div>
  );
}