"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

// ==========================================
// INTERFACES Y DATOS DE RECURSOS DE APOYO
// ==========================================

interface PuntoApoyo {
  id: string;
  nombre: string;
  descripcion: string;
  ubicacion: string;
  horario: string;
  telefono?: string;
  email?: string;
  esEmergencia?: boolean;
}

interface SeccionAcordeon {
  id: string;
  titulo: string;
  icono: string;
  color: string;
  colorBg: string;
  puntos: PuntoApoyo[];
}

const SECCIONES_APOYO: SeccionAcordeon[] = [
  {
    id: "ucv",
    titulo: "Apoyo psicológico UCV",
    icono: "🏛️",
    color: "text-[#4A72A6]",
    colorBg: "bg-blue-50 border-blue-100",
    puntos: [
      {
        id: "dbe",
        nombre: "División de Bienestar Estudiantil (DBE)",
        descripcion: "Servicio de orientación y acompañamiento psicológico gratuito para estudiantes de pregrado.",
        ubicacion: "Ciudad Universitaria, Edificio de Rectorado, Piso 1",
        horario: "Lun–Vie, 8:00 a.m. – 12:00 p.m. y 1:00 p.m. – 5:00 p.m.",
        telefono: "(0212) 605-4111",
        email: "bienestar@ucv.edu.ve",
      },
      {
        id: "esc_psico",
        nombre: "Clínica Psicológica — Escuela de Psicología",
        descripcion: "Atención clínica supervisada por profesionales. Solicita cita con antelación.",
        ubicacion: "Facultad de Humanidades y Educación, Escuela de Psicología",
        horario: "Lun–Vie, 8:00 a.m. – 12:00 p.m.",
        telefono: "(0212) 605-2711",
      },
      {
        id: "esc_medicina",
        nombre: "Departamento de Psiquiatría — Facultad de Medicina",
        descripcion: "Consulta médica especializada para situaciones de salud mental que requieran evaluación clínica.",
        ubicacion: "Ciudad Universitaria, Facultad de Medicina, Piso 3",
        horario: "Lun–Vie, 9:00 a.m. – 1:00 p.m.",
        telefono: "(0212) 605-3822",
      },
    ],
  },
  {
    id: "emergencia",
    titulo: "Líneas de crisis (24/7)",
    icono: "🚨",
    color: "text-rose-700",
    colorBg: "bg-rose-50 border-rose-100",
    puntos: [
      {
        id: "inpsasel",
        nombre: "INPSASEL — Línea de Salud Mental",
        descripcion: "Atención psicológica de emergencia disponible las 24 horas del día.",
        ubicacion: "Nacional (Venezuela)",
        horario: "24 horas, 7 días a la semana",
        telefono: "0800-SALUD-00 (0800-72583-00)",
        esEmergencia: true,
      },
      {
        id: "bomberos",
        nombre: "Cuerpo de Bomberos Universitarios UCV",
        descripcion: "Primeros auxilios y emergencias médicas dentro del campus universitario.",
        ubicacion: "Ciudad Universitaria, Portón principal",
        horario: "24 horas, 7 días a la semana",
        telefono: "(0212) 605-4444",
        esEmergencia: true,
      },
      {
        id: "emergencias",
        nombre: "Emergencias Nacionales",
        descripcion: "Número único de emergencias para situaciones de riesgo vital inmediato.",
        ubicacion: "Nacional (Venezuela)",
        horario: "24 horas, 7 días a la semana",
        telefono: "911",
        esEmergencia: true,
      },
    ],
  },
  {
    id: "autoayuda",
    titulo: "Técnicas de contención inmediata",
    icono: "🧘",
    color: "text-emerald-700",
    colorBg: "bg-emerald-50 border-emerald-100",
    puntos: [
      {
        id: "respiracion",
        nombre: "Respiración 4-7-8",
        descripcion: "Inhala contando 4 segundos, mantén 7 segundos, exhala lentamente en 8 segundos. Repite 3 veces. Activa el sistema nervioso parasimpático.",
        ubicacion: "",
        horario: "3–5 minutos",
      },
      {
        id: "grounding",
        nombre: "Técnica 5-4-3-2-1 (Grounding)",
        descripcion: "Nombra 5 cosas que puedes VER, 4 que puedes TOCAR, 3 que puedes ESCUCHAR, 2 que puedes OLER, 1 que puedes SABOREAR. Ancla tu mente al presente.",
        ubicacion: "",
        horario: "2–3 minutos",
      },
      {
        id: "frio",
        nombre: "Técnica de frío",
        descripcion: "Pon agua fría en tu muñeca o frente durante 30 segundos. El cambio de temperatura activa el reflejo de buceo y reduce la activación del sistema nervioso.",
        ubicacion: "",
        horario: "30 segundos – 1 minuto",
      },
    ],
  },
];

