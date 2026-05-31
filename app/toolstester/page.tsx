import { menuHerramientas } from '@/models/herramientas';

export default function PaginaHerramientas() {
  return (
    <div className="bg-amber-400 p-6">
      {/* Título de la sección */}
      <h1 className="text-4xl font-bold mb-4">{menuHerramientas.seccion}</h1>
      
      {/* Contenedor de las opciones */}
      <div className="grid grid-cols-1 gap-4">
        {menuHerramientas.opciones.map((elemento) => {
          return (
            <button 
              key={elemento.titulo} 
              className="p-4 bg-white rounded-xl shadow border text-left"
            >
              <h2 className="text-xl font-semibold text-black">{elemento.titulo}</h2>
              <p className="text-sm text-gray-600">{elemento.descripcion}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}