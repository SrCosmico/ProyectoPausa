// pantalla register
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
  clave: string;
}) => {
  const registro = {
    nombre_completo: alumno.nombre,
    correo_institucional: alumno.correo,
    facultad_escuela: alumno.facultad,
    creado_at: new Date().toISOString(),
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem('alumnoNombre', alumno.nombre);
    localStorage.setItem('alumnoEmail', alumno.correo);
    localStorage.setItem('alumnoFacultad', alumno.facultad);
    localStorage.setItem('sesionActiva', 'true');

    const alumnos = JSON.parse(
      localStorage.getItem('alumnos_registrados') ?? '[]'
    ) as Array<typeof registro>;
    alumnos.push(registro);
    localStorage.setItem('alumnos_registrados', JSON.stringify(alumnos));
  }

  return [registro];
};
