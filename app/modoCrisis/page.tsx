"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabase";
import {
  calcularEstadoRachaPareja,
  invitarPareja,
  aceptarInvitacionPareja,
  rechazarInvitacionPareja,
  validarInvitacion,
  cancelarInvitacion,
  usarProtector,
} from "@/lib/supabase/racha";
import type { EstadoRachaPareja, ParejaActivaInfo, ParejaPendienteInfo } from "@/models/racha";

const DIAS_ABBR = ["D", "L", "M", "X", "J", "V", "S"];

function AvatarIcono({ nombre, avatar, size = "md" }: { nombre?: string | null; avatar?: string | null; size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "w-9 h-9 text-sm", md: "w-12 h-12 text-base", lg: "w-14 h-14 text-xl" };
  const inicial = nombre?.charAt(0).toUpperCase() ?? "?";
  if (avatar) {
    return (
      <div className={`${sizes[size]} rounded-2xl overflow-hidden flex-shrink-0`}>
        <img src={avatar} alt={nombre ?? "Avatar"} className="w-full h-full object-cover" />
      </div>
    );
  }
  return (
    <div className={`${sizes[size]} rounded-2xl bg-orange-100 flex items-center justify-center font-bold text-orange-600 flex-shrink-0`}>
      {inicial}
    </div>
  );
}

// ─── Tarjeta de racha activa ──────────────────────────────────────────────────

