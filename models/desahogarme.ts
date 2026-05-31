// Pantalla 6 — Desahogarme

export interface PantallaDesahogarme {
  titulo: string;            // "Desahogarme"
  subtitulo: string;         // "Este es tu espacio seguro"
  ilustracionUrl?: string;
  areaTexto: {
    placeholder: string;     // "Empieza a escribir aquí..."
    texto: string;
    maxCaracteres: number;   // 1000
  };
  avisoPrivacidad: string;   // "Todo lo que escribes es privado y solo tú puedes verlo."
  botonGuardar: string;      // "Guardar"
}
