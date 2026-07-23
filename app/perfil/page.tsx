'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabase';
import { cerrarSesion } from '@/app/services/authService';
import { leerPerfilUsuario, actualizarPerfil } from '@/lib/supabase/perfil';
interface OpcionMenu {
  id: string;
  icono: string;
  titulo: string;
  descripcion: string;
  ruta?: string;
  accion?: () => void;
}

export default function PerfilPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [userId, setUserId]               = useState<string | null>(null);
  const [nombre, setNombre]               = useState('');
  const [correo, setCorreo]               = useState('');
  const [foto, setFoto]                   = useState<string | null>(null);
  const [cargando, setCargando]           = useState(true);
  const [subiendoFoto, setSubiendoFoto]   = useState(false);
  const [loadingLogout, setLoadingLogout] = useState(false);
  const [modalEditar, setModalEditar]     = useState(false);
  const [nuevoNombre, setNuevoNombre]     = useState('');
  const [guardandoNombre, setGuardandoNombre] = useState(false);

  // ─── NUEVO: Privacidad (cambio de contraseña) ─────────────────────────────
  const [modalPrivacidad, setModalPrivacidad] = useState(false);
  const [claveActual, setClaveActual] = useState('');
  const [claveNueva, setClaveNueva] = useState('');
  const [claveConfirmar, setClaveConfirmar] = useState('');
  const [guardandoClave, setGuardandoClave] = useState(false);
  const [errorClave, setErrorClave] = useState<string | null>(null);
  const [exitoClave, setExitoClave] = useState(false);

  // ─── NUEVO: Notificaciones (guardadas en localStorage por ahora) ─────────
  const [modalNotificaciones, setModalNotificaciones] = useState(false);
  const [notifDiaria, setNotifDiaria] = useState(true);
  const [notifRacha, setNotifRacha] = useState(true);
  const [notifParciales, setNotifParciales] = useState(true);
  const [notifCrisis, setNotifCrisis] = useState(true);

  // ─── Init ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/login'); return; }

      const user = session.user;
      setUserId(user.id);
      setCorreo(user.email || '');

      const perfil = await leerPerfilUsuario(user.id);

      const nombreReal =
        (perfil.nombre && perfil.nombre !== 'Valeria López' ? perfil.nombre : null) ||
        user.user_metadata?.nombre_usuario ||
        user.user_metadata?.full_name ||
        user.email?.split('@')[0] ||
        'Estudiante';

      setNombre(nombreReal);
      
      if (perfil.avatar) {
        setFoto(perfil.avatar);
        localStorage.setItem('userAvatar', perfil.avatar);
      } else {
        const avatarLocal = localStorage.getItem('userAvatar');
        if (avatarLocal) setFoto(avatarLocal);
      }

      // Cargar preferencias de notificaciones guardadas localmente
      const prefsGuardadas = localStorage.getItem('preferenciasNotificaciones');
      if (prefsGuardadas) {
        try {
          const prefs = JSON.parse(prefsGuardadas);
          setNotifDiaria(prefs.diaria ?? true);
          setNotifRacha(prefs.racha ?? true);
          setNotifParciales(prefs.parciales ?? true);
          setNotifCrisis(prefs.crisis ?? true);
        } catch {}
      }

      setCargando(false);
    };
    init();
  }, [router]);

  // ─── Cambiar foto — sin límite, siempre reemplaza ─────────────────────────

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    if (file.size > 5 * 1024 * 1024) { alert('La imagen no puede superar los 5 MB.'); return; }
    if (!file.type.startsWith('image/')) { alert('Solo se permiten archivos de imagen.'); return; }

    setSubiendoFoto(true);

    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      localStorage.setItem('userAvatar', base64);
      setFoto(base64);

      await actualizarPerfil(userId, { avatar_url: base64 });

    } catch (err) {
      console.error('Error procesando foto:', err);
      alert('No se pudo procesar la foto. Intenta de nuevo.');
    } finally {
      setSubiendoFoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // ─── Editar nombre ─────────────────────────────────────────────────────────

  const abrirEditar = () => { setNuevoNombre(nombre); setModalEditar(true); };

  const guardarNombre = async () => {
    if (!nuevoNombre.trim() || !userId) return;
    setGuardandoNombre(true);

    const [{ error: authError }, { error: dbError }] = await Promise.all([
      supabase.auth.updateUser({ data: { nombre_usuario: nuevoNombre.trim() } }),
      actualizarPerfil(userId, { nombre: nuevoNombre.trim() }),
    ]);

    if (authError || dbError) {
      alert('No se pudo actualizar el nombre. Intenta de nuevo.');
    } else {
      setNombre(nuevoNombre.trim());
      setModalEditar(false);
    }
    setGuardandoNombre(false);
  };

  // ─── NUEVO: Cambiar contraseña ─────────────────────────────────────────────

  const abrirPrivacidad = () => {
    setClaveActual('');
    setClaveNueva('');
    setClaveConfirmar('');
    setErrorClave(null);
    setExitoClave(false);
    setModalPrivacidad(true);
  };

  const guardarNuevaClave = async () => {
    setErrorClave(null);

    if (claveNueva.length < 6) {
      setErrorClave('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (claveNueva !== claveConfirmar) {
      setErrorClave('Las contraseñas no coinciden.');
      return;
    }

    setGuardandoClave(true);

    // Reautenticamos con la contraseña actual antes de cambiarla, por seguridad
    const { error: errorLogin } = await supabase.auth.signInWithPassword({
      email: correo,
      password: claveActual,
    });

    if (errorLogin) {
      setErrorClave('Tu contraseña actual no es correcta.');
      setGuardandoClave(false);
      return;
    }

    const { error: errorUpdate } = await supabase.auth.updateUser({ password: claveNueva });

    setGuardandoClave(false);

    if (errorUpdate) {
      setErrorClave('No se pudo cambiar la contraseña. Intenta de nuevo.');
      return;
    }

    setExitoClave(true);
    setTimeout(() => setModalPrivacidad(false), 1200);
  };

  // ─── NUEVO: Notificaciones ──────────────────────────────────────────────────

  const abrirNotificaciones = () => setModalNotificaciones(true);

  const guardarNotificaciones = () => {
    localStorage.setItem('preferenciasNotificaciones', JSON.stringify({
      diaria: notifDiaria,
      racha: notifRacha,
      parciales: notifParciales,
      crisis: notifCrisis,
    }));
    setModalNotificaciones(false);
  };

  // ─── Cerrar sesión ─────────────────────────────────────────────────────────

  const handleLogout = async () => {
    if (loadingLogout) return;
    setLoadingLogout(true);
    const { error } = await cerrarSesion();
    if (error) { alert(`No se pudo cerrar sesión: ${error.message}`); setLoadingLogout(false); }
    else router.push('/login');
  };

  // ─── Opciones del menú ─────────────────────────────────────────────────────

  const opcionesMenu: OpcionMenu[] = [
    { id: 'editar',        icono: '✏️', titulo: 'Editar información',           descripcion: 'Cambia tu nombre',                                    accion: abrirEditar        },
    { id: 'historial',     icono: '📊', titulo: 'Historial y evaluaciones',     descripcion: 'Registros emocionales por mes y resultados del test', ruta: '/historial'         },
    { id: 'privacidad',    icono: '🔒', titulo: 'Privacidad y seguridad',       descripcion: 'Cambia tu contraseña',                                accion: abrirPrivacidad    },
    { id: 'notificaciones',icono: '🔔', titulo: 'Notificaciones',               descripcion: 'Configura tus alertas y recordatorios',               accion: abrirNotificaciones},
  ];

  // ─── Render ────────────────────────────────────────────────────────────────

  if (cargando) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#4A72A6] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-0 sm:p-4 font-sans">
      <div className="w-full max-w-md h-screen sm:h-[850px] bg-slate-50 shadow-2xl flex flex-col relative sm:rounded-[40px] border border-gray-100 overflow-hidden">

        {/* HEADER */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between bg-white border-b border-slate-100 flex-shrink-0">
          <button onClick={() => router.push('/home')} className="p-2 -ml-2 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
          </button>
          <h3 className="text-sm font-bold text-[#2A3B50]">Mi perfil</h3>
          <div className="w-9" />
        </div>

        {/* CONTENIDO */}
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' } as React.CSSProperties}>

          {/* Avatar */}
          <div className="bg-white px-6 pt-8 pb-6 flex flex-col items-center border-b border-slate-100">
            <div className="relative mb-4">
              <div
                onClick={() => !subiendoFoto && fileInputRef.current?.click()}
                className="w-24 h-24 rounded-full overflow-hidden border-4 border-slate-50 shadow-md flex items-center justify-center text-white text-3xl font-bold cursor-pointer"
                style={{ backgroundColor: '#A7C7D8' }}
              >
                {subiendoFoto ? (
                  <div className="w-full h-full bg-black/30 flex items-center justify-center">
                    <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : foto ? (
                  <img src={foto} alt="Foto de perfil" className="w-full h-full object-cover" />
                ) : (
                  <span>{nombre.charAt(0).toUpperCase()}</span>
                )}
              </div>

              <button
                onClick={() => !subiendoFoto && fileInputRef.current?.click()}
                disabled={subiendoFoto}
                className="absolute bottom-0 right-0 w-8 h-8 bg-[#4A72A6] rounded-full flex items-center justify-center shadow-md border-2 border-white disabled:opacity-60"
              >
                {subiendoFoto ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-white">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                  </svg>
                )}
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            <h2 className="text-lg font-bold text-[#2A3B50]">{nombre}</h2>
            <p className="text-xs text-slate-400 mt-0.5">{correo}</p>

            <p className="text-[10px] text-slate-300 mt-2">
              {subiendoFoto ? 'Subiendo foto...' : 'Toca la foto para cambiarla'}
            </p>

            <div className="mt-3 flex items-center gap-1.5 bg-blue-50 border border-blue-100 rounded-full px-3 py-1">
              <span className="text-xs">🎓</span>
              <span className="text-[11px] font-bold text-[#4A72A6]">Estudiante UCV</span>
            </div>
          </div>

          {/* Menú */}
          <div className="px-6 py-5 space-y-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Configuración</p>

            {opcionesMenu.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  if (item.accion) item.accion();
                  else if (item.ruta) router.push(item.ruta);
                }}
                className="w-full flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 hover:border-[#4A72A6]/30 hover:bg-slate-50 transition-all text-left shadow-sm active:scale-[0.99]"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-lg flex-shrink-0">
                  {item.icono}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#2A3B50]">{item.titulo}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{item.descripcion}</p>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 text-slate-300 flex-shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            ))}

            <div className="pt-2">
              <button
                onClick={handleLogout}
                disabled={loadingLogout}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-white border-2 border-rose-200 text-rose-500 hover:bg-rose-50 font-bold text-sm rounded-2xl transition-all disabled:opacity-50 shadow-sm"
              >
                {loadingLogout ? (
                  <div className="w-4 h-4 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
                  </svg>
                )}
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL EDITAR NOMBRE */}
      {modalEditar && (
        <div className="absolute inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40" onClick={() => setModalEditar(false)}>
          <div className="bg-white w-full sm:max-w-md rounded-t-[30px] sm:rounded-[30px] p-6 shadow-2xl space-y-5" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-[#2A3B50]">Editar nombre</h3>
              <button onClick={() => setModalEditar(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1.5">Nombre de usuario</label>
              <input
                value={nuevoNombre}
                onChange={e => setNuevoNombre(e.target.value)}
                placeholder="Tu nombre"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-[#4A72A6] transition-colors"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setModalEditar(false)} className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-2xl text-sm font-bold hover:bg-slate-50 transition-colors">Cancelar</button>
              <button
                onClick={guardarNombre}
                disabled={guardandoNombre || !nuevoNombre.trim()}
                className="flex-1 py-3 bg-[#4A72A6] hover:bg-[#3B5E8C] text-white rounded-2xl text-sm font-bold transition-colors disabled:opacity-40"
              >
                {guardandoNombre ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PRIVACIDAD Y SEGURIDAD — cambiar contraseña */}
      {modalPrivacidad && (
        <div className="absolute inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40" onClick={() => setModalPrivacidad(false)}>
          <div className="bg-white w-full sm:max-w-md rounded-t-[30px] sm:rounded-[30px] p-6 shadow-2xl space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-[#2A3B50]">Cambiar contraseña</h3>
              <button onClick={() => setModalPrivacidad(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
            </div>

            {errorClave && (
              <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-semibold rounded-xl">
                ⚠️ {errorClave}
              </div>
            )}
            {exitoClave && (
              <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-semibold rounded-xl">
                ✅ Contraseña actualizada correctamente
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1.5">Contraseña actual</label>
              <input
                type="password"
                value={claveActual}
                onChange={e => setClaveActual(e.target.value)}
                placeholder="********"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-[#4A72A6] transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1.5">Nueva contraseña</label>
              <input
                type="password"
                value={claveNueva}
                onChange={e => setClaveNueva(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-[#4A72A6] transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1.5">Confirmar nueva contraseña</label>
              <input
                type="password"
                value={claveConfirmar}
                onChange={e => setClaveConfirmar(e.target.value)}
                placeholder="********"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-[#4A72A6] transition-colors"
              />
            </div>

            <div className="flex gap-3 pt-1">
              <button onClick={() => setModalPrivacidad(false)} className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-2xl text-sm font-bold hover:bg-slate-50 transition-colors">Cancelar</button>
              <button
                onClick={guardarNuevaClave}
                disabled={guardandoClave || !claveActual || !claveNueva || !claveConfirmar}
                className="flex-1 py-3 bg-[#4A72A6] hover:bg-[#3B5E8C] text-white rounded-2xl text-sm font-bold transition-colors disabled:opacity-40"
              >
                {guardandoClave ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL NOTIFICACIONES */}
      {modalNotificaciones && (
        <div className="absolute inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40" onClick={() => setModalNotificaciones(false)}>
          <div className="bg-white w-full sm:max-w-md rounded-t-[30px] sm:rounded-[30px] p-6 shadow-2xl space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-[#2A3B50]">Notificaciones</h3>
              <button onClick={() => setModalNotificaciones(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
            </div>

            {[
              { label: 'Recordatorio diario', desc: 'Te avisamos si aún no registras tu emoción hoy', valor: notifDiaria, set: setNotifDiaria },
              { label: 'Racha con amigos', desc: 'Alertas sobre tu racha y protectores', valor: notifRacha, set: setNotifRacha },
              { label: 'Parciales próximos', desc: 'Avisos cuando se acerque un parcial registrado', valor: notifParciales, set: setNotifParciales },
              { label: 'Modo crisis', desc: 'Notificaciones de apoyo si detectamos bienestar bajo', valor: notifCrisis, set: setNotifCrisis },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="pr-3">
                  <p className="text-xs font-bold text-slate-700">{item.label}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{item.desc}</p>
                </div>
                <button
                  onClick={() => item.set(!item.valor)}
                  className={`w-10 h-6 rounded-full p-0.5 transition-colors flex-shrink-0 ${item.valor ? 'bg-[#4A72A6]' : 'bg-slate-300'}`}
                >
                  <div className={`bg-white w-5 h-5 rounded-full shadow-sm transform transition-transform ${item.valor ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
              </div>
            ))}

            <button
              onClick={guardarNotificaciones}
              className="w-full py-3 bg-[#4A72A6] hover:bg-[#3B5E8C] text-white rounded-2xl text-sm font-bold transition-colors mt-2"
            >
              Guardar preferencias
            </button>
          </div>
        </div>
      )}
    </div>
  );
}