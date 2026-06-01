'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfileView() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [foto, setFoto] = useState<string | null>(null);

  useEffect(() => {
    setNombre(localStorage.getItem('alumnoNombre') || 'Valeria López');
    setCorreo(localStorage.getItem('alumnoEmail') || 'valeria@ucv.ve');
    setFoto(localStorage.getItem('userAvatar'));
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setFoto(result);
        localStorage.setItem('userAvatar', result);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('sesionActiva');
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-[#FCFBF8] flex justify-center items-center p-4 font-sans text-[#1E293B]">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-sm border border-gray-100 p-6 relative">
        
        {/* Botón de volver */}
        <button onClick={() => router.push('/homepage')} className="mb-6 text-gray-800">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </button>

        {/* Encabezado de perfil */}
        <div className="flex flex-col items-center mb-8">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-24 h-24 rounded-full bg-[#A7C7D8] mb-4 overflow-hidden border-4 border-gray-50 shadow-sm cursor-pointer flex items-center justify-center text-white text-3xl font-bold"
          >
            {foto ? (
              <img src={foto} alt="Perfil" className="w-full h-full object-cover" />
            ) : (
              nombre.charAt(0)
            )}
          </div>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
          <h2 className="text-xl font-bold text-[#1E293B]">{nombre}</h2>
          <p className="text-sm text-gray-500">{correo}</p>
        </div>

        {/* Menú de opciones */}
        <div className="space-y-3">
          {[
            { title: 'Editar información' },
            { title: 'Historial emocional' },
            { title: 'Privacidad y seguridad' },
            { title: 'Notificaciones' }
          ].map((item, i) => (
            <div key={i} className="w-full p-4 rounded-xl border border-gray-100 bg-gray-50 flex justify-between items-center cursor-pointer hover:border-[#5B7A9A] transition-all">
              <p className="font-semibold text-sm">{item.title}</p>
              <span className="text-gray-400">›</span>
            </div>
          ))}

          {/* Botón Cerrar Sesión */}
          <button 
            onClick={handleLogout}
            className="w-full mt-4 bg-white border-2 border-[#5B7A9A] text-[#5B7A9A] hover:bg-gray-50 font-semibold py-3.5 rounded-full transition-all"
          >
            Cerrar sesión
          </button>
        </div>

      </div>
    </div>
  );
}