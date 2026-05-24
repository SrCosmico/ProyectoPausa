import { PantallaBienestar} from '@/models/bienestar';

export default function MonitoreoBienestar() {

const datosUsuario: PantallaBienestar = {
  usuario: {
    nombre: "Valeria López",
    avatarUrl: "https://api.com/uploads/valeria_l.jpg"
  },
  estadoActual: {
    titulo: "Bien",
    mensajeInspirador: "¡Vas por buen camino!",
    identificadorIcono: "face_positive_default"
  },
  historialSemanal: [
    { dia: "L", estado: "bien", valorNumerico: 7 },
    { dia: "M", estado: "neutral", valorNumerico: 5 },
    { dia: "X", estado: "excelente", valorNumerico: 10 },
    { dia: "J", estado: "bien", valorNumerico: 7 },
    { dia: "V", estado: "excelente", valorNumerico: 9 },
    { dia: "S", estado: "neutral", valorNumerico: 6 },
    { dia: "D", estado: "excelente", valorNumerico: 9 }
  ],
  recomendacion: {
    titulo: "Recomendación para hoy",
    descripcion: "Dedica unos minutos a respirar profundo y descansar tu mente.",
    imagenUrl: "assets/images/meditation_vector.png"
  }
};

  return (
    <div className='bg-amber-400 text-4xl'>
      <h1>Bienvenido, {datosUsuario.usuario.nombre}</h1>
      
      {/* Tu map para renderizar el historial semanal */}
      {datosUsuario.historialSemanal.map((elemento) => {
        return (
          <div key={elemento.dia}>
            <p>{elemento.dia}: {elemento.estado}</p>
          </div>
        );
      })}
    </div>
  );
}