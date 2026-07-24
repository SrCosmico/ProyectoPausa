"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

// ==========================================
// FUENTE ÚNICA DE VERDAD: CONTACTOS
// ==========================================
//
// NOTA SOBRE VERACIDAD DE LOS DATOS:
// Los teléfonos marcados como verificados fueron corroborados contra
// fuentes públicas (directorio telefónico oficial de la UCV y directorios
// de líneas de ayuda psicológica de Venezuela). Los que NO pudieron
// verificarse quedan marcados con `verificado: false` y un aviso visible
// en la tarjeta, en vez de inventar un número.

type CategoriaContacto = "ucv" | "emergencia";

interface ContactoEmergencia {
  id: string;
  nombre: string;
  descripcion: string;
  categoria: CategoriaContacto;
  ubicacion: string;
  horario: string;
  telefono?: string;
  email?: string;
  esEmergencia?: boolean;
  verificado: boolean;
  // Datos para el mapa
  lat?: number;
  lng?: number;
  color: string;
  icono: string;
}

const CONTACTOS: ContactoEmergencia[] = [
  {
    id: "dbe",
    nombre: "Organización de Bienestar Estudiantil (OBE)",
    descripcion: "Dirección de la UCV encargada del bienestar integral del estudiantado, incluyendo orientación y acompañamiento.",
    categoria: "ucv",
    ubicacion: "Ciudad Universitaria, Edificio de Rectorado",
    horario: "Lun–Vie, horario de oficina",
    telefono: "(0212) 605-4751 / 605-4731",
    verificado: true,
    lat: 10.4886,
    lng: -66.8895,
    color: "#4A72A6",
    icono: "🏛️",
  },
  {
    id: "esc_psico",
    nombre: "Clínica Psicológica — Escuela de Psicología",
    descripcion: "Atención clínica supervisada por profesionales, adscrita a la Escuela de Psicología. Solicita cita con antelación.",
    categoria: "ucv",
    ubicacion: "Facultad de Humanidades y Educación, Escuela de Psicología",
    horario: "Lun–Vie (confirmar horario vigente con la escuela)",
    verificado: false,
    lat: 10.4855,
    lng: -66.8930,
    color: "#7C3AED",
    icono: "🧠",
  },
  {
    id: "sap_psicologia",
    nombre: "S.A.P. — Servicio de Asesoramiento Psicológico",
    descripcion: "Programa de la Escuela de Psicología orientado al asesoramiento y apoyo psicológico preventivo para la comunidad universitaria.",
    categoria: "ucv",
    ubicacion: "Facultad de Humanidades y Educación, Escuela de Psicología",
    horario: "Lun–Vie (confirmar horario vigente con la coordinación)",
    telefono: "(0212) 605-5914 / 605-2913",
    verificado: true,
    lat: 10.4862,
    lng: -66.8945,
    color: "#0891B2",
    icono: "🗣️",
  },
  {
    id: "orientacion_facultades",
    nombre: "Servicio de Orientación de tu Facultad",
    descripcion: "Cada facultad de la UCV cuenta con su propio Servicio de Orientación, que atiende a estudiantes en el área social, académica, vocacional y psicológica. Es un buen primer punto de contacto si no sabes a quién acudir.",
    categoria: "ucv",
    ubicacion: "Presente en cada Facultad de la Ciudad Universitaria",
    horario: "Según horario de atención de cada facultad",
    verificado: false,
    lat: 10.4905,
    lng: -66.8935,
    color: "#0D9488",
    icono: "🧭",
  },
  {
    id: "esc_medicina",
    nombre: "Departamento de Psiquiatría — Facultad de Medicina",
    descripcion: "Consulta médica especializada para situaciones de salud mental que requieran evaluación clínica.",
    categoria: "ucv",
    ubicacion: "Ciudad Universitaria, Facultad de Medicina",
    horario: "Lun–Vie (confirmar horario vigente con el departamento)",
    verificado: false,
    lat: 10.4840,
    lng: -66.8870,
    color: "#059669",
    icono: "🏥",
  },
  {
    id: "seapsi",
    nombre: "SEAPSI — Servicio de Atención Psicológica Integral",
    descripcion: "Programa de la Federación de Psicólogos de Venezuela (FPV) que ofrece atención y terapia psicológica gratuita o a bajo costo, incluyendo la modalidad de telepsicología.",
    categoria: "emergencia",
    ubicacion: "Atención telefónica y por telepsicología a nivel nacional (Venezuela)",
    horario: "Contactar por teléfono o correo para coordinar una cita (no es una línea de emergencia 24/7)",
    telefono: "0414-321-9575",
    email: "seapsi@fpv.org.ve",
    esEmergencia: false,
    verificado: true,
    lat: 10.4930,
    lng: -66.8880,
    color: "#9333EA",
    icono: "💬",
  },
  {
    id: "lapsi",
    nombre: "LAPSI — Línea de Ayuda Psicológica",
    descripcion: "Línea de la Federación de Psicólogos de Venezuela. Asistencia gratuita, anónima y confidencial, accesible desde cualquier teléfono.",
    categoria: "emergencia",
    ubicacion: "Atención telefónica a nivel nacional (Venezuela)",
    horario: "Cobertura casi continua: desde el viernes 8:00 a.m. hasta el miércoles 8:00 a.m.",
    telefono: "(0212) 416-3116 / 416-3118",
    esEmergencia: true,
    verificado: true,
    lat: 10.4915,
    lng: -66.8860,
    color: "#EA580C",
    icono: "📞",
  },
  {
    id: "bomberos",
    nombre: "Cuerpo de Bomberos Voluntarios Universitarios UCV",
    descripcion: "Primeros auxilios y emergencias médicas dentro del campus universitario.",
    categoria: "emergencia",
    ubicacion: "Sótano del Gimnasio Cubierto, Ciudad Universitaria de Caracas",
    horario: "24 horas, 365 días al año",
    telefono: "(0212) 605-2222 (central) / 605-4930 al 33",
    esEmergencia: true,
    verificado: true,
    lat: 10.4893,
    lng: -66.8875,
    color: "#E11D48",
    icono: "🚒",
  },
  {
    id: "emergencias_nacionales",
    nombre: "Emergencias Nacionales (VEN 911)",
    descripcion: "Número único de emergencias para situaciones de riesgo vital inmediato.",
    categoria: "emergencia",
    ubicacion: "Nacional (Venezuela)",
    horario: "24 horas, 7 días a la semana",
    telefono: "911",
    esEmergencia: true,
    verificado: true,
    color: "#E11D48",
    icono: "🚨",
  },
];

