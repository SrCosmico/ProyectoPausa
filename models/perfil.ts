// ==========================================
// INTERFACES Y MODELOS DE DATOS - PERFIL
// ==========================================

export interface OpcionMenu {
  title: string;
}

export interface UsuarioPerfil {
  nombre: string;
  correo: string;
  avatar?: string | null;
}

// Datos de configuración del menú de opciones
export const opcionesMenuPerfil: OpcionMenu[] = [
  { title: 'Editar información' },
  { title: 'Historial emocional' },
  { title: 'Privacidad y seguridad' },
  { title: 'Notificaciones' }
];

// Valores por defecto definidos en la lógica del componente
export const usuarioDefecto: UsuarioPerfil = {
  nombre: 'Valeria López',
  correo: 'valeria@ucv.ve',
  avatar: null
};