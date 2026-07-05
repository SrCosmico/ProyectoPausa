"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuizState } from '@/hooks/useQuizState';
import { obtenerNombreUsuarioLocal } from '@/lib/supabase/home';
import { cargarQuizState, obtenerUsuarioIdLocal } from '@/lib/supabase/quizState';
import supabase from '@/lib/supabase';
import { cerrarSesion } from '@/app/services/authService';

export type NivelEmocional = "Muy mal" | "Mal" | "Regular" | "Bien" | "Muy bien";
export type TabNavegacionId = "inicio" | "evaluacion" | "recursos" | "perfil";

export interface EmojiEstado {
  estado: NivelEmocional;
  emoji: string;
}

export interface AccesoRapido {
  id: string;
  titulo: string;
  descripcion: string;
  icono?: string;
  ruta: string;
}

export interface ItemNavegacion {
  id: TabNavegacionId;
  label: string;
  icono?: string;
  activo: boolean;
}

export const emojiEstadosData: EmojiEstado[] = [
  { estado: "Muy mal",  emoji: "😩" },
  { estado: "Mal",      emoji: "😔" },
  { estado: "Regular",  emoji: "😐" },
  { estado: "Bien",     emoji: "😊" },
  { estado: "Muy bien", emoji: "🤩" },
];

export const accesoRapidoData: AccesoRapido[] = [
  { id: "evaluacion",  titulo: "Evaluación rápida",        descripcion: "Conoce tu bienestar",                ruta: "/evaluacion.2"  },
  { id: "meditacion",  titulo: "Meditación y respiración",  descripcion: "Encuentra tu calma",                ruta: "/meditacion.2"  },
  { id: "antistres",   titulo: "Monitoreo emocional",       descripcion: "Revisa tu progreso y tus registros", ruta: "/monitoreo.2"   },
  { id: "cronograma",  titulo: "Cronograma académico",      descripcion: "Organiza tu semana",                ruta: "/cronograma.2"  },
  { id: "diario",      titulo: "Diario personal",           descripcion: "Escribe lo que piensas",             ruta: "/contrasena.2"  },
  { id: "crisis",      titulo: "Modo crisis",               descripcion: "Ayuda inmediata y contención",       ruta: "/modoCrisis.2"  },
  { id: "ia",          titulo: "Asistente IA de Bienestar", descripcion: "Habla con nuestro bot de apoyo",     ruta: ""               },
];

export const navegacionData: Omit<ItemNavegacion, "activo">[] = [
  { id: "inicio",     label: "Inicio" },
  { id: "evaluacion", label: "Evaluación" },
  { id: "perfil",     label: "Perfil" },
];

const mapeoIconosHerramientas: Record<string, string> = {
  evaluacion: "📊",
  meditacion: "🧘",
  antistres:  "📈",
  cronograma: "📅",
  diario:     "🔐",
  crisis:     "🚨",
  ia:         "💬",
};

// ==========================================
// PERSONALIZACIÓN SEGÚN METADATA DEL ONBOARDING
// ==========================================

function personalizarOrdenHerramientas(
  base: AccesoRapido[],
  motivos: string[]
): AccesoRapido[] {
  const prioridadPorMotivo: Record<string, string> = {
    dormir: 'meditacion',
    academico: 'cronograma',
    estres: 'evaluacion',
    bienestar: 'antistres',
    motivacion: 'antistres',
  };

  const idsPrioritarios = motivos
    .map((m) => prioridadPorMotivo[m])
    .filter((id): id is string => Boolean(id));

  if (idsPrioritarios.length === 0) return base;

  const ordenados = [...base];
  [...idsPrioritarios].reverse().forEach((id) => {
    const idx = ordenados.findIndex((item) => item.id === id);
    if (idx > 0) {
      const [item] = ordenados.splice(idx, 1);
      ordenados.unshift(item);
    }
  });

  return ordenados;
}