function TarjetaRacha({
  pareja,
  onUsarProtector,
  usandoProtector,
}: {
  pareja: ParejaActivaInfo;
  onUsarProtector?: (parejaId: string, historialDias: ParejaActivaInfo["historialDias"]) => void;
  usandoProtector?: boolean;
}) {
  const hoyStr = new Date().toISOString().split("T")[0];
  const hayDiaPendienteQueProteger = pareja.historialDias.some(
    (d) => d.fecha !== hoyStr && !d.completo && !d.protegido && !d.antesDePareja
  );

  return (
    <div className="bg-gradient-to-br from-orange-400 to-amber-500 rounded-[32px] p-6 text-white shadow-lg space-y-4">
      {pareja.mensajeMotivador && (
        <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl px-3.5 py-2 text-xs font-medium text-orange-50 inline-flex items-center gap-2">
          <span>🌟</span> {pareja.mensajeMotivador}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <AvatarIcono nombre={pareja.nombrePareja} avatar={pareja.avatarPareja} size="lg" />
          <div>
            <span className="text-xs text-orange-100 font-medium">Compartida con</span>
            <h3 className="text-lg font-bold leading-tight">{pareja.nombrePareja}</h3>
          </div>
        </div>
        <div className="text-right">
          <span className="text-4xl font-black tracking-tight">{pareja.rachaActual}</span>
          <p className="text-[10px] uppercase font-bold text-orange-100 tracking-wider">
            {pareja.rachaActual === 1 ? "Día" : "Días"}
          </p>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15">
        <p className="text-[11px] font-semibold text-orange-100 mb-3 text-center">Últimos 7 días</p>
        <div className="grid grid-cols-7 gap-1.5">
          {pareja.historialDias.map((dia) => {
            const fechaObj = new Date(dia.fecha + "T12:00:00");
            const letraDia = DIAS_ABBR[fechaObj.getDay()];
            return (
              <div key={dia.fecha} className="flex flex-col items-center gap-1.5">
                <span className="text-[10px] font-bold text-orange-100/70">{letraDia}</span>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all ${
                  dia.completo ? "bg-white text-orange-600 font-bold"
                  : dia.protegido ? "bg-blue-400/30 text-white"
                  : "bg-black/10"
                }`}>
                  {dia.completo ? "🔥" : dia.protegido ? "🛡️" : "·"}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pt-2 border-t border-white/20 flex items-center justify-between text-xs font-medium text-orange-100">
        <span>🏆 Récord: <strong className="text-white">{pareja.rachaMaxima} días</strong></span>
        <span>🛡️ Protectores: <strong className="text-white">{pareja.protectoresUsados}/4</strong></span>
      </div>

      {pareja.protectoresDisponibles > 0 && hayDiaPendienteQueProteger && (
        <button
          onClick={() => onUsarProtector?.(pareja.parejaId, pareja.historialDias)}
          disabled={usandoProtector}
          className="w-full py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl font-bold text-xs transition-all disabled:opacity-50"
        >
          {usandoProtector ? "Activando..." : "🛡️ Usar protector"}
        </button>
      )}
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function RachaPage() {
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [estado, setEstado] = useState<EstadoRachaPareja | null>(null);

  const [correoInvitacion, setCorreoInvitacion] = useState("");
  const [enviandoInvitacion, setEnviandoInvitacion] = useState(false);
  const [aceptandoId, setAceptandoId] = useState<string | null>(null);
  const [rechazandoId, setRechazandoId] = useState<string | null>(null);
  const [cancelandoId, setCancelAndoId] = useState<string | null>(null);
  const [usandoProtectorId, setUsandoProtectorId] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  const cargarEstado = useCallback(async (uid: string) => {
    const resultado = await calcularEstadoRachaPareja(uid);
    setEstado(resultado);
  }, []);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setUserId(user.id);
      setUserEmail(user.email || null);
      await cargarEstado(user.id);
      setCargando(false);
    };
    init();
  }, [router, cargarEstado]);

  const manejarInvitar = async () => {
    if (!userId || !userEmail || !correoInvitacion.trim()) return;
    setError(null); setMensajeExito(null); setEnviandoInvitacion(true);

    const resValidacion = await validarInvitacion(userEmail, correoInvitacion);
    if (!resValidacion.ok) { setEnviandoInvitacion(false); setError(resValidacion.mensaje || "Error."); return; }

    const { error: err } = await invitarPareja(userId, correoInvitacion.trim().toLowerCase());
    setEnviandoInvitacion(false);
    if (err) {
      // La restricción única en la base de datos evita invitaciones
      // duplicadas al mismo correo; se lo mostramos claro al usuario.
      const mensaje = err.message?.includes("duplicate")
        ? "Ya le enviaste una invitación pendiente a este correo."
        : "No se pudo enviar la invitación.";
      setError(mensaje);
      return;
    }

    setMensajeExito("¡Invitación enviada! Cuando tu amigo acepte, la racha se activará.");
    setCorreoInvitacion("");
    await cargarEstado(userId);
  };

  const manejarAceptar = async (parejaId: string) => {
    if (!userId) return;
    setAceptandoId(parejaId); setError(null);
    const { error: err } = await aceptarInvitacionPareja(parejaId);
    setAceptandoId(null);
    if (err) { setError("No se pudo aceptar la invitación."); return; }
    setMensajeExito("¡Invitación aceptada! La racha está activa.");
    await cargarEstado(userId);
  };

  // Antes esto hacía un DELETE directo desde el cliente, lo cual fallaba
  // silenciosamente para quien RECIBE la invitación (bloqueado por RLS,
  // ver fix_racha_definitivo.sql). Ahora usa la función que identifica la
  // invitación por el correo del usuario autenticado.
  const manejarRechazar = async (parejaId: string) => {
    if (!userId) return;
    setRechazandoId(parejaId); setError(null);
    const { error: err } = await rechazarInvitacionPareja();
    setRechazandoId(null);
    if (err) { setError("No se pudo rechazar la invitación."); return; }
    await cargarEstado(userId);
  };

  const manejarCancelar = async (parejaId: string) => {
    if (!userId) return;
    setCancelAndoId(parejaId); setError(null); setMensajeExito(null);
    const { exito, error: errCancelar } = await cancelarInvitacion(parejaId);
    if (!exito) { setCancelAndoId(null); setError(errCancelar || "No se pudo cancelar."); return; }
    setMensajeExito("¡Invitación cancelada!");
    setCancelAndoId(null);
    await cargarEstado(userId);
  };

  const manejarUsarProtector = async (parejaId: string, historialDias: ParejaActivaInfo["historialDias"]) => {
    if (!userId) return;
    const hoyStr = new Date().toISOString().split("T")[0];
    const diaFaltante = [...historialDias]
      .reverse()
      .find((d) => d.fecha !== hoyStr && !d.completo && !d.protegido && !d.antesDePareja);

    if (!diaFaltante) { setError("No hay ningún día pendiente que proteger."); return; }

    setUsandoProtectorId(parejaId); setError(null); setMensajeExito(null);
    const { ok, mensaje } = await usarProtector(parejaId, diaFaltante.fecha);
    setUsandoProtectorId(null);

    if (!ok) { setError(mensaje || "No se pudo usar el protector."); return; }
    setMensajeExito("🛡️ ¡Protector activado! Ese día ya no rompe la racha.");
    await cargarEstado(userId);
  };

  const recibidas = estado?.parejasPendientes?.filter(p => p.soyReceptor) ?? [];
  const enviadas = estado?.parejasPendientes?.filter(p => !p.soyReceptor) ?? [];

  if (cargando) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="w-9 h-9 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex justify-center p-0 sm:p-4">
      <div className="relative w-full max-w-md bg-[#F8FAFC] min-h-screen sm:min-h-[850px] shadow-2xl sm:rounded-[40px] border border-slate-100 flex flex-col overflow-hidden">

        {/* FONDO DECORATIVO — ramitas repartidas por toda la pantalla */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <img
            src="/images/ramita_izquierda.png"
            alt=""
            aria-hidden="true"
            className="absolute top-[2%] -left-8 w-36 sm:w-40 h-auto opacity-60 select-none -rotate-12"
          />
          <img
            src="/images/ramita_derecha.png"
            alt=""
            aria-hidden="true"
            className="absolute top-[20%] -right-10 w-36 sm:w-40 h-auto opacity-55 select-none rotate-6"
          />
          <img
            src="/images/ramita_izquierda.png"
            alt=""
            aria-hidden="true"
            className="absolute top-[42%] -left-10 w-32 sm:w-36 h-auto opacity-50 select-none rotate-[15deg] scale-x-[-1]"
          />
          <img
            src="/images/ramita_derecha.png"
            alt=""
            aria-hidden="true"
            className="absolute top-[65%] -right-8 w-32 sm:w-36 h-auto opacity-50 select-none -rotate-[8deg]"
          />
          <img
            src="/images/ramita_izquierda.png"
            alt=""
            aria-hidden="true"
            className="absolute bottom-[2%] -left-8 w-36 sm:w-40 h-auto opacity-60 select-none rotate-[25deg]"
          />
        </div>

        {/* CONTENIDO */}
        <div className="relative z-10 flex flex-col h-full overflow-y-auto">

          {/* Header */}
          <header className="bg-white/90 backdrop-blur-sm px-6 pt-6 pb-5 border-b border-slate-100 flex items-center gap-3.5 sticky top-0 z-10">
            <button onClick={() => router.push("/home")} className="w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 active:scale-95 text-slate-600 border border-slate-200/60 flex items-center justify-center transition-all flex-shrink-0">
              <svg className="w-5 h-5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-800">🔥 Racha con amigos</h1>
              <p className="text-xs text-slate-400 font-medium">Fortaleciendo su bienestar juntos</p>
            </div>
          </header>

          <div className="p-6 space-y-6">

            {/* Banners */}
            {error && (
              <div className="p-3.5 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-semibold rounded-2xl flex items-center gap-2">
                <span>⚠️</span><p>{error}</p>
              </div>
            )}
            {mensajeExito && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold rounded-2xl flex items-center gap-2">
                <span>✅</span><p>{mensajeExito}</p>
              </div>
            )}

            {/* RACHAS ACTIVAS */}
            <section className="space-y-3">
              {estado?.parejasActivas && estado.parejasActivas.length > 0 ? (
                estado.parejasActivas.map(pareja => (
                  <TarjetaRacha
                    key={pareja.parejaId}
                    pareja={pareja}
                    onUsarProtector={manejarUsarProtector}
                    usandoProtector={usandoProtectorId === pareja.parejaId}
                  />
                ))
              ) : (
                <div className="bg-white/90 backdrop-blur-sm rounded-[32px] p-6 border border-slate-100 shadow-sm text-center space-y-2">
                  <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-xl mx-auto">🔥</div>
                  <h3 className="text-sm font-bold text-slate-800">Aún no tienes una racha activa</h3>
                  <p className="text-xs text-slate-400 max-w-[240px] mx-auto">¡Invita a un amigo para empezar juntos!</p>
                </div>
              )}
            </section>

            {/* MIS AMIGOS */}
            <section className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">👥 Mis amigos</h2>
              {estado?.parejasActivas && estado.parejasActivas.length > 0 ? (
                estado.parejasActivas.map(pareja => (
                  <div key={pareja.parejaId} className="bg-white/90 backdrop-blur-sm rounded-[28px] p-4 border border-slate-100 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-3.5">
                      <AvatarIcono nombre={pareja.nombrePareja} avatar={pareja.avatarPareja} size="md" />
                      <div>
                        <h3 className="text-sm font-bold text-slate-800">{pareja.nombrePareja}</h3>
                        <span className="text-xs text-slate-400">🔥 {pareja.rachaActual} días de racha</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[11px] font-bold">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      🟢 Activo
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white/90 backdrop-blur-sm rounded-[28px] p-6 border border-slate-100 shadow-sm text-center space-y-2">
                  <span className="text-2xl">👥</span>
                  <p className="text-xs font-medium text-slate-600">Todavía no tienes amigos agregados</p>
                </div>
              )}
            </section>

            {/* INVITACIONES */}
            <section className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">📩 Invitaciones</h2>

              {/* Recibidas */}
              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-slate-400 px-1">Recibidas</span>
                {recibidas.length > 0 ? recibidas.map(p => (
                  <div key={p.parejaId} className="bg-white/90 backdrop-blur-sm rounded-[28px] p-4 border border-orange-100 shadow-sm space-y-3">
                    <div className="flex items-center gap-3">
                      <AvatarIcono nombre="?" size="sm" />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-slate-800">Tu amigo te ha invitado</h4>
                        <p className="text-[11px] text-slate-400 truncate">{p.correoInvitado}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => manejarAceptar(p.parejaId)}
                        disabled={aceptandoId === p.parejaId}
                        className="py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-xs disabled:opacity-50"
                      >
                        {aceptandoId === p.parejaId ? "Aceptando..." : "Aceptar"}
                      </button>
                      <button
                        onClick={() => manejarRechazar(p.parejaId)}
                        disabled={rechazandoId === p.parejaId}
                        className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-xs disabled:opacity-50"
                      >
                        {rechazandoId === p.parejaId ? "..." : "Rechazar"}
                      </button>
                    </div>
                  </div>
                )) : (
                  <div className="bg-white/90 backdrop-blur-sm rounded-[24px] p-4 border border-slate-100 shadow-sm flex items-center gap-3">
                    <span className="text-lg">📬</span>
                    <p className="text-xs text-slate-400">Aún no has recibido invitaciones.</p>
                  </div>
                )}
              </div>

              {/* Enviadas */}
              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-slate-400 px-1">Invitaciones pendientes</span>
                {enviadas.length > 0 ? enviadas.map(p => (
                  <div key={p.parejaId} className="bg-white/90 backdrop-blur-sm rounded-[24px] p-4 border border-slate-100 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 text-sm font-bold flex-shrink-0">⏳</div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-700 truncate">{p.correoInvitado}</p>
                        <span className="text-[10px] text-slate-400">Pendiente de aceptación</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[10px] bg-amber-50 text-amber-700 font-semibold px-2.5 py-1 rounded-full">Pendiente</span>
                      <button
                        onClick={() => manejarCancelar(p.parejaId)}
                        disabled={cancelandoId === p.parejaId}
                        className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold disabled:opacity-50"
                      >
                        {cancelandoId === p.parejaId ? "..." : "Cancelar"}
                      </button>
                    </div>
                  </div>
                )) : (
                  <div className="bg-white/90 backdrop-blur-sm rounded-[24px] p-4 border border-slate-100 shadow-sm flex items-center gap-3">
                    <span className="text-lg">📭</span>
                    <p className="text-xs text-slate-400">No tienes invitaciones pendientes.</p>
                  </div>
                )}
              </div>
            </section>

            {/* INVITAR */}
            <section className="pt-2">
              <div className="bg-white/90 backdrop-blur-sm rounded-[32px] p-6 border border-slate-100 shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500 text-lg">➕</div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Invitar amigo</h3>
                    <p className="text-xs text-slate-400">Escribe su correo para iniciar su racha juntos</p>
                  </div>
                </div>
                <input
                  type="email"
                  value={correoInvitacion}
                  onChange={(e) => setCorreoInvitacion(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-orange-400 focus:bg-white transition-all"
                />
                <button
                  onClick={manejarInvitar}
                  disabled={enviandoInvitacion || !correoInvitacion.trim()}
                  className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-200 text-white rounded-2xl font-bold text-xs transition-all disabled:text-slate-400"
                >
                  {enviandoInvitacion ? "Enviando..." : "Enviar invitación"}
                </button>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}