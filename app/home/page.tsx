"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuizState } from '@/hooks/useQuizState';
import { obtenerNombreUsuarioLocal } from '@/lib/supabase/home';
import supabase from '@/lib/supabase';
import { cerrarSesion } from '@/app/services/authService';

// ─── Importación segura de racha (puede no existir aún) ───────────────────────
let calcularEstadoRachaPareja: ((uid: string) => Promise<any>) | null = null;
try {
  const mod = require('@/lib/supabase/racha');
  calcularEstadoRachaPareja = mod.calcularEstadoRachaPareja ?? null;
} catch {
  calcularEstadoRachaPareja = null;
}

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type NivelEmocional = "Muy mal" | "Mal" | "Regular" | "Bien" | "Muy bien";
export type TabNavegacionId = "inicio" | "evaluacion" | "recursos" | "perfil";

export interface EmojiEstado { estado: NivelEmocional; emoji: string; }
export interface AccesoRapido { id: string; titulo: string; descripcion: string; icono?: string; ruta: string; }
export interface ItemNavegacion { id: TabNavegacionId; label: string; icono?: string; activo: boolean; }

interface EstadoRacha {
  tieneParejaActiva: boolean;
  esperandoAceptacion: boolean;
  rachaActual: number;
  nombrePareja?: string;
  correoInvitado?: string;
}

// ─── Datos constantes ─────────────────────────────────────────────────────────

export const emojiEstadosData: EmojiEstado[] = [
  { estado: "Muy mal",  emoji: "😩" },
  { estado: "Mal",      emoji: "😔" },
  { estado: "Regular",  emoji: "😐" },
  { estado: "Bien",     emoji: "😊" },
  { estado: "Muy bien", emoji: "🤩" },
];

export const accesoRapidoData: AccesoRapido[] = [
  { id: "evaluacion", titulo: "Evaluación rápida",       descripcion: "Conoce tu bienestar",                ruta: "/evaluacion.2"  },
  { id: "meditacion", titulo: "Meditación y respiración", descripcion: "Encuentra tu calma",                ruta: "/meditacion.2"  },
  { id: "antistres",  titulo: "Monitoreo emocional",      descripcion: "Revisa tu progreso y tus registros", ruta: "/monitoreo.2"   },
  { id: "cronograma", titulo: "Cronograma académico",     descripcion: "Organiza tu semana",                ruta: "/cronograma.2"  },
  { id: "diario",     titulo: "Diario personal",          descripcion: "Escribe lo que piensas",             ruta: "/contrasena.2"  },
  { id: "racha",      titulo: "Racha con amigos",         descripcion: "Cuídense juntos cada día",           ruta: "/racha"         },
  { id: "crisis",     titulo: "Modo crisis",              descripcion: "Ayuda inmediata y contención",       ruta: "/modoCrisis.2"  },
];

export const navegacionData: Omit<ItemNavegacion, "activo">[] = [
  { id: "inicio",     label: "Inicio" },
  { id: "evaluacion", label: "Evaluación" },
  { id: "perfil",     label: "Perfil" },
];

const mapeoIconos: Record<string, string> = {
  evaluacion: "📊", meditacion: "🧘", antistres: "📈",
  cronograma: "📅", diario: "🔐", crisis: "🚨", racha: "🔥",
};

// ─── Personalización ──────────────────────────────────────────────────────────

function personalizarOrden(base: AccesoRapido[], motivos: string[]): AccesoRapido[] {
  const mapa: Record<string, string> = {
    dormir: 'meditacion', academico: 'cronograma',
    estres: 'evaluacion', bienestar: 'antistres', motivacion: 'antistres',
  };
  const ids = motivos.map(m => mapa[m]).filter((id): id is string => Boolean(id));
  if (!ids.length) return base;
  const out = [...base];
  [...ids].reverse().forEach(id => {
    const i = out.findIndex(x => x.id === id);
    if (i > 0) out.unshift(out.splice(i, 1)[0]);
  });
  return out;
}

