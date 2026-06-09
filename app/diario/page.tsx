'use client';

import React, { useState, useEffect } from 'react';
import { 
  crearNotaDiario, 
  obtenerNotasDiario, 
  actualizarNotaDiario, 
  borrarNotaDiario, 
  NotaDiario 
} from '@/lib/supabase/services';

export default function DiarioEmocionalView() {
  // Datos simulados de sesión del estudiante logueado
  const userIdDummy = 'alumno_valeria_ucv';

  // Estados de la data de la Base de Datos
  const [notas, setNotas] = useState<NotaDiario[]>([]);
  const [cargando, setCargando] = useState<boolean>(false);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  // Estados del Formulario (Crear / Editar)
  const [tituloInput, setTituloInput] = useState<string>('');
  const [contenidoInput, setContenidoInput] = useState<string>('');
  const [idNotaEditando, setIdNotaEditando] = useState<string | null>(null);

  // 1. APLICACIÓN DE LA LETRA R (Read): Cargar las notas automáticamente al abrir la pantalla
  useEffect(() => {
    async function cargarHistorialNotas() {
      try {
        setCargando(true);
        const datosBaseDeDatos = await obtenerNotasDiario(userIdDummy);
        setNotas(datosBaseDeDatos);
      } catch (err: unknown) {
        if (err instanceof Error) setMensajeError(err.message);
      } finally {
        setCargando(false);
      }
    }
    cargarHistorialNotas();
  }, [userIdDummy]);

  // 2. APLICACIÓN DE LAS LETRAS C (Create) y U (Update) mediante el envío del formulario
  const handleGuardarNota = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!contenidoInput.trim()) return;

    try {
      setCargando(true);
      setMensajeError(null);

      if (idNotaEditando) {
        // Ejecuta Letra U si estábamos en modo edición
        await actualizarNotaDiario(idNotaEditando, tituloInput, contenidoInput);
      } else {
        // Ejecuta Letra C si es una nota completamente nueva
        await crearNotaDiario(userIdDummy, tituloInput, contenidoInput);
      }

      // Refrescar la lista leyendo de nuevo (Letra R) y limpiar inputs
      const datosActualizados = await obtenerNotasDiario(userIdDummy);
      setNotas(datosActualizados);
      setTituloInput('');
      setContenidoInput('');
      setIdNotaEditando(null);
    } catch (err: unknown) {
      if (err instanceof Error) setMensajeError(err.message);
    } finally {
      setCargando(false);
    }
  };

  // 3. APLICACIÓN DE LA LETRA D (Delete): Borrar nota al hacer clic en la papelera
  const handleEliminarNota = async (id: string) => {
    if (!confirm('¿Seguro que deseas eliminar esta nota de tu diario?')) return;

    try {
      setCargando(true);
      await borrarNotaDiario(id);
      
      // Actualizar el estado local para remover el elemento visual de inmediato
      setNotas(prev => prev.filter(nota => nota.id !== id));
    } catch (err: unknown) {
      if (err instanceof Error) setMensajeError(err.message);
    } finally {
      setCargando(false);
    }
  };

  // Activa el modo edición cargando los valores viejos en los campos de texto
  const iniciarEdicion = (nota: NotaDiario) => {
    setIdNotaEditando(nota.id);
    setTituloInput(nota.titulo);
    setContenidoInput(nota.contenido);
  };

  return (
    <div className="min-h-screen bg-[#FCFBF8] flex items-center justify-center p-0 sm:p-4 font-sans text-[#1E293B] selection:bg-blue-100">
      {/* Contenedor Esqueleto Mobile-First */}
      <div className="w-full max-w-md min-h-screen sm:min-h-[850px] sm:max-h-[900px] bg-white shadow-2xl overflow-y-auto flex flex-col justify-between relative sm:rounded-[40px] border border-gray-100 p-6">
        
        <div className="pt-4">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-black text-[#1E293B] tracking-tight">Mi Diario Emocional</h1>
            <p className="text-xs text-gray-400 mt-1 font-medium">Expresa tus pensamientos para liberar tu mente</p>
          </div>

          {/* Estado de Error */}
          {mensajeError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-xs font-semibold rounded-xl">
              ⚠️ Error: {mensajeError}
            </div>
          )}

          {/* Formulario de Entrada de Datos (Create / Update) */}
          <form onSubmit={handleGuardarNota} className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-3 mb-6">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              {idNotaEditando ? '✏️ Editando Nota' : '✍️ Escribir nueva entrada'}
            </h2>
            <input 
              type="text"
              placeholder="Título de la nota (opcional)"
              className="w-full px-3 py-2 text-sm font-semibold bg-white border border-gray-100 rounded-xl focus:outline-none focus:border-[#5B7A9A] text-gray-700"
              value={tituloInput}
              onChange={(e) => setTituloInput(e.target.value)}
            />
            <textarea 
              required
              rows={3}
              placeholder="¿Qué tienes en mente hoy?..."
              className="w-full px-3 py-2 text-sm font-medium bg-white border border-gray-100 rounded-xl focus:outline-none focus:border-[#5B7A9A] text-gray-700 resize-none"
              value={contenidoInput}
              onChange={(e) => setContenidoInput(e.target.value)}
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={cargando}
                className="flex-1 bg-[#5B7A9A] hover:bg-[#4A6480] text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all disabled:opacity-50"
              >
                {idNotaEditando ? 'Guardar Cambios (U)' : 'Añadir Entrada (C)'}
              </button>
              {idNotaEditando && (
                <button
                  type="button"
                  onClick={() => { setIdNotaEditando(null); setTituloInput(''); setContenidoInput(''); }}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-600 font-bold py-2.5 px-3 rounded-xl text-xs transition-all"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>

          {/* Listado de Tarjetas Renderizadas (Read / Delete) */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Entradas guardadas</h2>
            
            {cargando && notas.length === 0 && (
              <p className="text-xs font-medium text-gray-400 animate-pulse text-center py-4">Cargando notas...</p>
            )}

            {!cargando && notas.length === 0 && (
              <p className="text-xs font-medium text-gray-400 text-center py-4">No hay notas guardadas aún.</p>
            )}

            {notas.map((nota) => (
              <div key={nota.id} className="w-full p-4 rounded-2xl border border-gray-100 bg-white shadow-sm flex justify-between items-start gap-4 hover:border-gray-200 transition-all">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-[#1E293B]">{nota.titulo}</h3>
                    <span className="text-[10px] font-bold text-gray-300">
                      {new Date(nota.fecha).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 font-medium leading-relaxed whitespace-pre-wrap">{nota.contenido}</p>
                </div>

                {/* Botones de acción de la tarjeta */}
                <div className="flex gap-1 shrink-0">
                  <button 
                    onClick={() => iniciarEdicion(nota)}
                    className="p-1.5 text-gray-400 hover:text-[#5B7A9A] rounded-lg hover:bg-gray-50 transition-colors"
                    title="Editar nota (U)"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => handleEliminarNota(nota.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                    title="Eliminar nota (D)"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-100 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-300">Pausa App • Refugio Mental</p>
        </div>

      </div>
    </div>
  );
}