import { createClient } from '@/lib/supabase/client';
import type { EstadoRachaPareja, CheckinDia } from '@/models/racha';

const supabase = createClient();

// ─── Validar invitación ───────────────────────────────────────────────────────

export async function validarInvitacion(
  correoEmisor: string,
  correoInvitado: string
): Promise<{ ok: boolean; mensaje?: string }> {
  if (!correoInvitado?.trim()) return { ok: false, mensaje: 'Ingresa un correo válido.' };

  const correoNormalizado = correoInvitado.trim().toLowerCase();
  if (correoNormalizado === correoEmisor.toLowerCase()) return { ok: false, mensaje: 'No puedes invitarte a ti mismo.' };

  // Buscar usuario en auth.users
  const { data: usuarioId, error: errBusqueda } = await supabase
    .rpc('buscar_usuario_por_email', { correo: correoNormalizado });

  if (errBusqueda || !usuarioId) {
    return { ok: false, mensaje: 'No encontramos ningún usuario registrado con ese correo en Pausa.' };
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, mensaje: 'No autenticado.' };

  // Solo verificar si YA EXISTE una pareja activa o pendiente con ESA MISMA persona
  const { data: parejaExistente } = await supabase
    .from('parejas')
    .select('id, estado')
    .or(
      `and(user_id_1.eq.${user.id},user_id_2.eq.${usuarioId}),and(user_id_1.eq.${usuarioId},user_id_2.eq.${user.id})`
    )
    .in('estado', ['activa', 'pendiente'])
    .maybeSingle();

  if (parejaExistente) {
    const msg = parejaExistente.estado === 'activa'
      ? 'Ya tienes una racha activa con esta persona.'
      : 'Ya tienes una invitación pendiente con esta persona.';
    return { ok: false, mensaje: msg };
  }

  return { ok: true };
}

// ─── Invitar pareja ───────────────────────────────────────────────────────────

export async function invitarPareja(
  userIdEmisor: string,
  correoInvitado: string
): Promise<{ error: string | null }> {
  const { data: userIdInvitado, error: errBusqueda } = await supabase
    .rpc('buscar_usuario_por_email', { correo: correoInvitado.toLowerCase() });

  if (errBusqueda || !userIdInvitado) return { error: 'No se encontró el usuario.' };

  const { error } = await supabase.from('parejas').insert({
    user_id_1: userIdEmisor,
    user_id_2: userIdInvitado,
    estado: 'pendiente',
    correo_invitado: correoInvitado.toLowerCase(),
  });

  return { error: error?.message ?? null };
}

// ─── Aceptar invitación ───────────────────────────────────────────────────────

export async function aceptarInvitacionPareja(parejaId: string): Promise<{ error: string | null }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'No autenticado.' };

  const { error } = await supabase
    .from('parejas')
    .update({ estado: 'activa' })
    .eq('id', parejaId)
    .eq('user_id_2', user.id)
    .eq('estado', 'pendiente');

  return { error: error?.message ?? null };
}

// ─── Cancelar invitación ──────────────────────────────────────────────────────

export async function cancelarInvitacion(parejaId: string): Promise<{ exito: boolean; error?: string }> {
  const { error } = await supabase.from('parejas').delete().eq('id', parejaId);
  if (error) return { exito: false, error: error.message };
  return { exito: true };
}

// ─── Calcular estado de racha ─────────────────────────────────────────────────

