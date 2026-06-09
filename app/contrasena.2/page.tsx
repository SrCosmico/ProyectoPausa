"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
// DELATE
import { deleteNota } from '@/lib/supabase/contrasena';

type VistaDiario = 'bienvenida' | 'bloqueo' | 'listaNotas' | 'crearNota' | 'verNota';

interface Nota {
  id: number;
  titulo: string;
  contenido: string;
  fecha: string;
  emoji?: string;
}

export default function DiarioPage() {
  const router = useRouter();
  const [vista, setVista] = useState<VistaDiario>('bienvenida');
  const [listaNotas, setListaNotas] = useState<Nota[]>([]);
  const [notaActiva, setNotaActiva] = useState<Nota | null>(null);

  // Estados del formulario
  const [titulo, setTitulo] = useState("");
  const [contenido, setContenido] = useState("");
  const [estadoDia, setEstadoDia] = useState<{emoji: string, label: string} | null>(null);
  const [panelAbierto, setPanelAbierto] = useState(false);

  const opcionesEstado = [
    { emoji: "💜", label: "Productivo" },
    { emoji: "💛", label: "Cansado" },
    { emoji: "💙", label: "Tranquilo" },
    { emoji: "💚", label: "Aprendizaje" }
  ];

  const guardarNota = () => {
    const nuevaNota: Nota = {
      id: Date.now(),
      titulo: titulo || "Sin título",
      contenido: contenido,
      fecha: new Date().toLocaleDateString(),
      emoji: estadoDia?.emoji
    };
    setListaNotas([nuevaNota, ...listaNotas]);
    setTitulo(""); setContenido(""); setEstadoDia(null);
    setVista('listaNotas');
  };

  const abrirNota = (nota: Nota) => {
    setNotaActiva(nota);
    setVista('verNota');
  };

  const manejarAtras = () => {
    if (vista === 'bienvenida') router.push('/home.2');
    else if (vista === 'bloqueo') setVista('bienvenida');
    else if (vista === 'listaNotas') setVista('bloqueo');
    else if (vista === 'crearNota') setVista('listaNotas');
    else if (vista === 'verNota') setVista('listaNotas');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-0 sm:p-4 font-sans text-slate-800">
      <div className="w-full max-w-md h-screen sm:h-[850px] bg-white shadow-2xl flex flex-col relative sm:rounded-[40px] overflow-hidden border border-slate-100">
        
        {/* HEADER */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between z-10 bg-white">
          <button onClick={manejarAtras} className="p-2 -ml-2 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" /></svg>
          </button>
          <h3 className="text-sm font-bold">
            {vista === 'crearNota' ? "Nueva nota" : vista === 'verNota' ? "Detalle" : "Diario emocional"}
          </h3>
          <div className="w-5"></div>
        </div>

        {/* CONTENIDO */}
        <div className="flex-1 overflow-y-auto px-6 py-2 relative">
          
          {vista === 'bienvenida' && (
            <div className="text-center pt-10 space-y-6 animate-fadeIn">
              <div className="w-40 h-40 bg-purple-50 rounded-full mx-auto flex items-center justify-center text-6xl">📓</div>
              <h2 className="text-xl font-bold">Diario emocional</h2>
              <button onClick={() => setVista('bloqueo')} className="w-full py-4 bg-[#6B66B2] text-white rounded-xl font-bold text-sm shadow-md hover:bg-[#5a5596]">Abrir mi diario</button>
            </div>
          )}

          {vista === 'bloqueo' && (
            <div className="flex flex-col items-center pt-20 space-y-10 animate-fadeIn">
              <h2 className="text-lg font-bold">Ingresa tu patrón</h2>
              <div className="grid grid-cols-3 gap-10 p-4">
                {[...Array(9)].map((_, i) => (
                  <button key={i} onClick={() => setVista('listaNotas')} className="w-4 h-4 rounded-full border-2 border-slate-300 hover:border-[#6B66B2] transition-all" />
                ))}
              </div>
            </div>
          )}

          {vista === 'listaNotas' && (
            <div className="space-y-4 pt-4 animate-fadeIn">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Notas recientes</p>
              {listaNotas.map(nota => (
                <div key={nota.id} onClick={() => abrirNota(nota)} className="p-4 bg-white border border-slate-100 rounded-xl shadow-sm hover:border-[#6B66B2] cursor-pointer flex justify-between items-center">
                  <div>
                    <p className="text-xs font-bold">{nota.titulo}</p>
                    <p className="text-[10px] text-slate-400">{nota.fecha}</p>
                  </div>
                  <span className="text-xl">{nota.emoji}</span>
                </div>
              ))}
            </div>
          )}

          {vista === 'verNota' && notaActiva && (
            <div className="pt-4 space-y-4 animate-fadeIn">
              <h2 className="text-lg font-bold text-[#6B66B2]">{notaActiva.titulo}</h2>
              <p className="text-xs text-slate-600 leading-relaxed">{notaActiva.contenido}</p>
              <div className="text-sm font-bold pt-4 border-t">Estado del día: {notaActiva.emoji}</div>
            </div>
          )}

          {vista === 'crearNota' && (
            <div className="h-full flex flex-col pt-2 animate-fadeIn">
              <input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Título" className="w-full text-xs font-bold p-2 focus:outline-none" />
              <textarea value={contenido} onChange={(e) => setContenido(e.target.value)} placeholder="¿Qué tienes en mente hoy?" className="w-full flex-1 p-2 text-xs text-slate-600 focus:outline-none resize-none mt-2" />
              
              <button onClick={() => setPanelAbierto(true)} className="mb-4 p-4 rounded-xl bg-purple-50 flex items-center justify-between border border-purple-100 w-full transition-all">
                <span className="text-xs font-bold text-purple-700">{estadoDia ? `Día ${estadoDia.label}` : "Definir mi día"}</span>
                <span className="text-xl">{estadoDia?.emoji || "💜"}</span>
              </button>

              <button onClick={guardarNota} className="w-full py-3 bg-[#6B66B2] text-white rounded-xl font-bold text-xs shadow-md mb-6 hover:bg-[#5a5596]">Guardar nota</button>
            </div>
          )}
        </div>

        {/* PANEL DE ESTADOS */}
        {panelAbierto && (
          <div className="absolute inset-0 z-50 flex items-end bg-black/20 animate-fadeIn" onClick={() => setPanelAbierto(false)}>
            <div className="w-full bg-white rounded-t-3xl p-6 animate-slideUp" onClick={(e) => e.stopPropagation()}>
              <h4 className="text-xs font-bold text-slate-800 mb-4">¿Cómo fue tu día?</h4>
              <div className="grid grid-cols-2 gap-3">
                {opcionesEstado.map((op) => (
                  <button key={op.label} onClick={() => { setEstadoDia(op); setPanelAbierto(false); }} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-purple-50">
                    <span className="text-xl">{op.emoji}</span>
                    <span className="text-xs font-bold text-slate-700">{op.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {vista === 'listaNotas' && (
          <button onClick={() => setVista('crearNota')} className="absolute bottom-8 right-8 w-14 h-14 bg-[#6B66B2] text-white rounded-full shadow-xl flex items-center justify-center text-2xl z-20">+</button>
        )}
      </div>
      <style jsx global>{`
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-slideUp { animation: slideUp 0.3s ease-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
      `}</style>
    </div>
  );
}