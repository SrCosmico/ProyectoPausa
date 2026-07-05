import { createClient } from '@/lib/supabase/client';
import {
  MAX_PROTECTORES_MES,
  obtenerFechaLocalISO,
  obtenerMesActual,
  obtenerMensajeMotivadorAleatorio,
  type Pareja,
  type CheckinDia,
  type EstadoRachaPareja,
} from '@/models/racha';

const getSupabase = () => createClient();

const VENTANA_HISTORIAL_MAX_DIAS = 90;
const DIAS_MOSTRADOS_UI = 7;

// ============================================================
// C — Vincular pareja
// ============================================================

export async function invitarPareja(userId: string, correoPareja: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('parejas')
    .insert([{ user_id_1: userId, correo_invitado: correoPareja.trim().toLowerCase() }])
    .select()
    .single();

  if (error) {
    console.error('Error al invitar pareja:', error.message);
    return { data: null, error };
  }
  return { data: data as Pareja, error: null };
}

export async function aceptarInvitacionPareja() {
  const supabase = getSupabase();
  const { data, error } = await supabase.rpc('aceptar_invitacion_pareja');

  if (error) {
    console.error('Error al aceptar invitación de pareja:', error.message);
    return { data: null, error: error.message };
  }
  return { data: data as Pareja, error: null };
}

// ============================================================
// R — Lecturas base
// ============================================================

export async function leerParejaDelUsuario(userId: string): Promise<Pareja | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('parejas')
    .select('*')
    .or(`user_id_1.eq.${userId},user_id_2.eq.${userId}`)
    .order('creado_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error al leer pareja del usuario:', error.message);
    return null;
  }
  return data as Pareja | null;
}

function idParejaContraria(pareja: Pareja, miUserId: string): string | null {
  if (pareja.user_id_1 === miUserId) return pareja.user_id_2;
  if (pareja.user_id_2 === miUserId) return pareja.user_id_1;
  return null;
}

export async function leerNombrePareja(parejaUserId: string): Promise<string> {
  const supabase = getSupabase();
  const { data } = await supabase
    .from('perfiles')
    .select('nombre')
    .eq('id', parejaUserId)
    .maybeSingle();
  return data?.nombre || 'Tu pareja';
}

async function leerCheckinsRango(
  userId: string,
  parejaUserId: string,
  fechaDesde: string,
  fechaHasta: string
): Promise<Record<string, { u1: boolean; u2: boolean }>> {
  const supabase = getSupabase();
  const mapa: Record<string, { u1: boolean; u2: boolean }> = {};

  if (fechaDesde > fechaHasta) return mapa;

  const { data, error } = await supabase
    .from('historial_emociones')
    .select('user_id, dia')
    .in('user_id', [userId, parejaUserId])
    .gte('dia', fechaDesde)
    .lte('dia', fechaHasta);

  if (error) {
    console.error('Error al leer checkins de la pareja:', error.message);
    return mapa;
  }

  (data ?? []).forEach((fila: { user_id: string; dia: string }) => {
    if (!mapa[fila.dia]) mapa[fila.dia] = { u1: false, u2: false };
    if (fila.user_id === userId) mapa[fila.dia].u1 = true;
    if (fila.user_id === parejaUserId) mapa[fila.dia].u2 = true;
  });

  return mapa;
}

async function leerFechasProtegidas(parejaId: string): Promise<Set<string>> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('protectores_racha')
    .select('fecha')
    .eq('pareja_id', parejaId);

  if (error) {
    console.error('Error al leer protectores usados:', error.message);
    return new Set();
  }
  return new Set((data ?? []).map((f: { fecha: string }) => f.fecha));
}

async function contarProtectoresDelMes(parejaId: string, mes: string): Promise<number> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('protectores_racha')
    .select('fecha')
    .eq('pareja_id', parejaId)
    .gte('fecha', `${mes}-01`)
    .lte('fecha', `${mes}-31`);

  if (error) {
    console.error('Error al contar protectores del mes:', error.message);
    return 0;
  }
  return (data ?? []).length;
}

async function leerRachaMaximaGuardada(parejaId: string): Promise<number> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('rachas_parejas')
    .select('racha_maxima')
    .eq('pareja_id', parejaId)
    .maybeSingle();

  if (error) {
    console.error('Error al leer racha máxima:', error.message);
    return 0;
  }
  return data?.racha_maxima ?? 0;
}

async function actualizarRachaMaximaSiCorresponde(parejaId: string, rachaActual: number) {
  const supabase = getSupabase();
  const actual = await leerRachaMaximaGuardada(parejaId);
  if (rachaActual <= actual) return;

  const { error } = await supabase
    .from('rachas_parejas')
    .upsert(
      { pareja_id: parejaId, racha_maxima: rachaActual, actualizado_at: new Date().toISOString() },
      { onConflict: 'pareja_id' }
    );

  if (error) console.error('Error al actualizar racha máxima:', error.message);
}

async function usarProtectorRacha(
  parejaId: string,
  fecha: string,
  userId: string
): Promise<{ exito: boolean }> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('protectores_racha')
    .insert([{ pareja_id: parejaId, fecha, usado_por: userId }]);

  if (error && !error.message.toLowerCase().includes('duplicate')) {
    console.error('Error al usar protector de racha:', error.message);
    return { exito: false };
  }
  return { exito: true };
}

// ============================================================
// Cálculo principal: estado completo de la racha en pareja
// ============================================================

