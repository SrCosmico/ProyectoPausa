"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { guardarOnboardingEnSupabase } from '@/lib/supabase/onboarding';

export interface BeneficioItem {
  id: string;
  descripcion: string;
  icono?: string;
}

export interface PantallaConfirmacion {
  paso: number;
  totalPasos: number;
  titulo: string;
  subtitulo: string;
  seccionBeneficios: {
    titulo: string;
    items: BeneficioItem[];
  };
  ilustracionUrl?: string;
  botonComenzar: string;
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
  const [guardando, setGuardando]       = useState(true);
  const [errorGuardado, setErrorGuardado] = useState<string | null>(null);

  useEffect(() => {
    const persistirOnboarding = async () => {
      const { error } = await guardarOnboardingEnSupabase();
      if (error) setErrorGuardado(error);
      setGuardando(false);
    };
    persistirOnboarding();
  }, []);

  const datosConfirmacion: PantallaConfirmacion = {
    paso: 6,
    totalPasos: 6,
    titulo: "¡Gracias! 💜",
    subtitulo: "Con tus respuestas podemos personalizar tu experiencia.",
    seccionBeneficios: {
      titulo: "Esto encontrarás en Pausa",
      items: beneficiosData.map(item => ({
        ...item,
        icono: mapeoIconosBeneficios[item.id] || "🔹",
      })),
    },
    botonComenzar: "Comenzar mi refugio +",
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-0 sm:p-4 font-sans selection:bg-purple-100">

      {/* ── Contenedor principal ─────────────────────────────────────────────
          overflow:hidden para que las imágenes decorativas queden recortadas
          en las esquinas redondeadas. El scroll lo maneja el div interior.
      ──────────────────────────────────────────────────────────────────── */}
      <div className="w-full max-w-md min-h-screen sm:min-h-[850px] sm:max-h-[900px] bg-white shadow-2xl flex flex-col relative sm:rounded-[40px] border border-gray-100"
        style={{ overflow: 'hidden' }}
      >

        {/* ── DECORACIÓN DE FONDO (z-0, detrás de todo) ───────────────────
            Composición:
            • forma_morada  → blob lavanda, esquina superior izquierda
            • ramita_derecha → ramita, esquina superior derecha (espejada)
            • forma_verde   → blob salvia, esquina inferior derecha
            • ramita_izquierda → ramita, esquina inferior izquierda
            • onda_del_medio → franja central muy sutil
        ──────────────────────────────────────────────────────────────── */}

        {/* Blob lavanda — arriba a la izquierda */}
        <img
          src="/images/forma_morada.png"
          alt="" aria-hidden="true"
          style={{ opacity: 0.38 }}
          className="absolute top-0 left-0 w-[52%] pointer-events-none select-none z-0"
        />

        {/* Ramita derecha — arriba a la derecha */}
        <img
          src="/images/ramita_derecha.png"
          alt="" aria-hidden="true"
          style={{ opacity: 0.55 }}
          className="absolute top-0 right-0 w-[38%] pointer-events-none select-none z-0"
        />

        {/* Onda del medio — zona central, muy tenue */}
        <img
          src="/images/onda_del_medio.png"
          alt="" aria-hidden="true"
          style={{ opacity: 0.18 }}
          className="absolute top-[40%] left-0 w-full pointer-events-none select-none z-0"
        />

        {/* Blob verde salvia — abajo a la derecha */}
        <img
          src="/images/forma_verde.png"
          alt="" aria-hidden="true"
          style={{ opacity: 0.40 }}
          className="absolute bottom-0 right-0 w-[55%] pointer-events-none select-none z-0"
        />

        {/* Ramita izquierda — abajo a la izquierda */}
        <img
          src="/images/ramita_izquierda.png"
          alt="" aria-hidden="true"
          style={{ opacity: 0.50 }}
          className="absolute bottom-0 left-0 w-[36%] pointer-events-none select-none z-0"
        />

        {/* ── CONTENIDO (z-10, siempre encima de la decoración) ─────────── */}
        <div className="flex-1 overflow-y-auto flex flex-col relative z-10 p-6">

          <div className="pt-4 flex flex-col flex-1">

            {/* Barra de progreso */}
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-[#4A72A6] h-full w-full rounded-full transition-all duration-500 animate-pulse" />
            </div>
            <div className="flex justify-between items-center mt-2">
              <p className="text-[11px] font-bold text-[#4A72A6] tracking-wider uppercase">
                ¡Cuestionario Completado!
              </p>
              <p className="text-[11px] font-bold text-[#8C9BAE] tracking-wider">
                Paso {datosConfirmacion.paso} de {datosConfirmacion.totalPasos}
              </p>
            </div>

            {/* Título */}
            <div className="text-center mt-8 px-2">
              <h2 className="text-3xl font-extrabold text-[#2A3B50] tracking-tight">
                {datosConfirmacion.titulo}
              </h2>
              <p className="text-sm text-[#64748B] mt-3 leading-relaxed max-w-xs mx-auto">
                {datosConfirmacion.subtitulo}
              </p>
              {errorGuardado && (
                <p className="text-[11px] text-rose-500 font-semibold mt-3">
                  No pudimos guardar todas tus respuestas, pero puedes seguir usando Pausa.
                </p>
              )}
            </div>

            {/* Ícono central */}
            <div className="my-8 flex justify-center relative">
              <div className="absolute inset-0 bg-purple-100 rounded-full blur-3xl opacity-40 w-32 h-32 mx-auto" />
              <div className="w-24 h-24 bg-purple-50 rounded-full flex items-center justify-center border border-purple-100 shadow-sm relative z-10 animate-bounce-slow">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10 text-purple-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
                </svg>
              </div>
            </div>

            {/* Tarjeta de beneficios */}
            <div className="bg-white/70 backdrop-blur-sm border border-slate-100 rounded-3xl p-5 mt-auto shadow-sm">
              <h4 className="text-xs font-bold text-[#8C9BAE] tracking-widest uppercase mb-4 text-center sm:text-left">
                {datosConfirmacion.seccionBeneficios.titulo}
              </h4>
              <div className="space-y-4">
                {datosConfirmacion.seccionBeneficios.items.map((beneficio) => (
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

          {/* Botón */}
          <div className="mt-8 pb-4 w-full">
            <button
              onClick={() => router.push('/home')}
              disabled={guardando}
              className="w-full bg-[#4A72A6] hover:bg-[#3B5E8C] text-white font-semibold py-4 px-6 rounded-2xl shadow-xl shadow-blue-900/10 transition-all active:scale-[0.99] text-base text-center tracking-wide flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {guardando ? "Guardando tus respuestas..." : datosConfirmacion.botonComenzar}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}