// app/perfil/page.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { actualizarCorreoUsuario, actualizarContrasenaUsuario } from '@/lib/supabase/cuenta';

const supabase = createClient();

interface OpcionMenu {
  id: string;
  icono: string;
  titulo: string;
  descripcion: string;
  ruta?: string;
  accion?: () => void;
}

// ─── Tipos y claves para notificaciones ──────────────────────────────────────

interface ConfigNotificaciones {
  recordatoriosDiario: boolean;
  recordatoriosCronograma: boolean;
  alertasBienestar: boolean;
  modoCrisisAutomatico: boolean;
  resumenSemanal: boolean;
}

const NOTIF_KEY = (uid: string) => `notif_config_${uid}`;

const defaultNotif: ConfigNotificaciones = {
  recordatoriosDiario: true,
  recordatoriosCronograma: true,
  alertasBienestar: true,
  modoCrisisAutomatico: true,
  resumenSemanal: false,
};

const leerNotif = (uid: string): ConfigNotificaciones => {
  try {
    const raw = localStorage.getItem(NOTIF_KEY(uid));
    return raw ? { ...defaultNotif, ...JSON.parse(raw) } : defaultNotif;
  } catch {
    return defaultNotif;
  }
};

const guardarNotif = (uid: string, config: ConfigNotificaciones) => {
  localStorage.setItem(NOTIF_KEY(uid), JSON.stringify(config));
};

// ─── Toggle reutilizable ─────────────────────────────────────────────────────

function Toggle({ activo, onChange }: { activo: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`w-10 h-6 rounded-full p-0.5 transition-colors flex-shrink-0 ${activo ? 'bg-[#4A72A6]' : 'bg-slate-200'}`}
    >
      <div className={`bg-white w-5 h-5 rounded-full shadow-sm transform transition-transform ${activo ? 'translate-x-4' : 'translate-x-0'}`} />
    </button>
  );
}