const SALUDO_POR_FACTOR: Record<string, string> = {
  estres_academico: 'Estamos aquí para ayudarte con el estrés académico 📚',
  sobrecarga_tareas: 'Vamos a organizar tu carga de tareas juntos 📝',
  falta_tiempo: 'Te ayudamos a encontrar tiempo para ti 🕒',
  problemas_personales: 'Estamos aquí para acompañarte 💜',
  ansiedad: 'Tu calma es nuestra prioridad 🧘',
  motivacion_baja: 'Vamos a recuperar tu motivación juntos ✨',
};

function personalizarUmbralCrisis(frecuenciaEstres: string) {
  if (typeof window === 'undefined') return;
  if (frecuenciaEstres === 'todos_los_dias') {
    localStorage.setItem('umbral_crisis_personalizado', '2.2');
  } else if (frecuenciaEstres === 'varias_semana') {
    localStorage.setItem('umbral_crisis_personalizado', '2.0');
  }
}

// ==========================================
// RACHA (STREAK) — calculada a partir del historial local del quiz
// ==========================================

/**
 * Cuenta los días consecutivos (terminando hoy) en los que el usuario
 * registró al menos un check-in. Si hoy aún no ha registrado, la racha
 * se sigue mostrando basada en ayer (no se rompe hasta medianoche).
 */
