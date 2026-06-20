"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabase';
import {
  insertarNotaDiario,
  leerNotasDiarioInicial,
} from '@/lib/supabase/contrasena';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type VistaDiario =
  | 'bienvenida'
  | 'crearPatron'
  | 'confirmarPatron'
  | 'ingresarPatron'
  | 'listaNotas'
  | 'crearNota'
  | 'editarNota'
  | 'verNota'
  | 'estadisticas'
  | 'cambiarPatron';

interface Nota {
  id: number;
  titulo: string;
  contenido: string;
  fecha: string;
  emoji?: string;
  label?: string;
}

// ─── Utilidades de patrón ─────────────────────────────────────────────────────
// TODO: migrar a Supabase — guardar hash del patrón en tabla `diario_config`
// para que no quede expuesto en localStorage plain text.

const PATRON_KEY = (uid: string) => `diario_patron_${uid}`;
const CONFIGURADO_KEY = (uid: string) => `diario_configurado_${uid}`;

const guardarPatron = (uid: string, patron: number[]) => {
  localStorage.setItem(PATRON_KEY(uid), JSON.stringify(patron));
  localStorage.setItem(CONFIGURADO_KEY(uid), 'true');
};

const obtenerPatron = (uid: string): number[] | null => {
  const raw = localStorage.getItem(PATRON_KEY(uid));
  return raw ? JSON.parse(raw) : null;
};

const esPrimeraVez = (uid: string): boolean => {
  return localStorage.getItem(CONFIGURADO_KEY(uid)) !== 'true';
};

const borrarPatron = (uid: string) => {
  localStorage.removeItem(PATRON_KEY(uid));
  localStorage.removeItem(CONFIGURADO_KEY(uid));
};

// ─── Componente de grilla de patrón ──────────────────────────────────────────

interface GrillaPatronProps {
  seleccionados: number[];
  onToggle: (idx: number) => void;
  disabled?: boolean;
}

function GrillaPatron({ seleccionados, onToggle, disabled }: GrillaPatronProps) {
  return (
    <div className="grid grid-cols-3 gap-6 p-6">
      {[...Array(9)].map((_, i) => {
        const activo = seleccionados.includes(i);
        return (
          <button
            key={i}
            disabled={disabled}
            onClick={() => onToggle(i)}
            className={`w-12 h-12 rounded-full border-2 transition-all duration-150 flex items-center justify-center mx-auto
              ${activo
                ? 'bg-[#6B66B2] border-[#6B66B2] scale-110 shadow-md shadow-purple-200'
                : 'border-slate-300 hover:border-[#6B66B2] bg-white'
              } ${disabled ? 'cursor-default' : 'cursor-pointer'}`}
          >
            {activo && <span className="w-3 h-3 rounded-full bg-white" />}
          </button>
        );
      })}
    </div>
  );
}

// ─── Componente de estadísticas emocionales ───────────────────────────────────

interface EstadisticasProps {
  notas: Nota[];
}

