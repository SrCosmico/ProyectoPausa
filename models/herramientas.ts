// pantalla 8

export type Herramienta = 'Meditación y respiración' | 'Tips anti-estrés' | 'Escaneo corporal' | 'Relajación muscular progresiva' | 'Frases motivacionales' | 'Modo crisis';

export interface BotonHerramienta {
  titulo: Herramienta;
  descripcion: string;
}

export interface PantallaHerramientas {
  seccion: string;
  opciones: BotonHerramienta[];
}

// Herramientas individuales (exportadas por si necesitas usarlas por separado)
export const herramienta1: BotonHerramienta = {
  titulo: "Meditación y respiración",
  descripcion: "Ejercicios para calmar tu mente"
};

export const herramienta2: BotonHerramienta = {
  titulo: "Tips anti-estrés",
  descripcion: "Pequeñas acciones, grandes cambios"
};

export const herramienta3: BotonHerramienta = {
  titulo: "Escaneo corporal",
  descripcion: "Conecta con tu cuerpo"
};

export const herramienta4: BotonHerramienta = {
  titulo: "Relajación muscular progresiva",
  descripcion: "Libera la tensión"
};

export const herramienta5: BotonHerramienta = {
  titulo: "Frases motivacionales",
  descripcion: "Inspírate cada día"
};

export const herramienta6: BotonHerramienta = {
  titulo: "Modo crisis",
  descripcion: "Si necesitas ayuda inmediata"
};

// Objeto principal del menú listo para ser mapeado en tu componente
export const menuHerramientas: PantallaHerramientas = {
  seccion: "Para tu bienestar diario",
  opciones: [herramienta1, herramienta2, herramienta3, herramienta4, herramienta5, herramienta6]
};