// Agrupamos dinámicamente para el acordeón
const SECCIONES_APOYO = [
  {
    id: "ucv",
    titulo: "Apoyo psicológico UCV",
    icono: "🏛️",
    color: "text-[#4A72A6]",
    colorBg: "bg-blue-50 border-blue-100",
    puntos: CONTACTOS.filter((c) => c.categoria === "ucv"),
  },
  {
    id: "emergencia",
    titulo: "Líneas de apoyo y crisis",
    icono: "🚨",
    color: "text-rose-700",
    colorBg: "bg-rose-50 border-rose-100",
    puntos: CONTACTOS.filter((c) => c.categoria === "emergencia"),
  },
];

// Filtramos dinámicamente solo los que tienen coordenadas para el mapa
const PUNTOS_MAPA = CONTACTOS.filter((c) => c.lat !== undefined && c.lng !== undefined);

// ==========================================
// MAPA INTERACTIVO CON LEAFLET
// ==========================================

const LEAFLET_CSS_URL = 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css';
const LEAFLET_JS_URL  = 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js';

function cargarLeafletCSS(): Promise<void> {
  return new Promise((resolve) => {
    const existente = document.querySelector('link[data-leaflet-css]') as HTMLLinkElement | null;
    if (existente) { resolve(); return; }
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = LEAFLET_CSS_URL;
    link.setAttribute('data-leaflet-css', 'true');
    link.onload  = () => resolve();
    link.onerror = () => resolve();
    document.head.appendChild(link);
  });
}

