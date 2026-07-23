import { createClient } from '@/lib/supabase/client';
import type { EstadoRachaPareja, CheckinDia } from '@/models/racha';
import { obtenerMesActual, MAX_PROTECTORES_MES } from '@/models/racha';

const supabase = createClient();

// ─── Validar invitación ───────────────────────────────────────────────────────

export async function validarInvitacion(
  correoEmisor: string,
  correoInvitado: string
): Promise<{ ok: boolean; mensaje?: string }> {
  if (!correoInvitado?.trim()) return { ok: false, mensaje: 'Ingresa un correo válido.' };

  const correoNormalizado = correoInvitado.trim().toLowerCase();
  if (correoNormalizado === correoEmisor.toLowerCase()) return { ok: false, mensaje: 'No puedes invitarte a ti mismo.' };

  const { data: usuarioId, error: errBusqueda } = await supabase
    .rpc('buscar_usuario_por_email', { correo: correoNormalizado });

  if (errBusqueda || !usuarioId) {
    return { ok: false, mensaje: 'No encontramos ningún usuario registrado con ese correo en Pausa.' };
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, mensaje: 'No autenticado.' };

  const { data: parejaExistente } = await supabase
    .from('parejas')
    .select('id, estado')
    .or(`and(user_id_1.eq.${user.id},user_id_2.eq.${usuarioId}),and(user_id_1.eq.${usuarioId},user_id_2.eq.${user.id})`)
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

// ─── Calcular racha de una pareja (respeta días protegidos) ───────────────────

async function calcularRachaPareja(
  userId: string,
  otroUserId: string,
  parejaId: string
): Promise<number> {
  const { data: registros } = await supabase
    .from('historial_emociones')
    .select('dia, user_id')
    .in('user_id', [userId, otroUserId])
    .order('dia', { ascending: false });

  const { data: diasProtegidos } = await supabase
    .from('protectores_racha')
    .select('usado_en_fecha')
    .eq('pareja_id', parejaId)
    .not('usado_por', 'is', null)
    .not('usado_en_fecha', 'is', null);

  const fechasProtegidas = new Set((diasProtegidos ?? []).map(d => d.usado_en_fecha));

  if (!registros || registros.length === 0) return 0;

  let racha = 0;
  let diaActual = new Date();

  while (true) {
    const fechaStr = diaActual.toISOString().split('T')[0];
    const del_dia = registros.filter(r => r.dia === fechaStr);
    const yo = del_dia.some(r => r.user_id === userId);
    const otro = del_dia.some(r => r.user_id === otroUserId);
    const completo = yo && otro;
    const protegido = fechasProtegidas.has(fechaStr);

    if (completo || protegido) {
      racha++;
      diaActual.setDate(diaActual.getDate() - 1);
    } else {
      break;
    }
  }

  return racha;
}

// ─── Otorgar protector mensual (llamar cada vez que se carga el estado) ──────

export async function otorgarProtectorMensualSiCorresponde(parejaId: string): Promise<void> {
  const mesActual = obtenerMesActual();

  const { count } = await supabase
    .from('protectores_racha')
    .select('id', { count: 'exact', head: true })
    .eq('pareja_id', parejaId);

  if ((count ?? 0) >= MAX_PROTECTORES_MES) return;

  const hoy = new Date().toISOString().split('T')[0];

  await supabase
    .from('protectores_racha')
    .insert({
      pareja_id: parejaId,
      fecha: hoy,
      otorgado_mes: mesActual,
      usado_por: null,
      usado_en_fecha: null,
    })
    .select()
    .maybeSingle();
}

// ─── Usar protector manualmente sobre un día específico ──────────────────────

export async function usarProtector(
  parejaId: string,
  fechaAProteger: string
): Promise<{ ok: boolean; mensaje?: string }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, mensaje: 'No autenticado.' };

  const { data: protector, error: errBusqueda } = await supabase
    .from('protectores_racha')
    .select('id')
    .eq('pareja_id', parejaId)
    .is('usado_por', null)
    .limit(1)
    .maybeSingle();

  if (errBusqueda || !protector) {
    return { ok: false, mensaje: 'No tienes protectores disponibles.' };
  }

  const { error: errUpdate } = await supabase
    .from('protectores_racha')
    .update({ usado_por: user.id, usado_en_fecha: fechaAProteger })
    .eq('id', protector.id)
    .is('usado_por', null);

  if (errUpdate) return { ok: false, mensaje: 'No se pudo activar el protector.' };

  return { ok: true };
}

// ─── Calcular estado de racha (retorna TODAS las parejas) ─────────────────────

