"use client";

import React, { useMemo, useState } from 'react';
import {
  calcularCargaSemanas,
  obtenerMensajeSemaforo,
  obtenerTecnicasSugeridas,
} from '@/lib/cronograma/semaforoEstres';
import type { ParcialConMateria } from '@/models/cronogramaAcademico';

interface SemaforoEstresProps {
  parciales: ParcialConMateria[];
}

const ESTILO_NIVEL: Record<
  string,
  { bg: string; border: string; text: string; dot: string; badge: string; emoji: string; label: string }
> = {
  verde: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
    text: 'text-emerald-700',
    dot: 'bg-emerald-400',
    badge: 'bg-emerald-500',
    emoji: '🟢',
    label: 'Tranquila',
  },
  amarillo: {
    bg: 'bg-amber-50',
    border: 'border-amber-100',
    text: 'text-amber-700',
    dot: 'bg-amber-400',
    badge: 'bg-amber-500',
    emoji: '🟡',
    label: 'Moderada',
  },
  rojo: {
    bg: 'bg-rose-50',
    border: 'border-rose-100',
    text: 'text-rose-700',
    dot: 'bg-rose-500',
    badge: 'bg-rose-500',
    emoji: '🔴',
    label: 'Cargada',
  },
};

export default function SemaforoEstres({ parciales }: SemaforoEstresProps) {
  const semanas = useMemo(() => calcularCargaSemanas(parciales, 4), [parciales]);
  const [semanaAbierta, setSemanaAbierta] = useState<number>(0);

  const formatearRango = (inicioISO: string, finISO: string) => {
    const [, mi, di] = inicioISO.split('-').map(Number);
    const [, mf, df] = finISO.split('-').map(Number);
    const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    return mi === mf
      ? `${di} - ${df} ${meses[mi - 1]}`
      : `${di} ${meses[mi - 1]} - ${df} ${meses[mf - 1]}`;
  };

  const semana = semanas[semanaAbierta];
  const estilo = semana ? ESTILO_NIVEL[semana.nivel] : ESTILO_NIVEL.verde;
  const tecnicas = semana ? obtenerTecnicasSugeridas(semana.nivel) : [];

  return (
    <div className="bg-white border border-slate-100 rounded-[28px] p-5 shadow-sm space-y-5">

      {/* Título */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center text-xl flex-shrink-0">
          🚦
        </div>
        <div className="min-w-0">
          <h4 className="text-sm font-bold text-[#2A3B50]">Semáforo de estrés académico</h4>
          <p className="text-[11px] text-slate-400">Según tus materias y parciales registrados</p>
        </div>
      </div>

      {/* Selector de semanas — pills en vez de barritas */}
      <div className="grid grid-cols-4 gap-2">
        {semanas.map((s, idx) => {
          const est = ESTILO_NIVEL[s.nivel];
          const activo = semanaAbierta === idx;
          return (
            <button
              key={s.inicioSemana}
              onClick={() => setSemanaAbierta(idx)}
              className={`flex flex-col items-center gap-1 py-2.5 rounded-2xl border transition-all ${
                activo
                  ? `${est.bg} ${est.border} shadow-sm`
                  : 'bg-slate-50 border-slate-100 opacity-70 hover:opacity-100'
              }`}
            >
              <span className={`w-2.5 h-2.5 rounded-full ${est.dot}`} />
              <span className="text-[9px] font-bold text-slate-500 leading-none">
                {formatearRango(s.inicioSemana, s.finSemana).split(' - ')[0]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Panel de la semana seleccionada */}
      {semana && (
        <div className={`rounded-[24px] border ${estilo.border} ${estilo.bg} p-4 space-y-4`}>

          {/* Encabezado del panel */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                {formatearRango(semana.inicioSemana, semana.finSemana)}
              </p>
              <p className={`text-sm font-bold ${estilo.text} mt-0.5`}>
                {estilo.emoji} Semana {estilo.label.toLowerCase()}
              </p>
            </div>
            <span className={`text-[10px] font-bold text-white px-2.5 py-1 rounded-full ${estilo.badge}`}>
              {semana.nivel.toUpperCase()}
            </span>
          </div>

          <p className={`text-xs leading-relaxed ${estilo.text} bg-white/60 rounded-xl p-3`}>
            {obtenerMensajeSemaforo(semana.nivel)}
          </p>

          {/* Parciales de la semana */}
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Parciales esta semana
            </p>

            {semana.parciales.length === 0 ? (
              <div className="bg-white/70 rounded-xl px-3 py-3 text-center">
                <p className="text-[11px] text-slate-400 italic">Sin parciales registrados esta semana 🎉</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {semana.parciales.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between bg-white rounded-xl px-3.5 py-2.5 shadow-sm"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: p.materia.color }}
                      />
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-slate-700 truncate">{p.materia.nombre}</p>
                        <p className="text-[10px] text-slate-400 truncate">{p.titulo}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 flex-shrink-0 ml-2 bg-slate-50 px-2 py-1 rounded-lg">
                      {p.fecha.split('-').slice(1).reverse().join('/')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Técnicas sugeridas */}
          <div className="space-y-2 pt-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Técnicas sugeridas para esta semana
            </p>
            <div className="space-y-1.5">
              {tecnicas.slice(0, 3).map((t) => (
                <div key={t.id} className="flex items-start gap-3 bg-white rounded-xl px-3.5 py-3 shadow-sm">
                  <span className="text-lg flex-shrink-0 mt-0.5">{t.icono}</span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-slate-700">{t.titulo}</p>
                    <p className="text-[10px] text-slate-500 leading-snug mt-0.5">{t.descripcion}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}