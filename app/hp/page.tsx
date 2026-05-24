// Ejemplo de importación en tu componente de React / Next.js
import { Leyenda, NivelLeyenda, Pausa, feeltoday } from '@/models/home';

export default function HomePage() {
  
  const usuarioActual: Pausa = { id: 1, nombre: 'Usuario', saludo: 'Hola', ComoTeSientesHoy: 'Regular' };

  const leyenda: Leyenda[] = [
      { id: 1, nivel: "Muy mal", descripcion: "Te sientes abrumado, triste o desesperanzado." },
      { id: 2, nivel: "Mal", descripcion: "Te sientes decaído o con dificultades." },
      { id: 3, nivel: "Regular", descripcion: "Ni bien ni mal, un día promedio." },
      { id: 4, nivel: "Bien", descripcion: "Te sientes tranquilo y positivo." },
      { id: 5, nivel: "Muy bien", descripcion: "Te sientes excelente, lleno de energía." },
  ]

  return (
    <div className="bg-amber-400 p-6">
      {/* Saludo principal */}
      <h1 className="text-4xl font-bold mb-2">{usuarioActual.saludo}, {usuarioActual.nombre}</h1>
      <p className="text-lg mb-6">Estado actual seleccionado: <strong>{usuarioActual.ComoTeSientesHoy}</strong></p>
      
      <hr className="my-4 border-amber-500" />

      {/* Renderizado de la Leyenda */}
      <h2 className="text-2xl font-semibold mb-4">¿Cómo te sientes hoy?</h2>
      <div className="space-y-3">
        {leyenda.map((item) => {
          return (
            <div key={item.id} className="p-4 bg-white rounded-xl shadow">
              <h3 className="text-lg font-bold text-black">{item.nivel}</h3>
              <p className="text-sm text-gray-600">{item.descripcion}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}