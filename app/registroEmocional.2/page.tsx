"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabase';
import { insertarRegistros } from '@/app/services/emocionesService';
import { ESTADO_A_NIVEL, obtenerFechaLocalHoy } from '@/models/monitoreo';
import { obtenerTituloRegistro } from '@/lib/supabase/registroemocional';
import { obtenerEmocionTemporal, limpiarEmocionTemporal } from '@/lib/supabase/quizState';
import { obtenerUsuarioIdLocal } from '@/lib/supabase/home';
import { emojiEstadosData } from '@/models/home';

export default function RegistroEmocionalPage() {
  const router = useRouter();
  const [emocionSeleccionada, setEmocionSeleccionada] = useState<string | null>(null);
  const [notaOpcional, setNotaOpcional] = useState<string>("");
  const [tituloCabecera, setTituloCabecera] = useState<string>("¿Cómo te sientes hoy?");
  const [estaGuardando, setEstaGuardando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarEstado = async () => {
      const id = obtenerUsuarioIdLocal();

      const titulo = await obtenerTituloRegistro(id);
      setTituloCabecera(titulo);

      const { estado } = obtenerEmocionTemporal(id);
      if (estado) setEmocionSeleccionada(estado);

      limpiarEmocionTemporal(id);
    };

    cargarEstado();
  }, []);

  const manejarGuardado = async () => {
    if (!emocionSeleccionada) return;

    setEstaGuardando(true);
    setError(null);

    // 1. Verificamos que haya una sesión real de Supabase
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setError('Debes iniciar sesión para registrar tu emoción.');
      setEstaGuardando(false);
      return;
    }

    // 2. Convertimos el estado textual a nivel numérico (1-5)
    const nivel = ESTADO_A_NIVEL[emocionSeleccionada];

    // 3. Insertamos el registro real en la tabla 'historial_emociones'
    const { error: errorSupabase } = await insertarRegistros({
      user_id: user.id,
      fecha: obtenerFechaLocalHoy(),
      nivel,
      estado: emocionSeleccionada,
      nota: notaOpcional.trim() || null,
    });

    setEstaGuardando(false);

    if (errorSupabase) {
      setError('No se pudo guardar tu registro. Intenta de nuevo.');
      return;
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('fechaUltimoRegistro', new Date().toLocaleDateString());
    }

    // 4. Redirigimos directo a monitoreo para que vea su registro reflejado
    router.push('/monitoreo.2');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md h-[850px] bg-white shadow-2xl flex flex-col relative rounded-[40px] border border-gray-100 overflow-hidden">
        
        <div className="px-6 pt-10 pb-6">
          <h2 className="text-xl font-black text-slate-800">{tituloCabecera}</h2>
          <p className="text-xs text-slate-400 mt-1">Registra tu estado emocional para tu seguimiento.</p>
        </div>

        <div className="flex-1 px-6">
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-semibold rounded-xl">
              ⚠️ {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {emojiEstadosData.map((emocion) => (
              <button
                key={emocion.estado}
                onClick={() => setEmocionSeleccionada(emocion.estado)}
                disabled={estaGuardando}
                className={`p-6 rounded-3xl border-2 flex flex-col items-center gap-3 transition-all ${
                  emocionSeleccionada === emocion.estado 
                    ? "border-[#4A72A6] bg-blue-50" 
                    : "border-slate-100 bg-slate-50 hover:border-slate-200"
                } ${estaGuardando ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <span className="text-4xl">{emocion.emoji}</span>
                <span className="text-xs font-bold text-slate-700">{emocion.estado}</span>
              </button>
            ))}
          </div>

          <div className="mt-8">
            <label className="text-xs font-bold text-slate-500 mb-2 block">¿Algo más que quieras anotar?</label>
            <textarea 
              value={notaOpcional}
              onChange={(e) => setNotaOpcional(e.target.value)}
              disabled={estaGuardando}
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-medium text-slate-700 focus:outline-none focus:border-[#4A72A6] disabled:opacity-50"
              rows={3}
              placeholder="Hoy me siento..."
            />
          </div>
        </div>

        <div className="p-6 border-t border-slate-100">
          <button
            onClick={manejarGuardado}
            disabled={!emocionSeleccionada || estaGuardando}
            className={`w-full py-4 rounded-2xl text-xs font-bold text-white transition-all flex justify-center items-center ${
              emocionSeleccionada && !estaGuardando
                ? "bg-[#4A72A6] hover:bg-[#3b5e8c]" 
                : "bg-slate-300 cursor-not-allowed"
            }`}
          >
            {estaGuardando ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              "Guardar y ver monitoreo"
            )}
          </button>
        </div>

      </div>
    </div>
  );
}