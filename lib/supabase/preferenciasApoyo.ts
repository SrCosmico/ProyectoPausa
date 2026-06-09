// pantalla preferencias de apoyo
import { createClient } from "../supabase";
import {
  opcionesPreferenciasData,
  mapeoIconos as iconosPreferencias,
  type OpcionPreferencia,
} from "@/models/preferenciasApoyo";
/**
 * LETRA C: PANTALLA PREFERENCIAS DE APOYO
 * Registra los tipos de apoyo seleccionados por el estudiante
 * durante su proceso de inducción y configuración inicial.
 */
export const insertarPreferenciasApoyo = async (
  userId: string,
  preferenciasSeleccionadas: string[] // Arreglo de IDs elegidos (ej: ["ejercicios_calma", "chat_ia"])
) => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('preferencias_apoyo_usuario') // Tabla asignada para guardar los pilares de apoyo elegidos
    .insert({
      user_id: userId,
      preferencias: preferenciasSeleccionadas,
      creado_at: new Date().toISOString()
    })
    .select();

  if (error) {
    throw new Error(error.message);
  }
  return data;
};

// ============================================================
// CRUD: Letra "R" pantalla de preferenciasApoyo
// ============================================================

/** Devuelve las preferencias de apoyo con emoji y estado de selección. */
export function leerOpcionesPreferenciasApoyo(
  seleccionados: Record<string, boolean>
): OpcionPreferencia[] {
  return opcionesPreferenciasData.map((item) => ({
    ...item,
    icono: iconosPreferencias[item.id],
    seleccionado: seleccionados[item.id] ?? false,
  }));
}