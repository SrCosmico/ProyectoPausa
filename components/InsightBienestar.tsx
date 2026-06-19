"use client";

import React from "react";
import { useRouter } from "next/navigation";
import type { UsePromedioBienestarResultado } from "@/hooks/usePromedioBienestar";

interface InsightBienestarProps {
  resultado: UsePromedioBienestarResultado;
}

/**
 * Card de insight contextual según el promedio de bienestar de 7 días:
 * - "crisis"   -> banner de alerta + tip + botón para ir a Modo Crisis
 * - "bajo"     -> tip anti-estrés
 * - "moderado" -> mensaje neutro de mantenimiento
 * - "alto"     -> frase motivadora
 * - "sin_datos"-> invitación a registrar el primer check-in
 */
export default function InsightBienestar({ resultado }: InsightBienestarProps) {
  const router = useRouter();
  const { clasificacion, promedioRedondeado, frase, tip, cantidadRegistros } = resultado;

  const irAModoCrisis = () => {
    if (typeof window !== "undefined") {
      // Pasamos el contexto a la pantalla de Modo Crisis vía localStorage,
      // ya que router.push no permite pasar props directamente a una página.
      localStorage.setItem("crisis_auto", "true");
      localStorage.setItem("crisis_promedio", String(promedioRedondeado ?? ""));
    }
    router.push("/modoCrisis.2");
  };

  if (clasificacion === "sin_datos") {
    return (
      <div className="bg-white border border-slate-100 rounded-3xl p-5 text-center">
        <p className="text-xs font-medium text-slate-400">
          Registra tu estado de ánimo para ver tu balance de los últimos 7 días.
        </p>
      </div>
    );
  }

  if (clasificacion === "crisis") {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-3xl p-5 space-y-3 animate-fadeIn">
        <div className="flex items-center gap-2">
          <span className="text-xl">💙</span>
          <h4 className="text-sm font-bold text-rose-800">
            Hemos notado que tu bienestar ha sido bajo
          </h4>
        </div>
        <p className="text-xs text-rose-700 font-medium leading-relaxed">
          Tu promedio de los últimos 7 días es{" "}
          <strong>{promedioRedondeado}/5.0</strong> ({cantidadRegistros} registro
          {cantidadRegistros !== 1 ? "s" : ""}). No estás solo/a, tenemos ayuda
          inmediata para ti.
        </p>
        {tip && (
          <div className="bg-white/80 rounded-2xl p-3 flex items-start gap-3">
            <span className="text-lg">{tip.icono}</span>
            <p className="text-[11px] font-semibold text-rose-900">{tip.texto}</p>
          </div>
        )}
        <button
          onClick={irAModoCrisis}
          className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-2xl transition-all active:scale-[0.99]"
        >
          🚨 Ir a Modo Crisis
        </button>
      </div>
    );
  }

  if (clasificacion === "bajo") {
    return (
      <div className="bg-amber-50 border border-amber-100 rounded-3xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-amber-800">Tip anti-estrés para ti</h4>
          <span className="text-[10px] font-bold text-amber-600 bg-amber-100 px-2 py-1 rounded-full">
            Promedio: {promedioRedondeado}/5.0
          </span>
        </div>
        {tip && (
          <div className="bg-white rounded-2xl p-3.5 flex items-start gap-3 shadow-sm">
            <span className="text-xl">{tip.icono}</span>
            <p className="text-xs font-medium text-slate-700 leading-relaxed">{tip.texto}</p>
          </div>
        )}
        <p className="text-[11px] text-amber-700 font-medium">
          Si sientes que necesitas más apoyo, no dudes en buscar ayuda profesional.
        </p>
      </div>
    );
  }

  if (clasificacion === "alto") {
    return (
      <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-emerald-800">¡Sigue así! 🎉</h4>
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">
            Promedio: {promedioRedondeado}/5.0
          </span>
        </div>
        {frase && (
          <div className="bg-white rounded-2xl p-3.5 flex items-start gap-3 shadow-sm">
            <span className="text-xl">{frase.icono}</span>
            <p className="text-xs font-semibold text-slate-700 leading-relaxed">{frase.texto}</p>
          </div>
        )}
      </div>
    );
  }

  // clasificacion === "moderado"
  return (
    <div className="bg-slate-50 border border-slate-100 rounded-3xl p-5 space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-slate-700">Tu balance semanal</h4>
        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
          Promedio: {promedioRedondeado}/5.0
        </span>
      </div>
      <p className="text-xs text-slate-500 font-medium">
        Tu bienestar se mantiene estable. Sigue cuidando tus hábitos diarios.
      </p>
    </div>
  );
}