export async function calcularEstadoRachaPareja(userId: string): Promise<EstadoRachaPareja> {
  const estadoVacio: EstadoRachaPareja = {
    tieneParejaActiva: false,
    esperandoAceptacion: false,
    parejaId: null,
    correoInvitado: null,
    nombrePareja: null,
    avatarPareja: null,
    rachaActual: 0,
    rachaMaxima: 0,
    protectoresDisponibles: 0,
    protectoresUsadosEsteMes: 0,
    activadaHoy: false,
    historialDias: [],
    mensajeMotivador: null,
    soyReceptor: false,
    parejasActivas: [],
    parejasPendientes: [],
  };

  const { data: parejas, error } = await supabase
    .from('parejas')
    .select('*')
    .or(`user_id_1.eq.${userId},user_id_2.eq.${userId}`)
    .in('estado', ['activa', 'pendiente'])
    .order('creado_at', { ascending: false });

  if (error || !parejas || parejas.length === 0) return estadoVacio;

  const activas = parejas.filter(p => p.estado === 'activa');
  const pendientes = parejas.filter(p => p.estado === 'pendiente');

  // ── Construir info de cada pareja activa ──────────────────────────────────
  const parejasActivas = await Promise.all(activas.map(async (pareja) => {
    const otroUserId = pareja.user_id_1 === userId ? pareja.user_id_2 : pareja.user_id_1;

    await otorgarProtectorMensualSiCorresponde(pareja.id);

    const { data: perfil } = await supabase
      .from('perfiles')
      .select('nombre, avatar_url')
      .eq('id', otroUserId)
      .maybeSingle();

    const rachaActual = await calcularRachaPareja(userId, otroUserId, pareja.id);

    const hace7Dias = new Date();
    hace7Dias.setDate(hace7Dias.getDate() - 6);
    const fechaInicio7 = hace7Dias.toISOString().split('T')[0];

    const { data: historial } = await supabase
      .from('historial_emociones')
      .select('dia, user_id')
      .in('user_id', [userId, otroUserId])
      .gte('dia', fechaInicio7);

    const { data: protegidosSet } = await supabase
      .from('protectores_racha')
      .select('usado_en_fecha')
      .eq('pareja_id', pareja.id)
      .not('usado_por', 'is', null);

    const fechasProtegidas = new Set((protegidosSet ?? []).map(p => p.usado_en_fecha));

    const fechaCreacionPareja = pareja.creado_at.split('T')[0];

    const historialDias: CheckinDia[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const fechaStr = d.toISOString().split('T')[0];
      const del_dia = historial?.filter(h => h.dia === fechaStr) ?? [];
      historialDias.push({
        fecha: fechaStr,
        yoRegistre: del_dia.some(h => h.user_id === userId),
        parejaRegistro: del_dia.some(h => h.user_id === otroUserId),
        completo: del_dia.some(h => h.user_id === userId) && del_dia.some(h => h.user_id === otroUserId),
        protegido: fechasProtegidas.has(fechaStr),
        antesDePareja: fechaStr < fechaCreacionPareja,
      });
    }

    const { data: rachaData } = await supabase
      .from('rachas_parejas')
      .select('racha_maxima')
      .eq('pareja_id', pareja.id)
      .maybeSingle();

    const rachaMaximaGuardada = rachaData?.racha_maxima ?? 0;
    const rachaMaxima = Math.max(rachaMaximaGuardada, rachaActual);

    if (rachaMaxima > rachaMaximaGuardada) {
      await supabase
        .from('rachas_parejas')
        .upsert({ pareja_id: pareja.id, racha_maxima: rachaMaxima });
    }

    const { data: protectoresDisponibles } = await supabase
      .from('protectores_racha')
      .select('id')
      .eq('pareja_id', pareja.id)
      .is('usado_por', null);

    const { data: protectoresUsados } = await supabase
      .from('protectores_racha')
      .select('id')
      .eq('pareja_id', pareja.id)
      .not('usado_por', 'is', null);

    let mensajeMotivador = '';
    if (rachaActual >= 30) mensajeMotivador = '¡Un mes juntos! Son increíbles 🏆';
    else if (rachaActual >= 7) mensajeMotivador = '¡Una semana completa! Sigan así 🌟';
    else if (rachaActual >= 3) mensajeMotivador = '¡Van por buen camino! 💪';
    else if (rachaActual >= 1) mensajeMotivador = '¡Buen comienzo! Cada día cuenta 🔥';

    return {
      parejaId: pareja.id,
      nombrePareja: perfil?.nombre ?? 'Tu amigo',
      avatarPareja: perfil?.avatar_url ?? null,
      correoInvitado: pareja.correo_invitado,
      rachaActual,
      rachaMaxima,
      protectoresDisponibles: protectoresDisponibles?.length ?? 0,
      protectoresUsados: protectoresUsados?.length ?? 0,
      historialDias,
      mensajeMotivador,
      soyReceptor: pareja.user_id_2 === userId,
    };
  }));

  // ── Construir info de pendientes ──────────────────────────────────────────
  const parejasPendientes = pendientes.map(p => ({
    parejaId: p.id,
    correoInvitado: p.correo_invitado,
    soyReceptor: p.user_id_2 === userId,
  }));

  const primera = parejasActivas[0];
  const primeraPendiente = parejasPendientes.find(p => !p.soyReceptor);
  const primeraRecibida = parejasPendientes.find(p => p.soyReceptor);

  return {
    tieneParejaActiva: parejasActivas.length > 0,
    esperandoAceptacion: parejasPendientes.length > 0,
    parejaId: primera?.parejaId ?? primeraRecibida?.parejaId ?? primeraPendiente?.parejaId ?? null,
    correoInvitado: primera?.correoInvitado ?? primeraRecibida?.correoInvitado ?? null,
    nombrePareja: primera?.nombrePareja ?? null,
    avatarPareja: primera?.avatarPareja ?? null,
    rachaActual: primera?.rachaActual ?? 0,
    rachaMaxima: primera?.rachaMaxima ?? 0,
    protectoresDisponibles: primera?.protectoresDisponibles ?? 0,
    protectoresUsadosEsteMes: primera?.protectoresUsados ?? 0,
    activadaHoy: (primera?.rachaActual ?? 0) > 0,
    historialDias: primera?.historialDias ?? [],
    mensajeMotivador: primera?.mensajeMotivador ?? null,
    soyReceptor: primeraRecibida ? true : false,
    parejasActivas,
    parejasPendientes,
  };
}