// esto es un hook personalizado para manejar el estado del quiz, incluyendo la pregunta actual, el estado de espera y la lógica para guardar emociones temporales.
'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  MAX_CHECKINS_DIARIOS,
  obtenerPreguntaPorPaso,
  TIEMPO_ESPERA_MS,
} from '@/lib/supabase/home'
import {
  cargarQuizState,
  guardarEmocionTemporal as persistirEmocionTemporal,
  hayGuardadoReciente,
  limpiarSenalGuardadoReciente,
  obtenerUsuarioIdLocal,
} from '@/lib/supabase/quizState'

export function useQuizState() {
  const [userId, setUserId] = useState('')
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [esperando, setEsperando] = useState(false)
  const [listo, setListo] = useState(false)

  useEffect(() => {
    const id = obtenerUsuarioIdLocal()
    setUserId(id)

    const state = cargarQuizState(id)
    setCurrentQuestionIndex(state.currentQuestionIndex)

    if (hayGuardadoReciente(id)) {
      limpiarSenalGuardadoReciente(id)
      setEsperando(true)

      const timer = setTimeout(() => {
        setEsperando(false)
      }, TIEMPO_ESPERA_MS)

      setListo(true)
      return () => clearTimeout(timer)
    }

    setListo(true)
  }, [])

  const guardarEmocionTemporal = useCallback(
    (estado: string, emoji: string) => {
      const id = userId || obtenerUsuarioIdLocal()
      persistirEmocionTemporal(id, estado, emoji)
    },
    [userId]
  )

  const preguntaActual = obtenerPreguntaPorPaso(currentQuestionIndex)
  const mostrarCheckin =
    listo && currentQuestionIndex < MAX_CHECKINS_DIARIOS && !esperando

  return {
    userId,
    currentQuestionIndex,
    preguntaActual,
    esperando,
    listo,
    mostrarCheckin,
    guardarEmocionTemporal,
  }
}
