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

const COLOR_NIVEL: Record<string, { bg: string; text: string; dot: string }> = {
  verde:    { bg: 'bg-emerald-50 border-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-400' },
  amarillo: { bg: 'bg-amber-50 border-amber-100',     text: 'text-amber-700',  dot: 'bg-amber-400' },
  rojo:     { bg: 'bg-rose-50 border-rose-100',       text: 'text-rose-700',   dot: 'bg-rose-500' },
};

export default function SemaforoEstres({ parciales }: SemaforoEstresProps) {
  const semanas = useMemo(() => calcularCargaSemanas(parciales, 4), [parciales]);
  const [semanaAbierta, setSemanaAbierta] = useState<number>(0);

  const formatearRango = (inicioISO: string, finISO: string) => {
    const [ai, mi, di] = inicioISO.split('-').map(Number);
    const [, mf, df] = finISO.split('-').map(Number);
    const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    return mi === mf
      ? `${di} - ${df} ${meses[mi - 1]}`
      : `${di} ${meses[mi - 1]} - ${df} ${meses[mf - 1]}`;
  };

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
      <div>
        <h4 className="text-sm font-bold text-[#2A3B50]">Semáforo de estrés académico</h4>
        <p className="text-[11px] text-slate-400 mt-0.5">Según tus materias y parciales registrados</p>
      </div>

      <div className="flex gap-1.5">
        {semanas.map((s, idx) => (
          <button
            key={s.inicioSemana}
            onClick={() => setSemanaAbierta(idx)}
            className={`flex-1 h-2.5 rounded-full transition-all ${COLOR_NIVEL[s.nivel].dot} ${
              semanaAbierta === idx ? 'opacity-100 ring-2 ring-offset-1 ring-slate-300' : 'opacity-60'
            }`}
            title={formatearRango(s.inicioSemana, s.finSemana)}
          />
        ))}
      </div>

      {semanas[semanaAbierta] && (() => {
        const semana = semanas[semanaAbierta];
        const estilo = COLOR_NIVEL[semana.nivel];
        const tecnicas = obtenerTecnicasSugeridas(semana.nivel);

        return (
          <div className={`rounded-2xl border p-4 space-y-3 ${estilo.bg}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">
                {formatearRango(semana.inicioSemana, semana.finSemana)}
              </span>
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-white/70 ${estilo.text}`}>
                {semana.nivel}
              </span>
            </div>

            <p className={`text-xs font-medium leading-relaxed ${estilo.text}`}>
              {obtenerMensajeSemaforo(semana.nivel)}
            </p>

            {semana.parciales.length > 0 && (
              <div className="space-y-1.5">
                {semana.parciales.map((p) => (
                  <div key={p.id} className="flex items-center justify-between bg-white/70 rounded-xl px-3 py-2">
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-slate-700 truncate">{p.materia.nombre}</p>
                      <p className="text-[10px] text-slate-400 truncate">{p.titulo}</p>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 flex-shrink-0 ml-2">
                      {p.fecha.split('-').slice(1).reverse().join('/')}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {semana.parciales.length === 0 && (
              <p className="text-[11px] text-slate-400 italic">Sin parciales registrados esta semana.</p>
            )}

            <div className="pt-2 border-t border-white/60 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Técnicas sugeridas</p>
              {tecnicas.slice(0, 3).map((t) => (
                <div key={t.id} className="flex items-start gap-2 bg-white/70 rounded-xl px-3 py-2">
                  <span className="text-base flex-shrink-0">{t.icono}</span>
                  <div>
                    <p className="text-[11px] font-bold text-slate-700">{t.titulo}</p>
                    <p className="text-[10px] text-slate-500 leading-snug">{t.descripcion}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}
    </div>
  );
}