export async function calcularEstadoRachaPareja(userId: string): Promise<EstadoRachaPareja> {
  const estadoVacio: EstadoRachaPareja = {
    tieneParejaActiva: false,
    esperandoAceptacion: false,
    parejaId: null,
    correoInvitado: null,
    nombrePareja: null,
    rachaActual: 0,
    rachaMaxima: 0,
    protectoresDisponibles: 0,
    protectoresUsadosEsteMes: 0,
    activadaHoy: false,
    historialDias: [],
    mensajeMotivador: null,
    soyReceptor: false,
  };

  // Buscar TODAS las parejas del usuario (activas y pendientes)
  const { data: parejas, error: errPareja } = await supabase
    .from('parejas')
    .select('*')
    .or(`user_id_1.eq.${userId},user_id_2.eq.${userId}`)
    .in('estado', ['activa', 'pendiente'])
    .order('creado_at', { ascending: false });

  if (errPareja || !parejas || parejas.length === 0) return estadoVacio;

  // Priorizar pareja activa sobre pendiente
  const parejaActiva = parejas.find(p => p.estado === 'activa');
  const parejaPendiente = parejas.find(p => p.estado === 'pendiente');
  const pareja = parejaActiva ?? parejaPendiente;
  if (!pareja) return estadoVacio;

  // Pareja pendiente
  if (pareja.estado === 'pendiente') {
    const soyReceptor = pareja.user_id_2 === userId;
    return {
      ...estadoVacio,
      parejaId: pareja.id,
      esperandoAceptacion: true,
      correoInvitado: pareja.correo_invitado,
      soyReceptor,
    };
  }

  // Pareja activa
  const otroUserId = pareja.user_id_1 === userId ? pareja.user_id_2 : pareja.user_id_1;

  const { data: perfilPareja } = await supabase
    .from('perfiles')
    .select('nombre, avatar_url')
    .eq('id', otroUserId)
    .maybeSingle();

  const { data: rachaData } = await supabase
    .from('rachas_parejas')
    .select('*')
    .eq('pareja_id', pareja.id)
    .maybeSingle();

  // Calcular racha actual desde historial_emociones
  // Contamos días consecutivos donde ambos registraron, desde hoy hacia atrás
  const { data: todosRegistros } = await supabase
    .from('historial_emociones')
    .select('dia, user_id')
    .in('user_id', [userId, otroUserId])
    .order('dia', { ascending: false });

  let rachaActualCalculada = 0;
  if (todosRegistros && todosRegistros.length > 0) {
    const hoy = new Date();
    let diaActual = new Date(hoy);
    let contando = true;

    while (contando) {
      const fechaStr = diaActual.toISOString().split('T')[0];
      const registrosDelDia = todosRegistros.filter(r => r.dia === fechaStr);
      const yo = registrosDelDia.some(r => r.user_id === userId);
      const parejaTambien = registrosDelDia.some(r => r.user_id === otroUserId);

      if (yo && parejaTambien) {
        rachaActualCalculada++;
        diaActual.setDate(diaActual.getDate() - 1);
      } else {
        contando = false;
      }
    }
  }

  const hace7Dias = new Date();
  hace7Dias.setDate(hace7Dias.getDate() - 6);
  const fechaInicio7 = hace7Dias.toISOString().split('T')[0];

  const { data: historial } = await supabase
    .from('historial_emociones')
    .select('dia, user_id')
    .in('user_id', [userId, otroUserId])
    .gte('dia', fechaInicio7)
    .order('dia', { ascending: true });

  const fechaInicioPareja = pareja.creado_at
    ? new Date(pareja.creado_at).toISOString().split('T')[0]
    : null;

  const historialDias: CheckinDia[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const fechaStr = d.toISOString().split('T')[0];
    const antesDePareja = fechaInicioPareja ? fechaStr < fechaInicioPareja : false;
    const registrosDelDia = historial?.filter(h => h.dia === fechaStr) ?? [];

    historialDias.push({
      fecha: fechaStr,
      yoRegistre: registrosDelDia.some(h => h.user_id === userId),
      parejaRegistro: registrosDelDia.some(h => h.user_id === otroUserId),
      completo: registrosDelDia.length >= 2,
      protegido: false,
      antesDePareja,
    });
  }

  const { data: protectores } = await supabase
    .from('protectores_racha')
    .select('id')
    .eq('pareja_id', pareja.id)
    .eq('usado', false);

  const rachaActual = rachaActualCalculada;
  const rachaMaxima = rachaData?.racha_maxima ?? rachaActual;

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
    avatarPareja: perfilPareja?.avatar_url ?? null,
    correoInvitado: pareja.correo_invitado,
    rachaActual,
    rachaMaxima,
    protectoresDisponibles: protectores?.length ?? 0,
    protectoresUsadosEsteMes: 0,
    activadaHoy: rachaActual > 0,
    historialDias,
    mensajeMotivador,
    soyReceptor: pareja.user_id_2 === userId,
  };
}