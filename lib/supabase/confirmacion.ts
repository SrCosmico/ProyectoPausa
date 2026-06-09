// ============================================================
// CRUD: Letra "R" pantalla de confirmacion
// ============================================================

import { beneficiosData, type BeneficioItem } from "@/models/confirmacion";

const _iconosBeneficios: Record<string, string> = {
  "1": "✨",
  "2": "🧰",
  "3": "🛡️",
};

/** Devuelve la lista de beneficios de Pausa con su ícono asignado. */
export function leerBeneficiosConfirmacion(): BeneficioItem[] {
  return beneficiosData.map((item) => ({
    ...item,
    icono: _iconosBeneficios[item.id] ?? "🔹",
  }));
}