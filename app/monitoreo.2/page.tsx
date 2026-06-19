"use client";
import React, { useState, useEffect, useCallback } from 'react'; 
import { useRouter } from 'next/navigation';
import { 
  leerHistorialEmocionalSemanal,
  eliminarRegistroEmocional,
  actualizarRegistroEmocional,
  insertarRegistros
} from '@/app/services/emocionesService';
import { NivelBienestar } from '@/models/monitoreo';
import supabase from '@/lib/supabase';

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface RegistroHistorico {
  id?: string | number;
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

// ─── Datos constantes ─────────────────────────────────────────────────────────

const opcionesEmociones = [
  { n: 1, e: '😩', s: 'Muy mal' },
  { n: 2, e: '😔', s: 'Mal' },
  { n: 3, e: '😐', s: 'Regular' },
  { n: 4, e: '😊', s: 'Bien' },
  { n: 5, e: '🤩', s: 'Muy bien' }
];

// Tips organizados por nivel de ánimo (1-5)
const TIPS_POR_NIVEL: Record<number, TipAntiestres[]> = {
  1: [ // Muy mal — contención inmediata
    { id: 101, categoria: 'Respiración', contenido: 'Respira lento: inhala 4 segundos, sostén 4, exhala 4. Repite 3 veces. Tu sistema nervioso se calmará.' },
    { id: 102, categoria: 'Grounding', contenido: 'Nombra 5 cosas que puedes ver, 4 que puedes tocar, 3 que puedes oír. Ancla tu mente al presente.' },
    { id: 103, categoria: 'Pausa urgente', contenido: 'Detente. Pon agua fría en tus muñecas por 30 segundos. El frío activa tu sistema nervioso parasimpático.' },
    { id: 104, categoria: 'Autocompasión', contenido: 'Está bien no estar bien. No tienes que resolver todo hoy. Un paso pequeño es suficiente.' },
  ],
  2: [ // Mal — calma y descanso
    { id: 201, categoria: 'Descanso', contenido: 'Tómate 10 minutos lejos de pantallas. Cierra los ojos y escucha tu entorno sin juzgar nada.' },
    { id: 202, categoria: 'Movimiento suave', contenido: 'Estira cuello y hombros despacio. El estrés se acumula ahí. Tres rotaciones lentas hacia cada lado.' },
    { id: 203, categoria: 'Hidratación', contenido: 'Toma un vaso de agua fría ahora. La deshidratación leve amplifica el mal humor sin que lo notes.' },
    { id: 204, categoria: 'Escritura', contenido: 'Escribe 3 líneas sobre cómo te sientes. No tiene que tener sentido. Solo sacarlo ayuda.' },
  ],
  3: [ // Regular — equilibrio
    { id: 301, categoria: 'Hábitos', contenido: 'Haz una pausa activa cada 45 minutos de estudio. Tu concentración mejora significativamente.' },
    { id: 302, categoria: 'Alimentación', contenido: 'Si llevas más de 3 horas sin comer, tu ánimo lo está pagando. Un snack ligero puede cambiar tu energía.' },
    { id: 303, categoria: 'Conexión social', contenido: 'Escríbele a alguien que no hayas contactado esta semana. Las conexiones breves recargan el ánimo.' },
    { id: 304, categoria: 'Logros pequeños', contenido: 'Anota una cosa que hayas hecho bien hoy, por pequeña que sea. El cerebro necesita reconocer avances.' },
  ],
  4: [ // Bien — mantener energía
    { id: 401, categoria: 'Potencia tu día', contenido: 'Estás en buen momento. Aprovecha para abordar esa tarea que llevas posponiendo. Tienes la energía.' },
    { id: 402, categoria: 'Gratitud', contenido: 'Escribe 3 cosas específicas por las que estás agradecido/a hoy. La gratitud concreta refuerza el bienestar.' },
    { id: 403, categoria: 'Movimiento', contenido: 'Un buen ánimo es perfecto para una caminata de 15 minutos. El ejercicio consolida el estado positivo.' },
    { id: 404, categoria: 'Comparte', contenido: 'Cuando estamos bien, podemos dar. Haz algo amable por alguien hoy, aunque sea pequeño.' },
  ],
  5: [ // Muy bien — potenciar el momento
    { id: 501, categoria: '¡Excelente día!', contenido: 'Estás brillando hoy. Usa este impulso para aprender algo nuevo o avanzar en algo importante para ti.' },
    { id: 502, categoria: 'Celebra', contenido: 'Reconoce que llegaste aquí. El bienestar no es casualidad, es el resultado de tus hábitos y esfuerzo.' },
    { id: 503, categoria: 'Registra el momento', contenido: 'Escribe qué hiciste diferente hoy. Cuando vengan días difíciles, tendrás una guía de lo que te funciona.' },
    { id: 504, categoria: 'Comparte energía', contenido: 'Tu energía positiva es contagiosa. Apoya a alguien de tu entorno que pueda necesitarlo hoy.' },
  ],
};

const TIPS_GENERALES: TipAntiestres[] = [
  { id: 1, contenido: 'Recuerda hacer pausas activas cada 45 minutos de estudio. Estira tu cuello y hombros.', categoria: 'Relajación física' },
  { id: 2, contenido: 'Respira profundo: inhala en 4 segundos, sostén 4, exhala en 4. Repite 3 veces.', categoria: 'Respiración' },
  { id: 3, contenido: 'Aléjate de las pantallas por 10 minutos. Cierra los ojos y escucha tu entorno.', categoria: 'Desconexión digital' },
  { id: 4, contenido: 'Toma un vaso de agua fresca. La hidratación mejora la concentración y alivia la tensión.', categoria: 'Hábitos saludables' },
];

// ─── Utilidades ───────────────────────────────────────────────────────────────

const obtenerFechaLocal = (fechaBase = new Date()) => {
  const offset = fechaBase.getTimezoneOffset() * 60000;
  return new Date(fechaBase.getTime() - offset).toISOString().split('T')[0];
};

// ✅ NUEVO: Calcula el promedio de los últimos 7 días a partir del historial
const calcularPromedioSemanal = (registros: RegistroHistorico[]): number | null => {
  const ultimos7 = registros.slice(0, 7);
  if (ultimos7.length === 0) return null;
  const suma = ultimos7.reduce((acc, r) => acc + r.nivel, 0);
  return suma / ultimos7.length;
};

// ─── Componente CalendarioRegistros ──────────────────────────────────────────

interface DiaCalendario {
  fecha: string;
  registro?: RegistroHistorico;
}

interface CalendarioRegistrosProps {
  dias: DiaCalendario[];
  formatearFechaCorto: (fecha: string) => string;
  abrirModal: (fecha: string, registro?: RegistroHistorico) => void;
  eliminarRegistro: (id?: string | number) => void;
}

function CalendarioRegistros({ dias, formatearFechaCorto, abrirModal, eliminarRegistro }: CalendarioRegistrosProps) {
  const [registroDetalle, setRegistroDetalle] = useState<(RegistroHistorico & { fecha: string }) | null>(null);

  const verDetalle = (fecha: string, registro: RegistroHistorico) => {
    setRegistroDetalle({ ...registro, fecha });
  };

  const cerrarDetalle = () => setRegistroDetalle(null);

  const handleEliminar = () => {
    eliminarRegistro(registroDetalle?.id);
    cerrarDetalle();
  };

  const handleEditar = () => {
    if (!registroDetalle) return;
    cerrarDetalle();
    abrirModal(registroDetalle.fecha, registroDetalle);
  };

  // Nombre completo del día de la semana
  const nombreDiaCompleto = (fechaStr: string) => {
    const nombres = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const d = new Date(fechaStr + 'T12:00:00');
    return `${nombres[d.getDay()]}, ${d.getDate()} de ${meses[d.getMonth()]}`;
  };

  return (
    <>
      <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm">
        <h4 className="text-sm font-bold text-[#2A3B50] mb-3">Calendario de Registros</h4>
        <div className="max-h-72 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
          {dias.map((dia) => {
            const partesFecha = formatearFechaCorto(dia.fecha).split(' ');
            return (
              <div
                key={dia.fecha}
                className={`rounded-2xl border transition-all duration-150 ${
                  dia.registro
                    ? 'bg-slate-50 border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/40 cursor-pointer active:scale-[0.99]'
                    : 'bg-white border-dashed border-slate-200'
                }`}
                onClick={() => dia.registro && verDetalle(dia.fecha, dia.registro)}
              >
                <div className="flex items-center justify-between px-3 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 text-center border-r border-slate-200 pr-2 flex-shrink-0">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">{partesFecha[0]}</p>
                      <p className="text-sm font-black text-slate-700">{dia.fecha.split('-')[2]}</p>
                    </div>
                    {dia.registro ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{dia.registro.emoji}</span>
                        <div>
                          <p className="text-xs font-bold text-slate-700">{dia.registro.estado}</p>
                          {dia.registro.nota && (
                            <p className="text-[10px] text-slate-400 truncate max-w-[120px]">{dia.registro.nota}</p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">Día vacío</p>
                    )}
                  </div>

                  {dia.registro ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-slate-300 flex-shrink-0">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                    </svg>
                  ) : (
                    <button
                      onClick={(e) => { e.stopPropagation(); abrirModal(dia.fecha); }}
                      className="px-3 py-1.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-lg hover:bg-slate-200 transition-colors"
                    >
                      Añadir
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal de detalle del registro */}
      {registroDetalle && (
        <div
          className="absolute inset-0 z-50 bg-slate-900/40 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={cerrarDetalle}
        >
          <div
            className="bg-white w-full sm:max-w-sm rounded-t-[30px] sm:rounded-[30px] p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabecera */}
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {nombreDiaCompleto(registroDetalle.fecha)}
              </p>
              <button onClick={cerrarDetalle} className="text-slate-400 hover:text-slate-600 text-xl font-bold leading-none">&times;</button>
            </div>

            {/* Estado emocional */}
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-5xl">{registroDetalle.emoji}</span>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cómo te sentiste</p>
                <p className="text-lg font-black text-[#2A3B50] mt-0.5">{registroDetalle.estado}</p>
              </div>
            </div>

            {/* Nota */}
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Tu nota</p>
              {registroDetalle.nota ? (
                <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 max-h-36 overflow-y-auto scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  <p className="text-sm text-slate-600 font-medium leading-relaxed break-words whitespace-pre-wrap">
                    "{registroDetalle.nota}"
                  </p>
                </div>
              ) : (
                <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-4 text-center">
                  <p className="text-xs text-slate-400 italic">No dejaste ninguna nota este día.</p>
                </div>
              )}
            </div>

            {/* Acciones */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleEditar}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                </svg>
                Editar
              </button>
              <button
                onClick={handleEliminar}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-2xl transition-colors border border-red-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

interface AnimoFeedbackProps {
  promedioAnimo: number;
}

function AnimoFeedback({ promedioAnimo }: AnimoFeedbackProps) {
  return (
    <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm">
      <h4 className="text-sm font-bold text-[#2A3B50]">¡Buen ánimo esta semana!</h4>
      <p className="mt-2 text-sm text-slate-600 leading-relaxed">
        Tu promedio de ánimo es de <strong>{promedioAnimo.toFixed(1)}/5.0</strong>. Continúa reconociendo tus avances y cuidando tu bienestar día a día.
      </p>
      <div className="mt-4 grid gap-3">
        <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-3 text-sm text-emerald-700">
          Aprovecha este impulso para mantener hábitos que te hagan sentir bien.
        </div>
        <div className="rounded-2xl bg-slate-50 border border-slate-100 p-3 text-sm text-slate-700">
          Si notas cambios, registra tu estado diario para seguir ajustando tu apoyo.
        </div>
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function MonitoreoPage() {
  const router = useRouter();
  const [registros, setRegistros] = useState<RegistroHistorico[]>([]);
  
  // Estados para el Modal
  const [modalAbierto, setModalAbierto] = useState(false);
  const [registroEditando, setRegistroEditando] = useState<RegistroHistorico | null>(null);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(obtenerFechaLocal());
  const [emocionSeleccionada, setEmocionSeleccionada] = useState(opcionesEmociones[3]);
  const [notaActual, setNotaActual] = useState("");
  const [tipDelDia, setTipDelDia] = useState<TipAntiestres>(TIPS_GENERALES[0]);
  const [guardando, setGuardando] = useState(false);

  const refrescarDatos = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const datosCrudos = await leerHistorialEmocionalSemanal(user.id);
        const datosFormateados = datosCrudos.map((item: any) => ({
          ...item,
          fecha: item.dia 
        }));
        setRegistros(datosFormateados as RegistroHistorico[]);

        // ✅ El promedio se calcula en el estado derivado, sin redirección automática
      }
    } catch (err) {
      console.error("Error al refrescar:", err);
    }
  }, [router]);

  useEffect(() => {
    refrescarDatos();
  }, [refrescarDatos]);

  // ✅ NUEVO: Derivamos el promedio del estado actual para pasarlo a AnimoFeedback
  const promedioAnimo = calcularPromedioSemanal(registros);

  const estadoActual = registros.find(r => r.fecha === obtenerFechaLocal());

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

  const guardarRegistro = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      alert("Error: Debes iniciar sesión para registrar emociones.");
      return;
    }

    setGuardando(true);

    const datos = {
      user_id: user.id,
      fecha: fechaSeleccionada,
      nivel: emocionSeleccionada.n as NivelBienestar,
      estado: emocionSeleccionada.s, 
      nota: notaActual              
    };

    const registroExistenteEnFecha = registros.find(r => r.fecha === fechaSeleccionada);
    const idParaActualizar = registroEditando?.id || registroExistenteEnFecha?.id;

    let resultado;
    if (idParaActualizar) {
      resultado = await actualizarRegistroEmocional(String(idParaActualizar), datos);
    } else {
      resultado = await insertarRegistros(datos);
    }

    setGuardando(false);

    if (resultado?.error) {
      alert("Hubo un problema al guardar tu registro en la base de datos. Intenta de nuevo.");
      return;
    }

    await refrescarDatos(); 
    setModalAbierto(false);
    alert(idParaActualizar ? "¡Emoción actualizada!" : "¡Emoción guardada con éxito!");
  };

  const eliminarRegistro = async (id?: string | number) => {
    if (!id) {
      alert("Error: No se puede identificar el registro para eliminar.");
      return;
    }

    const confirmar = window.confirm("¿Estás seguro de que deseas eliminar este registro de emoción?");
    if (!confirmar) return;

    const exito = await eliminarRegistroEmocional(String(id));
    
    if (exito) {
      await refrescarDatos(); 
    } else {
      alert("Hubo un problema al contactar con la base de datos. No se pudo eliminar el registro.");
    }
  };

  const generarDiasCalendario = () => {
    const dias = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const fechaStr = obtenerFechaLocal(d);
      const registro = registros.find(r => r.fecha === fechaStr);
      dias.push({ fecha: fechaStr, registro });
    }
    return dias;
  };

  const formatearFechaCorto = (fechaStr: string) => {
    const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const date = new Date(fechaStr + 'T12:00:00');
    return `${dias[date.getDay()]} ${date.getDate()}`;
  };

  // Selecciona tips según el nivel de ánimo de hoy
  const obtenerTipsSegunAnimo = useCallback((): TipAntiestres[] => {
    if (!estadoActual) return TIPS_GENERALES;
    return TIPS_POR_NIVEL[estadoActual.nivel] ?? TIPS_GENERALES;
  }, [estadoActual]);

  // Inicializa el tip cuando cambia el estado de hoy
  useEffect(() => {
    const tips = obtenerTipsSegunAnimo();
    const idx = Math.floor(Math.random() * tips.length);
    setTipDelDia(tips[idx]);
  }, [estadoActual?.nivel]);

  const cambiarTip = () => {
    const tips = obtenerTipsSegunAnimo();
    const tipsRestantes = tips.filter(t => t.id !== tipDelDia.id);
    const pool = tipsRestantes.length > 0 ? tipsRestantes : tips;
    const nuevoTip = pool[Math.floor(Math.random() * pool.length)];
    setTipDelDia(nuevoTip);
  };

  const obtenerColorBarra = (nivel: number) => {
    switch (nivel) {
      case 5: return 'bg-emerald-500';
      case 4: return 'bg-lime-400';
      case 3: return 'bg-yellow-400';
      case 2: return 'bg-orange-400';
      case 1: return 'bg-rose-500';
      default: return 'bg-slate-300';
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-0 sm:p-4 font-sans selection:bg-blue-100">
      <div className="w-full max-w-md h-screen sm:h-[850px] bg-slate-50 shadow-2xl flex flex-col justify-between relative sm:rounded-[40px] border border-gray-100 overflow-hidden">
        
        <div className="flex-1 overflow-y-auto pb-6 custom-scrollbar">
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

            {/* Estado de hoy */}
            <div>
              <div className="flex justify-between items-end">
                <p className="text-xs font-bold text-[#8C9BAE] tracking-wider uppercase">Tu estado de hoy</p>
                <button onClick={() => abrirModal(obtenerFechaLocal(), estadoActual)} className="text-[10px] bg-indigo-50 text-indigo-600 font-bold px-3 py-1 rounded-full hover:bg-indigo-100">
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

            {/* ✅ BANNER DE ALERTA: se muestra si el promedio semanal es crítico (< 2.5)
                No redirige automáticamente — el usuario decide si quiere ir a Modo Crisis */}
            {promedioAnimo !== null && promedioAnimo < 2.5 && registros.length >= 3 && (
              <div className="rounded-2xl overflow-hidden border border-rose-200 shadow-sm">
                {/* Franja superior roja */}
                <div className="bg-rose-500 px-4 py-3 flex items-center gap-2">
                  <span className="text-lg">🚨</span>
                  <p className="text-white text-xs font-extrabold uppercase tracking-wide">
                    Alerta de bienestar
                  </p>
                </div>
                {/* Cuerpo del banner */}
                <div className="bg-rose-50 px-4 py-3 space-y-3">
                  <p className="text-rose-900 text-xs font-medium leading-relaxed">
                    Tu promedio de ánimo esta semana es de{" "}
                    <strong>{promedioAnimo.toFixed(1)}/5.0</strong>. Hemos notado
                    que has tenido días difíciles. No tienes que atravesar esto solo/a.
                  </p>
                  <p className="text-rose-700 text-[11px] leading-relaxed">
                    Te recomendamos visitar el <strong>Modo Crisis</strong>, donde
                    encontrarás recursos de apoyo psicológico, líneas de emergencia
                    y técnicas de contención inmediata.
                  </p>
                  <button
                    onClick={() => router.push(`/modoCrisis.2?auto=true&promedio=${promedioAnimo.toFixed(1)}`)}
                    className="w-full bg-rose-500 hover:bg-rose-600 active:scale-[0.99] text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-sm shadow-rose-200"
                  >
                    Ver recursos de apoyo →
                  </button>
                </div>
              </div>
            )}

            {/* ✅ Tarjeta motivacional: solo si el promedio es saludable (>= 2.5) */}
            {promedioAnimo !== null && promedioAnimo >= 2.5 && registros.length >= 3 && (
              <AnimoFeedback promedioAnimo={promedioAnimo} />
            )}

            {/* Balance de los últimos 7 días */}
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

            {/* Calendario de registros */}
            <CalendarioRegistros
              dias={generarDiasCalendario()}
              formatearFechaCorto={formatearFechaCorto}
              abrirModal={abrirModal}
              eliminarRegistro={eliminarRegistro}
            />

            {/* Tip inteligente según ánimo */}
            {(() => {
              const nivel = estadoActual?.nivel ?? null;
              const config: Record<number, { grad: string; border: string; badge: string; badgeText: string; emoji: string; titulo: string }> = {
                1: { grad: 'from-rose-50 to-pink-50',     border: 'border-rose-100',   badge: 'bg-rose-100 text-rose-700',    badgeText: 'Para este momento difícil', emoji: '🫂', titulo: 'Apoyo inmediato' },
                2: { grad: 'from-orange-50 to-amber-50',  border: 'border-orange-100', badge: 'bg-orange-100 text-orange-700', badgeText: 'Para cuando estás bajo',     emoji: '🌿', titulo: 'Calma y descanso' },
                3: { grad: 'from-yellow-50 to-lime-50',   border: 'border-yellow-100', badge: 'bg-yellow-100 text-yellow-700', badgeText: 'Para equilibrar tu día',     emoji: '⚖️', titulo: 'Equilibrio' },
                4: { grad: 'from-emerald-50 to-teal-50',  border: 'border-emerald-100',badge: 'bg-emerald-100 text-emerald-700',badgeText: 'Para mantener tu energía',  emoji: '✨', titulo: 'Potencia tu día' },
                5: { grad: 'from-indigo-50 to-purple-50', border: 'border-indigo-100', badge: 'bg-indigo-100 text-indigo-700', badgeText: '¡Estás en tu mejor momento!', emoji: '🌟', titulo: '¡Sigue brillando!' },
              };
              const c = nivel ? config[nivel] : { grad: 'from-[#F6EDFA] to-[#EDF3FC]', border: 'border-purple-100/50', badge: 'bg-purple-100 text-purple-700', badgeText: 'Registra tu ánimo para tips personalizados', emoji: '🧘‍♀️', titulo: 'Tip del día' };

              return (
                <div className={`bg-gradient-to-br ${c.grad} border ${c.border} p-5 rounded-3xl shadow-sm relative overflow-hidden`}>
                  {/* Cabecera */}
                  <div className="flex items-center justify-between mb-3 relative z-10">
                    <div>
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">{c.titulo}</h4>
                      <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${c.badge}`}>
                        {c.badgeText}
                      </span>
                    </div>
                    <button
                      onClick={cambiarTip}
                      className="p-1.5 bg-white/80 text-slate-500 hover:text-slate-700 rounded-full shadow-sm hover:shadow active:scale-95 transition-all"
                      title="Ver otro tip"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                      </svg>
                    </button>
                  </div>

                  {/* Contenido del tip */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 flex items-start gap-3 relative z-10">
                    <span className="text-2xl flex-shrink-0 mt-0.5">{c.emoji}</span>
                    <div>
                      <p className="text-xs font-bold text-slate-700">{tipDelDia.categoria}</p>
                      <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-1">{tipDelDia.contenido}</p>
                    </div>
                  </div>

                  {/* Indicador de personalización */}
                  {!estadoActual && (
                    <p className="text-[10px] text-slate-400 text-center mt-3 relative z-10">
                      💡 Registra tu estado de hoy para recibir tips personalizados
                    </p>
                  )}

                  <div className="absolute -bottom-6 -right-6 text-7xl opacity-5 select-none pointer-events-none">
                    {c.emoji}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Modal */}
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
                  {opcionesEmociones.map((opcion) => (
                    <button 
                      key={opcion.n} 
                      onClick={() => setEmocionSeleccionada(opcion)} 
                      className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${emocionSeleccionada.n === opcion.n ? 'bg-indigo-50 ring-2 ring-indigo-500 scale-110' : 'hover:bg-slate-50 grayscale opacity-60 hover:grayscale-0 hover:opacity-100'}`}
                    >
                      <span className="text-2xl">{opcion.e}</span>
                      <span className={`text-[9px] font-bold ${emocionSeleccionada.n === opcion.n ? 'text-indigo-600' : 'text-slate-400'}`}>{opcion.s}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-500">Notas (Opcional)</label>
                  <span className="text-[10px] text-slate-400">{notaActual.length}/300</span>
                </div>
                <textarea
                  value={notaActual}
                  onChange={(e) => setNotaActual(e.target.value.slice(0, 300))}
                  placeholder="¿Por qué te sientes así? Cuéntame un poco más..."
                  rows={4}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:bg-indigo-50/30 resize-none leading-relaxed transition-colors placeholder:text-slate-300 scrollbar-hide"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}
                />
              </div>

              <button onClick={guardarRegistro} disabled={guardando} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200 disabled:opacity-60 disabled:cursor-not-allowed">
                {guardando ? "Guardando..." : "Guardar Emoción"}
              </button>
            </div>
          </div>
        )}

        <div className="bg-white border-t border-slate-100 px-6 py-3.5 flex justify-around items-center sm:rounded-b-[40px] z-30 flex-shrink-0">
          <span className="text-[10px] font-bold text-[#4A72A6]">Inicio / Evaluación / Perfil</span>
        </div>
      </div>
    </div>
  );
}

// Ocultar scrollbar en Chrome/Safari para el contenedor de nota
const style = typeof document !== 'undefined' ? (() => {
  const s = document.createElement('style');
  s.textContent = `.scrollbar-hide::-webkit-scrollbar { display: none; }`;
  document.head.appendChild(s);
  return s;
})() : null;
