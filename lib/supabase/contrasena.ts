//Pantalla contraseña
/**
 * LETRA C: PANTALLA DIARIO EMOCIONAL (CONTRASEÑA)
 * Guarda una nueva nota escrita por el usuario con su respectivo título, contenido y etiqueta del día.
 */
export const insertarNotaDiario = async (
  userId: string, 
  titulo: string, 
  contenido: string, 
  emojiDia: string | null, 
  labelDia: string | null
) => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('diario_notas') // Nombre sugerido para la tabla en Supabase
    .insert({
      user_id: userId,
      titulo: titulo.trim() || 'Sin título',
      contenido: contenido.trim(),
      emoji_dia: emojiDia,
      label_dia: labelDia,
      fecha: new Date().toLocaleDateString() // Almacena el string de la fecha actual
    })
    .select();

  if (error) {
    throw new Error(error.message);
  }
  return data;
};

import { type Nota } from "@/models/contrasena";

// ============================================================
// CRUD: Letra "R" pantalla de contrasena (diario personal)
// ============================================================

// Datos iniciales dummy — en producción arrancarán desde Supabase
const _notasDiarioDummy: Nota[] = [
  {
    id: 1,
    titulo: "Mi primer día en Pausa",
    contenido:
      "Hoy empecé a usar la app. Me siento con esperanza de mejorar mis hábitos de bienestar.",
    fecha: new Date().toLocaleDateString(),
    emoji: "💜",
  },
  {
    id: 2,
    titulo: "Semana de exámenes",
    contenido:
      "El estrés de los parciales es alto, pero intento respirar y mantenerme enfocado.",
    fecha: new Date(Date.now() - 86_400_000).toLocaleDateString(),
    emoji: "💛",
  },
];

/**
 * Devuelve las notas iniciales del diario (dummy).
 * Se usa para inicializar el useState<Nota[]> en la page.
 */
export function leerNotasDiarioInicial(): Nota[] {
  return _notasDiarioDummy;
}

/** Busca y devuelve una nota del diario por su ID. */
export function leerNotaDiarioPorId(notas: Nota[], id: number): Nota | undefined {
  return notas.find((n) => n.id === id);
}

/** Devuelve las notas ordenadas de más reciente a más antigua. */
export function leerNotasDiarioOrdenadas(notas: Nota[]): Nota[] {
  return [...notas].sort((a, b) => b.id - a.id);
}


//U
// Función de UPDATE para una entrada del diario
import { createClient } from '../supabase'; 

async function actualizarEntradaDiario(diarioId: string, nuevoTexto: string, nuevoTitulo: string) {
  const supabase = createClient();
  
  // CRÍTICO: Usamos el .eq('id', diarioId) para modificar SOLO la entrada seleccionada
  // tal como se indica en "WhatsApp Image 2026-06-08 at 4.56.27 PM.jpeg"
  const { data, error } = await supabase
    .from('diario')
    .update({ 
      titulo: nuevoTitulo,
      contenido: nuevoTexto,
      fecha_edicion: new Date().toISOString() // Opcional: para saber cuándo se editó
    })
    .eq('id', diarioId); 
    
  return { data, error };
}