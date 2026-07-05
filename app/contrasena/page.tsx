'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabase';
import { insertarNotaDiario, actualizarEntradaDiario } from '@/lib/supabase/contrasena';

// Interfaz local compatible con notas_diario (id es UUID string de Supabase)
interface NotaDiario {
  id: string;
  user_id: string;
  titulo: string;
  contenido: string;
  fecha: string;
  emoji_dia?: string | null;
  label_dia?: string | null;
}

type VistaDiario = 'bienvenida' | 'bloqueo' | 'listaNotas' | 'crearNota' | 'verNota';

export default function DiarioPage() {
  const router = useRouter();

  const [userId,      setUserId]      = useState<string>('');
  const [vista,       setVista]       = useState<VistaDiario>('bienvenida');
  const [listaNotas,  setListaNotas]  = useState<NotaDiario[]>([]);
  const [notaActiva,  setNotaActiva]  = useState<NotaDiario | null>(null);
  const [cargando,    setCargando]    = useState<boolean>(false);

  // Estados del formulario de creación
  const [titulo,       setTitulo]       = useState('');
  const [contenido,    setContenido]    = useState('');
  const [estadoDia,    setEstadoDia]    = useState<{ emoji: string; label: string } | null>(null);
  const [panelAbierto, setPanelAbierto] = useState(false);

  const opcionesEstado = [
    { emoji: '💜', label: 'Productivo' },
    { emoji: '💛', label: 'Cansado'    },
    { emoji: '💙', label: 'Tranquilo'  },
    { emoji: '💚', label: 'Aprendizaje'},
  ];

  // ── Fetch de notas desde Supabase ────────────────────────────────────────
  const cargarNotas = useCallback(async (uid: string) => {
    if (!uid) return;
    setCargando(true);
    const { data, error } = await supabase
      .from('notas_diario')
      .select('*')
      .eq('user_id', uid)
      .order('fecha', { ascending: false });

    if (!error && data) setListaNotas(data as NotaDiario[]);
    setCargando(false);
  }, []);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      setUserId(user.id);
      await cargarNotas(user.id);
    };
    init();
  }, [router, cargarNotas]);

  // ── Guardar nota nueva en Supabase ───────────────────────────────────────
  const guardarNota = async () => {
    if (!userId) return;
    setCargando(true);

    const { error } = await insertarNotaDiario(
      userId,
      titulo || 'Sin título',
      contenido,
      estadoDia?.emoji  ?? null,
      estadoDia?.label  ?? null
    );

    if (!error) {
      setTitulo('');
      setContenido('');
      setEstadoDia(null);
      await cargarNotas(userId);
      setVista('listaNotas');
    } else {
      console.error('Error al guardar nota:', error);
    }
    setCargando(false);
  };

  // ── Eliminar nota en Supabase ─────────────────────────────────────────────
  const eliminarNota = async (notaId: string) => {
    const { error } = await supabase
      .from('notas_diario')
      .delete()
      .eq('id', notaId);

    if (!error) {
      setListaNotas((prev) => prev.filter((n) => n.id !== notaId));
      if (notaActiva?.id === notaId) {
        setNotaActiva(null);
        setVista('listaNotas');
      }
    }
  };

  const abrirNota = (nota: NotaDiario) => {
    setNotaActiva(nota);
    setVista('verNota');
  };

  const manejarAtras = () => {
    if (vista === 'bienvenida')  router.push('/home');
    else if (vista === 'bloqueo')      setVista('bienvenida');
    else if (vista === 'listaNotas')   setVista('bloqueo');
    else if (vista === 'crearNota')    setVista('listaNotas');
    else if (vista === 'verNota')      setVista('listaNotas');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-0 sm:p-4 font-sans text-slate-800">
      <div className="w-full max-w-md h-screen sm:h-[850px] bg-white shadow-2xl flex flex-col relative sm:rounded-[40px] overflow-hidden border border-slate-100">

        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between z-10 bg-white">
          <button onClick={manejarAtras} className="p-2 -ml-2 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
          </button>
          <h3 className="text-sm font-bold">
            {vista === 'crearNota' ? 'Nueva nota' : vista === 'verNota' ? 'Detalle' : 'Diario emocional'}
          </h3>
          <div className="w-5" />
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto px-6 py-2 relative">

          {/* ── Bienvenida ──────────────────────────────────────────── */}
          {vista === 'bienvenida' && (
            <div className="text-center pt-10 space-y-6">
              <div className="w-40 h-40 bg-purple-50 rounded-full mx-auto flex items-center justify-center text-6xl">📓</div>
              <h2 className="text-xl font-bold">Diario emocional</h2>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">Tu espacio seguro para escribir lo que sientes, sin filtros.</p>
              <button onClick={() => setVista('bloqueo')} className="w-full py-4 bg-[#6B66B2] text-white rounded-xl font-bold text-sm shadow-md hover:bg-[#5a5596]">
                Abrir mi diario
              </button>
            </div>
          )}

          {/* ── Bloqueo (patrón simulado) ────────────────────────────── */}
          {vista === 'bloqueo' && (
            <div className="flex flex-col items-center pt-20 space-y-10">
              <h2 className="text-lg font-bold">Ingresa tu patrón</h2>
              <div className="grid grid-cols-3 gap-10 p-4">
                {[...Array(9)].map((_, i) => (
                  <button key={i} onClick={() => setVista('listaNotas')} className="w-4 h-4 rounded-full border-2 border-slate-300 hover:border-[#6B66B2] transition-all" />
                ))}
              </div>
            </div>
          )}

          {/* ── Lista de notas ───────────────────────────────────────── */}
          {vista === 'listaNotas' && (
            <div className="space-y-4 pt-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Notas guardadas</p>

              {cargando && (
                <p className="text-xs text-slate-400 text-center py-6 animate-pulse">Cargando notas...</p>
              )}

              {!cargando && listaNotas.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-6">Aún no tienes notas. ¡Crea la primera!</p>
              )}

              {listaNotas.map((nota) => (
                <div key={nota.id} className="p-4 bg-white border border-slate-100 rounded-xl shadow-sm flex justify-between items-center cursor-pointer hover:border-[#6B66B2]"
                  onClick={() => abrirNota(nota)}>
                  <div>
                    <p className="text-xs font-bold">{nota.titulo}</p>
                    <p className="text-[10px] text-slate-400">{nota.fecha}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{nota.emoji_dia ?? ''}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); eliminarNota(nota.id); }}
                      className="p-1 text-slate-300 hover:text-rose-500 transition-colors"
                      title="Eliminar nota"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Ver nota ─────────────────────────────────────────────── */}
          {vista === 'verNota' && notaActiva && (
            <div className="pt-4 space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{notaActiva.emoji_dia ?? ''}</span>
                <h2 className="text-lg font-bold text-[#6B66B2]">{notaActiva.titulo}</h2>
              </div>
              <p className="text-[10px] text-slate-400">{notaActiva.fecha} · {notaActiva.label_dia ?? ''}</p>
              <p className="text-xs text-slate-600 leading-relaxed">{notaActiva.contenido}</p>
              <button
                onClick={() => eliminarNota(notaActiva.id)}
                className="mt-4 w-full py-3 border border-rose-100 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold hover:bg-rose-100 transition-colors"
              >
                Eliminar nota
              </button>
            </div>
          )}

          {/* ── Crear nota ───────────────────────────────────────────── */}
          {vista === 'crearNota' && (
            <div className="h-full flex flex-col pt-2">
              <input
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Título"
                className="w-full text-xs font-bold p-2 focus:outline-none border-b border-slate-100 mb-2"
              />
              <textarea
                value={contenido}
                onChange={(e) => setContenido(e.target.value)}
                placeholder="¿Qué tienes en mente hoy?"
                className="w-full flex-1 p-2 text-xs text-slate-600 focus:outline-none resize-none"
              />

              <button
                onClick={() => setPanelAbierto(true)}
                className="mb-4 p-4 rounded-xl bg-purple-50 flex items-center justify-between border border-purple-100 w-full"
              >
                <span className="text-xs font-bold text-purple-700">{estadoDia ? `Día ${estadoDia.label}` : 'Definir mi día'}</span>
                <span className="text-xl">{estadoDia?.emoji ?? '💜'}</span>
              </button>

              <button
                onClick={guardarNota}
                disabled={cargando || !contenido.trim()}
                className="w-full py-3 bg-[#6B66B2] disabled:bg-slate-300 text-white rounded-xl font-bold text-xs shadow-md mb-6 hover:bg-[#5a5596] transition-colors"
              >
                {cargando ? 'Guardando...' : 'Guardar nota'}
              </button>
            </div>
          )}
        </div>

        {/* Panel de estados del día */}
        {panelAbierto && (
          <div className="absolute inset-0 z-50 flex items-end bg-black/20" onClick={() => setPanelAbierto(false)}>
            <div className="w-full bg-white rounded-t-3xl p-6" onClick={(e) => e.stopPropagation()}>
              <h4 className="text-xs font-bold text-slate-800 mb-4">¿Cómo fue tu día?</h4>
              <div className="grid grid-cols-2 gap-3">
                {opcionesEstado.map((op) => (
                  <button
                    key={op.label}
                    onClick={() => { setEstadoDia(op); setPanelAbierto(false); }}
                    className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-purple-50"
                  >
                    <span className="text-xl">{op.emoji}</span>
                    <span className="text-xs font-bold text-slate-700">{op.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* FAB para crear nota */}
        {vista === 'listaNotas' && (
          <button
            onClick={() => setVista('crearNota')}
            className="absolute bottom-8 right-8 w-14 h-14 bg-[#6B66B2] text-white rounded-full shadow-xl flex items-center justify-center text-2xl z-20 hover:bg-[#5a5596]"
          >
            +
          </button>
        )}
      </div>

      <style jsx global>{`
        @keyframes fadeIn  { from { opacity: 0 }  to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(100%) } to { transform: translateY(0) } }
      `}</style>
    </div>
  );
}