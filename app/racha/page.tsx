"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import supabase from "@/lib/supabase";
import {
  calcularEstadoRachaPareja,
  invitarPareja,
  aceptarInvitacionPareja,
  validarInvitacion,
  cancelarInvitacion,
} from "@/lib/supabase/racha";
import type { EstadoRachaPareja } from "@/models/racha";

const DIAS_ABBR = ["D", "L", "M", "X", "J", "V", "S"];
const AVATAR_DEFAULT =
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80";

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
  const [cancelando, setCancelando] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  const cargarEstado = useCallback(async (uid: string) => {
    const resultado = await calcularEstadoRachaPareja(uid);
    setEstado(resultado);
  }, []);

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUserId(user.id);
      setUserEmail(user.email || null);
      await cargarEstado(user.id);
      setCargando(false);
    };
    init();
  }, [router, cargarEstado]);

  const manejarInvitar = async () => {
    if (!userId || !userEmail || !correoInvitacion.trim()) return;

    setError(null);
    setMensajeExito(null);
    setEnviandoInvitacion(true);

    const resValidacion = await validarInvitacion(userEmail, correoInvitacion);
    if (!resValidacion.ok) {
      setEnviandoInvitacion(false);
      setError(resValidacion.mensaje || "Error al procesar la invitación.");
      return;
    }

    const { error: err } = await invitarPareja(userId, correoInvitacion.trim().toLowerCase());

    setEnviandoInvitacion(false);

    if (err) {
      setError("No se pudo enviar la invitación. Inténtalo de nuevo.");
      return;
    }

    setMensajeExito("¡Invitación enviada! Cuando tu amigo acepte, la racha se activará.");
    setCorreoInvitacion("");
    await cargarEstado(userId);
  };

  const manejarAceptar = async (id?: string) => {
    if (!userId) return;
    if (id) setAceptandoId(id);
    setError(null);

    const { error: err } = await aceptarInvitacionPareja();

    setAceptandoId(null);
    if (err) {
      setError("No encontramos ninguna invitación pendiente para tu correo.");
      return;
    }
    setMensajeExito("¡Invitación aceptada! La racha con tu amigo está activa.");
    await cargarEstado(userId);
  };

  const manejarRechazar = async (id: string) => {
    if (!userId) return;
    setRechazandoId(id);
    setError(null);

    const { error: err } = await supabase
      .from("parejas")
      .delete()
      .eq("id", id);

    setRechazandoId(null);
    if (err) {
      setError("Ocurrió un problema al rechazar la invitación.");
      return;
    }
    await cargarEstado(userId);
  };

  // ✅ FIX: usa cancelarInvitacion del servicio y resetea estado local antes de recargar
  const manejarCancelar = async () => {
    if (!userId || !estado?.parejaId) {
      setError("No hay invitación para cancelar");
      return;
    }

    setCancelando(true);
    setError(null);
    setMensajeExito(null);

    const { exito, error: errCancelar } = await cancelarInvitacion(estado.parejaId);

    if (!exito) {
      setCancelando(false);
      setError(errCancelar || "No se pudo cancelar la invitación.");
      return;
    }

    // Reset inmediato del estado local para que la UI se actualice de inmediato
    setEstado(null);
    setMensajeExito("¡Invitación cancelada correctamente!");
    setCancelando(false);

    // Recargar desde Supabase para confirmar el estado real
    await cargarEstado(userId);
  };

  const invitacionRecibida = !!(
    estado?.esperandoAceptacion &&
    !estado?.tieneParejaActiva &&
    userEmail &&
    estado.correoInvitado === userEmail
  );

  const invitacionPendienteEnviada = !!(
    estado?.esperandoAceptacion &&
    userEmail &&
    estado.correoInvitado !== userEmail
  );

  if (cargando) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-medium">Cargando racha...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex justify-center p-0 sm:p-4">
      <div className="w-full max-w-md bg-[#F8FAFC] min-h-screen sm:min-h-[850px] sm:max-h-[900px] shadow-2xl sm:rounded-[40px] border border-slate-100 flex flex-col overflow-y-auto">

        {/* Encabezado */}
        <header className="bg-white px-6 pt-6 pb-5 border-b border-slate-100 flex items-center gap-3.5 sticky top-0 z-10 backdrop-blur-md bg-white/90">
          <button
            onClick={() => router.push("/home")}
            className="w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 active:scale-95 text-slate-600 border border-slate-200/60 flex items-center justify-center transition-all flex-shrink-0 shadow-sm"
            aria-label="Volver"
          >
            <svg className="w-5 h-5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-800 leading-tight">🔥 Racha con amigos</h1>
            <p className="text-xs text-slate-400 font-medium">Fortaleciendo su bienestar juntos</p>
          </div>
        </header>

        <div className="p-6 space-y-6">

          {/* Banners */}
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-semibold rounded-2xl flex items-center gap-2">
              <span>⚠️</span>
              <p className="leading-snug">{error}</p>
            </div>
          )}
          {mensajeExito && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold rounded-2xl flex items-center gap-2">
              <span>✅</span>
              <p className="leading-snug">{mensajeExito}</p>
            </div>
          )}

          {/* SECCIÓN 1: Racha Activa o Estado Inicial */}
          <section className="space-y-3">
            {estado?.tieneParejaActiva ? (
              <div className="bg-gradient-to-br from-orange-400 to-amber-500 rounded-[32px] p-6 text-white shadow-lg space-y-5">

                {estado.mensajeMotivador && (
                  <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl px-3.5 py-2 text-xs font-medium text-orange-50 inline-flex items-center gap-2">
                    <span>🌟</span> {estado.mensajeMotivador}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-white/40 shadow-inner bg-orange-300">
                      <Image src={AVATAR_DEFAULT} alt={estado.nombrePareja || "Amigo"} fill className="object-cover" />
                    </div>
                    <div>
                      <span className="text-xs text-orange-100 font-medium">Compartida con</span>
                      <h3 className="text-lg font-bold leading-tight">{estado.nombrePareja}</h3>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-4xl font-black tracking-tight">{estado.rachaActual}</span>
                    <p className="text-[10px] uppercase font-bold text-orange-100 tracking-wider">
                      {estado.rachaActual === 1 ? "Día" : "Días"}
                    </p>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15">
                  <p className="text-[11px] font-semibold text-orange-100 mb-3 text-center">Últimos 7 días</p>
                  <div className="grid grid-cols-7 gap-1.5">
                    {estado.historialDias.map((dia) => {
                      const fechaObj = new Date(dia.fecha + "T12:00:00");
                      const letraDia = DIAS_ABBR[fechaObj.getDay()];
                      return (
                        <div key={dia.fecha} className="flex flex-col items-center gap-1.5">
                          <span className="text-[10px] font-bold text-orange-100/70">{letraDia}</span>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all ${
                            dia.antesDePareja ? "bg-white/10 opacity-30"
                            : dia.completo ? "bg-white text-orange-600 font-bold"
                            : dia.protegido ? "bg-blue-400/30 text-white"
                            : "bg-black/10"
                          }`}>
                            {dia.antesDePareja ? "—" : dia.completo ? "🔥" : dia.protegido ? "🛡️" : "·"}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2 border-t border-white/20 flex items-center justify-between text-xs font-medium text-orange-100">
                  <span>🏆 Récord: <strong className="text-white">{estado.rachaMaxima} días</strong></span>
                  <span>🛡️ Protectores: <strong className="text-white">{estado.protectoresDisponibles}/4</strong></span>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm text-center space-y-2">
                <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-xl mx-auto text-orange-500">🔥</div>
                <h3 className="text-sm font-bold text-slate-800">Aún no tienes una racha activa</h3>
                <p className="text-xs text-slate-400 max-w-[240px] mx-auto">
                  La racha siempre se construye con un amigo. ¡Invítalo para empezar juntos!
                </p>
              </div>
            )}
          </section>

          {/* SECCIÓN 2: Mis Amigos */}
          <section className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">👥 Mis amigos</h2>

            {estado?.tieneParejaActiva ? (
              <div className="bg-white rounded-[28px] p-4 border border-slate-100 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-slate-100 border border-slate-100">
                    <Image src={AVATAR_DEFAULT} alt="Avatar" fill className="object-cover" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">{estado.nombrePareja}</h3>
                    <span className="text-xs text-slate-400">🔥 {estado.rachaActual} días de racha</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[11px] font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  🟢 Activo
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-[28px] p-6 border border-slate-100 shadow-sm text-center space-y-2">
                <span className="text-2xl">👥</span>
                <p className="text-xs font-medium text-slate-600">Todavía no tienes amigos agregados</p>
                <p className="text-[11px] text-slate-400">Invita a un amigo para comenzar una racha juntos.</p>
              </div>
            )}
          </section>

          {/* SECCIÓN 3: Invitaciones */}
          <section className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">📩 Invitaciones</h2>

            {/* Recibidas */}
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 px-1">Recibidas</span>
              {invitacionRecibida ? (
                <div className="bg-white rounded-[28px] p-4 border border-orange-100 shadow-sm space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-slate-100">
                      <Image src={AVATAR_DEFAULT} alt="Invitante" fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-800 truncate">Tu amigo te ha invitado</h4>
                      <p className="text-[11px] text-slate-400 truncate">{estado.correoInvitado}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => manejarAceptar()}
                      disabled={!!aceptandoId}
                      className="py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-xs transition-colors shadow-sm disabled:opacity-50"
                    >
                      {aceptandoId ? "Aceptando..." : "Aceptar"}
                    </button>
                    <button
                      onClick={() => manejarRechazar("id_pendiente")}
                      disabled={!!rechazandoId}
                      className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-xs transition-colors disabled:opacity-50"
                    >
                      Rechazar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-[24px] p-4 border border-slate-100 shadow-sm flex items-center gap-3">
                  <span className="text-lg">📬</span>
                  <p className="text-xs text-slate-400">Aún no has recibido invitaciones.</p>
                </div>
              )}
            </div>

            {/* Pendientes enviadas */}
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 px-1">Invitaciones pendientes</span>
              {invitacionPendienteEnviada ? (
                <div className="bg-white rounded-[24px] p-4 border border-slate-100 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 text-sm font-bold flex-shrink-0">⏳</div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-700 truncate">{estado.correoInvitado}</p>
                      <span className="text-[10px] text-slate-400 block">Pendiente de aceptación</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[10px] bg-amber-50 text-amber-700 font-semibold px-2.5 py-1 rounded-full">Pendiente</span>
                    <button
                      onClick={manejarCancelar}
                      disabled={cancelando}
                      className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold transition-colors disabled:opacity-50 active:scale-95"
                    >
                      {cancelando ? "..." : "Cancelar"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-[24px] p-4 border border-slate-100 shadow-sm flex items-center gap-3">
                  <span className="text-lg">📭</span>
                  <p className="text-xs text-slate-400">No tienes invitaciones pendientes.</p>
                </div>
              )}
            </div>
          </section>

          {/* SECCIÓN 4: Invitar Amigo */}
          <section className="pt-2">
            <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500 text-lg">➕</div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Invitar amigo</h3>
                  <p className="text-xs text-slate-400">Escribe su correo para iniciar su racha juntos</p>
                </div>
              </div>
              <div className="space-y-3">
                <input
                  type="email"
                  value={correoInvitacion}
                  onChange={(e) => setCorreoInvitacion(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-orange-400 focus:bg-white transition-all"
                />
                <button
                  onClick={manejarInvitar}
                  disabled={enviandoInvitacion || !correoInvitacion.trim() || !!estado?.tieneParejaActiva}
                  className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-200 text-white rounded-2xl font-bold text-xs transition-all shadow-md shadow-orange-500/10 disabled:shadow-none disabled:text-slate-400"
                >
                  {enviandoInvitacion ? "Enviando..." : "Enviar invitación"}
                </button>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}