// ==========================================
// COMPONENTE ACORDEÓN INDIVIDUAL
// ==========================================

interface AccordionItemProps {
  punto: PuntoApoyo;
}

function AccordionItem({ punto }: AccordionItemProps) {
  const [abierto, setAbierto] = useState(false);

  return (
    <div className={`rounded-2xl border overflow-hidden transition-all duration-200 ${
      punto.esEmergencia
        ? "border-rose-200 bg-white"
        : "border-slate-100 bg-white"
    }`}>
      {/* Cabecera del acordeón */}
      <button
        onClick={() => setAbierto(!abierto)}
        className="w-full flex items-center justify-between px-4 py-3.5 text-left focus:outline-none group"
        aria-expanded={abierto}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {punto.esEmergencia && (
            <span className="text-rose-500 text-base flex-shrink-0">🔴</span>
          )}
          <span className={`text-xs font-bold leading-snug ${
            punto.esEmergencia ? "text-rose-800" : "text-slate-800"
          } line-clamp-2`}>
            {punto.nombre}
          </span>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          stroke="currentColor"
          className={`w-4 h-4 flex-shrink-0 ml-2 text-slate-400 transition-transform duration-200 ${
            abierto ? "rotate-180" : ""
          }`}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {/* Contenido expandido */}
      {abierto && (
        <div className="px-4 pb-4 space-y-3 border-t border-slate-100 pt-3 animate-fadeIn">
          <p className="text-[11px] font-medium text-slate-600 leading-relaxed">
            {punto.descripcion}
          </p>

          <div className="space-y-2">
            {punto.ubicacion && (
              <div className="flex items-start gap-2">
                <span className="text-[10px] text-slate-400 flex-shrink-0 mt-0.5">📍</span>
                <span className="text-[11px] text-slate-500 font-medium">{punto.ubicacion}</span>
              </div>
            )}
            {punto.horario && (
              <div className="flex items-start gap-2">
                <span className="text-[10px] text-slate-400 flex-shrink-0 mt-0.5">🕒</span>
                <span className="text-[11px] text-slate-500 font-medium">{punto.horario}</span>
              </div>
            )}
            {punto.telefono && (
              <a
                href={`tel:${punto.telefono.replace(/\D/g, "")}`}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-bold transition-all active:scale-[0.99] ${
                  punto.esEmergencia
                    ? "bg-rose-500 text-white hover:bg-rose-600"
                    : "bg-[#4A72A6] text-white hover:bg-[#3B5E8C]"
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5 flex-shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.338c0-1.36 1.22-2.337 2.57-2.096l1.77.32A2.25 2.25 0 0 1 8.33 6.44l.51 2.55a2.25 2.25 0 0 1-1.29 2.49l-.99.44a1.04 1.04 0 0 0-.57 1.17c.53 2.58 2.47 4.73 5.05 5.78l.45.18a1.04 1.04 0 0 0 1.23-.41l.44-.66a2.25 2.25 0 0 1 2.58-.92l2.53.84a2.25 2.25 0 0 1 1.55 2.25v1.44c0 1.36-1.22 2.34-2.57 2.09C7.62 22.78 1.5 15.5 1.5 6.75c0-.15.02-.3.05-.45l.69-.001.01.034Z" />
                </svg>
                Llamar: {punto.telefono}
              </a>
            )}
            {punto.email && (
              <a
                href={`mailto:${punto.email}`}
                className="flex items-center gap-2 text-[11px] font-medium text-[#4A72A6] hover:underline"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5 flex-shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                </svg>
                {punto.email}
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// COMPONENTE PRINCIPAL: MODO CRISIS
// ==========================================

interface ModoCrisisProps {
  /** Si viene de la detección automática de puntuación baja */
  desencadenadoAutomaticamente?: boolean;
  /** Promedio de bienestar de los últimos 7 días (para mensajes contextuales) */
  promedioBienestar?: number;
}

export default function ModoCrisisPage({
  desencadenadoAutomaticamente = false,
  promedioBienestar,
}: ModoCrisisProps) {
  const router = useRouter();
  const [seccionAbierta, setSeccionAbierta] = useState<string | null>("emergencia");

  const mensajePrincipal = desencadenadoAutomaticamente
    ? "Hemos notado que tu bienestar ha sido bajo esta semana. No estás solo/a."
    : "Este es tu espacio de ayuda inmediata. Estás en el lugar correcto.";

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-0 sm:p-4 font-sans">
      <div className="w-full max-w-md h-screen sm:h-[850px] bg-white shadow-2xl flex flex-col relative sm:rounded-[40px] border border-gray-100 overflow-hidden">

        {/* HEADER ROJO DE CRISIS */}
        <div className={`px-6 pt-6 pb-5 ${
          desencadenadoAutomaticamente
            ? "bg-gradient-to-b from-rose-50 to-white border-b border-rose-100"
            : "bg-white border-b border-slate-100"
        }`}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/home.2")}
              className="p-2 -ml-2 text-slate-600 hover:text-slate-800 transition-colors rounded-full hover:bg-slate-100 active:scale-95 flex-shrink-0"
              aria-label="Volver al inicio"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
              </svg>
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xl">🚨</span>
                <h2 className="text-base font-extrabold text-[#2A3B50] tracking-tight">
                  Modo crisis
                </h2>
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5 leading-snug">
                Ayuda inmediata y contención
              </p>
            </div>
          </div>

          {/* Banner de alerta automática */}
          {desencadenadoAutomaticamente && (
            <div className="mt-4 p-3.5 bg-rose-500 text-white rounded-2xl flex items-start gap-3">
              <span className="text-lg flex-shrink-0 mt-0.5">💙</span>
              <div>
                <p className="text-xs font-bold leading-snug">
                  {mensajePrincipal}
                </p>
                {promedioBienestar !== undefined && (
                  <p className="text-[10px] font-medium mt-1 opacity-90">
                    Tu bienestar promedio esta semana: {promedioBienestar.toFixed(1)}/5.0
                  </p>
                )}
              </div>
            </div>
          )}

          {!desencadenadoAutomaticamente && (
            <div className="mt-4 p-3.5 bg-slate-50 border border-slate-100 rounded-2xl flex items-start gap-3">
              <span className="text-lg flex-shrink-0 mt-0.5">💜</span>
              <p className="text-xs font-medium text-slate-600 leading-snug">
                {mensajePrincipal}
              </p>
            </div>
          )}
        </div>

        {/* CONTENIDO SCROLLABLE */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">

          {/* SECCIONES DE ACORDEÓN */}
          {SECCIONES_APOYO.map((seccion) => {
            const estaAbierta = seccionAbierta === seccion.id;
            return (
              <div key={seccion.id} className={`rounded-3xl border overflow-hidden ${seccion.colorBg}`}>

                {/* Cabecera de la sección */}
                <button
                  onClick={() => setSeccionAbierta(estaAbierta ? null : seccion.id)}
                  className="w-full flex items-center justify-between px-5 py-4 focus:outline-none"
                  aria-expanded={estaAbierta}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{seccion.icono}</span>
                    <span className={`text-xs font-extrabold uppercase tracking-wide ${seccion.color}`}>
                      {seccion.titulo}
                    </span>
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 flex-shrink-0 ${
                      estaAbierta ? "rotate-180" : ""
                    }`}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>

                {/* Lista de puntos de apoyo */}
                {estaAbierta && (
                  <div className="px-4 pb-4 space-y-2.5 animate-fadeIn">
                    {seccion.puntos.map((punto) => (
                      <AccordionItem key={punto.id} punto={punto} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* MENSAJE FINAL DE ESPERANZA */}
          <div className="p-4 bg-purple-50 border border-purple-100 rounded-3xl flex items-start gap-3 mb-4">
            <span className="text-xl flex-shrink-0">✨</span>
            <div>
              <p className="text-xs font-bold text-purple-900">Recuerda</p>
              <p className="text-[11px] text-purple-700 font-medium leading-relaxed mt-1">
                Pedir ayuda es un acto de valentía. No tienes que atravesar esto solo/a.
                Los servicios de la UCV están aquí para acompañarte.
              </p>
            </div>
          </div>
        </div>

        {/* BOTÓN INFERIOR FIJO: VOLVER AL HOME */}
        <div className="bg-white border-t border-slate-100 p-4 sm:rounded-b-[40px] flex-shrink-0">
          <button
            onClick={() => router.push("/home.2")}
            className="w-full py-3.5 bg-[#4A72A6] hover:bg-[#3B5E8C] text-white font-semibold text-sm rounded-2xl transition-all active:scale-[0.99] shadow-sm"
          >
            Volver al inicio
          </button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out forwards; }
      `}</style>
    </div>
  );
}
