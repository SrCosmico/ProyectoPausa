"use client";

import { useRouter } from "next/navigation";

export default function RachaPage() {
  const router = useRouter();

  const rachaActual = 12;

  const dias = ["L", "M", "M", "J", "V", "S", "D"];

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-0 sm:p-4">

      <div className="w-full max-w-md h-screen sm:h-[850px] bg-slate-50 shadow-2xl flex flex-col sm:rounded-[40px] overflow-y-auto">

        {/* HEADER */}
        <div className="bg-white p-6 border-b border-slate-100">

          <button
            onClick={() => router.push("/home")}
            className="p-2 rounded-full hover:bg-slate-100 transition mb-4"
          >
            ←
          </button>

          <h1 className="text-3xl font-bold text-[#2A3B50]">
            🔥 Conexión en pareja
          </h1>

          <p className="text-sm text-slate-500 mt-2">
            Fortaleciendo su bienestar juntos
          </p>
        </div>

        <div className="p-6 space-y-5">

          {/* RACHA */}
          <div className="bg-gradient-to-r from-orange-400 to-orange-500 rounded-3xl p-6 text-white shadow-lg">

            <p className="text-sm opacity-90">
              Racha actual
            </p>

            <h2 className="text-5xl font-extrabold mt-2">
              {rachaActual}
            </h2>

            <p className="mt-2 text-orange-100">
              días seguidos
            </p>

          </div>

          {/* ESTADO PAREJA */}
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">

            <h3 className="font-bold text-slate-700 mb-4">
              ❤️ Estado de conexión
            </h3>

            <div className="space-y-3">

              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-700">
                  Camila
                </span>

                <span className="text-emerald-600 font-semibold">
                  ✅ Activa hoy
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-700">
                  Tu pareja
                </span>

                <span className="text-emerald-600 font-semibold">
                  ✅ Activo hoy
                </span>
              </div>

            </div>
          </div>

          {/* ACTIVIDAD SEMANAL */}
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">

            <h3 className="font-bold text-slate-700 mb-4">
              📈 Actividad semanal
            </h3>

            <div className="grid grid-cols-7 gap-2">

              {dias.map((dia) => (
                <div
                  key={dia}
                  className="flex flex-col items-center"
                >
                  <span className="text-xs text-slate-500">
                    {dia}
                  </span>

                  <div className="mt-2 text-2xl">
                    🔥
                  </div>
                </div>
              ))}

            </div>

          </div>

          {/* LOGRO */}
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">

            <h3 className="font-bold text-slate-700 mb-3">
              🏆 Logro actual
            </h3>

            <p className="text-slate-600">
              12 días compartiendo emociones juntos.
            </p>

          </div>

          {/* FRASE */}
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">

            <h3 className="font-bold text-slate-700 mb-3">
              💬 Frase del día
            </h3>

            <p className="italic text-slate-600">
              "Las pequeñas conversaciones construyen grandes conexiones."
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}