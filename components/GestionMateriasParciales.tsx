"use client";

import React, { useEffect, useState, useCallback } from 'react';
import {
  crearMateria,
  eliminarMateria,
  leerMateriasUsuario,
  crearParcial,
  eliminarParcial,
  leerParcialesConMateria,
} from '@/lib/supabase/materiasParciales';
import {
  COLORES_MATERIA,
  MAPEO_ICONOS_TIPO_PARCIAL,
  MAPEO_LABEL_TIPO_PARCIAL,
  type Materia,
  type NivelDificultad,
  type ParcialConMateria,
  type TipoParcial,
} from '@/models/cronogramaAcademico';

interface GestionMateriasParcialesProps {
  userId: string;
  onDatosActualizados: (parciales: ParcialConMateria[]) => void;
}

export default function GestionMateriasParciales({
  userId,
  onDatosActualizados,
}: GestionMateriasParcialesProps) {
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [parciales, setParciales] = useState<ParcialConMateria[]>([]);
  const [cargando, setCargando] = useState(true);

  // formulario materia
  const [nombreMateria, setNombreMateria] = useState('');
  const [dificultadMateria, setDificultadMateria] = useState<NivelDificultad>(3);
  const [guardandoMateria, setGuardandoMateria] = useState(false);

  // formulario parcial
  const [materiaIdSeleccionada, setMateriaIdSeleccionada] = useState('');
  const [tituloParcial, setTituloParcial] = useState('');
  const [fechaParcial, setFechaParcial] = useState('');
  const [tipoParcial, setTipoParcial] = useState<TipoParcial>('parcial');
  const [pesoParcial, setPesoParcial] = useState<NivelDificultad>(3);
  const [guardandoParcial, setGuardandoParcial] = useState(false);
  const [errorParcial, setErrorParcial] = useState<string | null>(null);

  const cargarTodo = useCallback(async () => {
    setCargando(true);
    const [mats, pars] = await Promise.all([
      leerMateriasUsuario(userId),
      leerParcialesConMateria(userId),
    ]);
    setMaterias(mats);
    setParciales(pars);
    onDatosActualizados(pars);
    if (!materiaIdSeleccionada && mats.length > 0) {
      setMateriaIdSeleccionada(mats[0].id);
    }
    setCargando(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    cargarTodo();
  }, [cargarTodo]);

  const handleCrearMateria = async () => {
    if (!nombreMateria.trim()) return;
    setGuardandoMateria(true);
    const colorAsignado = COLORES_MATERIA[materias.length % COLORES_MATERIA.length];
    const { error } = await crearMateria(userId, nombreMateria, dificultadMateria, colorAsignado);
    setGuardandoMateria(false);
    if (!error) {
      setNombreMateria('');
      setDificultadMateria(3);
      await cargarTodo();
    }
  };

  const handleEliminarMateria = async (materiaId: string) => {
    const confirmar = window.confirm('Esto también eliminará los parciales asociados. ¿Continuar?');
    if (!confirmar) return;
    await eliminarMateria(materiaId);
    await cargarTodo();
  };

  const handleCrearParcial = async () => {
    setErrorParcial(null);
    if (!materiaIdSeleccionada) {
      setErrorParcial('Primero crea al menos una materia.');
      return;
    }
    if (!tituloParcial.trim() || !fechaParcial) {
      setErrorParcial('Completa el título y la fecha del parcial.');
      return;
    }
    setGuardandoParcial(true);
    const { error } = await crearParcial(
      userId,
      materiaIdSeleccionada,
      tituloParcial,
      fechaParcial,
      tipoParcial,
      pesoParcial
    );
    setGuardandoParcial(false);
    if (error) {
      setErrorParcial('No se pudo guardar el parcial. Intenta de nuevo.');
      return;
    }
    setTituloParcial('');
    setFechaParcial('');
    setTipoParcial('parcial');
    setPesoParcial(3);
    await cargarTodo();
  };

  const handleEliminarParcial = async (parcialId: string) => {
    await eliminarParcial(parcialId);
    await cargarTodo();
  };

  if (cargando) {
    return <p className="text-xs text-slate-400 text-center py-6">Cargando materias...</p>;
  }

  return (
    <div className="space-y-5">
      {/* ── Materias ─────────────────────────────────────────── */}
      <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-3">
        <h4 className="text-sm font-bold text-[#2A3B50]">Mis materias</h4>

        <div className="space-y-2">
          {materias.length === 0 && (
            <p className="text-xs text-slate-400 italic">Aún no has agregado materias.</p>
          )}
          {materias.map((m) => (
            <div key={m.id} className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 bg-slate-50/60">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: m.color }} />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-700 truncate">{m.nombre}</p>
                  <p className="text-[10px] text-slate-400">Dificultad {m.dificultad}/5</p>
                </div>
              </div>
              <button
                onClick={() => handleEliminarMateria(m.id)}
                className="p-1.5 text-slate-300 hover:text-rose-500 transition-colors flex-shrink-0"
                title="Eliminar materia"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-slate-100 space-y-2.5">
          <input
            value={nombreMateria}
            onChange={(e) => setNombreMateria(e.target.value)}
            placeholder="Nombre de la materia (ej. Cálculo II)"
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:border-[#4A72A6]"
          />
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-bold text-slate-400">
              <span>Dificultad</span>
              <span>{dificultadMateria}/5</span>
            </div>
            <input
              type="range"
              min={1}
              max={5}
              value={dificultadMateria}
              onChange={(e) => setDificultadMateria(Number(e.target.value) as NivelDificultad)}
              className="w-full accent-[#4A72A6]"
            />
          </div>
          <button
            onClick={handleCrearMateria}
            disabled={guardandoMateria || !nombreMateria.trim()}
            className="w-full py-2.5 bg-[#4A72A6] hover:bg-[#3B5E8C] disabled:bg-slate-300 text-white text-xs font-bold rounded-xl transition-colors"
          >
            {guardandoMateria ? 'Guardando...' : '+ Agregar materia'}
          </button>
        </div>
      </div>

      {/* ── Parciales ────────────────────────────────────────── */}
      <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-3">
        <h4 className="text-sm font-bold text-[#2A3B50]">Parciales y evaluaciones</h4>

        <div className="space-y-2">
          {parciales.length === 0 && (
            <p className="text-xs text-slate-400 italic">Aún no has agregado parciales.</p>
          )}
          {parciales.map((p) => (
            <div key={p.id} className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 bg-slate-50/60">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-lg flex-shrink-0">{MAPEO_ICONOS_TIPO_PARCIAL[p.tipo]}</span>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-700 truncate">{p.materia.nombre} · {p.titulo}</p>
                  <p className="text-[10px] text-slate-400">
                    {MAPEO_LABEL_TIPO_PARCIAL[p.tipo]} · {p.fecha.split('-').reverse().join('/')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleEliminarParcial(p.id)}
                className="p-1.5 text-slate-300 hover:text-rose-500 transition-colors flex-shrink-0"
                title="Eliminar parcial"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-slate-100 space-y-2.5">
          <select
            value={materiaIdSeleccionada}
            onChange={(e) => setMateriaIdSeleccionada(e.target.value)}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
          >
            <option value="" disabled>Selecciona una materia</option>
            {materias.map((m) => (
              <option key={m.id} value={m.id}>{m.nombre}</option>
            ))}
          </select>

          <input
            value={tituloParcial}
            onChange={(e) => setTituloParcial(e.target.value)}
            placeholder="Título (ej. Segundo parcial)"
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:border-[#4A72A6]"
          />

          <div className="grid grid-cols-2 gap-2.5">
            <input
              type="date"
              value={fechaParcial}
              onChange={(e) => setFechaParcial(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
            />
            <select
              value={tipoParcial}
              onChange={(e) => setTipoParcial(e.target.value as TipoParcial)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
            >
              {(Object.keys(MAPEO_LABEL_TIPO_PARCIAL) as TipoParcial[]).map((t) => (
                <option key={t} value={t}>{MAPEO_LABEL_TIPO_PARCIAL[t]}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-bold text-slate-400">
              <span>Peso / importancia</span>
              <span>{pesoParcial}/5</span>
            </div>
            <input
              type="range"
              min={1}
              max={5}
              value={pesoParcial}
              onChange={(e) => setPesoParcial(Number(e.target.value) as NivelDificultad)}
              className="w-full accent-[#4A72A6]"
            />
          </div>

          {errorParcial && (
            <p className="text-[11px] font-semibold text-rose-600 bg-rose-50 border border-rose-100 rounded-xl p-2.5">
              ⚠️ {errorParcial}
            </p>
          )}

          <button
            onClick={handleCrearParcial}
            disabled={guardandoParcial}
            className="w-full py-2.5 bg-[#4A72A6] hover:bg-[#3B5E8C] disabled:opacity-60 text-white text-xs font-bold rounded-xl transition-colors"
          >
            {guardandoParcial ? 'Guardando...' : '+ Agregar parcial'}
          </button>
        </div>
      </div>
    </div>
  );
}