function calcularRachaDias(timestamps: string[]): number {
  if (timestamps.length === 0) return 0;

  const diasConRegistro = new Set(
    timestamps.map((t) => new Date(t).toDateString())
  );

  let racha = 0;
  const cursor = new Date();

  if (!diasConRegistro.has(cursor.toDateString())) {
    cursor.setDate(cursor.getDate() - 1);
  }

  while (diasConRegistro.has(cursor.toDateString())) {
    racha += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return racha;
}

export default function HomePage() {
  const router = useRouter();
  const [usuarioNombre, setUsuarioNombre]   = useState('Usuario');
  const [yaRegistroHoy, setYaRegistroHoy]   = useState(false);
  const [loadingLogout, setLoadingLogout]   = useState(false);
  const [herramientas, setHerramientas]     = useState<AccesoRapido[]>(accesoRapidoData);
  const [saludo, setSaludo]                 = useState('Nos alegra que estés aquí');
  const [rachaDias, setRachaDias]           = useState(0);

  const { preguntaActual, mostrarCheckin, guardarEmocionTemporal } = useQuizState();

  useEffect(() => {
    const verificarSesionReal = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/login'); return; }

      const nombreMeta = session.user?.user_metadata?.nombre_usuario;
      if (nombreMeta) {
        setUsuarioNombre(nombreMeta);
      } else {
        setUsuarioNombre(obtenerNombreUsuarioLocal() || 'Estudiante');
      }

      const registroFecha = localStorage.getItem('fechaUltimoRegistro');
      const hoy = new Date().toLocaleDateString();
      if (registroFecha === hoy) setYaRegistroHoy(true);

      // --- Racha: se calcula del historial guardado por el quiz diario ---
      const userId = obtenerUsuarioIdLocal();
      const { historial } = cargarQuizState(userId);
      setRachaDias(calcularRachaDias(historial.map((h) => h.timestamp)));

      // --- Personalización a partir de los datos del cuestionario de onboarding ---
      const metadata = session.user?.user_metadata;
      if (metadata?.onboarding_completado) {
        const motivos: string[] = metadata.motivos_principales ?? [];
        setHerramientas(personalizarOrdenHerramientas(accesoRapidoData, motivos));

        const frecuencia: string = metadata.frecuencia_estres ?? '';
        personalizarUmbralCrisis(frecuencia);

        const factorPrincipal: string = metadata.factores_impacto?.[0] ?? '';
        if (factorPrincipal && SALUDO_POR_FACTOR[factorPrincipal]) {
          setSaludo(SALUDO_POR_FACTOR[factorPrincipal]);
        }
      }
    };
    verificarSesionReal();
  }, [router]);

  const handleLogout = async () => {
    if (loadingLogout) return;
    setLoadingLogout(true);
    const { error } = await cerrarSesion();
    if (error) {
      alert(`No se pudo cerrar sesión: ${error.message}`);
      setLoadingLogout(false);
    } else {
      router.push('/login');
    }
  };

  const manejarClickEmoji = (item: EmojiEstado) => {
    guardarEmocionTemporal(item.estado, item.emoji);
    localStorage.setItem('fechaUltimoRegistro', new Date().toLocaleDateString());
    setYaRegistroHoy(true);
    setRachaDias((prev) => (prev > 0 ? prev + (yaRegistroHoy ? 0 : 1) : 1));
    router.push('/registroEmocional');
  };

  const preguntaCheckin =
    preguntaActual ||
    (yaRegistroHoy ? '¿Cómo te sientes ahora?' : '¿Cómo te sientes hoy?');

  const datosHome = {
    usuario:    { nombre: usuarioNombre },
    saludo,
    registroEmocional: {
      pregunta:     preguntaCheckin,
      descripcion:  "Registra tu estado emocional",
      opcionesEmoji: emojiEstadosData,
    },
    accesoRapido: herramientas,
    navegacion: navegacionData.map((item) => ({ ...item, activo: item.id === "inicio" })),
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-0 sm:p-4 font-sans selection:bg-blue-100">
      <div className="w-full max-w-md h-screen sm:h-[850px] bg-slate-50 shadow-2xl flex flex-col justify-between relative sm:rounded-[40px] border border-gray-100 overflow-hidden">

        <div className="flex-1 overflow-y-auto pb-6 custom-scrollbar">

          {/* ENCABEZADO */}
          <div className="p-6 bg-white rounded-b-[32px] shadow-sm border-b border-slate-100">
            <div className="flex items-center justify-between gap-4">

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-500 via-indigo-400 to-blue-400 p-0.5 shadow-md flex-shrink-0 flex items-center justify-center">
                  <div className="w-full h-full bg-white rounded-full flex items-center justify-center overflow-hidden">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-indigo-400 translate-y-1">
                      <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-bold text-[#2A3B50] truncate max-w-[180px]">
                    Hola, {datosHome.usuario.nombre}
                  </h2>
                  <p className="text-xs font-medium text-[#8C9BAE]">{datosHome.saludo}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {/* BOTÓN DE RACHA -> navega a /racha.2 */}
                <button
                  onClick={() => router.push('/racha')}
                  title={`Ver mi racha: ${rachaDias} ${rachaDias === 1 ? 'día' : 'días'}`}
                  className="flex items-center gap-1 bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 text-orange-600 px-3 py-2 rounded-full shadow-sm hover:shadow-md hover:border-orange-200 active:scale-95 transition-all duration-150"
                >
                  <span className="text-base leading-none">🔥</span>
                  <span className="text-xs font-extrabold leading-none tabular-nums">
                    {rachaDias}
                  </span>
                </button>

                {/* BOTÓN LOGOUT */}
                <button
                  onClick={handleLogout}
                  disabled={loadingLogout}
                  title="Cerrar sesión"
                  className="p-2.5 rounded-full bg-slate-50 border border-slate-100 text-slate-400 hover:text-rose-500 hover:bg-rose-50 active:scale-95 transition-all duration-150 flex items-center justify-center disabled:opacity-50"
                >
                  {loadingLogout ? (
                    <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* CHECK-IN EMOCIONAL */}
            {mostrarCheckin && (
              <div className="mt-6 bg-slate-50/70 border border-slate-100/80 rounded-2xl p-4 text-center">
                <h3 className="text-sm font-bold text-[#334155]">
                  {datosHome.registroEmocional.pregunta}
                </h3>
                <p className="text-[11px] text-[#8C9BAE] mt-0.5">
                  {datosHome.registroEmocional.descripcion}
                </p>
                <div className="flex justify-between items-center gap-1 mt-4 px-1">
                  {datosHome.registroEmocional.opcionesEmoji.map((item) => (
                    <button
                      key={item.estado}
                      onClick={() => manejarClickEmoji(item)}
                      className="flex flex-col items-center group focus:outline-none"
                      title={item.estado}
                    >
                      <span className="text-3xl sm:text-4xl transition-all duration-300 transform group-hover:scale-125 group-hover:animate-bounce cursor-pointer select-none active:scale-90 block">
                        {item.emoji}
                      </span>
                      <span className="text-[9px] font-bold text-[#A0AEC0] mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        {item.estado}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* HERRAMIENTAS */}
          <div className="p-6">
            <h4 className="text-xs font-bold text-[#8C9BAE] tracking-widest uppercase mb-4">
              Herramientas recomendadas
            </h4>

            <div className="grid grid-cols-1 gap-3">
              {datosHome.accesoRapido.map((item) => {
                const esCrisis        = item.id === "crisis";
                const esIA            = item.id === "ia";
                const tieneNavegacion = item.ruta !== "";

                return (
                  <button
                    key={item.id}
                    onClick={() => { if (tieneNavegacion) router.push(item.ruta); }}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all duration-150 active:scale-[0.99] group shadow-sm ${
                      esCrisis
                        ? "bg-rose-50/60 border-rose-100 hover:bg-rose-50"
                        : esIA
                        ? "bg-rose-50/60 border-rose-100 hover:bg-rose-50"
                        : "bg-white border-slate-100 hover:bg-slate-50"
                    } ${!tieneNavegacion ? "cursor-default opacity-75" : "cursor-pointer"}`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-sm flex-shrink-0 group-hover:scale-105 transition-transform ${
                      esCrisis ? "bg-rose-100" : "bg-slate-50 group-hover:bg-purple-50"
                    }`}>
                      {mapeoIconosHerramientas[item.id] || "✨"}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h5 className={`text-sm font-bold truncate ${esCrisis ? "text-rose-700" : "text-[#334155]"}`}>
                        {item.titulo}
                      </h5>
                      <p className="text-xs text-[#8C9BAE] truncate mt-0.5">
                        {item.descripcion}
                      </p>
                    </div>

                    <div className={`text-slate-300 group-hover:translate-x-1 transition-transform flex-shrink-0 ${esCrisis ? "text-rose-300" : ""}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                      </svg>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* NAVEGACIÓN INFERIOR */}
        <div className="bg-white border-t border-slate-100 px-6 py-3.5 flex justify-around items-center sm:rounded-b-[40px] z-30 shadow-[0_-6px_20px_rgba(0,0,0,0.03)] flex-shrink-0">
          {datosHome.navegacion.map((tab) => {
            const rutasMenu = {
              inicio:     "/home",
              evaluacion: "/evaluacion",
              perfil:     "/perfil",
              recursos:   "/herramientas",
            };
            return (
              <button
                key={tab.id}
                onClick={() => router.push(rutasMenu[tab.id as keyof typeof rutasMenu])}
                className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl transition-all active:scale-95 ${
                  tab.activo ? "text-[#4A72A6]" : "text-[#8C9BAE] hover:text-[#4A72A6]"
                }`}
              >
                {tab.id === "inicio" && (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M11.47 3.822a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 0 1-1.06 1.06L20 13.061v6.189a1.75 1.75 0 0 1-1.75 1.75H15.25a.75.75 0 0 1-.75-.75V16.5a.5.5 0 0 0-.5-.5h-2a.5.5 0 0 0-.5.5v3.75a.75.75 0 0 1-.75.75H5.75A1.75 1.75 0 0 1 4 19.25v-6.19l-.56.56a.75.75 0 0 1-1.06-1.06l8.69-8.69Z" />
                  </svg>
                )}
                {tab.id === "evaluacion" && (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M10.5 3.75a.75.75 0 0 0-1.5 0v16.5a.75.75 0 0 0 1.5 0V3.75ZM6 6.75a.75.75 0 0 0-1.5 0v10.5a.75.75 0 0 0 1.5 0V6.75ZM19.5 9.75a.75.75 0 0 0-1.5 0v4.5a.75.75 0 0 0 1.5 0v-4.5ZM15 8.25a.75.75 0 0 0-1.5 0v7.5a.75.75 0 0 0 1.5 0v-7.5Z" />
                  </svg>
                )}
                {tab.id === "perfil" && (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
                  </svg>
                )}
                <span className="text-[10px] font-bold tracking-wide">{tab.label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
}