function PanelEstadisticas({ notas }: EstadisticasProps) {
  const opcionesEstado = [
    { emoji: '💜', label: 'Productivo', color: 'bg-purple-100 text-purple-700 border-purple-200' },
    { emoji: '💛', label: 'Cansado', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    { emoji: '💙', label: 'Tranquilo', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    { emoji: '💚', label: 'Aprendizaje', color: 'bg-green-100 text-green-700 border-green-200' },
  ];

  const conteos = useMemo(() => {
    const map: Record<string, number> = {};
    notas.forEach(n => { if (n.label) map[n.label] = (map[n.label] || 0) + 1; });
    return map;
  }, [notas]);

  const total = notas.filter(n => n.label).length;
  const sinEstado = notas.length - total;

  // Últimos 7 días
  const ultimosDias = useMemo(() => {
    const hoy = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(hoy);
      d.setDate(hoy.getDate() - (6 - i));
      const fechaStr = d.toLocaleDateString();
      const notasDelDia = notas.filter(n => n.fecha === fechaStr);
      const emoji = notasDelDia[notasDelDia.length - 1]?.emoji;
      return { dia: d.toLocaleDateString('es', { weekday: 'short' }), emoji, tiene: notasDelDia.length > 0 };
    });
  }, [notas]);

  if (notas.length === 0) {
    return (
      <div className="text-center pt-16 space-y-3">
        <span className="text-5xl">📊</span>
        <p className="text-xs text-slate-400">Escribe tus primeras notas para ver cómo han sido tus días.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 pt-2 animate-fadeIn">
      {/* Última semana */}
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Última semana</p>
        <div className="flex justify-between gap-1">
          {ultimosDias.map((d, i) => (
            <div key={i} className="flex flex-col items-center gap-1 flex-1">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base border ${d.tiene ? 'bg-purple-50 border-purple-100' : 'bg-slate-50 border-slate-100'}`}>
                {d.emoji || (d.tiene ? '📝' : '')}
              </div>
              <span className="text-[9px] text-slate-400 capitalize">{d.dia}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Resumen total */}
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Mis estados</p>
        <div className="space-y-2">
          {opcionesEstado.map(op => {
            const count = conteos[op.label] || 0;
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <div key={op.label} className="flex items-center gap-3">
                <span className="text-lg w-6">{op.emoji}</span>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-[10px] font-medium text-slate-600">{op.label}</span>
                    <span className="text-[10px] text-slate-400">{count} nota{count !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#6B66B2] rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Totales */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-purple-50 border border-purple-100 rounded-2xl p-3 text-center">
          <p className="text-xl font-bold text-[#6B66B2]">{notas.length}</p>
          <p className="text-[9px] text-slate-500">entradas</p>
        </div>
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 text-center">
          <p className="text-xl font-bold text-slate-700">{total}</p>
          <p className="text-[9px] text-slate-500">con estado</p>
        </div>
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 text-center">
          <p className="text-xl font-bold text-slate-700">{sinEstado}</p>
          <p className="text-[9px] text-slate-500">sin estado</p>
        </div>
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function DiarioPage() {
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);
  const [vista, setVista] = useState<VistaDiario>('bienvenida');
  const [vistaAnterior, setVistaAnterior] = useState<VistaDiario>('listaNotas');
  const [cargando, setCargando] = useState(true);

  // Patrón
  const [patronCreando, setPatronCreando] = useState<number[]>([]);
  const [patronConfirmando, setPatronConfirmando] = useState<number[]>([]);
  const [patronIngresando, setPatronIngresando] = useState<number[]>([]);
  const [errorPatron, setErrorPatron] = useState<string | null>(null);
  const [intentosFallidos, setIntentosFallidos] = useState(0);
  const [esCambioPatron, setEsCambioPatron] = useState(false);

  // Notas
  const [listaNotas, setListaNotas] = useState<Nota[]>([]);
  const [notaActiva, setNotaActiva] = useState<Nota | null>(null);
  const [titulo, setTitulo] = useState('');
  const [contenido, setContenido] = useState('');
  const [estadoDia, setEstadoDia] = useState<{ emoji: string; label: string } | null>(null);
  const [panelAbierto, setPanelAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEmoji, setFiltroEmoji] = useState<string | null>(null);
  const [confirmarEliminar, setConfirmarEliminar] = useState(false);

  const MAX_CONTENIDO = 1000;

  const opcionesEstado = [
    { emoji: '💜', label: 'Productivo' },
    { emoji: '💛', label: 'Cansado' },
    { emoji: '💙', label: 'Tranquilo' },
    { emoji: '💚', label: 'Aprendizaje' },
  ];

  // ─── Notas filtradas ──────────────────────────────────────────────────────

  const notasFiltradas = useMemo(() => {
    return listaNotas.filter(n => {
      const coincideBusqueda =
        busqueda === '' ||
        n.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
        n.contenido.toLowerCase().includes(busqueda.toLowerCase());
      const coincideEmoji = filtroEmoji === null || n.emoji === filtroEmoji;
      return coincideBusqueda && coincideEmoji;
    });
  }, [listaNotas, busqueda, filtroEmoji]);

  // ─── Al montar ───────────────────────────────────────────────────────────

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      setUserId(user.id);
      setListaNotas(leerNotasDiarioInicial());
      setVista(esPrimeraVez(user.id) ? 'bienvenida' : 'ingresarPatron');
      setCargando(false);
    };
    init();
  }, []);

  // ─── Helpers de patrón ───────────────────────────────────────────────────

  const togglePunto = (lista: number[], setLista: (v: number[]) => void, idx: number) => {
    setLista(lista.includes(idx) ? lista.filter(i => i !== idx) : [...lista, idx]);
  };

  const handleConfirmarPatron = () => {
    if (patronCreando.length < 3) { setErrorPatron('El patrón debe tener al menos 3 puntos.'); return; }
    setErrorPatron(null);
    setVista('confirmarPatron');
  };

  const handleVerificarConfirmacion = () => {
    if (JSON.stringify(patronCreando) === JSON.stringify(patronConfirmando)) {
      guardarPatron(userId!, patronCreando);
      setErrorPatron(null);
      setPatronCreando([]);
      setPatronConfirmando([]);
      setEsCambioPatron(false);
      setVista('listaNotas');
    } else {
      setErrorPatron('Los patrones no coinciden. Inténtalo de nuevo.');
      setPatronCreando([]);
      setPatronConfirmando([]);
      setVista('crearPatron');
    }
  };

  const handleIngresarPatron = () => {
    const patronGuardado = obtenerPatron(userId!);
    if (JSON.stringify(patronIngresando) === JSON.stringify(patronGuardado)) {
      setErrorPatron(null);
      setIntentosFallidos(0);
      setPatronIngresando([]);
      setVista('listaNotas');
    } else {
      const nuevosIntentos = intentosFallidos + 1;
      setIntentosFallidos(nuevosIntentos);
      setPatronIngresando([]);
      setErrorPatron(
        nuevosIntentos >= 5
          ? 'Demasiados intentos fallidos. Vuelve más tarde.'
          : `Patrón incorrecto. Te quedan ${5 - nuevosIntentos} intento${5 - nuevosIntentos === 1 ? '' : 's'}.`
      );
    }
  };

  const iniciarCambioPatron = () => {
    setEsCambioPatron(true);
    setPatronCreando([]);
    setPatronConfirmando([]);
    setErrorPatron(null);
    setVista('crearPatron');
  };

  const resetearPatron = () => {
    if (window.confirm('¿Seguro que quieres restablecer tu patrón? Tendrás que crear uno nuevo.')) {
      borrarPatron(userId!);
      setIntentosFallidos(0);
      setErrorPatron(null);
      setPatronIngresando([]);
      setPatronCreando([]);
      setPatronConfirmando([]);
      setEsCambioPatron(false);
      setVista('crearPatron');
    }
  };

  // ─── Handlers de notas ───────────────────────────────────────────────────

  const guardarNota = async () => {
    if (!userId) return;
    const nueva: Nota = {
      id: Date.now(),
      titulo: titulo.trim() || 'Sin título',
      contenido,
      fecha: new Date().toLocaleDateString(),
      emoji: estadoDia?.emoji,
      label: estadoDia?.label,
    };
    await insertarNotaDiario(userId, nueva.titulo, nueva.contenido, estadoDia?.emoji ?? null, estadoDia?.label ?? null);
    setListaNotas([nueva, ...listaNotas]);
    setTitulo(''); setContenido(''); setEstadoDia(null);
    setVista('listaNotas');
  };

  const guardarEdicion = async () => {
    if (!notaActiva || !userId) return;
    const actualizada: Nota = {
      ...notaActiva,
      titulo: titulo.trim() || 'Sin título',
      contenido,
      emoji: estadoDia?.emoji ?? notaActiva.emoji,
      label: estadoDia?.label ?? notaActiva.label,
    };
    // TODO: llamar a updateNotaDiario en Supabase cuando esté disponible
    setListaNotas(listaNotas.map(n => n.id === notaActiva.id ? actualizada : n));
    setNotaActiva(actualizada);
    setTitulo(''); setContenido(''); setEstadoDia(null);
    setVista('verNota');
  };

  const eliminarNota = () => {
    if (!notaActiva) return;
    // TODO: llamar a eliminarNotaDiario en Supabase cuando esté disponible
    setListaNotas(listaNotas.filter(n => n.id !== notaActiva.id));
    setNotaActiva(null);
    setConfirmarEliminar(false);
    setVista('listaNotas');
  };

  const abrirEdicion = (nota: Nota) => {
    setNotaActiva(nota);
    setTitulo(nota.titulo);
    setContenido(nota.contenido);
    setEstadoDia(nota.emoji && nota.label ? { emoji: nota.emoji, label: nota.label } : null);
    setVistaAnterior('verNota');
    setVista('editarNota');
  };

  // ─── Navegación atrás ────────────────────────────────────────────────────

  const manejarAtras = () => {
    setErrorPatron(null);
    if (vista === 'bienvenida') router.push('/home.2');
    else if (vista === 'crearPatron') {
      if (esCambioPatron) { setEsCambioPatron(false); setVista('cambiarPatron'); }
      else setVista('bienvenida');
    }
    else if (vista === 'confirmarPatron') { setPatronConfirmando([]); setVista('crearPatron'); }
    else if (vista === 'ingresarPatron') router.push('/home.2');
    else if (vista === 'listaNotas') setVista('ingresarPatron');
    else if (vista === 'crearNota') { setTitulo(''); setContenido(''); setEstadoDia(null); setVista('listaNotas'); }
    else if (vista === 'editarNota') { setTitulo(''); setContenido(''); setEstadoDia(null); setVista('verNota'); }
    else if (vista === 'verNota') setVista('listaNotas');
    else if (vista === 'estadisticas') setVista('listaNotas');
    else if (vista === 'cambiarPatron') setVista('listaNotas');
  };

  const tituloCabecera: Record<VistaDiario, string> = {
    bienvenida: 'Diario emocional',
    crearPatron: esCambioPatron ? 'Cambiar patrón' : 'Crear patrón',
    confirmarPatron: 'Confirmar patrón',
    ingresarPatron: 'Diario emocional',
    listaNotas: 'Diario emocional',
    crearNota: 'Nueva nota',
    editarNota: 'Editar nota',
    verNota: 'Mi nota',
    estadisticas: 'Mis emociones',
    cambiarPatron: 'Seguridad',
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#6B66B2] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-0 sm:p-4 font-sans text-slate-800">
      <div className="w-full max-w-md h-screen sm:h-[850px] bg-white shadow-2xl flex flex-col relative sm:rounded-[40px] overflow-hidden border border-slate-100">

        {/* HEADER */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between z-10 bg-white border-b border-slate-100">
          <button onClick={manejarAtras} className="p-2 -ml-2 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
          </button>
          <h3 className="text-sm font-bold text-[#2A3B50]">{tituloCabecera[vista]}</h3>

          {/* Acciones del header según vista */}
          {vista === 'listaNotas' ? (
            <button
              onClick={() => setVista('estadisticas')}
              className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
              title="Ver estadísticas"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
              </svg>
            </button>
          ) : vista === 'verNota' ? (
            <div className="flex gap-1">
              <button
                onClick={() => notaActiva && abrirEdicion(notaActiva)}
                className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
                title="Editar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                </svg>
              </button>
              <button
                onClick={() => setConfirmarEliminar(true)}
                className="p-2 text-rose-400 hover:bg-rose-50 rounded-xl transition-colors"
                title="Eliminar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="w-9" />
          )}
        </div>

        {/* CONTENIDO */}
        <div className="flex-1 overflow-y-auto px-6 py-4 relative">

          {/* ── BIENVENIDA ── */}
          {vista === 'bienvenida' && (
            <div className="text-center pt-10 space-y-6 animate-fadeIn">
              <div className="w-36 h-36 bg-purple-50 rounded-full mx-auto flex items-center justify-center text-6xl">📓</div>
              <div>
                <h2 className="text-xl font-bold text-[#2A3B50]">Diario emocional</h2>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Tu espacio privado. Protegido con un patrón que solo tú conoces.
                </p>
              </div>
              <button
                onClick={() => setVista('crearPatron')}
                className="w-full py-4 bg-[#6B66B2] text-white rounded-2xl font-bold text-sm shadow-md hover:bg-[#5a5596] transition-colors"
              >
                Crear mi patrón y abrir el diario
              </button>
            </div>
          )}

          {/* ── CREAR PATRÓN ── */}
          {vista === 'crearPatron' && (
            <div className="flex flex-col items-center pt-6 space-y-2 animate-fadeIn">
              <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-2xl mb-2">🔐</div>
              <h2 className="text-base font-bold text-[#2A3B50]">
                {esCambioPatron ? 'Crea tu nuevo patrón' : 'Crea tu patrón'}
              </h2>
              <p className="text-[11px] text-slate-400 text-center leading-relaxed px-4">
                Selecciona al menos 3 puntos en el orden que quieras. Recuérdalo bien.
              </p>
              <GrillaPatron
                seleccionados={patronCreando}
                onToggle={(idx) => togglePunto(patronCreando, setPatronCreando, idx)}
              />
              {errorPatron && (
                <div className="w-full bg-rose-50 border border-rose-200 rounded-2xl px-4 py-3 text-xs text-rose-700 font-medium text-center">
                  {errorPatron}
                </div>
              )}
              <p className="text-[10px] text-slate-400">
                {patronCreando.length} punto{patronCreando.length !== 1 ? 's' : ''} seleccionado{patronCreando.length !== 1 ? 's' : ''}
              </p>
              <div className="flex gap-3 w-full pt-2">
                <button onClick={() => setPatronCreando([])} className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-2xl text-xs font-bold hover:bg-slate-50 transition-colors">Limpiar</button>
                <button onClick={handleConfirmarPatron} disabled={patronCreando.length < 3} className="flex-1 py-3 bg-[#6B66B2] text-white rounded-2xl text-xs font-bold hover:bg-[#5a5596] transition-colors disabled:opacity-40">Continuar</button>
              </div>
            </div>
          )}

          {/* ── CONFIRMAR PATRÓN ── */}
          {vista === 'confirmarPatron' && (
            <div className="flex flex-col items-center pt-6 space-y-2 animate-fadeIn">
              <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-2xl mb-2">✅</div>
              <h2 className="text-base font-bold text-[#2A3B50]">Confirma tu patrón</h2>
              <p className="text-[11px] text-slate-400 text-center leading-relaxed px-4">
                Repite el mismo patrón que acabas de crear para confirmarlo.
              </p>
              <GrillaPatron
                seleccionados={patronConfirmando}
                onToggle={(idx) => togglePunto(patronConfirmando, setPatronConfirmando, idx)}
              />
              {errorPatron && (
                <div className="w-full bg-rose-50 border border-rose-200 rounded-2xl px-4 py-3 text-xs text-rose-700 font-medium text-center">
                  {errorPatron}
                </div>
              )}
              <p className="text-[10px] text-slate-400">
                {patronConfirmando.length} punto{patronConfirmando.length !== 1 ? 's' : ''} seleccionado{patronConfirmando.length !== 1 ? 's' : ''}
              </p>
              <div className="flex gap-3 w-full pt-2">
                <button onClick={() => setPatronConfirmando([])} className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-2xl text-xs font-bold hover:bg-slate-50 transition-colors">Limpiar</button>
                <button onClick={handleVerificarConfirmacion} disabled={patronConfirmando.length < 3} className="flex-1 py-3 bg-[#6B66B2] text-white rounded-2xl text-xs font-bold hover:bg-[#5a5596] transition-colors disabled:opacity-40">Confirmar</button>
              </div>
            </div>
          )}

          {/* ── INGRESAR PATRÓN ── */}
          {vista === 'ingresarPatron' && (
            <div className="flex flex-col items-center pt-6 space-y-2 animate-fadeIn">
              <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-2xl mb-2">🔒</div>
              <h2 className="text-base font-bold text-[#2A3B50]">Ingresa tu patrón</h2>
              <p className="text-[11px] text-slate-400 text-center leading-relaxed px-4">
                Selecciona los puntos en el mismo orden que estableciste.
              </p>
              <GrillaPatron
                seleccionados={patronIngresando}
                onToggle={(idx) => { if (intentosFallidos >= 5) return; togglePunto(patronIngresando, setPatronIngresando, idx); }}
                disabled={intentosFallidos >= 5}
              />
              {errorPatron && (
                <div className={`w-full rounded-2xl px-4 py-3 text-xs font-medium text-center border ${intentosFallidos >= 5 ? 'bg-red-50 border-red-200 text-red-700' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
                  {intentosFallidos >= 5 ? '🔒 ' : '⚠️ '}{errorPatron}
                </div>
              )}
              {intentosFallidos < 5 && (
                <p className="text-[10px] text-slate-400">
                  {patronIngresando.length} punto{patronIngresando.length !== 1 ? 's' : ''} seleccionado{patronIngresando.length !== 1 ? 's' : ''}
                </p>
              )}
              {intentosFallidos < 5 && (
                <div className="flex gap-3 w-full pt-2">
                  <button onClick={() => { setPatronIngresando([]); setErrorPatron(null); }} className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-2xl text-xs font-bold hover:bg-slate-50 transition-colors">Limpiar</button>
                  <button onClick={handleIngresarPatron} disabled={patronIngresando.length < 1} className="flex-1 py-3 bg-[#6B66B2] text-white rounded-2xl text-xs font-bold hover:bg-[#5a5596] transition-colors disabled:opacity-40">Entrar</button>
                </div>
              )}
              <button onClick={resetearPatron} className="text-[11px] text-[#6B66B2] font-medium hover:underline mt-1">
                ¿Olvidaste tu patrón?
              </button>
            </div>
          )}

          {/* ── LISTA DE NOTAS ── */}
          {vista === 'listaNotas' && (
            <div className="space-y-3 pt-2 animate-fadeIn">
              {/* Buscador */}
              <div className="relative">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
                <input
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar en tus notas..."
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs text-slate-700 placeholder:text-slate-300 focus:outline-none focus:border-[#6B66B2] transition-colors"
                />
              </div>

              {/* Filtros por emoji */}
              <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                <button
                  onClick={() => setFiltroEmoji(null)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[10px] font-bold border transition-colors ${filtroEmoji === null ? 'bg-[#6B66B2] text-white border-[#6B66B2]' : 'bg-white text-slate-500 border-slate-200'}`}
                >
                  Todas
                </button>
                {opcionesEstado.map(op => (
                  <button
                    key={op.label}
                    onClick={() => setFiltroEmoji(filtroEmoji === op.emoji ? null : op.emoji)}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[10px] font-bold border transition-colors ${filtroEmoji === op.emoji ? 'bg-[#6B66B2] text-white border-[#6B66B2]' : 'bg-white text-slate-500 border-slate-200'}`}
                  >
                    {op.emoji} {op.label}
                  </button>
                ))}
              </div>

              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {notasFiltradas.length} nota{notasFiltradas.length !== 1 ? 's' : ''}
              </p>

              {notasFiltradas.length === 0 && (
                <div className="text-center pt-10 space-y-3">
                  <span className="text-5xl">{listaNotas.length === 0 ? '📝' : '🔍'}</span>
                  <p className="text-xs text-slate-400">
                    {listaNotas.length === 0 ? '¡Escribe tu primera entrada!' : 'No hay notas que coincidan.'}
                  </p>
                </div>
              )}

              {notasFiltradas.map(nota => (
                <div
                  key={nota.id}
                  onClick={() => { setNotaActiva(nota); setVista('verNota'); }}
                  className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-[#6B66B2] cursor-pointer flex justify-between items-center transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[#2A3B50] truncate">{nota.titulo}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{nota.fecha}</p>
                    {nota.contenido && (
                      <p className="text-[10px] text-slate-400 mt-1 truncate">{nota.contenido}</p>
                    )}
                  </div>
                  <span className="text-2xl ml-3 flex-shrink-0">{nota.emoji}</span>
                </div>
              ))}
            </div>
          )}

          {/* ── VER NOTA ── */}
          {vista === 'verNota' && notaActiva && (
            <div className="pt-4 space-y-4 animate-fadeIn">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{notaActiva.emoji}</span>
                <div>
                  <h2 className="text-base font-bold text-[#6B66B2]">{notaActiva.titulo}</h2>
                  <p className="text-[10px] text-slate-400">{notaActiva.fecha} {notaActiva.label && `· ${notaActiva.label}`}</p>
                </div>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 min-h-[200px]">
                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">{notaActiva.contenido}</p>
              </div>
            </div>
          )}

          {/* ── CREAR NOTA ── */}
          {(vista === 'crearNota' || vista === 'editarNota') && (
            <div className="h-full flex flex-col pt-2 animate-fadeIn">
              <input
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Título"
                maxLength={80}
                className="w-full text-sm font-bold p-2 focus:outline-none text-[#2A3B50] placeholder:text-slate-300"
              />
              <div className="w-full h-px bg-slate-100 my-2" />
              <textarea
                value={contenido}
                onChange={(e) => setContenido(e.target.value.slice(0, MAX_CONTENIDO))}
                placeholder="¿Qué tienes en mente hoy?"
                className="w-full flex-1 p-2 text-xs text-slate-600 focus:outline-none resize-none leading-relaxed placeholder:text-slate-300"
                style={{ scrollbarWidth: 'none' } as React.CSSProperties}
              />
              <div className="flex justify-end mb-1">
                <span className={`text-[9px] ${contenido.length >= MAX_CONTENIDO ? 'text-rose-400 font-bold' : 'text-slate-300'}`}>
                  {contenido.length}/{MAX_CONTENIDO}
                </span>
              </div>

              <button
                onClick={() => setPanelAbierto(true)}
                className="mb-3 p-4 rounded-2xl bg-purple-50 flex items-center justify-between border border-purple-100 w-full transition-all hover:bg-purple-100"
              >
                <span className="text-xs font-bold text-purple-700">
                  {estadoDia ? `Día ${estadoDia.label}` : 'Definir mi día'}
                </span>
                <span className="text-xl">{estadoDia?.emoji || '💜'}</span>
              </button>

              <button
                onClick={vista === 'crearNota' ? guardarNota : guardarEdicion}
                className="w-full py-3 bg-[#6B66B2] text-white rounded-2xl font-bold text-xs shadow-md mb-4 hover:bg-[#5a5596] transition-colors"
              >
                {vista === 'crearNota' ? 'Guardar nota' : 'Guardar cambios'}
              </button>
            </div>
          )}

          {/* ── ESTADÍSTICAS ── */}
          {vista === 'estadisticas' && (
            <PanelEstadisticas notas={listaNotas} />
          )}

          {/* ── CAMBIAR PATRÓN ── */}
          {vista === 'cambiarPatron' && (
            <div className="pt-6 space-y-4 animate-fadeIn">
              <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-2xl mx-auto">🛡️</div>
              <div className="text-center space-y-1">
                <h2 className="text-base font-bold text-[#2A3B50]">Seguridad del diario</h2>
                <p className="text-[11px] text-slate-400">Gestiona el patrón de acceso a tu diario.</p>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  onClick={iniciarCambioPatron}
                  className="w-full p-4 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-center gap-3 hover:border-[#6B66B2] transition-colors text-left"
                >
                  <span className="text-xl">🔄</span>
                  <div>
                    <p className="text-xs font-bold text-[#2A3B50]">Cambiar patrón</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Crea un patrón nuevo para acceder al diario.</p>
                  </div>
                </button>

                <button
                  onClick={resetearPatron}
                  className="w-full p-4 bg-white border border-rose-100 rounded-2xl shadow-sm flex items-center gap-3 hover:border-rose-300 transition-colors text-left"
                >
                  <span className="text-xl">⚠️</span>
                  <div>
                    <p className="text-xs font-bold text-rose-600">Restablecer patrón</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Borra el patrón actual y crea uno desde cero.</p>
                  </div>
                </button>
              </div>

              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
                <p className="text-[10px] text-amber-700 leading-relaxed">
                  ⚠️ El patrón se guarda localmente en este dispositivo. Si cambias de navegador o dispositivo, necesitarás restablecerlo.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* FAB nueva nota */}
        {vista === 'listaNotas' && (
          <button
            onClick={() => setVista('crearNota')}
            className="absolute bottom-8 right-8 w-14 h-14 bg-[#6B66B2] text-white rounded-full shadow-xl flex items-center justify-center text-2xl z-20 hover:bg-[#5a5596] transition-colors"
          >
            +
          </button>
        )}

        {/* Botón seguridad dentro del diario */}
        {vista === 'listaNotas' && (
          <button
            onClick={() => setVista('cambiarPatron')}
            className="absolute bottom-8 left-8 w-14 h-14 bg-white border border-slate-200 text-slate-500 rounded-full shadow-md flex items-center justify-center text-xl z-20 hover:bg-slate-50 transition-colors"
            title="Seguridad"
          >
            🛡️
          </button>
        )}

        {/* PANEL DE ESTADOS */}
        {panelAbierto && (
          <div
            className="absolute inset-0 z-50 flex items-end bg-black/20 animate-fadeIn"
            onClick={() => setPanelAbierto(false)}
          >
            <div
              className="w-full bg-white rounded-t-3xl p-6 animate-slideUp"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-4" />
              <h4 className="text-xs font-bold text-slate-800 mb-4">¿Cómo fue tu día?</h4>
              <div className="grid grid-cols-2 gap-3">
                {opcionesEstado.map((op) => (
                  <button
                    key={op.label}
                    onClick={() => { setEstadoDia(op); setPanelAbierto(false); }}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${estadoDia?.label === op.label ? 'bg-purple-50 border-[#6B66B2]' : 'border-slate-100 hover:bg-purple-50'}`}
                  >
                    <span className="text-xl">{op.emoji}</span>
                    <span className="text-xs font-bold text-slate-700">{op.label}</span>
                  </button>
                ))}
              </div>
              {estadoDia && (
                <button
                  onClick={() => { setEstadoDia(null); setPanelAbierto(false); }}
                  className="w-full mt-3 py-2 text-[10px] text-slate-400 hover:text-slate-600 font-medium transition-colors"
                >
                  Quitar estado
                </button>
              )}
            </div>
          </div>
        )}

        {/* MODAL CONFIRMAR ELIMINAR */}
        {confirmarEliminar && (
          <div
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/30 animate-fadeIn px-6"
            onClick={() => setConfirmarEliminar(false)}
          >
            <div
              className="w-full bg-white rounded-3xl p-6 shadow-2xl animate-fadeIn"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center space-y-3">
                <span className="text-4xl">🗑️</span>
                <h4 className="text-sm font-bold text-[#2A3B50]">¿Eliminar esta nota?</h4>
                <p className="text-[11px] text-slate-400">Esta acción no se puede deshacer.</p>
              </div>
              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => setConfirmarEliminar(false)}
                  className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-2xl text-xs font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={eliminarNota}
                  className="flex-1 py-3 bg-rose-500 text-white rounded-2xl text-xs font-bold hover:bg-rose-600 transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        .animate-fadeIn  { animation: fadeIn  0.25s ease-out; }
        .animate-slideUp { animation: slideUp 0.3s cubic-bezier(0.32,0.72,0,1); }
        @keyframes fadeIn  { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
      `}</style>
    </div>
  );
}