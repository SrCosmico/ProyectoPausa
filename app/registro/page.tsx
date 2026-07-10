'use client';

import React, { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabase';
import { registrarUsuario } from '@/app/services/authService';

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<AlumnoRegistro>({
    nombre: '',
    correo: '',
    facultad: '',
    clave: '',
    confirmarClave: '',
    terminos: false,
  });

  // Redirigir si ya hay sesión activa
  useEffect(() => {
    const verificarSesion = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) router.push('/home');
    };
    verificarSesion();
  }, [router]);

  const handleRegistro = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (formData.clave !== formData.confirmarClave) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (formData.clave.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (!formData.terminos) {
      setError('Debes aceptar los términos y condiciones.');
      return;
    }

    setLoading(true);

    const { data, error: registroError } = await registrarUsuario(
      formData.correo.trim(),
      formData.clave,
      formData.nombre.trim(),
      formData.facultad
    );

    setLoading(false);

    if (registroError) {
      const msg = registroError.message ?? '';
      if (msg.includes('already registered') || msg.includes('User already registered')) {
        setError('Este correo ya tiene una cuenta registrada. Inicia sesión.');
      } else if (msg.includes('invalid email')) {
        setError('El correo ingresado no es válido.');
      } else if (msg.includes('Password should be')) {
        setError('La contraseña debe tener al menos 6 caracteres.');
      } else {
        setError(`Error al registrarse: ${msg}`);
      }
      return;
    }

    if (data?.user) {
      router.push('/bienvenida');
    }
  };

  return (
    <div className="min-h-screen bg-[#FCFBF8] flex justify-center items-center p-4 font-sans text-[#1E293B]">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-sm border border-gray-100 p-6 relative">

        <button
          onClick={() => router.back()}
          className="mb-6 text-gray-800"
          disabled={loading}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#1E293B] mb-1">Crea tu cuenta</h1>
          <p className="text-sm text-gray-500">Estás a un paso de tu refugio mental</p>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2">
            <span className="text-rose-500 text-sm flex-shrink-0 mt-0.5">⚠️</span>
            <p className="text-xs font-semibold text-rose-700 leading-relaxed">{error}</p>
          </div>
        )}

        <form onSubmit={handleRegistro} className="space-y-4">

          <div>
            <label className="block text-sm font-semibold mb-1.5 text-[#1E293B]">Nombre completo</label>
            <input
              type="text"
              required
              disabled={loading}
              placeholder="Ej: Valeria López"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-[#5B7A9A] focus:bg-white transition-all text-sm disabled:opacity-50"
              value={formData.nombre}
              onChange={(e) => { setError(null); setFormData({ ...formData, nombre: e.target.value }); }}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5 text-[#1E293B]">Correo institucional UCV</label>
            <input
              type="email"
              required
              disabled={loading}
              placeholder="ejemplo@ucv.ve"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-[#5B7A9A] focus:bg-white transition-all text-sm disabled:opacity-50"
              value={formData.correo}
              onChange={(e) => { setError(null); setFormData({ ...formData, correo: e.target.value }); }}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5 text-[#1E293B]">Facultad / Escuela</label>
            <div className="relative">
              <select
                required
                disabled={loading}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-[#5B7A9A] focus:bg-white transition-all text-sm appearance-none disabled:opacity-50"
                value={formData.facultad}
                onChange={(e) => { setError(null); setFormData({ ...formData, facultad: e.target.value }); }}
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
              disabled={loading}
              placeholder="Mínimo 6 caracteres"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-[#5B7A9A] focus:bg-white transition-all text-sm disabled:opacity-50"
              value={formData.clave}
              onChange={(e) => { setError(null); setFormData({ ...formData, clave: e.target.value }); }}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5 text-[#1E293B]">Confirmar contraseña</label>
            <input
              type="password"
              required
              disabled={loading}
              placeholder="********"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-[#5B7A9A] focus:bg-white transition-all text-sm disabled:opacity-50"
              value={formData.confirmarClave}
              onChange={(e) => { setError(null); setFormData({ ...formData, confirmarClave: e.target.value }); }}
            />
          </div>

          <div className="flex items-start gap-2 pt-2 pb-2">
            <input
              type="checkbox"
              disabled={loading}
              className="mt-1 w-4 h-4 rounded border-gray-300 accent-[#5B7A9A] disabled:opacity-50"
              checked={formData.terminos}
              onChange={(e) => { setError(null); setFormData({ ...formData, terminos: e.target.checked }); }}
            />
            <label className="text-xs text-gray-600 leading-relaxed">
              Acepto los términos y condiciones y la política de privacidad
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#5B7A9A] hover:bg-[#4A6480] text-white font-semibold py-3.5 rounded-full transition-all mt-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creando cuenta...
              </span>
            ) : 'Crear cuenta'}
          </button>

        </form>
      </div>
    </div>
  );
}