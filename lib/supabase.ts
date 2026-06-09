import { createBrowserClient } from '@supabase/ssr'
import type { TipAntiestres } from '@/types'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export const getRandomTip = async (): Promise<TipAntiestres | null> => {
  const supabase = createClient()

  const { data, error } = await supabase.rpc('obtener_tip_aleatorio').maybeSingle()

  if (!error && data) {
    return data as TipAntiestres
  }

  if (error) {
    console.warn('Error al obtener el tip vía RPC:', JSON.stringify(error))
  }

  const { data: tips, error: fallbackError } = await supabase
    .from('tips_antiestres')
    .select('id, contenido, categoria')

  if (fallbackError) {
    console.error('No se pudo obtener el tip desde la tabla tips_antiestres:', JSON.stringify(fallbackError))
    return null
  }

  if (!tips || tips.length === 0) {
    console.error('No se encontraron tips en la tabla tips_antiestres')
    return null
  }

  return tips[Math.floor(Math.random() * tips.length)]
}