function cargarLeafletJS(): Promise<any> {
  return new Promise((resolve, reject) => {
    if ((window as any).L) { resolve((window as any).L); return; }
    const existente = document.querySelector('script[data-leaflet-js]') as HTMLScriptElement | null;
    if (existente) {
      existente.addEventListener('load',  () => resolve((window as any).L));
      existente.addEventListener('error', () => reject(new Error('No se pudo cargar Leaflet (JS)')));
      return;
    }
    const script = document.createElement('script');
    script.src = LEAFLET_JS_URL;
    script.setAttribute('data-leaflet-js', 'true');
    script.onload  = () => resolve((window as any).L);
    script.onerror = () => reject(new Error('No se pudo cargar Leaflet (JS)'));
    document.head.appendChild(script);
  });
}

function MapaUCV() {
  const mapRef            = useRef<HTMLDivElement>(null);
  const mapInstanceRef    = useRef<any>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const intentosRef       = useRef(0);
  const [puntoSeleccionado, setPuntoSeleccionado] = useState<ContactoEmergencia | null>(null);
  const [estadoMapa, setEstadoMapa]               = useState<'cargando' | 'listo' | 'error'>('cargando');

  useEffect(() => {
    let cancelado = false;

    const conTimeout = <T,>(promesa: Promise<T>, ms: number, mensaje: string): Promise<T> =>
      Promise.race([
        promesa,
        new Promise<T>((_, reject) => setTimeout(() => reject(new Error(mensaje)), ms)),
      ]);

    const esperarDimensiones = (el: HTMLDivElement, maxMs = 4000): Promise<void> =>
      new Promise((resolve, reject) => {
        if (el.offsetWidth > 0 && el.offsetHeight > 0) { resolve(); return; }
        const inicio = Date.now();
        const raf = () => {
          if (cancelado)                                    { reject(new Error('cancelado')); return; }
          if (el.offsetWidth > 0 && el.offsetHeight > 0)   { resolve(); return; }
          if (Date.now() - inicio > maxMs)                  { reject(new Error('sin dimensiones')); return; }
          requestAnimationFrame(raf);
        };
        requestAnimationFrame(raf);
      });

    const iniciarMapa = async () => {
      try {
        await conTimeout(cargarLeafletCSS(), 8000, 'Tiempo de espera agotado cargando el CSS de Leaflet');
        const L = await conTimeout(cargarLeafletJS(), 8000, 'Tiempo de espera agotado cargando Leaflet');

        if (cancelado || !mapRef.current || mapInstanceRef.current) return;

        await esperarDimensiones(mapRef.current);
        if (cancelado || !mapRef.current || mapInstanceRef.current) return;

        const map = L.map(mapRef.current, {
          center:          [10.4880, -66.8905],
          zoom:            15,
          zoomControl:     true,
          scrollWheelZoom: true,
          tap:             false,
        });

        mapInstanceRef.current = map;

        const capaTiles = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          attribution: '© OpenStreetMap © CARTO',
          subdomains:  'abcd',
          maxZoom:     19,
        });

        capaTiles.on('tileload', () => { if (!cancelado) setEstadoMapa('listo'); });
        capaTiles.on('load',     () => { if (!cancelado) setEstadoMapa('listo'); });
        capaTiles.on('tileerror',() => { if (!cancelado) setEstadoMapa((prev) => (prev === 'listo' ? prev : 'error')); });

        capaTiles.addTo(map);

        setTimeout(() => {
          if (!cancelado) setEstadoMapa((prev) => (prev === 'cargando' ? 'error' : prev));
        }, 8000);

        PUNTOS_MAPA.forEach((punto) => {
          const iconHtml = `
            <div style="
              background: ${punto.color};
              width: 40px; height: 40px;
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              border: 3px solid white;
              box-shadow: 0 3px 10px rgba(0,0,0,0.35);
              display: flex; align-items: center; justify-content: center;
            ">
              <span style="transform: rotate(45deg); font-size: 18px; line-height: 1;">
                ${punto.icono}
              </span>
            </div>
          `;
          const icon   = L.divIcon({ html: iconHtml, className: '', iconSize: [40, 40], iconAnchor: [20, 40] });
          const marker = L.marker([punto.lat!, punto.lng!], { icon }).addTo(map);
          marker.on('click', () => { map.panTo([punto.lat!, punto.lng!]); setPuntoSeleccionado(punto); });
        });

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (!cancelado && mapInstanceRef.current) {
              map.invalidateSize({ animate: false });
            }
          });
        });

        if (typeof ResizeObserver !== 'undefined' && mapRef.current) {
          const observer = new ResizeObserver(() => { map.invalidateSize({ animate: false }); });
          observer.observe(mapRef.current);
          resizeObserverRef.current = observer;
        }
      } catch (err) {
        console.error('Error cargando el mapa:', err);
        if (!cancelado && intentosRef.current < 1) {
          intentosRef.current += 1;
          setTimeout(iniciarMapa, 1500);
        } else if (!cancelado) {
          setEstadoMapa('error');
        }
      }
    };

    iniciarMapa();

    return () => {
      cancelado = true;
      if (resizeObserverRef.current) { resizeObserverRef.current.disconnect(); resizeObserverRef.current = null; }
      if (mapInstanceRef.current)    { mapInstanceRef.current.remove();        mapInstanceRef.current    = null; }
    };
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <div ref={mapRef} className="w-full h-full" />

      {estadoMapa === 'cargando' && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-50 pointer-events-none">
          <div className="w-8 h-8 border-4 border-teal-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {estadoMapa === 'error' && (
        <div className="absolute top-4 left-4 right-4 z-[999] bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-xs text-amber-800 font-medium text-center shadow-sm">
          No se pudo cargar el mapa. Revisa tu conexión — los puntos de apoyo siguen disponibles en la lista anterior.
        </div>
      )}

      {puntoSeleccionado && (
        <div className="absolute bottom-0 left-0 right-0 z-[1000] animate-slideUp">
          <div className="bg-white rounded-t-[28px] shadow-2xl px-5 pt-4 pb-6">
            <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-4" />
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ backgroundColor: puntoSeleccionado.color + '20' }}
                >
                  {puntoSeleccionado.icono}
                </div>
                <div>
                  <p className="text-sm font-bold text-[#2A3B50] leading-snug">{puntoSeleccionado.nombre}</p>
                  <p className="text-[10px] font-medium mt-0.5" style={{ color: puntoSeleccionado.color }}>
                    {puntoSeleccionado.esEmergencia ? '📞 Línea de crisis 24/7' : '📍 ' + puntoSeleccionado.ubicacion}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPuntoSeleccionado(null)}
                className="p-1.5 bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 flex-shrink-0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="bg-slate-50 rounded-2xl px-4 py-3 space-y-1.5 mb-4">
              <div className="flex items-start gap-2">
                <span className="text-xs flex-shrink-0">📍</span>
                <p className="text-[11px] text-slate-600 font-medium leading-snug">{puntoSeleccionado.ubicacion}</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-xs flex-shrink-0">🕒</span>
                <p className="text-[11px] text-slate-600 font-medium">{puntoSeleccionado.horario}</p>
              </div>
              {puntoSeleccionado.email && (
                <div className="flex items-start gap-2">
                  <span className="text-xs flex-shrink-0">✉️</span>
                  <p className="text-[11px] text-slate-600 font-medium">{puntoSeleccionado.email}</p>
                </div>
              )}
              {puntoSeleccionado.telefono && (
                <div className="flex items-start gap-2">
                  <span className="text-xs flex-shrink-0">📞</span>
                  <p className="text-[11px] text-slate-600 font-medium">{puntoSeleccionado.telefono}</p>
                </div>
              )}
              {!puntoSeleccionado.verificado && (
                <div className="flex items-start gap-2 pt-1">
                  <span className="text-xs flex-shrink-0">ℹ️</span>
                  <p className="text-[10px] text-amber-600 font-medium leading-snug">
                    Dato por confirmar directamente con la institución.
                  </p>
                </div>
              )}
            </div>

            {puntoSeleccionado.lat && puntoSeleccionado.lng && (
              <a
                href={`https://maps.google.com/?q=${puntoSeleccionado.lat},${puntoSeleccionado.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                </svg>
                Ir a ubicación
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// COMPONENTE ACORDEÓN INDIVIDUAL
// ==========================================

function AccordionItem({ punto }: { punto: ContactoEmergencia }) {
  const [abierto, setAbierto] = useState(false);

  return (
    <div className={`rounded-2xl border overflow-hidden transition-all duration-200 bg-white ${
      punto.esEmergencia ? "border-rose-200" : "border-slate-100"
    }`}>
      <button
        onClick={() => setAbierto(!abierto)}
        className="w-full flex items-center justify-between px-4 py-3.5 text-left focus:outline-none group"
        aria-expanded={abierto}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span
            className="relative w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0"
            style={{ backgroundColor: punto.color + '18' }}
          >
            {punto.icono}
            {punto.esEmergencia && (
              <span className="absolute -top-1.5 -right-1.5 text-[7px] font-black text-white bg-rose-500 rounded-full px-1 py-[1px] leading-none shadow-sm">
                24/7
              </span>
            )}
          </span>
          <span className={`text-xs font-bold leading-snug ${
            punto.esEmergencia ? "text-rose-800" : "text-slate-800"
          } line-clamp-2`}>
            {punto.nombre}
          </span>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          stroke="currentColor"
          className={`w-4 h-4 flex-shrink-0 ml-2 text-slate-400 transition-transform duration-200 ${
            abierto ? "rotate-180" : ""
          }`}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {abierto && (
        <div className="px-4 pb-4 space-y-3 border-t border-slate-100 pt-3 animate-fadeIn">
          <p className="text-[11px] font-medium text-slate-600 leading-relaxed">
            {punto.descripcion}
          </p>
          <div className="space-y-2">
            {punto.ubicacion && (
              <div className="flex items-start gap-2">
                <span className="text-[10px] text-slate-400 flex-shrink-0 mt-0.5">📍</span>
                <span className="text-[11px] text-slate-500 font-medium">{punto.ubicacion}</span>
              </div>
            )}
            {punto.horario && (
              <div className="flex items-start gap-2">
                <span className="text-[10px] text-slate-400 flex-shrink-0 mt-0.5">🕒</span>
                <span className="text-[11px] text-slate-500 font-medium">{punto.horario}</span>
              </div>
            )}
            {punto.telefono && (
              <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-bold ${
                punto.esEmergencia
                  ? "bg-rose-50 text-rose-700 border border-rose-100"
                  : "bg-[#4A72A6]/10 text-[#3B5E8C] border border-[#4A72A6]/20"
              }`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5 flex-shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.338c0-1.36 1.22-2.337 2.57-2.096l1.77.32A2.25 2.25 0 0 1 8.33 6.44l.51 2.55a2.25 2.25 0 0 1-1.29 2.49l-.99.44a1.04 1.04 0 0 0-.57 1.17c.53 2.58 2.47 4.73 5.05 5.78l.45.18a1.04 1.04 0 0 0 1.23-.41l.44-.66a2.25 2.25 0 0 1 2.58-.92l2.53.84a2.25 2.25 0 0 1 1.55 2.25v1.44c0 1.36-1.22 2.34-2.57 2.09C7.62 22.78 1.5 15.5 1.5 6.75c0-.15.02-.3.05-.45l.69-.001.01.034Z" />
                </svg>
                {punto.telefono}
              </div>
            )}
            {punto.email && (
              <a
                href={`mailto:${punto.email}`}
                className="flex items-center gap-2 text-[11px] font-medium text-[#4A72A6] hover:underline"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5 flex-shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                </svg>
                {punto.email}
              </a>
            )}
            {!punto.verificado && (
              <div className="flex items-start gap-2 pt-1">
                <span className="text-[10px] text-amber-500 flex-shrink-0 mt-0.5">ℹ️</span>
                <span className="text-[10px] text-amber-600 font-medium leading-snug">
                  No se encontró un teléfono público confirmado para este servicio. Te recomendamos contactar directamente a la facultad correspondiente.
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// COMPONENTE PRINCIPAL: MODO CRISIS
// ==========================================

export default function ModoCrisisPage() {
  const router = useRouter();

  const desencadenadoAutomaticamente = false;
  const promedioBienestar: number = 0;

  const [seccionAbierta, setSeccionAbierta] = useState<string | null>("emergencia");
  const [mapaFullscreen, setMapaFullscreen] = useState(false);

  const mensajePrincipal = desencadenadoAutomaticamente
    ? "Hemos notado que tu bienestar ha sido bajo esta semana. No estás solo/a."
    : "Este es tu espacio de ayuda inmediata. Estás en el lugar correcto.";

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-0 sm:p-4 font-sans">
      <div
        className="w-full max-w-md h-screen sm:h-[850px] shadow-2xl flex flex-col relative sm:rounded-[40px] border border-gray-100 overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #F5F3FF 0%, #FDF2F8 38%, #FFFFFF 62%)' }}
      >
        {/* ── IMÁGENES DECORATIVAS (mismo patrón que la pantalla de bienvenida) ── */}

        {/* Forma morada: esquina superior izquierda */}
        <img
          src="/images/forma_morada.png"
          alt=""
          aria-hidden="true"
          className="absolute -top-2 -left-2 w-[55%] max-w-[240px] object-contain pointer-events-none select-none z-0 opacity-70"
        />

        {/* Forma verde: esquina inferior derecha */}
        <img
          src="/images/forma_verde.png"
          alt=""
          aria-hidden="true"
          className="absolute -bottom-2 -right-2 w-[55%] max-w-[240px] object-contain pointer-events-none select-none z-0 opacity-70"
        />

        {/* Onda del medio: lateral izquierdo */}
        <img
          src="/images/onda_del_medio.png"
          alt=""
          aria-hidden="true"
          className="absolute top-1/2 h-[55%] w-auto object-contain pointer-events-none select-none z-0 opacity-20"
          style={{ transform: 'translateY(-50%) rotate(90deg)', left: '-18%' }}
        />

        {/* Ramita izquierda */}
        <img
          src="/images/ramita_izquierda.png"
          alt=""
          aria-hidden="true"
          className="absolute top-[46%] -left-3 w-28 sm:w-32 object-contain pointer-events-none select-none z-0 opacity-70"
        />

        {/* Ramita derecha */}
        <img
          src="/images/ramita_derecha.png"
          alt=""
          aria-hidden="true"
          className="absolute top-[38%] -right-3 w-20 sm:w-24 object-contain pointer-events-none select-none z-0 opacity-70"
        />

        {/* HEADER */}
        <div className="relative z-10 px-6 pt-6 pb-5">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/home")}
              className="p-2 -ml-2 text-slate-600 hover:text-slate-800 transition-colors rounded-full hover:bg-white/70 active:scale-95 flex-shrink-0"
              aria-label="Volver al inicio"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
              </svg>
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className="w-9 h-9 rounded-2xl flex items-center justify-center text-lg flex-shrink-0 shadow-sm"
                  style={{ background: 'linear-gradient(135deg, #FB7185 0%, #F43F5E 100%)' }}
                >
                  🚨
                </span>
                <div>
                  <h2 className="text-base font-extrabold text-[#2A3B50] tracking-tight leading-tight">
                    Modo crisis
                  </h2>
                  <p className="text-[11px] text-slate-500 font-medium leading-snug">
                    Ayuda inmediata y contención
                  </p>
                </div>
              </div>
            </div>
          </div>

          {desencadenadoAutomaticamente ? (
            <div className="mt-4 p-4 rounded-3xl flex items-start gap-3 shadow-md shadow-rose-200/60" style={{ background: 'linear-gradient(135deg, #FB7185 0%, #E11D48 100%)' }}>
              <span className="text-lg flex-shrink-0 mt-0.5">💙</span>
              <div>
                <p className="text-xs font-bold text-white leading-snug">{mensajePrincipal}</p>
                {promedioBienestar !== undefined && (
                  <p className="text-[10px] font-medium mt-1 text-rose-50">
                    Tu bienestar promedio esta semana: {promedioBienestar.toFixed(1)}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-4 p-4 bg-white/80 backdrop-blur-sm border border-purple-100/70 rounded-3xl flex items-start gap-3 shadow-sm">
              <span className="text-lg flex-shrink-0 mt-0.5">💜</span>
              <p className="text-xs font-medium text-slate-600 leading-relaxed">
                {mensajePrincipal}
              </p>
            </div>
          )}
        </div>

        {/* CONTENIDO SCROLLABLE */}
        <div className="relative z-10 flex-1 overflow-y-auto px-6 py-2 space-y-4">
          {SECCIONES_APOYO.map((seccion) => {
            const estaAbierta = seccionAbierta === seccion.id;
            return (
              <div key={seccion.id} className={`rounded-3xl border overflow-hidden shadow-sm backdrop-blur-sm ${seccion.colorBg}`}>
                <button
                  onClick={() => setSeccionAbierta(estaAbierta ? null : seccion.id)}
                  className="w-full flex items-center justify-between px-5 py-4 focus:outline-none"
                  aria-expanded={estaAbierta}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{seccion.icono}</span>
                    <span className={`text-xs font-extrabold uppercase tracking-wide ${seccion.color}`}>
                      {seccion.titulo}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 bg-white/70 px-2 py-0.5 rounded-full">
                      {seccion.puntos.length}
                    </span>
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 flex-shrink-0 ${
                      estaAbierta ? "rotate-180" : ""
                    }`}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>

                {estaAbierta && (
                  <div className="px-4 pb-4 space-y-2.5 animate-fadeIn">
                    {seccion.puntos.map((punto) => (
                      <AccordionItem key={punto.id} punto={punto} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          <button
            onClick={() => setMapaFullscreen(true)}
            className="w-full rounded-3xl border border-teal-100 px-5 py-4 flex items-center justify-between focus:outline-none hover:brightness-95 transition-all shadow-sm"
            style={{ background: 'linear-gradient(135deg, #CCFBF1 0%, #99F6E4 100%)' }}
          >
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-2xl bg-white/70 flex items-center justify-center text-xl flex-shrink-0">🗺️</span>
              <div className="text-left">
                <p className="text-xs font-extrabold uppercase tracking-wide text-teal-800">Puntos de apoyo en el campus</p>
                <p className="text-[10px] text-teal-600 font-medium mt-0.5">Ver mapa interactivo</p>
              </div>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-teal-600 flex-shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </button>

          <div className="p-4 rounded-3xl flex items-start gap-3 mb-4 shadow-sm border border-purple-100/70" style={{ background: 'linear-gradient(135deg, #F5F3FF 0%, #FAE8FF 100%)' }}>
            <span className="text-xl flex-shrink-0">✨</span>
            <div>
              <p className="text-xs font-bold text-purple-900">Recuerda</p>
              <p className="text-[11px] text-purple-700 font-medium leading-relaxed mt-1">
                Pedir ayuda es un acto de valentía. No tienes que atravesar esto solo/a.
                Los servicios de la UCV están aquí para acompañarte.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* MAPA FULLSCREEN */}
      {mapaFullscreen && (
        <div className="absolute inset-0 z-50 bg-white flex flex-col sm:rounded-[40px] overflow-hidden">
          <div className="px-4 py-3 bg-white border-b border-slate-100 flex items-center gap-3 flex-shrink-0">
            <button
              onClick={() => setMapaFullscreen(false)}
              className="p-2 -ml-1 text-slate-600 hover:text-slate-800 rounded-full hover:bg-slate-100 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
              </svg>
            </button>
            <div>
              <p className="text-sm font-bold text-[#2A3B50]">Puntos de apoyo</p>
              <p className="text-[10px] text-slate-400 font-medium">Ciudad Universitaria UCV — toca un pin para ver detalles</p>
            </div>
          </div>
          <div className="flex-1 relative min-h-0">
            <MapaUCV />
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
        .animate-fadeIn  { animation: fadeIn  0.2s ease-out forwards; }
        .animate-slideUp { animation: slideUp 0.3s cubic-bezier(0.32,0.72,0,1) forwards; }
      `}</style>
    </div>
  );
}