export async function calcularEstadoRachaPareja(userId: string): Promise<EstadoRachaPareja> {
  const vacio: EstadoRachaPareja = {
    parejaId: null,
    tieneParejaActiva: false,
    esperandoAceptacion: false,
    correoInvitado: null,
    nombrePareja: null,
    rachaActual: 0,
    rachaMaxima: 0,
    protectoresDisponibles: MAX_PROTECTORES_MES,
    protectoresUsadosEsteMes: 0,
    activadaHoy: false,
    historialDias: [],
    mensajeMotivador: null,
  };

  const pareja = await leerParejaDelUsuario(userId);
  if (!pareja) return vacio;

  if (pareja.estado !== 'activa' || !pareja.user_id_2) {
    return {
      ...vacio,
      parejaId: pareja.id,
      esperandoAceptacion: true,
      correoInvitado: pareja.correo_invitado,
    };
  }

  const parejaUserId = idParejaContraria(pareja, userId);
  if (!parejaUserId) return { ...vacio, parejaId: pareja.id };

  const nombrePareja = await leerNombrePareja(parejaUserId);

  // ── LÍMITE CLAVE: la racha nunca puede empezar antes de que la pareja exista ──
  const fechaCreacionPareja = new Date(pareja.creado_at);
  const parejaFechaISO = obtenerFechaLocalISO(fechaCreacionPareja);

  const hoy = new Date();
  const hoyISO = obtenerFechaLocalISO(hoy);

  const limiteVentana = new Date(hoy);
  limiteVentana.setDate(limiteVentana.getDate() - VENTANA_HISTORIAL_MAX_DIAS);
  const limiteVentanaISO = obtenerFechaLocalISO(limiteVentana);

  // La fecha desde la que consultamos nunca es anterior a la creación de la pareja
  const desdeISO = parejaFechaISO > limiteVentanaISO ? parejaFechaISO : limiteVentanaISO;

  const checkins = await leerCheckinsRango(userId, parejaUserId, desdeISO, hoyISO);
  const fechasProtegidas = await leerFechasProtegidas(pareja.id);
  const rachaMaximaGuardada = await leerRachaMaximaGuardada(pareja.id);

  const hoyCompleto = Boolean(checkins[hoyISO]?.u1 && checkins[hoyISO]?.u2);

  const cursor = new Date(hoy);
  if (!hoyCompleto) cursor.setDate(cursor.getDate() - 1);

  let rachaActual = 0;
  let mesEnCurso = obtenerMesActual(cursor);
  let protectoresRestantesMes =
    MAX_PROTECTORES_MES - (await contarProtectoresDelMes(pareja.id, mesEnCurso));

  while (true) {
    const fechaCursorISO = obtenerFechaLocalISO(cursor);

    // Nunca contar (ni consumir protectores) en días anteriores a la pareja
    if (fechaCursorISO < parejaFechaISO) break;

    const mesCursor = obtenerMesActual(cursor);
    if (mesCursor !== mesEnCurso) {
      mesEnCurso = mesCursor;
      protectoresRestantesMes =
        MAX_PROTECTORES_MES - (await contarProtectoresDelMes(pareja.id, mesEnCurso));
    }

    const dia = checkins[fechaCursorISO];
    const completo = Boolean(dia?.u1 && dia?.u2);
    let protegido = fechasProtegidas.has(fechaCursorISO);

    if (!completo && !protegido && protectoresRestantesMes > 0) {
      const { exito } = await usarProtectorRacha(pareja.id, fechaCursorISO, userId);
      if (exito) {
        protegido = true;
        protectoresRestantesMes -= 1;
        fechasProtegidas.add(fechaCursorISO);
      }
    }

    if (completo || protegido) {
      rachaActual += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }

  const rachaMaxima = Math.max(rachaMaximaGuardada, rachaActual);
  if (rachaActual > rachaMaximaGuardada) {
    await actualizarRachaMaximaSiCorresponde(pareja.id, rachaActual);
  }

  const protectoresUsadosEsteMes = await contarProtectoresDelMes(
    pareja.id,
    obtenerMesActual(hoy)
  );

  const historialDias: CheckinDia[] = [];
  for (let i = DIAS_MOSTRADOS_UI - 1; i >= 0; i--) {
    const d = new Date(hoy);
    d.setDate(d.getDate() - i);
    const fechaISO = obtenerFechaLocalISO(d);
    const dia = checkins[fechaISO];
    const yoRegistre = Boolean(dia?.u1);
    const parejaRegistro = Boolean(dia?.u2);

    historialDias.push({
      fecha: fechaISO,
      yoRegistre,
      parejaRegistro,
      completo: yoRegistre && parejaRegistro,
      protegido: fechasProtegidas.has(fechaISO),
      antesDePareja: fechaISO < parejaFechaISO,
    });
  }

  return {
    parejaId: pareja.id,
    tieneParejaActiva: true,
    esperandoAceptacion: false,
    correoInvitado: pareja.correo_invitado,
    nombrePareja,
    rachaActual,
    rachaMaxima,
    protectoresDisponibles: Math.max(0, MAX_PROTECTORES_MES - protectoresUsadosEsteMes),
    protectoresUsadosEsteMes,
    activadaHoy: hoyCompleto,
    historialDias,
    mensajeMotivador: hoyCompleto ? obtenerMensajeMotivadorAleatorio() : null,
  };
}