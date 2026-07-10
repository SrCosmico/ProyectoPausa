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

  // ─── Init ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/login'); return; }

      const user = session.user;
      setUserId(user.id);
      setCorreo(user.email || '');

      // Leer perfil desde Supabase
      const perfil = await leerPerfilUsuario(user.id);

      // ✅ Prioridad: tabla perfiles → user_metadata → email prefix
      // Ignoramos usuarioDefecto ('Valeria López') si la tabla no tiene nombre real
      const nombreReal =
        (perfil.nombre && perfil.nombre !== 'Valeria López' ? perfil.nombre : null) ||
        user.user_metadata?.nombre_usuario ||
        user.user_metadata?.full_name ||
        user.email?.split('@')[0] ||
        'Estudiante';

      setNombre(nombreReal);
      
      // Prioridad: Supabase > localStorage
      if (perfil.avatar) {
        setFoto(perfil.avatar);
        localStorage.setItem('userAvatar', perfil.avatar);
      } else {
        const avatarLocal = localStorage.getItem('userAvatar');
        if (avatarLocal) setFoto(avatarLocal);
      }

      setCargando(false);
    };
    init();
  }, [router]);

  // ─── Cambiar foto — sin límite, siempre reemplaza ─────────────────────────

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    // Validaciones básicas
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen no puede superar los 5 MB.');
      return;
    }
    if (!file.type.startsWith('image/')) {
      alert('Solo se permiten archivos de imagen.');
      return;
    }

    setSubiendoFoto(true);

    try {
      // Nombre único basado en userId — siempre sobreescribe el anterior
      const extension = file.name.split('.').pop() ?? 'jpg';
      const rutaArchivo = `avatars/${userId}/avatar.${extension}`;

      // Subir a Supabase Storage (upsert: reemplaza si ya existe)
      const { error: uploadError } = await supabase.storage
        .from('avatares')
        .upload(rutaArchivo, file, { upsert: true, contentType: file.type });

      if (uploadError) throw uploadError;

      // Obtener URL pública
      const { data: urlData } = supabase.storage
        .from('avatares')
        .getPublicUrl(rutaArchivo);

      // Añadir timestamp para invalidar caché del navegador
      const urlPublica = `${urlData.publicUrl}?t=${Date.now()}`;

      // Guardar en tabla perfiles
      await actualizarPerfil(userId, { avatar_url: urlPublica });

      // Actualizar estado local y localStorage (para la home)
      setFoto(urlPublica);
      localStorage.setItem('userAvatar', urlPublica);

    } catch (err: any) {
      console.error('Error subiendo foto:', err);
      alert('No se pudo subir la foto. Intenta de nuevo.');
    } finally {
      setSubiendoFoto(false);
      // Limpiar input para permitir subir el mismo archivo de nuevo
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
    { id: 'editar',        icono: '✏️', titulo: 'Editar información',     descripcion: 'Cambia tu nombre',                      accion: abrirEditar     },
    { id: 'historial',     icono: '📊', titulo: 'Historial emocional',    descripcion: 'Revisa tu evolución de bienestar',       ruta: '/monitoreo.2'   },
    { id: 'privacidad',    icono: '🔒', titulo: 'Privacidad y seguridad', descripcion: 'Gestiona tu contraseña y datos'                                  },
    { id: 'notificaciones',icono: '🔔', titulo: 'Notificaciones',         descripcion: 'Configura tus alertas y recordatorios'                           },
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

              {/* Botón cámara */}
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
    </div>
  );
}