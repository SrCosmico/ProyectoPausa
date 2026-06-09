import type { TipAntiestres } from '@/types'
import { bcoTipsAntiEstres } from '@/models/monitoreo'

const tipsLocales: TipAntiestres[] = bcoTipsAntiEstres.map((tip) => ({
  id: tip.id,
  contenido: tip.descripcion,
  categoria: tip.titulo,
}))

export const getRandomTip = async (): Promise<TipAntiestres | null> => {
  if (tipsLocales.length === 0) return null
  return tipsLocales[Math.floor(Math.random() * tipsLocales.length)]
}
