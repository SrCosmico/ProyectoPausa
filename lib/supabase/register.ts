// pantalla register
import { createClient } from "../supabase";
/**
 * LETRA C: PANTALLA REGISTER
 * Registra un nuevo alumno en la base de datos de la aplicación.
 * Nota: Si estás implementando autenticación nativa con Supabase Auth,
 * se utiliza signUp(), pero si mapeas los datos a una tabla personalizada 
 * de perfiles, se ejecuta un .insert() estándar.
 */
export const registrarNuevoAlumno = async (alumno: {
  nombre: string;
  correo: string;
  facultad: string;
  clave: string; // Se recomienda que la contraseña viaje ya encriptada o manejada por el proveedor de Auth
}) => {
  const supabase = createClient();

  // Opción por tabla personalizada de perfiles de estudiantes
  const { data, error } = await supabase
    .from('alumnos_perfiles')
    .insert({
      nombre_completo: alumno.nombre,
      correo_institucional: alumno.correo,
      facultad_escuela: alumno.facultad,
      creado_at: new Date().toISOString()
    })
    .select();

  if (error) {
    throw new Error(error.message);
  }
  return data;
};
