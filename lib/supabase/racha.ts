import supabase from "@/lib/supabase";
import type { EstadoRachaPareja } from "@/models/racha";
import { obtenerMensajeMotivadorAleatorio } from "@/models/racha";

// ==========================================
// Todas las funciones de este archivo son ahora "delgadas": la lógica de
// cálculo de racha, protectores e invitaciones vive en el servidor
// (funciones RPC de Postgres), no en el cliente. Esto es intencional:
//
//  - El cálculo de racha depende de comparar fechas día a día. Hacerlo en
//    JS en el navegador es frágil ante zonas horarias distintas entre el
//    dispositivo del usuario y su pareja. Hacerlo en Postgres con una sola
//    zona horaria de referencia (America/Caracas) elimina esa clase de bug.
//  - Los protectores y las invitaciones ahora se escriben en una sola
//    transacción atómica del lado del servidor, evitando el problema de
//    antes donde dos rutas de código distintas escribían las mismas
//    columnas de forma incompatible.
// ==========================================

export async function calcularEstadoRachaPareja(uid: string): Promise<EstadoRachaPareja | null> {
  const { data, error } = await supabase.rpc("estado_racha_usuario", { p_user_id: uid });

  if (error || !data) {
    console.error("Error al calcular el estado de la racha:", error);
    return null;
  }

  const parejasActivas = (data.parejasActivas ?? []).map((p: any) => ({
    ...p,
    // El mensaje motivador es puramente decorativo, así que se elige en el
    // cliente para no gastar ciclos del servidor en algo sin lógica real.
    mensajeMotivador: p.rachaActual > 0 ? obtenerMensajeMotivadorAleatorio() : "",
  }));

  return {
    parejaId: parejasActivas[0]?.parejaId ?? null,
    tieneParejaActiva: parejasActivas.length > 0,
    esperandoAceptacion: (data.parejasPendientes ?? []).some((p: any) => !p.soyReceptor),
    correoInvitado: parejasActivas[0]?.correoInvitado ?? null,
    nombrePareja: parejasActivas[0]?.nombrePareja ?? null,
    avatarPareja: parejasActivas[0]?.avatarPareja ?? null,
    rachaActual: parejasActivas[0]?.rachaActual ?? 0,
    rachaMaxima: parejasActivas[0]?.rachaMaxima ?? 0,
    protectoresDisponibles: parejasActivas[0]?.protectoresDisponibles ?? 4,
    protectoresUsadosEsteMes: parejasActivas[0]?.protectoresUsados ?? 0,
    activadaHoy: parejasActivas[0]?.historialDias?.at(-1)?.completo ?? false,
    historialDias: parejasActivas[0]?.historialDias ?? [],
    mensajeMotivador: parejasActivas[0]?.mensajeMotivador ?? null,
    soyReceptor: parejasActivas[0]?.soyReceptor,
    parejasActivas,
    parejasPendientes: data.parejasPendientes ?? [],
  };
}

export async function validarInvitacion(
  miCorreo: string,
  correoInvitado: string
): Promise<{ ok: boolean; mensaje?: string }> {
  const correo = correoInvitado.trim().toLowerCase();
  const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!regexCorreo.test(correo)) {
    return { ok: false, mensaje: "Ingresa un correo válido." };
  }
  if (correo === miCorreo.trim().toLowerCase()) {
    return { ok: false, mensaje: "No puedes invitarte a ti mismo." };
  }
  return { ok: true };
}

export async function invitarPareja(userId: string, correoInvitado: string) {
  const { error } = await supabase
    .from("parejas")
    .insert({ user_id_1: userId, correo_invitado: correoInvitado, estado: "pendiente" });

  return { error };
}

// El parámetro se mantiene por compatibilidad con la UI existente, pero la
// función del servidor identifica la invitación a aceptar por el correo del
// usuario autenticado (auth.jwt() ->> 'email'), no por el id recibido aquí.
export async function aceptarInvitacionPareja(_parejaId: string) {
  const { error } = await supabase.rpc("aceptar_invitacion_pareja");
  return { error };
}

// Antes esto se resolvía con un DELETE directo desde el cliente, lo cual
// fallaba para quien RECIBE la invitación porque las políticas RLS de
// `parejas` exigen auth.uid() = user_id_1 o user_id_2 — y user_id_2 sigue
// siendo NULL hasta que se acepta. Ahora usa una función que verifica por
// correo electrónico, igual que aceptar_invitacion_pareja.
export async function rechazarInvitacionPareja() {
  const { error } = await supabase.rpc("rechazar_invitacion_pareja");
  return { error };
}

export async function cancelarInvitacion(parejaId: string): Promise<{ exito: boolean; error?: string }> {
  // Quien cancela aquí es siempre el remitente (user_id_1), a quien las
  // políticas RLS sí le permiten borrar directamente.
  const { error } = await supabase.from("parejas").delete().eq("id", parejaId);
  if (error) return { exito: false, error: error.message };
  return { exito: true };
}

export async function usarProtector(
  parejaId: string,
  fecha: string
): Promise<{ ok: boolean; mensaje?: string }> {
  const { error } = await supabase.rpc("usar_protector_racha", {
    p_pareja_id: parejaId,
    p_fecha: fecha,
  });

  if (error) {
    return { ok: false, mensaje: error.message };
  }
  return { ok: true };
}