"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

import { 
  leerHistorialEmocionalSemanal, 
  crearRegistroEmocional, 
  actualizarRegistroEmocional, 
  eliminarRegistroEmocional 
} from '@/lib/supabase/monitoreo';



interface RegistroHistorico {
  id?: string;
  fecha: string; 
  nivel: number; 
  emoji: string;
  estado: string;
  nota: string | null;
}

interface TipAntiestres {
  id: number;
  contenido: string;
  categoria: string;
}

// Datos simulados para arrancar
const datosIniciales: RegistroHistorico[] = [
  { id: '1', fecha: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0], nivel: 2, emoji: "😔", estado: "Mal", nota: "Mucho estrés por un parcial" },
  { id: '2', fecha: new Date(Date.now() - 86400000 * 1).toISOString().split('T')[0], nivel: 4, emoji: "😊", estado: "Bien", nota: "Pude descansar mejor" },
  { id: '3', fecha: new Date().toISOString().split('T')[0], nivel: 5, emoji: "🤩", estado: "Muy bien", nota: "Entregué el proyecto" },
];

const opcionesEmociones = [
  { n: 1, e: '😩', s: 'Muy mal' },
  { n: 2, e: '😔', s: 'Mal' },
  { n: 3, e: '😐', s: 'Regular' },
  { n: 4, e: '😊', s: 'Bien' },
  { n: 5, e: '🤩', s: 'Muy bien' }
];

const bancoTips: TipAntiestres[] = [
  { id: 1, contenido: 'Recuerda hacer pausas activas cada 45 minutos de estudio. Estira tu cuello y hombros.', categoria: 'Relajación física' },
  { id: 2, contenido: 'Respira profundo: inhala en 4 segundos, sostén 4, exhala en 4. Repite 3 veces.', categoria: 'Respiración' },
  { id: 3, contenido: 'Aléjate de las pantallas por 10 minutos. Cierra los ojos y escucha tu entorno.', categoria: 'Desconexión digital' },
  { id: 4, contenido: 'Toma un vaso de agua fresca. La hidratación mejora la concentración y alivia la tensión.', categoria: 'Hábitos saludables' },
];

