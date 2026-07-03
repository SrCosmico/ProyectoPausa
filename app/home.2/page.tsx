"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuizState } from '@/hooks/useQuizState';
import { obtenerNombreUsuarioLocal } from '@/lib/supabase/home';
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
  { id: "antistres",   titulo: "Tips anti-estrés",          descripcion: "Pequeñas acciones, grandes cambios", ruta: "/monitoreo.2"   },
  { id: "cronograma",  titulo: "Cronograma académico",      descripcion: "Organiza tu semana",                ruta: "/cronograma.2"  },
  { id: "registro",    titulo: "Registro emocional",        descripcion: "Tu espacio personal",               ruta: "/monitoreo.2"   },
  { id: "crisis",      titulo: "Modo crisis",               descripcion: "Ayuda inmediata y contención",       ruta: "/modoCrisis.2"  },
  { id: "diario",      titulo: "Diario personal",           descripcion: "Escribe lo que piensas",             ruta: "/contrasena.2"  },
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
  antistres:  "💡",
  cronograma: "📅",
  registro:   "❤️",
  crisis:     "🚨",
  diario:     "🔐",
  ia:         "💬",
};

export default function HomePage() {
  const router = useRouter();
  const [usuarioNombre, setUsuarioNombre] = useState('Usuario');
  const [usuarioAvatar, setUsuarioAvatar] = useState<string | null>(null); // ✅ NUEVO
  const [yaRegistroHoy, setYaRegistroHoy] = useState(false);
  const [loadingLogout, setLoadingLogout] = useState(false);

  const [rachaActual] = useState(12);

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

      // ✅ NUEVO: leer avatar guardado desde perfil
      const avatar = localStorage.getItem('userAvatar');
      setUsuarioAvatar(avatar);

      const registroFecha = localStorage.getItem('fechaUltimoRegistro');
      const hoy = new Date().toLocaleDateString();
      if (registroFecha === hoy) setYaRegistroHoy(true);
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
    router.push('/registroEmocional.2');
  };

  const preguntaCheckin =
    preguntaActual ||
    (yaRegistroHoy ? '¿Cómo te sientes ahora?' : '¿Cómo te sientes hoy?');

  const datosHome = {
    usuario:    { nombre: usuarioNombre },
    saludo:     "Nos alegra que estés aquí",
    registroEmocional: {
      pregunta:     preguntaCheckin,
      descripcion:  "Registra tu estado emocional",
      opcionesEmoji: emojiEstadosData,
    },
    accesoRapido: accesoRapidoData,
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
                {/* ✅ Avatar igual al del perfil */}
                <div
                  className="w-12 h-12 rounded-full overflow-hidden border-4 border-slate-50 shadow-sm flex-shrink-0 flex items-center justify-center text-white text-lg font-bold"
                  style={{ backgroundColor: '#A7C7D8' }}
                >
                  {usuarioAvatar ? (
                    <img
                      src={usuarioAvatar}
                      alt="Foto de perfil"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{usuarioNombre.charAt(0).toUpperCase()}</span>
                  )}
                </div>

                <div>
                  <h2 className="text-xl font-bold text-[#2A3B50] truncate max-w-[180px]">
                    Hola, {datosHome.usuario.nombre}
                  </h2>
                  <p className="text-xs font-medium text-[#8C9BAE]">{datosHome.saludo}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">

  {/* BOTÓN RACHA */}
  <button
    onClick={() => router.push('/Racha.2')}
    className="flex items-center gap-1 px-3 py-2 rounded-full bg-orange-50 border border-orange-100 hover:bg-orange-100 transition-all active:scale-95"
  >
    <span className="text-lg">🔥</span>

    <span className="text-sm font-bold text-orange-600">
      {rachaActual}
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
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className="w-5 h-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75"
        />
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
              inicio:     "/home.2",
              evaluacion: "/evaluacion.2",
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