const SALUDOS: Record<string, string> = {
  estres_academico: 'Estamos aquí para ayudarte con el estrés académico 📚',
  sobrecarga_tareas: 'Vamos a organizar tu carga de tareas juntos 📝',
  falta_tiempo: 'Te ayudamos a encontrar tiempo para ti 🕒',
  problemas_personales: 'Estamos aquí para acompañarte 💜',
  ansiedad: 'Tu calma es nuestra prioridad 🧘',
  motivacion_baja: 'Vamos a recuperar tu motivación juntos ✨',
};

function ajustarUmbralCrisis(frecuencia: string) {
  if (typeof window === 'undefined') return;
  if (frecuencia === 'todos_los_dias') localStorage.setItem('umbral_crisis_personalizado', '2.2');
  else if (frecuencia === 'varias_semana') localStorage.setItem('umbral_crisis_personalizado', '2.0');
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function HomePage() {
  const router = useRouter();
  const [usuarioNombre, setUsuarioNombre] = useState('Usuario');
  const [usuarioAvatar, setUsuarioAvatar] = useState<string | null>(null);
  const [yaRegistroHoy, setYaRegistroHoy] = useState(false);
  const [loadingLogout, setLoadingLogout] = useState(false);
  const [herramientas, setHerramientas]   = useState<AccesoRapido[]>(accesoRapidoData);
  const [saludo, setSaludo]               = useState('Nos alegra que estés aquí');
  const [estadoRacha, setEstadoRacha]     = useState<EstadoRacha | null>(null);

  const { preguntaActual, mostrarCheckin, guardarEmocionTemporal } = useQuizState();

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/login'); return; }
      const user = session.user;

      // Nombre
      const nombreMeta = user.user_metadata?.nombre_usuario;
      setUsuarioNombre(nombreMeta || obtenerNombreUsuarioLocal() || 'Estudiante');

      // Avatar ✅
      // Avatar: prioridad Supabase > localStorage
      const { data: perfil } = await supabase
        .from('perfiles')
        .select('avatar_url')
        .eq('id', user.id)
        .single();

      if (perfil?.avatar_url) {
        setUsuarioAvatar(perfil.avatar_url);
        localStorage.setItem('userAvatar', perfil.avatar_url);
      } else {
        setUsuarioAvatar(localStorage.getItem('userAvatar'));
      }

      // Registro hoy
      if (localStorage.getItem('fechaUltimoRegistro') === new Date().toLocaleDateString()) {
        setYaRegistroHoy(true);
      }

      // Racha (seguro)
      if (calcularEstadoRachaPareja) {
        try { setEstadoRacha(await calcularEstadoRachaPareja(user.id)); } catch { /* sin racha */ }
      }

      // Personalización onboarding
      const meta = user.user_metadata;
      if (meta?.onboarding_completado) {
        setHerramientas(personalizarOrden(accesoRapidoData, meta.motivos_principales ?? []));
        ajustarUmbralCrisis(meta.frecuencia_estres ?? '');
        const factor = meta.factores_impacto?.[0] ?? '';
        if (SALUDOS[factor]) setSaludo(SALUDOS[factor]);
      }
    };
    init();
  }, [router]);

  const handleLogout = async () => {
    if (loadingLogout) return;
    setLoadingLogout(true);
    const { error } = await cerrarSesion();
    if (error) { alert(`No se pudo cerrar sesión: ${error.message}`); setLoadingLogout(false); }
    else router.push('/login');
  };

  const manejarClickEmoji = (item: EmojiEstado) => {
    guardarEmocionTemporal(item.estado, item.emoji);
    localStorage.setItem('fechaUltimoRegistro', new Date().toLocaleDateString());
    setYaRegistroHoy(true);
    router.push('/registroEmocional');
  };

  const rachaDias = estadoRacha?.rachaActual ?? 0;
  const preguntaCheckin = preguntaActual || (yaRegistroHoy ? '¿Cómo te sientes ahora?' : '¿Cómo te sientes hoy?');

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-0 sm:p-4 font-sans selection:bg-blue-100">
      <div className="w-full max-w-md h-screen sm:h-[850px] bg-slate-50 shadow-2xl flex flex-col justify-between relative sm:rounded-[40px] border border-gray-100 overflow-hidden">

        {/* ── Imágenes decorativas: absolute dentro del contenedor del celular,
               fuera del scroll para que no se muevan ── */}

        {/* Forma morada: esquina superior izquierda, debajo del header */}
        <img
          src="/images/forma_morada.png"
          alt=""
          aria-hidden="true"
          className="absolute top-16 left-0 w-44 opacity-35 pointer-events-none select-none z-0"
        />

        {/* Onda del medio: zona de herramientas recomendadas */}
        <img
          src="/images/onda_del_medio.png"
          alt=""
          aria-hidden="true"
          className="absolute top-[42%] left-0 w-full opacity-15 pointer-events-none select-none z-0"
        />

        {/* Forma grande: justo encima de la barra de navegación */}
        <img
          src="/images/forma_grande.png"
          alt=""
          aria-hidden="true"
          className="absolute bottom-16 left-0 w-full opacity-40 pointer-events-none select-none z-0"
        />

        <div className="flex-1 overflow-y-auto pb-6 custom-scrollbar relative z-10">

          {/* ENCABEZADO */}
          <div className="p-6 bg-white rounded-b-[32px] shadow-sm border-b border-slate-100">
            <div className="flex items-center justify-between gap-4">

              <div className="flex items-center gap-4">
                {/* Avatar ✅ */}
                <div
                  className="w-12 h-12 rounded-full overflow-hidden border-4 border-slate-50 shadow-sm flex-shrink-0 flex items-center justify-center text-white text-lg font-bold cursor-pointer"
                  style={{ backgroundColor: '#A7C7D8' }}
                  onClick={() => router.push('/perfil')}
                >
                  {usuarioAvatar
                    ? <img src={usuarioAvatar} alt="Foto de perfil" className="w-full h-full object-cover" />
                    : <span>{usuarioNombre.charAt(0).toUpperCase()}</span>
                  }
                </div>

                <div>
                  <h2 className="text-xl font-bold text-[#2A3B50] truncate max-w-[150px]">
                    Hola, {usuarioNombre}
                  </h2>
                  <p className="text-xs font-medium text-[#8C9BAE]">{saludo}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Racha (solo si el módulo existe) */}
                {calcularEstadoRachaPareja !== null && (
                  <button
                    onClick={() => router.push('/racha')}
                    className={`flex items-center gap-1 px-3 py-2 rounded-full shadow-sm active:scale-95 transition-all border ${
                      estadoRacha?.tieneParejaActiva
                        ? 'bg-gradient-to-br from-orange-50 to-amber-50 border-orange-100 text-orange-600'
                        : 'bg-slate-50 border-slate-100 text-slate-400'
                    }`}
                  >
                    <span className="text-base">🔥</span>
                    <span className="text-xs font-extrabold tabular-nums">{rachaDias}</span>
                  </button>
                )}

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  disabled={loadingLogout}
                  className="p-2.5 rounded-full bg-slate-50 border border-slate-100 text-slate-400 hover:text-rose-500 hover:bg-rose-50 active:scale-95 transition-all flex items-center justify-center disabled:opacity-50"
                >
                  {loadingLogout
                    ? <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                    : <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" /></svg>
                  }
                </button>
              </div>
            </div>

            {/* Banners de racha */}
            {estadoRacha && !estadoRacha.tieneParejaActiva && !estadoRacha.esperandoAceptacion && (
              <button onClick={() => router.push('/racha')} className="mt-4 w-full text-left px-4 py-3 bg-orange-50 border border-orange-100 rounded-2xl text-[11px] font-semibold text-orange-700 hover:bg-orange-100 transition-colors">
                🔥 Vincula a tu pareja y empiecen su racha de bienestar juntos →
              </button>
            )}
            {estadoRacha?.esperandoAceptacion && (
              <button onClick={() => router.push('/racha')} className="mt-4 w-full text-left px-4 py-3 bg-amber-50 border border-amber-100 rounded-2xl text-[11px] font-semibold text-amber-700 hover:bg-amber-100 transition-colors">
                ⏳ Invitación enviada a {estadoRacha.correoInvitado}, esperando que acepte →
              </button>
            )}

            {/* CHECK-IN EMOCIONAL */}
            {mostrarCheckin && (
              <div className="mt-6 bg-slate-50/70 border border-slate-100/80 rounded-2xl p-4 text-center">
                <h3 className="text-sm font-bold text-[#334155]">{preguntaCheckin}</h3>
                <p className="text-[11px] text-[#8C9BAE] mt-0.5">Registra tu estado emocional</p>
                <div className="flex justify-between items-center gap-1 mt-4 px-1">
                  {emojiEstadosData.map((item) => (
                    <button key={item.estado} onClick={() => manejarClickEmoji(item)} className="flex flex-col items-center group focus:outline-none" title={item.estado}>
                      <span className="text-3xl sm:text-4xl transition-all duration-300 group-hover:scale-125 cursor-pointer select-none active:scale-90 block">{item.emoji}</span>
                      <span className="text-[9px] font-bold text-[#A0AEC0] mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">{item.estado}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* HERRAMIENTAS */}
          <div className="p-6">
            <h4 className="text-xs font-bold text-[#8C9BAE] tracking-widest uppercase mb-4">Herramientas recomendadas</h4>

            {/* Grid 2 columnas */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              {herramientas.filter(i => i.id !== 'crisis').map((item) => (
                <button
                  key={item.id}
                  onClick={() => { if (item.ruta) router.push(item.ruta); }}
                  className="flex flex-col items-start gap-3 p-4 bg-white rounded-2xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all active:scale-[0.98] group shadow-sm text-left"
                >
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 group-hover:bg-white flex items-center justify-center text-2xl shadow-sm transition-all group-hover:scale-110">
                    {mapeoIconos[item.id] || "✨"}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#334155] leading-snug">{item.titulo}</p>
                    <p className="text-[10px] text-[#8C9BAE] mt-0.5 leading-snug">{item.descripcion}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Modo Crisis */}
            <button
              onClick={() => router.push('/modoCrisis.2')}
              className="w-full flex items-center gap-4 p-5 bg-rose-500 hover:bg-rose-600 rounded-2xl transition-all active:scale-[0.99] shadow-md shadow-rose-200 text-left"
            >
              <div className="w-14 h-14 rounded-2xl bg-rose-400/50 flex items-center justify-center text-3xl flex-shrink-0">🚨</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-extrabold text-white">Modo crisis</p>
                <p className="text-xs text-rose-100 mt-0.5">Ayuda inmediata y contención</p>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-rose-200 flex-shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
        </div>

        {/* NAVEGACIÓN INFERIOR */}
        <div className="bg-white border-t border-slate-100 px-6 py-3.5 flex justify-around items-center sm:rounded-b-[40px] z-30 shadow-[0_-6px_20px_rgba(0,0,0,0.03)] flex-shrink-0">
          {navegacionData.map((tab) => {
            const rutasMenu: Record<TabNavegacionId, string> = {
              inicio: "/home", evaluacion: "/evaluacion", perfil: "/perfil", recursos: "/herramientas",
            };
            const activo = tab.id === "inicio";
            return (
              <button key={tab.id} onClick={() => router.push(rutasMenu[tab.id])} className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl transition-all active:scale-95 ${activo ? "text-[#4A72A6]" : "text-[#8C9BAE] hover:text-[#4A72A6]"}`}>
                {tab.id === "inicio" && <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M11.47 3.822a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 0 1-1.06 1.06L20 13.061v6.189a1.75 1.75 0 0 1-1.75 1.75H15.25a.75.75 0 0 1-.75-.75V16.5a.5.5 0 0 0-.5-.5h-2a.5.5 0 0 0-.5.5v3.75a.75.75 0 0 1-.75.75H5.75A1.75 1.75 0 0 1 4 19.25v-6.19l-.56.56a.75.75 0 0 1-1.06-1.06l8.69-8.69Z" /></svg>}
                {tab.id === "evaluacion" && <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M10.5 3.75a.75.75 0 0 0-1.5 0v16.5a.75.75 0 0 0 1.5 0V3.75ZM6 6.75a.75.75 0 0 0-1.5 0v10.5a.75.75 0 0 0 1.5 0V6.75ZM19.5 9.75a.75.75 0 0 0-1.5 0v4.5a.75.75 0 0 0 1.5 0v-4.5ZM15 8.25a.75.75 0 0 0-1.5 0v7.5a.75.75 0 0 0 1.5 0v-7.5Z" /></svg>}
                {tab.id === "perfil" && <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" /></svg>}
                <span className="text-[10px] font-bold tracking-wide">{tab.label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
}