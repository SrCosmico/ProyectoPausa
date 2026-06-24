"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabase';

export interface BeneficioItem {
  id: string;
  descripcion: string;
  icono?: string;
}

export const beneficiosData: BeneficioItem[] = [
  { id: "1", descripcion: "Recomendaciones personalizadas según tus necesidades." },
  { id: "2", descripcion: "Herramientas que te ayudarán en tu día a día." },
  { id: "3", descripcion: "Seguimiento de tu bienestar de forma segura." },
];

const mapeoIconosBeneficios: Record<string, string> = {
  "1": "✨",
  "2": "🧰",
  "3": "🛡️",
};

export default function ConfirmacionPage() {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);
  const handleComenzar = async () => {
    setCargando(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const email = user.email || '';

        // Leer datos guardados en localStorage durante el cuestionario
        const motivosRaw = localStorage.getItem(`motivos_${email}`);
        const preferenciasRaw = localStorage.getItem(`preferencias_apoyo_${email}`);
        const factoresRaw = localStorage.getItem(`factores_impacto_${email}`);
        const estadoInicial = localStorage.getItem('estadoActualId');
        const frecuenciaEstres = localStorage.getItem('frecuenciaEstresId');

        const motivos = motivosRaw ? JSON.parse(motivosRaw).motivos ?? [] : [];
        const preferencias = preferenciasRaw ? JSON.parse(preferenciasRaw).preferencias ?? [] : [];
        const factores = factoresRaw ? JSON.parse(factoresRaw).factores_seleccionados ?? [] : [];

        // Guardar en metadata del usuario en Supabase
        await supabase.auth.updateUser({
          data: {
            onboarding_completado: true,
            onboarding_fecha: new Date().toISOString(),
            // Datos del cuestionario (usables en home.2, monitoreo, etc.)
            motivos_principales: motivos,
            preferencias_apoyo: preferencias,
            factores_impacto: factores,
            estado_emocional_inicial: estadoInicial ?? 'regular',
            frecuencia_estres: frecuenciaEstres ?? 'varias_semana',
          },
        });
      }
    } catch (err) {
      console.error('Error guardando perfil de onboarding:', err);
      // Continuar de todas formas, no bloquear al usuario
    } finally {
      setCargando(false);
      router.push('/home.2');
    }
  };

  const items = beneficiosData.map(item => ({
    ...item,
    icono: mapeoIconosBeneficios[item.id] ?? "🔹",
  }));

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-0 sm:p-4 font-sans selection:bg-purple-100">
      <div className="w-full max-w-md min-h-screen sm:min-h-[850px] sm:max-h-[900px] bg-white shadow-2xl overflow-y-auto flex flex-col justify-between relative sm:rounded-[40px] border border-gray-100 p-6">

        <div className="pt-4 flex flex-col flex-1">
          {/* Barra de progreso completa */}
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-[#4A72A6] h-full w-full rounded-full transition-all duration-500 animate-pulse" />
          </div>
          <div className="flex justify-between items-center mt-2">
            <p className="text-[11px] font-bold text-[#4A72A6] tracking-wider uppercase">
              ¡Cuestionario Completado!
            </p>
            <p className="text-[11px] font-bold text-[#8C9BAE] tracking-wider">
              Paso 6 de 6
            </p>
          </div>

          {/* Encabezado */}
          <div className="text-center mt-8 px-2">
            <h2 className="text-3xl font-extrabold text-[#2A3B50] tracking-tight">
              ¡Gracias! 💜
            </h2>
            <p className="text-sm text-[#64748B] mt-3 leading-relaxed max-w-xs mx-auto">
              Con tus respuestas podemos personalizar tu experiencia.
            </p>
          </div>

          {/* Ícono de éxito */}
          <div className="my-8 flex justify-center relative">
            <div className="absolute inset-0 bg-purple-100 rounded-full blur-3xl opacity-40 w-32 h-32 mx-auto" />
            <div className="w-24 h-24 bg-purple-50 rounded-full flex items-center justify-center border border-purple-100 shadow-sm relative z-10">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10 text-purple-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
              </svg>
            </div>
          </div>

          {/* Beneficios */}
          <div className="bg-slate-50/80 border border-slate-100 rounded-3xl p-5 mt-auto shadow-inner">
            <h4 className="text-xs font-bold text-[#8C9BAE] tracking-widest uppercase mb-4 text-center sm:text-left">
              Esto encontrarás en Pausa
            </h4>
            <div className="space-y-4">
              {items.map((beneficio) => (
                <div key={beneficio.id} className="flex items-start gap-3">
                  <div className="text-lg select-none p-1.5 bg-white rounded-xl shadow-sm border border-slate-100 flex-shrink-0">
                    {beneficio.icono}
                  </div>
                  <p className="text-xs font-medium text-slate-600 leading-relaxed pt-1">
                    {beneficio.descripcion}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Botón final → guarda y va al home */}
        <div className="mt-8 pb-4 w-full">
          <button
            onClick={handleComenzar}
            disabled={cargando}
            className="w-full bg-[#4A72A6] hover:bg-[#3B5E8C] text-white font-semibold py-4 px-6 rounded-2xl shadow-xl shadow-blue-900/10 transition-all active:scale-[0.99] text-base text-center flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {cargando ? (
              <>
                <svg className="animate-spin w-4 h-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Guardando tu perfil...
              </>
            ) : (
              "Comenzar mi refugio +"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}