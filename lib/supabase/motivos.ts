// pantalla motivos
import { createClient } from "../supabase";
import { opcionesMotivosData, type OpcionMotivo } from "@/models/motivos";
/**
 * LETRA C: PANTALLA MOTIVOS
 * Registra por primera vez los motivos seleccionados por el estudiante
 * durante su proceso de inducción u onboarding en la aplicación.
 */
export const insertarMotivosOnboarding = async (
  userId: string,
  motivosSeleccionados: string[], // Arreglo de los IDs seleccionados (ej: ["estres", "dormir"])
  otroTextoEspecificado?: string  // Texto opcional en caso de marcar "Otro"
) => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('motivos_registro_usuario') // Tabla asignada para capturar las preferencias de onboarding
    .insert({
      user_id: userId,
      motivos: motivosSeleccionados,
      otro_motivo_texto: otroTextoEspecificado || null,
      creado_at: new Date().toISOString()
    })
    .select();

  if (error) {
    throw new Error(error.message);
  }
  return data;
};

// ============================================================
// CRUD: Letra "R" pantalla de motivos
// ============================================================

const _iconosMotivos: Record<string, string> = {
  estres: "🧘",
  bienestar: "🌸",
  dormir: "🌙",
  academico: "📚",
  motivacion: "✨",
  otro: "✏️",
};

/**
 * Devuelve la lista de opciones de motivos con emoji y estado de selección
 * a partir del mapa de seleccionados recibido como parámetro.
 */
export function leerOpcionesMotivos(
  seleccionados: Record<string, boolean>
): OpcionMotivo[] {
  return opcionesMotivosData.map((item) => ({
    ...item,
    icono: _iconosMotivos[item.id] ?? "❓",
    seleccionado: seleccionados[item.id] ?? false,
  }));
}