export default function MonitoreoPage() {
  const router = useRouter();
  const [registros, setRegistros] = useState<RegistroHistorico[]>([]);
  
  // Estados para el Modal
  const [modalAbierto, setModalAbierto] = useState(false);
  const [registroEditando, setRegistroEditando] = useState<RegistroHistorico | null>(null);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date().toISOString().split('T')[0]);
  const [emocionSeleccionada, setEmocionSeleccionada] = useState(opcionesEmociones[3]);
  const [notaActual, setNotaActual] = useState("");

  const [tipDelDia, setTipDelDia] = useState<TipAntiestres>(bancoTips[0]);

  const estadoActual = registros.find(r => r.fecha === new Date().toISOString().split('T')[0]);

  // Generar lista de los últimos 14 días
  const generarDiasCalendario = () => {
    const dias = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const fechaStr = d.toISOString().split('T')[0];
      const registro = registros.find(r => r.fecha === fechaStr);
      dias.push({ fecha: fechaStr, registro });
    }
    return dias;
  };

  const abrirModal = (fecha: string, registroExistente?: RegistroHistorico) => {
    setFechaSeleccionada(fecha);
    if (registroExistente) {
      setRegistroEditando(registroExistente);
      const emo = opcionesEmociones.find(e => e.s === registroExistente.estado) || opcionesEmociones[3];
      setEmocionSeleccionada(emo);
      setNotaActual(registroExistente.nota || "");
    } else {
      setRegistroEditando(null);
      setEmocionSeleccionada(opcionesEmociones[3]);
      setNotaActual("");
    }
    setModalAbierto(true);
  };

  const guardarRegistro = () => {
    if (registroEditando) {
      setRegistros(registros.map(r => r.id === registroEditando.id ? {
        ...r, nivel: emocionSeleccionada.n, emoji: emocionSeleccionada.e, estado: emocionSeleccionada.s, nota: notaActual
      } : r));
    } else {
      const nuevo: RegistroHistorico = {
        id: Date.now().toString(),
        fecha: fechaSeleccionada,
        nivel: emocionSeleccionada.n,
        emoji: emocionSeleccionada.e,
        estado: emocionSeleccionada.s,
        nota: notaActual
      };
      setRegistros([...registros, nuevo]);
    }
    setModalAbierto(false);
  };

  const eliminarRegistro = async (id: string) => {
  const exito = await eliminarRegistroEmocional(id);
  if (exito) {
    // Si se borró en BD, lo quitamos de la vista localmente
    setRegistros(registros.filter(r => r.id !== id));
  } else {
    alert("No se pudo eliminar el registro");
  }
};

  const formatearFechaCorto = (fechaStr: string) => {
    const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const date = new Date(fechaStr + 'T12:00:00');
    return `${dias[date.getDay()]} ${date.getDate()}`;
  };

  const cambiarTip = () => {
    const tipsRestantes = bancoTips.filter(t => t.id !== tipDelDia.id);
    const nuevoTip = tipsRestantes[Math.floor(Math.random() * tipsRestantes.length)];
    setTipDelDia(nuevoTip);
  };

  // Función para asignar color según el nivel de emoción
  const obtenerColorBarra = (nivel: number) => {
    switch (nivel) {
      case 5: return 'bg-emerald-500'; // Verde oscuro (Muy bien)
      case 4: return 'bg-lime-400';    // Verde claro/amarillento (Bien)
      case 3: return 'bg-yellow-400';  // Amarillo (Regular)
      case 2: return 'bg-orange-400';  // Naranja (Mal)
      case 1: return 'bg-rose-500';    // Rojo (Muy mal)
      default: return 'bg-slate-300';
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-0 sm:p-4 font-sans selection:bg-blue-100">
      <div className="w-full max-w-md h-screen sm:h-[850px] bg-slate-50 shadow-2xl flex flex-col justify-between relative sm:rounded-[40px] border border-gray-100 overflow-hidden">
        
        <div className="flex-1 overflow-y-auto pb-6 custom-scrollbar">
          {/* Header */}
          <div className="px-6 pt-5 pb-3 flex items-center justify-between bg-white z-10 border-b border-slate-100">
            <button onClick={() => router.push('/home.2')} className="p-2 -ml-2 text-slate-700 hover:text-slate-900 transition-colors rounded-xl hover:bg-slate-50">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" /></svg>
            </button>
            <h3 className="text-sm font-bold text-[#2A3B50]">Monitoreo de Bienestar</h3>
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-400 p-0.5 flex items-center justify-center">
              <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-[11px] font-black text-indigo-500">JS</div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            
            {/* Estado Actual */}
            <div>
              <div className="flex justify-between items-end">
                <p className="text-xs font-bold text-[#8C9BAE] tracking-wider uppercase">Tu estado de hoy</p>
                <button onClick={() => abrirModal(new Date().toISOString().split('T')[0], estadoActual)} className="text-[10px] bg-indigo-50 text-indigo-600 font-bold px-3 py-1 rounded-full hover:bg-indigo-100">
                  {estadoActual ? "✎ Editar hoy" : "+ Registrar hoy"}
                </button>
              </div>
              
              {estadoActual ? (
                <div className="mt-2 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-center gap-4">
                  <span className="text-4xl">{estadoActual.emoji}</span>
                  <div>
                    <h4 className="text-base font-bold text-[#334155]">{estadoActual.estado}</h4>
                    {estadoActual.nota && <p className="text-xs font-medium text-slate-400 mt-0.5 line-clamp-1">"{estadoActual.nota}"</p>}
                  </div>
                </div>
              ) : (
                <div className="mt-2 p-4 bg-white border border-slate-100 rounded-2xl border-dashed flex items-center justify-center text-slate-400 text-sm">
                  Aún no has registrado cómo te sientes hoy.
                </div>
              )}
            </div>

            {/* Gráfica de Barras Multicolores */}
            <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm space-y-4">
              <h4 className="text-sm font-bold text-[#2A3B50]">Balance de los últimos 7 días</h4>
              <div className="h-48 w-full flex items-end justify-between gap-2 pt-4 border-b border-slate-100 pb-2 relative">
                <div className="absolute w-full border-b border-dashed border-slate-200 top-4"></div>
                <div className="absolute w-full border-b border-dashed border-slate-200 top-1/2"></div>
                
                {generarDiasCalendario().slice(0, 7).reverse().map((dia, idx) => (
                  <div key={idx} className="flex flex-col items-center flex-1 h-full justify-end z-10 group">
                    {dia.registro ? (
                      <>
                        <span className="text-lg mb-1 transition-transform group-hover:scale-125">{dia.registro.emoji}</span>
                        <div 
                          className={`w-full rounded-t-md transition-all duration-500 ${obtenerColorBarra(dia.registro.nivel)}`} 
                          style={{ height: `${(dia.registro.nivel / 5) * 100}%`, minHeight: '10%' }}
                        ></div>
                      </>
                    ) : (
                      <div className="w-full bg-slate-100 rounded-t-md" style={{ height: '5%' }}></div>
                    )}
                    <span className="text-[9px] font-bold text-slate-400 mt-2">{formatearFechaCorto(dia.fecha).split(' ')[0]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Calendario / Historial */}
            <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm">
              <h4 className="text-sm font-bold text-[#2A3B50] mb-3">Calendario de Registros</h4>
              <div className="max-h-56 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                {generarDiasCalendario().map((dia, index) => (
                  <div key={index} className={`flex items-center justify-between p-3 rounded-xl border ${dia.registro ? 'bg-slate-50 border-slate-100' : 'bg-white border-dashed border-slate-200'}`}>
                    <div className="flex items-center gap-3 w-2/3">
                      <div className="w-12 text-center border-r border-slate-200 pr-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">{formatearFechaCorto(dia.fecha).split(' ')[0]}</p>
                        <p className="text-sm font-black text-slate-700">{dia.fecha.split('-')[2]}</p>
                      </div>
                      {dia.registro ? (
                        <div className="flex items-center gap-2 overflow-hidden">
                          <span className="text-xl">{dia.registro.emoji}</span>
                          <div className="truncate">
                            <p className="text-xs font-bold text-slate-700">{dia.registro.estado}</p>
                            {dia.registro.nota && <p className="text-[10px] text-slate-400 truncate w-full">{dia.registro.nota}</p>}
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">Día vacío</p>
                      )}
                    </div>
                    
                    <div className="flex gap-1">
                      {dia.registro ? (
                        <>
                          <button onClick={() => abrirModal(dia.fecha, dia.registro)} className="p-1.5 text-blue-500 bg-blue-50 rounded-lg"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" /></svg></button>
                          <button onClick={() => eliminarRegistro(dia.registro!.id!)} className="p-1.5 text-red-500 bg-red-50 rounded-lg"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg></button>
                        </>
                      ) : (
                        <button onClick={() => abrirModal(dia.fecha)} className="px-3 py-1.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-lg hover:bg-slate-200">Añadir</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tips Antiestrés Actualizable */}
            <div className="bg-gradient-to-br from-[#F6EDFA] to-[#EDF3FC] border border-purple-100/50 p-5 rounded-3xl shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between mb-3 relative z-10">
                <h4 className="text-xs font-bold text-purple-900 uppercase tracking-wider">Tip anti-estrés para hoy</h4>
                <button onClick={cambiarTip} className="p-1.5 bg-white text-purple-600 hover:text-purple-800 rounded-full shadow-sm hover:shadow active:scale-95 transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
                </button>
              </div>
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 flex items-start gap-4 relative z-10">
                <span className="text-3xl p-2 bg-purple-50 rounded-xl shadow-sm">🧘‍♀️</span>
                <div>
                  <h5 className="text-xs font-bold text-[#2A3B50]">{tipDelDia.categoria}</h5>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-1">{tipDelDia.contenido}</p>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 text-7xl opacity-5 select-none pointer-events-none">💡</div>
            </div>

          </div>
        </div>

        {/* Modal de Registro con Fecha y Notas */}
        {modalAbierto && (
          <div className="absolute inset-0 z-50 bg-slate-900/40 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
            <div className="bg-white w-full sm:max-w-sm rounded-t-[30px] sm:rounded-[30px] p-6 shadow-2xl space-y-5 animate-slideUp">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-[#2A3B50]">{registroEditando ? "Editar registro" : "Nuevo registro"}</h3>
                <button onClick={() => setModalAbierto(false)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">&times;</button>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Fecha</label>
                <input type="date" value={fechaSeleccionada} onChange={(e) => setFechaSeleccionada(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 outline-none focus:border-indigo-500" />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-2">¿Cómo te sientes?</label>
                <div className="flex justify-between px-1">
                  {opcionesEmociones.map(opcion => (
                    <button key={opcion.n} onClick={() => setEmocionSeleccionada(opcion)} className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${emocionSeleccionada.n === opcion.n ? 'bg-indigo-50 ring-2 ring-indigo-500 scale-110' : 'hover:bg-slate-50 grayscale opacity-60 hover:grayscale-0 hover:opacity-100'}`}>
                      <span className="text-2xl">{opcion.e}</span>
                      <span className={`text-[9px] font-bold ${emocionSeleccionada.n === opcion.n ? 'text-indigo-600' : 'text-slate-400'}`}>{opcion.s}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Notas (Opcional)</label>
                <textarea value={notaActual} onChange={(e) => setNotaActual(e.target.value)} placeholder="¿Por qué te sientes así?" rows={2} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-500 resize-none"></textarea>
              </div>

              <button onClick={guardarRegistro} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200">
                Guardar Emoción
              </button>
            </div>
          </div>
        )}

        {/* Nav Inferior */}
        <div className="bg-white border-t border-slate-100 px-6 py-3.5 flex justify-around items-center sm:rounded-b-[40px] z-30 flex-shrink-0">
          <span className="text-[10px] font-bold text-[#4A72A6]">Inicio / Evaluación / Perfil</span>
        </div>
      </div>
    </div>
  );
}