"use client";

import React, { useState, useEffect } from 'react';
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
  | 'verNota';

interface Nota {
  id: number;
  titulo: string;
  contenido: string;
  fecha: string;
  emoji?: string;
}

// ─── Utilidades de patrón (localStorage por ahora, migrar a Supabase luego) ──

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

// ─── Componente principal ─────────────────────────────────────────────────────

export default function DiarioPage() {
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);
  const [vista, setVista] = useState<VistaDiario>('bienvenida');
  const [cargando, setCargando] = useState(true);

  // Patrón
  const [patronCreando, setPatronCreando] = useState<number[]>([]);
  const [patronConfirmando, setPatronConfirmando] = useState<number[]>([]);
  const [patronIngresando, setPatronIngresando] = useState<number[]>([]);
  const [errorPatron, setErrorPatron] = useState<string | null>(null);
  const [intentosFallidos, setIntentosFallidos] = useState(0);

  // Notas
  const [listaNotas, setListaNotas] = useState<Nota[]>([]);
  const [notaActiva, setNotaActiva] = useState<Nota | null>(null);
  const [titulo, setTitulo] = useState('');
  const [contenido, setContenido] = useState('');
  const [estadoDia, setEstadoDia] = useState<{ emoji: string; label: string } | null>(null);
  const [panelAbierto, setPanelAbierto] = useState(false);

  const opcionesEstado = [
    { emoji: '💜', label: 'Productivo' },
    { emoji: '💛', label: 'Cansado' },
    { emoji: '💙', label: 'Tranquilo' },
    { emoji: '💚', label: 'Aprendizaje' },
  ];

  // ─── Al montar: obtener usuario y decidir vista inicial ───────────────────

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      setUserId(user.id);
      setListaNotas(leerNotasDiarioInicial());

      if (esPrimeraVez(user.id)) {
        setVista('bienvenida');
      } else {
        setVista('ingresarPatron');
      }
      setCargando(false);
    };
    init();
  }, []);

  // ─── Handlers de patrón ──────────────────────────────────────────────────

  const togglePunto = (lista: number[], setLista: (v: number[]) => void, idx: number) => {
    if (lista.includes(idx)) {
      setLista(lista.filter(i => i !== idx));
    } else {
      setLista([...lista, idx]);
    }
  };

  const handleConfirmarPatron = () => {
    if (patronCreando.length < 3) {
      setErrorPatron('El patrón debe tener al menos 3 puntos.');
      return;
    }
    setErrorPatron(null);
    setVista('confirmarPatron');
  };

  const handleVerificarConfirmacion = () => {
    if (JSON.stringify(patronCreando) === JSON.stringify(patronConfirmando)) {
      guardarPatron(userId!, patronCreando);
      setErrorPatron(null);
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
      if (nuevosIntentos >= 5) {
        setErrorPatron('Demasiados intentos fallidos. Vuelve más tarde.');
      } else {
        setErrorPatron(`Patrón incorrecto. Te quedan ${5 - nuevosIntentos} intento${5 - nuevosIntentos === 1 ? '' : 's'}.`);
      }
    }
  };

  // ─── Handlers de notas ───────────────────────────────────────────────────

  const guardarNota = async () => {
    if (!userId) return;
    const nueva: Nota = {
      id: Date.now(),
      titulo: titulo || 'Sin título',
      contenido,
      fecha: new Date().toLocaleDateString(),
      emoji: estadoDia?.emoji,
    };
    await insertarNotaDiario(userId, nueva.titulo, nueva.contenido, estadoDia?.emoji ?? null, estadoDia?.label ?? null);
    setListaNotas([nueva, ...listaNotas]);
    setTitulo(''); setContenido(''); setEstadoDia(null);
    setVista('listaNotas');
  };

  const manejarAtras = () => {
    setErrorPatron(null);
    if (vista === 'bienvenida') router.push('/home.2');
    else if (vista === 'crearPatron') setVista('bienvenida');
    else if (vista === 'confirmarPatron') { setPatronConfirmando([]); setVista('crearPatron'); }
    else if (vista === 'ingresarPatron') router.push('/home.2');
    else if (vista === 'listaNotas') setVista('ingresarPatron');
    else if (vista === 'crearNota') setVista('listaNotas');
    else if (vista === 'verNota') setVista('listaNotas');
  };

  const tituloCabecera: Record<VistaDiario, string> = {
    bienvenida: 'Diario emocional',
    crearPatron: 'Crear patrón',
    confirmarPatron: 'Confirmar patrón',
    ingresarPatron: 'Diario emocional',
    listaNotas: 'Diario emocional',
    crearNota: 'Nueva nota',
    verNota: 'Detalle',
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
          <div className="w-9" />
        </div>

        {/* CONTENIDO */}
        <div className="flex-1 overflow-y-auto px-6 py-4 relative">

          {/* ── BIENVENIDA (solo primera vez) ── */}
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
              <h2 className="text-base font-bold text-[#2A3B50]">Crea tu patrón</h2>
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
                <button
                  onClick={() => setPatronCreando([])}
                  className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-2xl text-xs font-bold hover:bg-slate-50 transition-colors"
                >
                  Limpiar
                </button>
                <button
                  onClick={handleConfirmarPatron}
                  disabled={patronCreando.length < 3}
                  className="flex-1 py-3 bg-[#6B66B2] text-white rounded-2xl text-xs font-bold hover:bg-[#5a5596] transition-colors disabled:opacity-40"
                >
                  Continuar
                </button>
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
                <button
                  onClick={() => setPatronConfirmando([])}
                  className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-2xl text-xs font-bold hover:bg-slate-50 transition-colors"
                >
                  Limpiar
                </button>
                <button
                  onClick={handleVerificarConfirmacion}
                  disabled={patronConfirmando.length < 3}
                  className="flex-1 py-3 bg-[#6B66B2] text-white rounded-2xl text-xs font-bold hover:bg-[#5a5596] transition-colors disabled:opacity-40"
                >
                  Confirmar
                </button>
              </div>
            </div>
          )}

          {/* ── INGRESAR PATRÓN (veces siguientes) ── */}
          {vista === 'ingresarPatron' && (
            <div className="flex flex-col items-center pt-6 space-y-2 animate-fadeIn">
              <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-2xl mb-2">🔒</div>
              <h2 className="text-base font-bold text-[#2A3B50]">Ingresa tu patrón</h2>
              <p className="text-[11px] text-slate-400 text-center leading-relaxed px-4">
                Selecciona los puntos en el mismo orden que estableciste.
              </p>

              <GrillaPatron
                seleccionados={patronIngresando}
                onToggle={(idx) => {
                  if (intentosFallidos >= 5) return;
                  togglePunto(patronIngresando, setPatronIngresando, idx);
                }}
                disabled={intentosFallidos >= 5}
              />

              {/* Advertencia de error */}
              {errorPatron && (
                <div className={`w-full rounded-2xl px-4 py-3 text-xs font-medium text-center border ${
                  intentosFallidos >= 5
                    ? 'bg-red-50 border-red-200 text-red-700'
                    : 'bg-amber-50 border-amber-200 text-amber-700'
                }`}>
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
                  <button
                    onClick={() => { setPatronIngresando([]); setErrorPatron(null); }}
                    className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-2xl text-xs font-bold hover:bg-slate-50 transition-colors"
                  >
                    Limpiar
                  </button>
                  <button
                    onClick={handleIngresarPatron}
                    disabled={patronIngresando.length < 1}
                    className="flex-1 py-3 bg-[#6B66B2] text-white rounded-2xl text-xs font-bold hover:bg-[#5a5596] transition-colors disabled:opacity-40"
                  >
                    Entrar
                  </button>
                </div>
              )}

              {/* Olvidaste tu patrón */}
              <button
                onClick={() => {
                  if (window.confirm('¿Seguro que quieres restablecer tu patrón? Tendrás que crear uno nuevo.')) {
                    localStorage.removeItem(PATRON_KEY(userId!));
                    localStorage.removeItem(CONFIGURADO_KEY(userId!));
                    setIntentosFallidos(0);
                    setErrorPatron(null);
                    setPatronIngresando([]);
                    setPatronCreando([]);
                    setPatronConfirmando([]);
                    setVista('crearPatron');
                  }
                }}
                className="text-[11px] text-[#6B66B2] font-medium hover:underline mt-1"
              >
                ¿Olvidaste tu patrón?
              </button>
            </div>
          )}

          {/* ── LISTA DE NOTAS ── */}
          {vista === 'listaNotas' && (
            <div className="space-y-3 pt-2 animate-fadeIn">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Notas recientes</p>
              {listaNotas.length === 0 && (
                <div className="text-center pt-16 space-y-3">
                  <span className="text-5xl">📝</span>
                  <p className="text-xs text-slate-400">Aún no tienes notas. ¡Escribe tu primera entrada!</p>
                </div>
              )}
              {listaNotas.map(nota => (
                <div
                  key={nota.id}
                  onClick={() => { setNotaActiva(nota); setVista('verNota'); }}
                  className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-[#6B66B2] cursor-pointer flex justify-between items-center transition-colors"
                >
                  <div>
                    <p className="text-xs font-bold text-[#2A3B50]">{nota.titulo}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{nota.fecha}</p>
                  </div>
                  <span className="text-2xl">{nota.emoji}</span>
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
                  <p className="text-[10px] text-slate-400">{notaActiva.fecha}</p>
                </div>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <p className="text-xs text-slate-600 leading-relaxed">{notaActiva.contenido}</p>
              </div>
            </div>
          )}

          {/* ── CREAR NOTA ── */}
          {vista === 'crearNota' && (
            <div className="h-full flex flex-col pt-2 animate-fadeIn">
              <input
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Título"
                className="w-full text-sm font-bold p-2 focus:outline-none text-[#2A3B50] placeholder:text-slate-300"
              />
              <div className="w-full h-px bg-slate-100 my-2" />
              <textarea
                value={contenido}
                onChange={(e) => setContenido(e.target.value)}
                placeholder="¿Qué tienes en mente hoy?"
                className="w-full flex-1 p-2 text-xs text-slate-600 focus:outline-none resize-none leading-relaxed placeholder:text-slate-300"
                style={{ scrollbarWidth: 'none' } as React.CSSProperties}
              />

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
                onClick={guardarNota}
                className="w-full py-3 bg-[#6B66B2] text-white rounded-2xl font-bold text-xs shadow-md mb-4 hover:bg-[#5a5596] transition-colors"
              >
                Guardar nota
              </button>
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
                    className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-purple-50 transition-colors"
                  >
                    <span className="text-xl">{op.emoji}</span>
                    <span className="text-xs font-bold text-slate-700">{op.label}</span>
                  </button>
                ))}
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