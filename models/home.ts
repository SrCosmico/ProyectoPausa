//pantalla 4 principal home

export type feeltoday = "Muy mal" | "Mal" | "Regular" | "Bien" | "Muy bien"

export interface Pausa {
    id: number
    nombre: string
    saludo: string
    ComoTeSientesHoy: feeltoday
};

export type NivelLeyenda = "Muy mal" | "Mal" | "Regular" | "Bien" | "Muy bien"

export interface Leyenda {
    id: number
    nivel: NivelLeyenda
    descripcion: string
};
