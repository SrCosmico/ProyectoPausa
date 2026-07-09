"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabase";
import {
  calcularEstadoRachaPareja,
  invitarPareja,
  aceptarInvitacionPareja,
} from "@/lib/supabase/racha";
import type { EstadoRachaPareja } from "@/models/racha";

const DIAS_ABBR = ["D", "L", "M", "X", "J", "V", "S"];

export default function RachaPage() {
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [estado, setEstado] = useState<EstadoRachaPareja | null>(null);

  const [correoInvitacion, setCorreoInvitacion] = useState("");
  const [enviandoInvitacion, setEnviandoInvitacion] = useState(false);
  const [aceptando, setAceptando] = useState(false);
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
      await cargarEstado(user.id);
      setCargando(false);
    };
    init();
  }, [router, cargarEstado]);

  const manejarInvitar = async () => {
    if (!userId || !correoInvitacion.trim()) return;
    setEnviandoInvitacion(true);
    setError(null);

    const { error: err } = await invitarPareja(userId, correoInvitacion);

    setEnviandoInvitacion(false);
    if (err) {
      setError("No se pudo enviar la invitación. Intenta de nuevo.");
      return;
    }
    setMensajeExito("¡Invitación enviada! Cuando tu pareja acepte, la racha se activará.");
    await cargarEstado(userId);
  };

  const manejarAceptar = async () => {
    if (!userId) return;
    setAceptando(true);
    setError(null);

    const { error: err } = await aceptarInvitacionPareja();

    setAceptando(false);
    if (err) {
      setError("No encontramos ninguna invitación pendiente para tu correo.");
      return;
    }
    await cargarEstado(userId);
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-md h-screen sm:h-[850px] bg-slate-50 shadow-2xl flex flex-col sm:rounded-[40px] overflow-y-auto">

        <div className="bg-white p-6 border-b border-slate-100">
          <button
            onClick={() => router.push("/home")}
            className="p-2 rounded-full hover:bg-slate-100 transition mb-4 -ml-2"
          >
            ←
          </button>
          <h1 className="text-3xl font-bold text-[#2A3B50]">🔥 Conexión en pareja</h1>
          <p className="text-sm text-slate-500 mt-2">Fortaleciendo su bienestar juntos</p>
        </div>

        <div className="p-6 space-y-5">

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-semibold rounded-xl">
              ⚠️ {error}
            </div>
          )}
          {mensajeExito && (
            <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-semibold rounded-xl">
              ✅ {mensajeExito}
            </div>
          )}

          {!estado?.parejaId && (
            <div className="space-y-4">
              <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-3">
                <h3 className="font-bold text-slate-700">💌 Invita a tu pareja</h3>
                <p className="text-xs text-slate-500">
                  Escribe el correo con el que se registró en Pausa para empezar su racha juntos.
                </p>
                <input
                  type="email"
                  value={correoInvitacion}
                  onChange={(e) => setCorreoInvitacion(e.target.value)}
                  placeholder="correo@ucv.ve"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-orange-400"
                />
                <button
                  onClick={manejarInvitar}
                  disabled={enviandoInvitacion || !correoInvitacion.trim()}
                  className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-300 text-white rounded-xl font-bold text-sm transition-colors"
                >
                  {enviandoInvitacion ? "Enviando..." : "Enviar invitación"}
                </button>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-3">
                <h3 className="font-bold text-slate-700">📩 ¿Ya te invitaron?</h3>
                <p className="text-xs text-slate-500">
                  Si tu pareja ya te envió una invitación a tu correo, acéptala aquí.
                </p>
                <button
                  onClick={manejarAceptar}
                  disabled={aceptando}
                  className="w-full py-3 bg-white border-2 border-orange-400 text-orange-600 hover:bg-orange-50 disabled:opacity-50 rounded-xl font-bold text-sm transition-colors"
                >
                  {aceptando ? "Verificando..." : "Aceptar invitación"}
                </button>
              </div>
            </div>
          )}

          {estado?.esperandoAceptacion && (
            <div className="bg-white rounded-3xl p-6 border border-amber-100 shadow-sm text-center space-y-2">
              <span className="text-4xl">⏳</span>
              <h3 className="font-bold text-slate-700">Esperando confirmación</h3>
              <p className="text-xs text-slate-500">
                Invitaste a <strong>{estado.correoInvitado}</strong>. En cuanto acepte,
                su racha se activará.
              </p>
            </div>
          )}

          {estado?.tieneParejaActiva && (
            <>
              {estado.mensajeMotivador && (
                <div className="bg-gradient-to-r from-orange-400 to-amber-400 rounded-3xl p-4 text-white shadow-lg animate-fadeIn">
                  <p className="text-xs font-bold uppercase tracking-wide opacity-90">
                    ¡Racha activada hoy!
                  </p>
                  <p className="text-sm font-semibold mt-1">{estado.mensajeMotivador}</p>
                </div>
              )}

              <div className="bg-gradient-to-r from-orange-400 to-orange-500 rounded-3xl p-6 text-white shadow-lg">
                <p className="text-sm opacity-90">Racha actual con {estado.nombrePareja}</p>
                <h2 className="text-5xl font-extrabold mt-2">{estado.rachaActual}</h2>
                <p className="mt-2 text-orange-100">
                  {estado.rachaActual === 1 ? "día seguido" : "días seguidos"}
                </p>
                <div className="mt-4 pt-4 border-t border-white/20 flex justify-between text-xs font-semibold">
                  <span>🏆 Récord: {estado.rachaMaxima} días</span>
                  <span>🛡️ {estado.protectoresDisponibles}/4 protectores este mes</span>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
                <h3 className="font-bold text-slate-700 mb-4">📈 Últimos 7 días</h3>
                <div className="grid grid-cols-7 gap-2">
                  {estado.historialDias.map((dia) => {
                    const fechaObj = new Date(dia.fecha + "T12:00:00");
                    const letraDia = DIAS_ABBR[fechaObj.getDay()];
                    return (
                      <div key={dia.fecha} className="flex flex-col items-center gap-1.5">
                        <span className="text-[10px] font-bold text-slate-400">{letraDia}</span>
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center text-base ${
                            dia.antesDePareja
                              ? "bg-slate-50 opacity-40"
                              : dia.completo
                              ? "bg-emerald-100"
                              : dia.protegido
                              ? "bg-blue-100"
                              : "bg-slate-100"
                          }`}
                          title={
                            dia.antesDePareja
                              ? "Antes de formar pareja"
                              : dia.completo
                              ? "Ambos registraron su emoción"
                              : dia.protegido
                              ? "Protegido con racha protectora"
                              : "Día incompleto"
                          }
                        >
                          {dia.antesDePareja ? "—" : dia.completo ? "🔥" : dia.protegido ? "🛡️" : "·"}
                        </div>
                        {!dia.antesDePareja && (
                          <div className="flex gap-0.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${dia.yoRegistre ? "bg-emerald-400" : "bg-slate-200"}`} />
                            <span className={`w-1.5 h-1.5 rounded-full ${dia.parejaRegistro ? "bg-emerald-400" : "bg-slate-200"}`} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <p className="text-[10px] text-slate-400 mt-4 text-center">
                  Cada puntito representa tu registro y el de tu pareja ese día.
                </p>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
                <h3 className="font-bold text-slate-700 mb-3">🛡️ Protectores de racha</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Cada mes tienen <strong>4 protectores</strong>. Si un día alguno olvida
                  registrar su emoción, se usa automáticamente uno para que la racha no se rompa.
                  Este mes han usado <strong>{estado.protectoresUsadosEsteMes}</strong>.
                </p>
              </div>

              {!estado.activadaHoy && (
                <button
                  onClick={() => router.push("/comoTeSientesHoy")}
                  className="w-full py-4 bg-[#4A72A6] hover:bg-[#3B5E8C] text-white rounded-2xl font-bold text-sm shadow-md transition-colors"
                >
                  Registrar cómo me siento hoy →
                </button>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
}