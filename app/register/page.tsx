'use client';

import React, { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface AlumnoData {
  correo: string;
  clave: string;
}

export default function RegisterView() {
  const [formData, setFormData] = useState<AlumnoData>({ correo: '', clave: '' });
  const router = useRouter();

  const handleRegistro = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.correo || !formData.clave) {
      alert('Por favor, completa todos los campos.');
      return;
    }
    // Guardamos la sesión (simulación local)
    localStorage.setItem('alumnoEmail', formData.correo);
    router.push('/homepage');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center p-4">
      <div className="w-full max-w-md bg-[#F9F7F2] rounded-3xl shadow-xl p-8 relative overflow-hidden">
        {/* Decoración de fondo */}
        <div className="absolute top-[-50px] right-[-50px] w-32 h-32 bg-[#4A4E69] opacity-10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-[-50px] left-[-50px] w-40 h-40 bg-sage-500 opacity-10 rounded-full blur-2xl"></div>

        <div className="text-center mb-8 relative z-10">
          <h1 className="text-4xl font-extrabold text-[#4A4E69] mb-2 tracking-tight">Pausa.</h1>
          <p className="text-sm text-[#4A4E69]/70 font-medium">Tu espacio de autogestión emocional</p>
        </div>

        <form onSubmit={handleRegistro} className="space-y-5 relative z-10">
          <div>
            <label className="block text-sm font-semibold text-[#4A4E69] mb-1.5">
              Correo institucional
            </label>
            <input
              type="email"
              required
              placeholder="alumno@ucv.ve"
              className="w-full px-4 py-3 rounded-xl border border-[#4A4E69]/20 bg-white focus:outline-none focus:ring-2 focus:ring-[#4A4E69]/50 focus:border-transparent transition-all placeholder:text-gray-400 text-[#4A4E69]"
              value={formData.correo}
              onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#4A4E69] mb-1.5">
              Contraseña
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-[#4A4E69]/20 bg-white focus:outline-none focus:ring-2 focus:ring-[#4A4E69]/50 focus:border-transparent transition-all placeholder:text-gray-400 text-[#4A4E69]"
              value={formData.clave}
              onChange={(e) => setFormData({ ...formData, clave: e.target.value })}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#4A4E69] hover:bg-[#3A3D53] text-white font-bold py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.98] mt-4"
          >
            Ingresar
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-[#4A4E69]/60">
          Al registrarte aceptas que esta herramienta no sustituye la consulta profesional.
        </p>
      </div>
    </div>
  );
}