export default function PerfilPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [foto, setFoto] = useState<string | null>(null);
  const [userId, setUserId] = useState('');
  const [cargando, setCargando] = useState(true);
  const [loadingLogout, setLoadingLogout] = useState(false);
  const [loadingAvatar, setLoadingAvatar] = useState(false);

  const [modalEditar, setModalEditar] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [guardandoNombre, setGuardandoNombre] = useState(false);

  // --- Modal de cuenta y seguridad ---
  const [modalCuenta, setModalCuenta] = useState(false);
  const [nuevoCorreo, setNuevoCorreo] = useState('');
  const [guardandoCorreo, setGuardandoCorreo] = useState(false);
  const [errorCorreo, setErrorCorreo] = useState<string | null>(null);
  const [exitoCorreo, setExitoCorreo] = useState(false);

  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [guardandoContrasena, setGuardandoContrasena] = useState(false);
  const [errorContrasena, setErrorContrasena] = useState<string | null>(null);
  const [exitoContrasena, setExitoContrasena] = useState(false);

  // --- Modal de notificaciones ---
  const [modalNotif, setModalNotif] = useState(false);
  const [notif, setNotif] = useState<ConfigNotificaciones>(defaultNotif);
  const [guardadoNotif, setGuardadoNotif] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) { router.push('/login'); return; }

      setUserId(user.id);
      setCorreo(user.email || '');
      setNuevoCorreo(user.email || '');
      setNotif(leerNotif(user.id));

      const { data: perfil } = await supabase
        .from('perfiles')
        .select('nombre, avatar_url')
        .eq('id', user.id)
        .single();

      const nombreFallback =
        user.user_metadata?.nombre_usuario ||
        user.user_metadata?.full_name ||
        user.email?.split('@')[0] ||
        'Estudiante';

      setNombre(perfil?.nombre || nombreFallback);
      setFoto(perfil?.avatar_url || null);
      setCargando(false);
    };
    init();
  }, [router]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    setLoadingAvatar(true);
    const ext = file.name.split('.').pop();
    const filePath = `${userId}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (!uploadError) {
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setFoto(publicUrl);
      await supabase
        .from('perfiles')
        .upsert({ id: userId, avatar_url: publicUrl, updated_at: new Date().toISOString() }, { onConflict: 'id' });
    }
    setLoadingAvatar(false);
  };

  const abrirEditar = () => {
    setNuevoNombre(nombre);
    setModalEditar(true);
  };

  const guardarNombre = async () => {
    if (!nuevoNombre.trim()) return;
    setGuardandoNombre(true);

    const [{ error: authError }, { error: dbError }] = await Promise.all([
      supabase.auth.updateUser({ data: { nombre_usuario: nuevoNombre.trim() } }),
      supabase.from('perfiles').upsert(
        { id: userId, nombre: nuevoNombre.trim(), updated_at: new Date().toISOString() },
        { onConflict: 'id' }
      ),
    ]);

    if (!authError && !dbError) {
      setNombre(nuevoNombre.trim());
      setModalEditar(false);
    } else {
      alert('No se pudo actualizar el nombre. Intenta de nuevo.');
    }
    setGuardandoNombre(false);
  };

  // --- Cuenta y seguridad ---
  const abrirCuenta = () => {
    setNuevoCorreo(correo);
    setErrorCorreo(null);
    setExitoCorreo(false);
    setNuevaContrasena('');
    setConfirmarContrasena('');
    setErrorContrasena(null);
    setExitoContrasena(false);
    setModalCuenta(true);
  };

  const guardarCorreo = async () => {
    if (!nuevoCorreo.trim() || nuevoCorreo.trim() === correo) return;
    setGuardandoCorreo(true);
    setErrorCorreo(null);
    setExitoCorreo(false);

    const { error } = await actualizarCorreoUsuario(nuevoCorreo.trim());

    if (error) {
      setErrorCorreo('No se pudo actualizar el correo: ' + error);
    } else {
      setExitoCorreo(true);
    }
    setGuardandoCorreo(false);
  };

  const guardarContrasena = async () => {
    setErrorContrasena(null);
    setExitoContrasena(false);

    if (nuevaContrasena.length < 6) {
      setErrorContrasena('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (nuevaContrasena !== confirmarContrasena) {
      setErrorContrasena('Las contraseñas no coinciden.');
      return;
    }

    setGuardandoContrasena(true);
    const { error } = await actualizarContrasenaUsuario(nuevaContrasena);

    if (error) {
      setErrorContrasena('No se pudo actualizar la contraseña: ' + error);
    } else {
      setExitoContrasena(true);
      setNuevaContrasena('');
      setConfirmarContrasena('');
    }
    setGuardandoContrasena(false);
  };

  // --- Notificaciones ---
  const abrirNotif = () => {
    setNotif(leerNotif(userId));
    setGuardadoNotif(false);
    setModalNotif(true);
  };

  const toggleNotif = (clave: keyof ConfigNotificaciones) => {
    const nueva = { ...notif, [clave]: !notif[clave] };
    setNotif(nueva);
    guardarNotif(userId, nueva);
    setGuardadoNotif(true);
    setTimeout(() => setGuardadoNotif(false), 2000);
  };

  const handleLogout = async () => {
    if (loadingLogout) return;
    setLoadingLogout(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      alert(`No se pudo cerrar sesión: ${error.message}`);
      setLoadingLogout(false);
    } else {
      router.push('/login');
    }
  };

  const opcionesMenu: OpcionMenu[] = [
    {
      id: 'editar',
      icono: '✏️',
      titulo: 'Editar información',
      descripcion: 'Cambia tu nombre o foto de perfil',
      accion: abrirEditar,
    },
    {
      id: 'historial',
      icono: '📊',
      titulo: 'Historial emocional',
      descripcion: 'Revisa tu calendario y tus evaluaciones',
      ruta: '/historial',
    },
    {
      id: 'notificaciones',
      icono: '🔔',
      titulo: 'Notificaciones',
      descripcion: 'Elige qué avisos quieres recibir',
      accion: abrirNotif,
    },
    {
      id: 'cuenta',
      icono: '🔒',
      titulo: 'Cuenta y seguridad',
      descripcion: 'Cambia tu correo o tu contraseña',
      accion: abrirCuenta,
    },
  ];

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
          <button
            onClick={() => router.push('/home')}
            className="p-2 -ml-2 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
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
                onClick={() => fileInputRef.current?.click()}
                className="w-24 h-24 rounded-full overflow-hidden border-4 border-slate-50 shadow-md cursor-pointer flex items-center justify-center text-white text-3xl font-bold"
                style={{ backgroundColor: '#A7C7D8' }}
              >
                {loadingAvatar ? (
                  <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
                ) : foto ? (
                  <img src={foto} alt="Perfil" className="w-full h-full object-cover" />
                ) : (
                  <span>{nombre.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-8 h-8 bg-[#4A72A6] rounded-full flex items-center justify-center shadow-md border-2 border-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-white">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                </svg>
              </button>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*"
            />
            <h2 className="text-lg font-bold text-[#2A3B50]">{nombre}</h2>
            <p className="text-xs text-slate-400 mt-0.5">{correo}</p>
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
        <div
          className="absolute inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40"
          onClick={() => setModalEditar(false)}
        >
          <div
            className="bg-white w-full sm:max-w-md rounded-t-[30px] sm:rounded-[30px] p-6 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-[#2A3B50]">Editar nombre</h3>
              <button onClick={() => setModalEditar(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1.5">Nombre de usuario</label>
              <input
                value={nuevoNombre}
                onChange={(e) => setNuevoNombre(e.target.value)}
                placeholder="Tu nombre"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-[#4A72A6] transition-colors"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setModalEditar(false)}
                className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-2xl text-sm font-bold hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
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

      {/* MODAL NOTIFICACIONES */}
      {modalNotif && (
        <div
          className="absolute inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 p-0 sm:p-4"
          onClick={() => setModalNotif(false)}
        >
          <div
            className="bg-white w-full sm:max-w-md rounded-t-[30px] sm:rounded-[30px] p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-[#2A3B50]">Notificaciones</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Elige qué avisos quieres recibir</p>
              </div>
              <button onClick={() => setModalNotif(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
            </div>

            {/* Confirmación guardado */}
            {guardadoNotif && (
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-2.5">
                <span className="text-emerald-500 text-sm">✅</span>
                <p className="text-[11px] font-semibold text-emerald-700">Preferencias guardadas</p>
              </div>
            )}

            {/* Grupo: Diario */}
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">Diario emocional</p>
              <div className="bg-slate-50 rounded-2xl border border-slate-100 divide-y divide-slate-100">
                <div className="flex items-center justify-between px-4 py-3.5">
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="text-xs font-bold text-slate-700">Recordatorio diario</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Aviso para escribir en tu diario cada día</p>
                  </div>
                  <Toggle activo={notif.recordatoriosDiario} onChange={() => toggleNotif('recordatoriosDiario')} />
                </div>
                <div className="flex items-center justify-between px-4 py-3.5">
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="text-xs font-bold text-slate-700">Resumen semanal</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Un informe de cómo estuvo tu semana emocional</p>
                  </div>
                  <Toggle activo={notif.resumenSemanal} onChange={() => toggleNotif('resumenSemanal')} />
                </div>
              </div>
            </div>

            {/* Grupo: Cronograma */}
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">Cronograma</p>
              <div className="bg-slate-50 rounded-2xl border border-slate-100 divide-y divide-slate-100">
                <div className="flex items-center justify-between px-4 py-3.5">
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="text-xs font-bold text-slate-700">Recordatorios de actividades</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Aviso 15 min antes de cada actividad programada</p>
                  </div>
                  <Toggle activo={notif.recordatoriosCronograma} onChange={() => toggleNotif('recordatoriosCronograma')} />
                </div>
              </div>
            </div>

            {/* Grupo: Bienestar */}
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">Bienestar</p>
              <div className="bg-slate-50 rounded-2xl border border-slate-100 divide-y divide-slate-100">
                <div className="flex items-center justify-between px-4 py-3.5">
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="text-xs font-bold text-slate-700">Alertas de bienestar bajo</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Notificación cuando tus registros sean bajos varios días seguidos</p>
                  </div>
                  <Toggle activo={notif.alertasBienestar} onChange={() => toggleNotif('alertasBienestar')} />
                </div>
                <div className="flex items-center justify-between px-4 py-3.5">
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="text-xs font-bold text-slate-700">Modo crisis automático</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Activa el modo crisis si tu bienestar es crítico esta semana</p>
                  </div>
                  <Toggle activo={notif.modoCrisisAutomatico} onChange={() => toggleNotif('modoCrisisAutomatico')} />
                </div>
              </div>
            </div>

            {/* Nota informativa */}
            <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3">
              <span className="text-sm flex-shrink-0 mt-0.5">ℹ️</span>
              <p className="text-[10px] text-[#4A72A6] font-medium leading-relaxed">
                Las notificaciones se guardan en este dispositivo. Para recibir avisos push, asegúrate de que los permisos del navegador estén habilitados.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CUENTA Y SEGURIDAD */}
      {modalCuenta && (
        <div
          className="absolute inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 p-0 sm:p-4"
          onClick={() => setModalCuenta(false)}
        >
          <div
            className="bg-white w-full sm:max-w-md rounded-t-[30px] sm:rounded-[30px] p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-[#2A3B50]">Cuenta y seguridad</h3>
              <button onClick={() => setModalCuenta(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
            </div>

            {/* Cambiar correo */}
            <div className="space-y-2.5 border-b border-slate-100 pb-6">
              <label className="text-xs font-bold text-slate-500 block">Correo institucional</label>
              <input
                type="email"
                value={nuevoCorreo}
                onChange={(e) => { setNuevoCorreo(e.target.value); setExitoCorreo(false); }}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-[#4A72A6] transition-colors"
              />
              {errorCorreo && (
                <p className="text-[11px] font-semibold text-rose-600 bg-rose-50 border border-rose-100 rounded-xl p-2.5">
                  ⚠️ {errorCorreo}
                </p>
              )}
              {exitoCorreo && (
                <p className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-xl p-2.5">
                  ✅ Revisa tu nuevo correo para confirmar el cambio.
                </p>
              )}
              <button
                onClick={guardarCorreo}
                disabled={guardandoCorreo || !nuevoCorreo.trim() || nuevoCorreo.trim() === correo}
                className="w-full py-3 bg-[#4A72A6] hover:bg-[#3B5E8C] text-white rounded-2xl text-sm font-bold transition-colors disabled:opacity-40"
              >
                {guardandoCorreo ? 'Guardando...' : 'Actualizar correo'}
              </button>
            </div>

            {/* Cambiar contraseña */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-slate-500 block">Nueva contraseña</label>
              <input
                type="password"
                value={nuevaContrasena}
                onChange={(e) => { setNuevaContrasena(e.target.value); setExitoContrasena(false); }}
                placeholder="Mínimo 6 caracteres"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-[#4A72A6] transition-colors"
              />
              <label className="text-xs font-bold text-slate-500 block">Confirmar contraseña</label>
              <input
                type="password"
                value={confirmarContrasena}
                onChange={(e) => { setConfirmarContrasena(e.target.value); setExitoContrasena(false); }}
                placeholder="Repite la contraseña"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-[#4A72A6] transition-colors"
              />
              {errorContrasena && (
                <p className="text-[11px] font-semibold text-rose-600 bg-rose-50 border border-rose-100 rounded-xl p-2.5">
                  ⚠️ {errorContrasena}
                </p>
              )}
              {exitoContrasena && (
                <p className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-xl p-2.5">
                  ✅ Contraseña actualizada correctamente.
                </p>
              )}
              <button
                onClick={guardarContrasena}
                disabled={guardandoContrasena || !nuevaContrasena || !confirmarContrasena}
                className="w-full py-3 bg-[#4A72A6] hover:bg-[#3B5E8C] text-white rounded-2xl text-sm font-bold transition-colors disabled:opacity-40"
              >
                {guardandoContrasena ? 'Guardando...' : 'Actualizar contraseña'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}