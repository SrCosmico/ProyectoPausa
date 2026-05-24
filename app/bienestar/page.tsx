import React from 'react';

// --- TYPES & INTERFACES ---
interface HistoryPoint {
  dayLabel: string;
  dayInitial: string;
  statusEmoji: string;
  valueY: number; // Percentage for SVG chart positioning
  dotColor: string;
}

export default function WellnessDashboard() {
  // --- DUMMY DATA ---
  const historyData: HistoryPoint[] = [
    { dayLabel: 'L', dayInitial: 'L', statusEmoji: '😐', valueY: 45, dotColor: 'bg-emerald-500' },
    { dayLabel: 'M', dayInitial: 'M', statusEmoji: '😕', valueY: 65, dotColor: 'bg-sky-400' },
    { dayLabel: 'M', dayInitial: 'M', statusEmoji: '😐', valueY: 55, dotColor: 'bg-sky-400' },
    { dayLabel: 'J', dayInitial: 'J', statusEmoji: '😐', valueY: 35, dotColor: 'bg-sky-500' },
    { dayLabel: 'V', dayInitial: 'V', statusEmoji: '😕', valueY: 50, dotColor: 'bg-amber-400' },
    { dayLabel: 'S', dayInitial: 'S', statusEmoji: '😐', valueY: 40, dotColor: 'bg-teal-500' },
    { dayLabel: 'D', dayInitial: 'D', statusEmoji: '😐', valueY: 20, dotColor: 'bg-emerald-400' },
  ];

  // SVG Line Generation logic based on coordinates
  const svgWidth = 500;
  const svgHeight = 120;
  const pointsCount = historyData.length;
  const paddingX = 40;
  const chartWidth = svgWidth - paddingX * 2;
  
  const pointsCoordinates = historyData.map((item, index) => {
    const x = paddingX + (index * (chartWidth / (pointsCount - 1)));
    const y = item.valueY;
    return { x, y, ...item };
  });

  // Create SVG path d-attribute using a smooth cubic bezier curve
  let pathD = '';
  if (pointsCoordinates.length > 0) {
    pathD = `M ${pointsCoordinates[0].x} ${pointsCoordinates[0].y}`;
    for (let i = 0; i < pointsCoordinates.length - 1; i++) {
      const p0 = pointsCoordinates[i];
      const p1 = pointsCoordinates[i + 1];
      const cpX1 = p0.x + (p1.x - p0.x) / 2;
      const cpY1 = p0.y;
      const cpX2 = p0.x + (p1.x - p0.x) / 2;
      const cpY2 = p1.y;
      pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
    }
  }

  // Create Area Path closure for gradient background
  const areaD = `${pathD} L ${pointsCoordinates[pointsCoordinates.length - 1].x} ${svgHeight} L ${pointsCoordinates[0].x} ${svgHeight} Z`;

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-start md:py-8">
      {/* Mobile-first Container Frame */}
      <div className="w-full max-w-md bg-[#FAF8F5] min-h-screen md:min-h-[850px] md:rounded-[40px] md:shadow-xl overflow-hidden flex flex-col justify-between relative font-sans text-[#1A2530]">
        
        {/* Main Content Area */}
        <div className="p-6 flex-1 pb-24">
          
          {/* Header Section */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-[#111A24]">Tu bienestar</h1>
              <p className="text-sm text-gray-500 mt-0.5">Resumen de tu estado</p>
            </div>
            {/* Profile Avatar Placeholder */}
            <div className="w-11 h-11 rounded-full bg-[#D1E0E8] overflow-hidden border border-white shadow-sm flex items-end justify-center">
              <svg viewBox="0 0 24 24" className="w-9 h-9 text-[#4A5D6E]" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
          </div>

          {/* Current Status Card */}
          <div className="bg-[#F0F5F3] rounded-3xl p-5 mb-4 border border-[#E3EDE9]">
            <h2 className="text-sm font-semibold text-[#2C3E35] mb-3">Tu estado actual</h2>
            <div className="flex items-center gap-4">
              {/* Status Smile Icon Container */}
              <div className="w-14 h-14 rounded-full bg-[#C3DDD0] flex items-center justify-center text-3xl">
                😊
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#1E352A]">Bien</h3>
                <p className="text-sm text-[#476355]">¡Vas por buen camino!</p>
              </div>
            </div>
          </div>

          {/* Emotional History Card */}
          <div className="bg-white rounded-3xl p-5 mb-4 border border-[#F0EFEA] shadow-sm relative">
            <div className="flex justify-between items-center mb-1">
              <h2 className="text-sm font-semibold text-[#111A24]">Historial emocional</h2>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <p className="text-xs text-gray-400 mb-4">Últimos 7 días</p>

            {/* Custom Interactive SVG Chart Area */}
            <div className="w-full overflow-visible relative my-2">
              <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto overflow-visible" preserveAspectRatio="none">
                <defs>
                  {/* Background Gradient for the chart path */}
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#DDF3E8" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#DDF3E8" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Filled Area beneath line */}
                <path d={areaD} fill="url(#chartGradient)" />

                {/* Main Curve Line */}
                <path d={pathD} fill="none" stroke="#68BCA2" strokeWidth="2.5" strokeLinecap="round" />

                {/* Interactive Points mapping */}
                {pointsCoordinates.map((pt, i) => (
                  <g key={i}>
                    {/* Ring Outer Circle */}
                    <circle cx={pt.x} cy={pt.y} r="8" fill="white" stroke="#68BCA2" strokeWidth="2" />
                    {/* Inner Center Dot */}
                    <circle cx={pt.x} cy={pt.y} r="3" fill="#40967E" />
                  </g>
                ))}
              </svg>

              {/* Dynamic Bottom Label Mapping aligned perfectly to X positions */}
              <div className="flex justify-between items-center mt-3 px-[4%] text-center">
                {pointsCoordinates.map((pt, i) => (
                  <div key={i} className="flex flex-col items-center flex-1">
                    <span className="text-base mb-1 block">{pt.statusEmoji}</span>
                    <span className={`text-xs font-semibold ${i === 1 ? 'text-[#111A24] font-bold' : 'text-gray-400'}`}>
                      {pt.dayInitial}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Today's Recommendation Card */}
          <div className="bg-white rounded-3xl p-5 border border-[#F0EFEA] shadow-sm flex justify-between items-center gap-4">
            <div className="flex-1">
              <h2 className="text-sm font-semibold text-[#111A24] mb-2">Recomendación para hoy</h2>
              <p className="text-xs text-gray-500 leading-relaxed">
                Dedica unos minutos a respirar profundo y descansar tu mente.
              </p>
            </div>
            
            {/* Flat Vector Illustration Placeholder (Zen Meditation) */}
            <div className="w-24 h-24 relative flex-shrink-0 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-[#E8F1EE] rounded-full scale-90 translate-y-2 opacity-60"></div>
              {/* Simple CSS Geometric Character Graphic to replicate the original illustration vibe */}
              <div className="relative z-10 w-12 h-16 flex flex-col items-center">
                {/* Head */}
                <div className="w-3.5 h-3.5 bg-[#E2B29D] rounded-full relative">
                  <div className="absolute -top-1 left-0 right-0 h-2 bg-[#21254A] rounded-t-full"></div>
                </div>
                {/* Torso / Clothes */}
                <div className="w-7 h-8 bg-[#A78BFA] rounded-t-xl mt-1 relative flex items-center justify-between px-1">
                  {/* Cross-legged Base representation */}
                  <div className="absolute -bottom-2 -left-3 -right-3 h-4 bg-[#7C3AED] rounded-full"></div>
                </div>
                {/* Floating organic elements */}
                <div className="absolute -left-4 top-2 w-2 h-4 bg-teal-200 rounded-full rotate-45 opacity-70"></div>
                <div className="absolute -right-4 top-4 w-3 h-5 bg-emerald-200 rounded-full -rotate-12 opacity-70"></div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Navigation Bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-100 px-6 py-3 flex justify-between items-center rounded-b-[40px] md:rounded-b-[40px]">
          
          {/* Nav Item: Inicio (Active) */}
          <button className="flex flex-col items-center gap-1 flex-1 text-[#1D3E6B]">
            <div className="p-1 text-[#1D3E6B]">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
              </svg>
            </div>
            <span className="text-xs font-bold">Inicio</span>
          </button>

          {/* Nav Item: Evaluación */}
          <button className="flex flex-col items-center gap-1 flex-1 text-gray-400 hover:text-gray-600 transition-colors">
            <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center text-[10px] font-bold">
              ψ
            </div>
            <span className="text-xs font-medium">Evaluación</span>
          </button>

          {/* Nav Item: Recursos */}
          <button className="flex flex-col items-center gap-1 flex-1 text-gray-400 hover:text-gray-600 transition-colors">
            <div className="p-1">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="text-xs font-medium">Recursos</span>
          </button>

          {/* Nav Item: Perfil */}
          <button className="flex flex-col items-center gap-1 flex-1 text-gray-400 hover:text-gray-600 transition-colors">
            <div className="p-1">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <span className="text-xs font-medium">Perfil</span>
          </button>
          
        </div>

      </div>
    </div>
  );
}
=======

//holA mrc el q lo lea
>>>>>>> bbb9a40f699a305463055283801c4268de6dac91
