// pantalla factores de impacto

import { FactorId } from "@/models/factoresImpacto";
import { createClient } from "../supabase";

/**
 * LETRA C: PANTALLA FACTORES DE IMPACTO (PASO 3)
 * Registra de forma masiva los factores que afectan el bienestar del usuario,
 * incluyendo soporte para un texto libre personalizado si seleccionó "Otro".
 */
export const insertarFactoresImpactoBienestar = async (
  userId: string,
  factoresIds: FactorId[],
  otroTextoEspecificado?: string
) => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('factores_impacto_usuario') // Nombre sugerido para la tabla relacional de factores de riesgo o impacto
    .insert({
      user_id: userId,
      paso: 3,
      factores_seleccionados: factoresIds, // Guarda el array de identificadores de Supabase como ["falta_tiempo", "ansiedad", "otro"]
      otro_especificar_texto: factoresIds.includes('otro') ? otroTextoEspecificado : null,
      creado_at: new Date().toISOString()
    })
    .select();

  if (error) {
    throw new Error(error.message);
  }
  return data;
};