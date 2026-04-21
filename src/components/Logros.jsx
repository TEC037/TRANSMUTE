import React, { useMemo, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { haptics } from '../utils/haptics';
import Sparkles from 'lucide-react/dist/esm/icons/sparkles';
import Flame from 'lucide-react/dist/esm/icons/flame';
import Shield from 'lucide-react/dist/esm/icons/shield';
import Eye from 'lucide-react/dist/esm/icons/eye';
import Crown from 'lucide-react/dist/esm/icons/crown';
import Zap from 'lucide-react/dist/esm/icons/zap';
import Star from 'lucide-react/dist/esm/icons/star';
import Lock from 'lucide-react/dist/esm/icons/lock';
import Trophy from 'lucide-react/dist/esm/icons/trophy';
import Sun from 'lucide-react/dist/esm/icons/sun';
import Gem from 'lucide-react/dist/esm/icons/gem';

/**
 * ─── EL FIRMAMENTO DE LA OBRA v2.1 (Expandido) ───────────────────────────
 * Cartografía estelar de la evolución del adepto.
 */

const LOGROS_CONSTELACION = [
  
  { id: 'ach_first_spark',     group: 'Voluntad', x: 50, y: 55, icon: Sparkles, color: '#fef3c7' }, 
  { id: 'ach_ten_acts',        group: 'Voluntad', x: 50, y: 70, icon: Zap,      color: '#fde68a' },
  { id: 'ach_fifty_acts',      group: 'Maestría', x: 45, y: 82, icon: Eye,      color: '#fbbf24' },
  { id: 'ach_century',         group: 'Maestría', x: 55, y: 82, icon: Trophy,   color: '#f59e0b' },
  { id: 'ach_five_hundred',    group: 'Gloria',   x: 50, y: 92, icon: Sparkles, color: '#d97706' },
  { id: 'ach_titan_acts',      group: 'Gloria',   x: 50, y: 10, icon: Gem,      color: '#f59e0b' }, 

  
  { id: 'ach_first_streak',    group: 'Fuego',    x: 35, y: 45, icon: Flame,    color: '#fca5a5' },
  { id: 'ach_week_streak',     group: 'Fuego',    x: 24, y: 38, icon: Flame,    color: '#f87171' },
  { id: 'ach_fortnight_streak', group: 'Fuego',    x: 18, y: 28, icon: Shield,   color: '#ef4444' },
  { id: 'ach_month_streak',    group: 'Fuego',    x: 12, y: 18, icon: Crown,    color: '#dc2626' },
  { id: 'ach_solar_streak',    group: 'Fuego',    x: 8,  y: 8,  icon: Sun,      color: '#991b1b' },

  
  { id: 'ach_perfect_day',     group: 'Aire',     x: 65, y: 45, icon: Star,     color: '#93c5fd' },
  { id: 'ach_seven_perfect',   group: 'Aire',     x: 76, y: 38, icon: Crown,    color: '#60a5fa' },
  { id: 'ach_master_perfect',  group: 'Aire',     x: 88, y: 28, icon: Sun,      color: '#3b82f6' },
  { id: 'ach_five_habits',     group: 'Aire',     x: 75, y: 55, icon: Star,     color: '#2563eb' },
];

const CONEXIONES = [
  ['ach_first_spark', 'ach_ten_acts'],
  ['ach_ten_acts', 'ach_fifty_acts'],
  ['ach_ten_acts', 'ach_century'],
  ['ach_century', 'ach_five_hundred'],
  ['ach_five_hundred', 'ach_titan_acts'],

  ['ach_first_spark', 'ach_first_streak'],
  ['ach_first_streak', 'ach_week_streak'],
  ['ach_week_streak', 'ach_fortnight_streak'],
  ['ach_fortnight_streak', 'ach_month_streak'],
  ['ach_month_streak', 'ach_solar_streak'],

  ['ach_first_spark', 'ach_perfect_day'],
  ['ach_perfect_day', 'ach_seven_perfect'],
  ['ach_seven_perfect', 'ach_master_perfect'],
  ['ach_perfect_day', 'ach_five_habits']
];

const REQUIREMENTS = {
  ach_first_spark:      { type: 'completions', val: 1,    name: 'El Acto Primordial', lore: 'Inicia la Gran Obra completando tu primer hábito de alto impacto.' },
  ach_ten_acts:         { type: 'completions', val: 10,   name: 'Inercia del Éxito', lore: 'Has acumulado 10 actos de disciplina. La inercia del éxito empieza a trabajar a tu favor.' },
  ach_fifty_acts:       { type: 'completions', val: 50,   name: 'Sello de la Persistencia', lore: '50 repeticiones. Has cruzado el valle de la deserción que detiene a la mayoría.' },
  ach_century:          { type: 'completions', val: 100,  name: 'Centurión del Enfoque', lore: '100 actos de poder. El enfoque profundo se ha convertido en tu estado natural.' },
  ach_five_hundred:     { type: 'completions', val: 500,  name: 'Maestría del Destino', lore: '500 transmutaciones. Ya no sigues hábitos; has diseñado tu propia realidad.' },
  ach_titan_acts:       { type: 'completions', val: 1000, name: 'Soberano de la Acción', lore: '1.000 actos de voluntad. Tu capacidad de ejecución es ahora legendaria.' },

  ach_first_streak:     { type: 'streak', val: 3,  name: 'Umbral de la Disciplina', lore: '3 días consecutivos. El caos inicial ha sido dominado por el orden del hábito.' },
  ach_week_streak:      { type: 'streak', val: 7,  name: 'Sintonía Semanal', lore: '7 días sin interrupción. Has completado un ciclo de alto rendimiento.' },
  ach_fortnight_streak: { type: 'streak', val: 21, name: 'Arquitecto de la Rutina', lore: '21 días. El tiempo sagrado donde el esfuerzo se convierte en identidad.' },
  ach_month_streak:     { type: 'streak', val: 30, name: 'Inviolabilidad del Carácter', lore: '30 días. Has demostrado poseer un carácter inquebrantable frente a las distracciones.' },
  ach_solar_streak:     { type: 'streak', val: 90, name: 'Legado de la Constancia', lore: '90 días. Un trimestre de excelencia. Has transmutado tu vida por completo.' },

  ach_perfect_day:      { type: 'perfect', val: 1,  name: 'Día de Alto Rendimiento', lore: '100% de efectividad. Has logrado la sintonía perfecta entre intención y acción.' },
  ach_seven_perfect:    { type: 'perfect', val: 7,  name: 'Sintonía del Dominio', lore: '7 días perfectos. El dominio sobre tu tiempo y energía es absoluto.' },
  ach_master_perfect:   { type: 'perfect', val: 50, name: 'Santo de la Ejecución', lore: '50 días perfectos. Eres un maestro en la ciencia de la realización personal.' },
  ach_five_habits:      { type: 'habits',  val: 5,  name: 'Equilibrio del Sistema', lore: '5 hábitos activos. Has equilibrado las áreas críticas de tu desarrollo personal.' },
};

function Estrella({ astro, unlocked, progress, onClick }) {
  const Icon = astro.icon;
  const isLegendary = ['ach_solar_streak', 'ach_five_hundred', 'ach_titan_acts'].includes(astro.id);

  return (
    <motion.div
      style={{ left: `${astro.x}%`, top: `${astro.y}%` }}
      className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
    >
      <motion.button
        whileHover={{ scale: 1.25 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => { onClick(astro); haptics.impactMedium(); }}
        className="relative group"
      >
        <div 
          className={`absolute inset-[-15px] rounded-full blur-2xl opacity-0 group-hover:opacity-60 transition-opacity duration-700`}
          style={{ backgroundColor: astro.color }}
        />

        <div className={`
          w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center border transition-all duration-1000
          ${unlocked 
            ? 'bg-[var(--bg-porcelain)] bg-opacity-10 shadow-[0_0_20px_rgba(255,255,255,0.15)] border-white/20' 
            : 'bg-transparent border-white/5 opacity-30 scale-90'
          }
        `}
        style={{ borderColor: unlocked ? `${astro.color}66` : undefined }}
        >
          {unlocked ? (
            <Icon size={20} style={{ color: astro.color }} />
          ) : (
            <Lock size={12} className="text-white/20" />
          )}

          {unlocked && isLegendary && (
            <motion.div
              animate={{ opacity: [0.3, 0.8, 0.3], scale: [1, 1.4, 1] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute inset-0 rounded-full bg-white/10 blur-xl pointer-events-none"
            />
          )}
        </div>

        {!unlocked && progress.actual > 0 && (
           <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8">
             <div className="h-0.5 bg-white/5 w-full rounded-full overflow-hidden">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${Math.min((progress.actual / progress.objetivo) * 100, 100)}%` }}
                 className="h-full bg-white/40" 
               />
             </div>
           </div>
        )}
      </motion.button>
    </motion.div>
  );
}

function Logros() {
  const { achievements, habits, bestStreak, perfectDaysCount } = useStore();
  const [selected, setSelected] = useState(null);
  const containerRef = useRef(null);

  const stats = useMemo(() => {
    const totalComps = habits.reduce((n, h) => n + Object.keys(h.completedDays||{}).length, 0);
    return {
      completions: totalComps,
      streak: bestStreak || 0,
      perfect: perfectDaysCount || 0,
      habits: habits.length
    };
  }, [habits, bestStreak, perfectDaysCount]);

  const astros = useMemo(() => {
    return LOGROS_CONSTELACION.map(a => {
      const req = REQUIREMENTS[a.id];
      let actual = 0;
      if (req.type === 'completions') actual = stats.completions;
      if (req.type === 'streak')      actual = stats.streak;
      if (req.type === 'perfect')     actual = stats.perfect;
      if (req.type === 'habits')      actual = stats.habits;

      return {
        ...a,
        unlocked: achievements.includes(a.id) || actual >= req.val,
        progress: { actual, objetivo: req.val, lore: req.lore }
      };
    });
  }, [achievements, stats]);

  return (
    <div className="min-h-[95vh] flex flex-col bg-[#050505] -mt-4 -mx-4 pb-32 relative overflow-hidden">
      
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[5%] left-[10%] w-[80%] h-[80%] bg-blue-500/[0.03] blur-[150px] rounded-full" />
        <div className="absolute bottom-[5%] right-[5%] w-[60%] h-[60%] bg-amber-500/[0.03] blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https:
      </div>

      <header className="relative z-30 p-8 pt-12 text-center pointer-events-none">
        <span className="text-[10px] font-black uppercase tracking-[0.6em] text-white/30 font-serif block mb-2">
          Firmamento de la Obra
        </span>
        <h1 className="text-4xl font-black font-serif text-white tracking-tighter uppercase leading-none">
          Logros
        </h1>
        <div className="h-px w-12 bg-white/10 mx-auto mt-4" />
        <p className="text-[10px] font-black uppercase tracking-widest text-[#f59e0b] mt-4 opacity-80">
          {astros.filter(a => a.unlocked).length} Eones Alineados
        </p>
      </header>

      <main className="relative z-10 w-full aspect-[3/4] md:aspect-square lg:aspect-video overflow-visible cursor-crosshair px-6">
        <div className="absolute inset-0" ref={containerRef}>
          <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
            {CONEXIONES.map(([fromId, toId]) => {
              const from = astros.find(a => a.id === fromId);
              const to = astros.find(a => a.id === toId);
              if (!from || !to) return null;
              const active = from.unlocked && to.unlocked;
              return (
                <motion.line
                  key={`${fromId}-${toId}`}
                  x1={`${from.x}%`} y1={`${from.y}%`}
                  x2={`${to.x}%`}   y2={`${to.y}%`}
                  stroke={active ? 'rgba(245,158,11,0.25)' : 'rgba(255,255,255,0.04)'}
                  strokeWidth={active ? "1.2" : "0.6"}
                  strokeDasharray={active ? "none" : "2 4"}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                />
              );
            })}
          </svg>

          {astros.map((astro) => (
            <Estrella
              key={astro.id}
              astro={astro}
              unlocked={astro.unlocked}
              progress={astro.progress}
              onClick={setSelected}
            />
          ))}
        </div>
      </main>

      <footer className="relative z-30 p-12 text-center">
         <div className="inline-flex flex-col items-center gap-1 opacity-20">
           <Zap size={14} />
           <p className="text-[10px] font-black uppercase tracking-[0.4em]">
             Explora tu Constelación
           </p>
         </div>
      </footer>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-black/98 backdrop-blur-3xl"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 30, opacity: 0 }}
              className="w-full max-w-sm flex flex-col items-center text-center"
              onClick={e => e.stopPropagation()}
            >
              <div 
                className="w-24 h-24 rounded-full flex items-center justify-center mb-8 border shadow-[0_0_50px_rgba(255,255,255,0.03)]"
                style={{ borderColor: selected.unlocked ? `${selected.color}44` : 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.01)' }}
              >
                <selected.icon size={44} style={{ color: selected.unlocked ? selected.color : 'rgba(255,255,255,0.05)' }} />
              </div>

              <span className="text-[10px] font-black uppercase tracking-[0.6em] text-white/30 mb-4">
                {selected.group}
              </span>
              
              <h2 className="text-3xl font-black font-serif text-white tracking-tighter uppercase mb-2 leading-none">
                {REQUIREMENTS[selected.id].val} {selected.id.includes('streak') ? 'Días' : selected.id.includes('perfect') ? 'Perfectos' : 'Actos'}
              </h2>
              <h3 className="text-xl font-black font-serif text-[var(--color-gold)] uppercase tracking-tighter mb-4 opacity-100">
                {REQUIREMENTS[selected.id].name}
              </h3>

              <p className="text-xs font-serif italic text-white/80 leading-relaxed mb-10 px-6">
                "{selected.progress.lore}"
              </p>

              <div className="flex flex-col gap-4 w-full max-w-[240px]">
                {!selected.unlocked && (
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-white/20">
                      <span>Proyección</span>
                      <span>{selected.progress.actual} / {selected.progress.objetivo}</span>
                    </div>
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(selected.progress.actual / selected.progress.objetivo) * 100}%` }}
                        className="h-full bg-[var(--color-gold)]"
                      />
                    </div>
                  </div>
                )}
                {selected.unlocked && (
                  <div className="flex items-center justify-center gap-2 text-emerald-400/80">
                    <Sparkles size={14} />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em]">Eón Sincronizado</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => setSelected(null)}
                className="mt-16 text-[10px] font-black uppercase tracking-[0.5em] text-white/20 hover:text-white transition-colors"
              >
                Cerrar Mapa
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Logros;
