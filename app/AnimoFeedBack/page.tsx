"use client";

import { useEffect, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AnimoFeedbackProps {
  /** Promedio de ánimo de los últimos 7 días (escala 1–5) */
  promedioAnimo: number;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const MENSAJES_MOTIVACIONALES: string[] = [
  "¡Vas muy bien! Cada día es una nueva oportunidad para crecer. 🌱",
  "Tu bienestar importa. Recuerda tomarte un descanso hoy. ☀️",
  "¡Sigue adelante! El esfuerzo que pones hoy construye tu mañana. 💪",
  "Eres más fuerte de lo que crees. La UCV está contigo. 🎓",
  "¡Buen ánimo! Los pequeños avances también son victorias. ⭐",
  "Recuerda: pedir ayuda es una señal de fortaleza, no de debilidad. 🤝",
  "Estás haciendo lo mejor que puedes. ¡Eso es suficiente! 🌟",
];

// ─── Tarjeta motivacional (promedio >= 3.5) ───────────────────────────────────

function TarjetaMotivacional({ promedio }: { promedio: number }) {
  const [mensaje, setMensaje] = useState<string>("");

  useEffect(() => {
    const idx = Math.floor(Math.random() * MENSAJES_MOTIVACIONALES.length);
    setMensaje(MENSAJES_MOTIVACIONALES[idx]);
  }, []);

  const nivelLabel =
    promedio >= 4.5
      ? "¡Excelente estado de ánimo!"
      : promedio >= 4
      ? "Buen estado de ánimo"
      : "Estado de ánimo estable";

  const gradiente =
    promedio >= 4.5
      ? "from-emerald-400 to-teal-500"
      : promedio >= 4
      ? "from-blue-400 to-indigo-500"
      : "from-violet-400 to-purple-500";

  return (
    <div className="rounded-3xl overflow-hidden shadow-sm border border-slate-100">
      {/* Encabezado con gradiente */}
      <div className={`bg-gradient-to-r ${gradiente} px-5 py-4`}>
        <div className="flex items-center gap-3">
          <div className="text-3xl">
            {promedio >= 4.5 ? "🌟" : promedio >= 4 ? "😊" : "🙂"}
          </div>
          <div>
            <p className="text-white font-semibold text-[11px] uppercase tracking-wide opacity-80">
              Tu promedio semanal
            </p>
            <p className="text-white font-bold text-base">{nivelLabel}</p>
          </div>
        </div>
        {/* Barra de progreso */}
        <div className="mt-3 bg-white/30 rounded-full h-1.5">
          <div
            className="bg-white rounded-full h-1.5 transition-all duration-700"
            style={{ width: `${(promedio / 5) * 100}%` }}
          />
        </div>
        <p className="text-white/70 text-[10px] mt-1 text-right font-medium">
          {promedio.toFixed(1)} / 5.0
        </p>
      </div>

      {/* Cuerpo del mensaje */}
      <div className="bg-white px-5 py-4">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
          Mensaje del día
        </p>
        <p className="text-xs text-slate-600 font-medium leading-relaxed">
          {mensaje}
        </p>
        <button
          onClick={() => {
            const idx = Math.floor(Math.random() * MENSAJES_MOTIVACIONALES.length);
            setMensaje(MENSAJES_MOTIVACIONALES[idx]);
          }}
          className="mt-3 text-[10px] text-indigo-600 font-bold border border-indigo-100 bg-indigo-50 rounded-full px-3 py-1 hover:bg-indigo-100 transition-colors"
        >
          Otro mensaje ✨
        </button>
      </div>
    </div>
  );
}

// ─── Tarjeta estado intermedio (2.5 – 3.4) ───────────────────────────────────

function TarjetaEstadoIntermedio({ promedio }: { promedio: number }) {
  return (
    <div className="rounded-3xl overflow-hidden shadow-sm border border-amber-100">
      <div className="bg-gradient-to-r from-amber-400 to-orange-400 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="text-3xl">😐</div>
          <div>
            <p className="text-white font-semibold text-[11px] uppercase tracking-wide opacity-80">
              Tu promedio semanal
            </p>
            <p className="text-white font-bold text-base">Estado regular</p>
          </div>
        </div>
        <div className="mt-3 bg-white/30 rounded-full h-1.5">
          <div
            className="bg-white rounded-full h-1.5 transition-all duration-700"
            style={{ width: `${(promedio / 5) * 100}%` }}
          />
        </div>
        <p className="text-white/70 text-[10px] mt-1 text-right font-medium">
          {promedio.toFixed(1)} / 5.0
        </p>
      </div>
      <div className="bg-white px-5 py-4">
        <p className="text-xs text-slate-600 font-medium leading-relaxed">
          Parece que has tenido días difíciles. Está bien no estar bien todo el
          tiempo. Si necesitas apoyo, el servicio de{" "}
          <strong className="text-[#4A72A6]">Apoyo Psicológico UCV</strong> está
          disponible para ti.
        </p>
        <a
          href="tel:02126054111"
          className="mt-3 inline-flex items-center gap-1.5 text-[10px] bg-amber-100 text-amber-800 border border-amber-200 rounded-full px-3 py-1 font-bold hover:bg-amber-200 transition-colors"
        >
          📞 Llamar a Apoyo UCV
        </a>
      </div>
    </div>
  );
}

// ─── Componente principal exportado ──────────────────────────────────────────
// NOTA: Este componente solo maneja promedio >= 2.5
// Para promedio < 2.5, monitoreo redirige directamente a /modoCrisis.2

export default function AnimoFeedback({ promedioAnimo }: AnimoFeedbackProps) {
  const promedio = Math.min(5, Math.max(1, promedioAnimo));

  if (promedio >= 3.5) {
    return <TarjetaMotivacional promedio={promedio} />;
  }

  return <TarjetaEstadoIntermedio promedio={promedio} />;
}
