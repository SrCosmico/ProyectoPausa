import { createClient } from '@/lib/supabase/client';
import type { EstadoRachaPareja, DiaRacha } from '@/models/racha';

const supabase = createClient();

// ─── Validar invitación ───────────────────────────────────────────────────────
// ✅ Usa la función SQL buscar_usuario_por_email para buscar en auth.users

export async function validarInvitacion(
  correoEmisor: string,
  correoInvitado: string
): Promise<{ ok: boolean; mensaje?: string }> {

  if (!correoInvitado?.trim()) {
    return { ok: false, mensaje: 'Ingresa un correo válido.' };
  }

  const correoNormalizado = correoInvitado.trim().toLowerCase();

  if (correoNormalizado === correoEmisor.toLowerCase()) {
    return { ok: false, mensaje: 'No puedes invitarte a ti mismo.' };
  }

  // ✅ Buscar en auth.users usando la función SECURITY DEFINER
  const { data: usuarioId, error: errBusqueda } = await supabase
    .rpc('buscar_usuario_por_email', { correo: correoNormalizado });

  if (errBusqueda || !usuarioId) {
    return {
      ok: false,
      mensaje: 'No encontramos ningún usuario registrado con ese correo en Pausa.',
    };
  }

  // Verificar que no tenga ya una pareja activa o invitación pendiente
  const { data: parejaExistente } = await supabase
    .from('parejas')
    .select('id, estado')
    .or(
      `user_id_1.eq.${usuarioId},user_id_2.eq.${usuarioId}`
    )
    .in('estado', ['activa', 'pendiente'])
    .maybeSingle();

  if (parejaExistente) {
    return {
      ok: false,
      mensaje: 'Ese usuario ya tiene una racha activa o una invitación pendiente.',
    };
  }

  return { ok: true };
}

// ─── Invitar pareja ───────────────────────────────────────────────────────────

export async function invitarPareja(
  userIdEmisor: string,
  correoInvitado: string
): Promise<{ error: string | null }> {
  // Obtener el user_id del invitado usando la función SQL
  const { data: userIdInvitado, error: errBusqueda } = await supabase
    .rpc('buscar_usuario_por_email', { correo: correoInvitado.toLowerCase() });

  if (errBusqueda || !userIdInvitado) {
    return { error: 'No se encontró el usuario.' };
  }

  const { error } = await supabase.from('parejas').insert({
    user_id_1: userIdEmisor,
    user_id_2: userIdInvitado,
    estado: 'pendiente',
    correo_invitado: correoInvitado.toLowerCase(),
  });

  return { error: error?.message ?? null };
}

// ─── Aceptar invitación ───────────────────────────────────────────────────────

export async function aceptarInvitacionPareja(): Promise<{ error: string | null }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'No autenticado.' };

  const { error } = await supabase
    .from('parejas')
    .update({ estado: 'activa', fecha_inicio: new Date().toISOString() })
    .eq('user_id_2', user.id)
    .eq('estado', 'pendiente');

  return { error: error?.message ?? null };
}

// ─── Cancelar invitación ──────────────────────────────────────────────────────

export async function cancelarInvitacion(
  parejaId: string
): Promise<{ exito: boolean; error?: string }> {
  const { error } = await supabase
    .from('parejas')
    .delete()
    .eq('id', parejaId);

  if (error) return { exito: false, error: error.message };
  return { exito: true };
}

// ─── Calcular estado de racha ─────────────────────────────────────────────────

export async function calcularEstadoRachaPareja(
  userId: string
): Promise<EstadoRachaPareja> {

  const estadoVacio: EstadoRachaPareja = {
    tieneParejaActiva: false,
    esperandoAceptacion: false,
    rachaActual: 0,
    rachaMaxima: 0,
    protectoresDisponibles: 0,
    historialDias: [],
    mensajeMotivador: '',
  };

  // Buscar pareja activa o pendiente
  const { data: pareja, error: errPareja } = await supabase
    .from('parejas')
    .select('*')
    .or(`user_id_1.eq.${userId},user_id_2.eq.${userId}`)
    .in('estado', ['activa', 'pendiente'])
    .maybeSingle();

  if (errPareja || !pareja) return estadoVacio;

  // Pareja pendiente
  if (pareja.estado === 'pendiente') {
    return {
      ...estadoVacio,
      esperandoAceptacion: true,
      parejaId: pareja.id,
      correoInvitado: pareja.correo_invitado,
    };
  }

  // Obtener ID y nombre del otro usuario
  const otroUserId = pareja.user_id_1 === userId ? pareja.user_id_2 : pareja.user_id_1;

  const { data: perfilPareja } = await supabase
    .from('perfiles')
    .select('nombre')
    .eq('id', otroUserId)
    .maybeSingle();

  // Obtener racha activa
  const { data: rachaData } = await supabase
    .from('rachas_parejas')
    .select('*')
    .eq('pareja_id', pareja.id)
    .maybeSingle();

  // Obtener historial de los últimos 7 días
  const hace7Dias = new Date();
  hace7Dias.setDate(hace7Dias.getDate() - 6);
  const fechaInicio = hace7Dias.toISOString().split('T')[0];

  const { data: historial } = await supabase
    .from('historial_emociones')
    .select('dia')
    .in('user_id', [userId, otroUserId])
    .gte('dia', fechaInicio)
    .order('dia', { ascending: true });

  // Construir historial de 7 días
  const historialDias: DiaRacha[] = [];
  const fechaInicioPareja = pareja.fecha_inicio
    ? new Date(pareja.fecha_inicio).toISOString().split('T')[0]
    : null;

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const fechaStr = d.toISOString().split('T')[0];

    const antesDePareja = fechaInicioPareja ? fechaStr < fechaInicioPareja : false;
    const registrosDelDia = historial?.filter(h => h.dia === fechaStr) ?? [];
    const ambosRegistraron = registrosDelDia.length >= 2;

    historialDias.push({
      fecha: fechaStr,
      completo: ambosRegistraron,
      protegido: false,
      antesDePareja,
    });
  }

  // Protectores disponibles
  const { data: protectores } = await supabase
    .from('protectores_racha')
    .select('id')
    .eq('pareja_id', pareja.id)
    .eq('usado', false);

  const rachaActual = rachaData?.racha_actual ?? 0;
  const rachaMaxima = rachaData?.racha_maxima ?? 0;

  // Mensaje motivador
  let mensajeMotivador = '';
  if (rachaActual >= 30) mensajeMotivador = '¡Un mes juntos! Son increíbles 🏆';
  else if (rachaActual >= 7) mensajeMotivador = '¡Una semana completa! Sigan así 🌟';
  else if (rachaActual >= 3) mensajeMotivador = '¡Van por buen camino! 💪';
  else if (rachaActual >= 1) mensajeMotivador = '¡Buen comienzo! Cada día cuenta 🔥';

  return {
    tieneParejaActiva: true,
    esperandoAceptacion: false,
    parejaId: pareja.id,
    nombrePareja: perfilPareja?.nombre ?? 'Tu amigo',
    correoInvitado: pareja.correo_invitado,
    rachaActual,
    rachaMaxima,
    protectoresDisponibles: protectores?.length ?? 0,
    historialDias,
    mensajeMotivador,
  };
}