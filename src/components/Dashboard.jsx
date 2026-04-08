import React, { useState, useRef } from 'react';
import { useGame } from '../context/GameContext';
import HabitCard from './HabitCard';
import { Plus, Sparkles, Zap, Flame, Crown, Hexagon } from 'lucide-react';

function Dashboard() {
  const { habits, addHabit, selectedDate, setSelectedDate } = useGame();
  const [isCreating, setIsCreating] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const screenRef = useRef(null);

  const handleCreate = (e) => {
    e.preventDefault();
    if (newHabitName.trim()) {
      addHabit(newHabitName);
      setNewHabitName('');
      setIsCreating(false);
    }
  };

  const dayNumbers = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay() + i);
    const dateStr = d.toDateString();
    return {
      num: d.getDate(),
      label: d.toLocaleDateString('es-ES', { weekday: 'short' }),
      dateStr: dateStr,
      isSelected: dateStr === selectedDate
    };
  });

  const completionRate = habits.length > 0 
    ? (habits.filter(h => h.completedDays && h.completedDays[selectedDate]).length / habits.length) 
    : 0;

  const days = dayNumbers.filter(d => d.dateStr !== selectedDate);
  const currentDay = dayNumbers.find(d => d.dateStr === selectedDate) || dayNumbers[0];

  const displayDate = new Intl.DateTimeFormat('es-ES', { 
    day: 'numeric', month: 'long', year: 'numeric'
  }).format(new Date(selectedDate));

  return (
    <div className="min-h-screen bg-[#050505] text-[#E2E8F0] font-sans safe-bottom overflow-x-hidden">
      
      {/* Atmósfera Alquímica */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-yellow-900/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 left-0 w-full h-[30vh] bg-gradient-to-t from-black to-transparent opacity-80"></div>
      </div>

      <div ref={screenRef} className="max-w-md mx-auto pt-12 flex flex-col gap-10 relative z-10 safe-top safe-px">
        
        {/* Título Principal (iOS Centered Style) */}
        <header className="flex flex-col items-center gap-1">
           <div className="flex items-center gap-2 opacity-40">
              <Hexagon size={12} className="text-[#CB9D06]" />
              <span className="text-[10px] font-black tracking-[0.6em] uppercase">Vesica Piscis</span>
           </div>
           <h1 className="text-4xl font-black italic tracking-tighter text-white">TRANSMUTE</h1>
        </header>

        {/* CÍRCULO DE TRANSMUTACIÓN (Radial Progress) */}
        <div className="relative w-full h-80 flex items-center justify-center">
           
           {/* RING DE PROGRESO (Crisol Dorado) */}
           <div className="absolute w-52 h-52 rounded-full border border-white/5 flex items-center justify-center bg-white/[0.02]">
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                 <circle cx="104" cy="104" r="95" stroke="currentColor" strokeWidth="1" fill="transparent" className="text-white/[0.03]" />
                 <circle cx="104" cy="104" r="95" stroke="currentColor" strokeWidth="4" fill="transparent" 
                   strokeDasharray={2 * Math.PI * 95} 
                   strokeDashoffset={2 * Math.PI * 95 * (1 - completionRate)}
                   strokeLinecap="round"
                   className="text-[#CB9D06] transition-all duration-1000 gold-glow opacity-80" 
                 />
              </svg>
              
              {/* NÚCLEO: Estado Actual */}
              <div className="text-center flex flex-col items-center">
                 <span className="text-[9px] font-black uppercase tracking-[0.4em] text-[#CB9D06] mb-2">{currentDay.label}</span>
                 <span className="text-7xl font-black italic tracking-tighter tabular-nums leading-none text-white drop-shadow-2xl">{currentDay.num}</span>
                 <div className="flex items-center gap-2 mt-3">
                   <Crown size={10} className={completionRate === 1 ? 'text-[#CB9D06]' : 'text-slate-700'} />
                   <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{Math.round(completionRate * 100)}% Magnum Opus</span>
                 </div>
              </div>
           </div>

           {/* ESFERAS TEMPORALES: Días en órbita */}
           <div className="absolute w-full h-full">
             {days.map((d, i) => {
               const angle = (i * 60) * (Math.PI / 180);
               const radius = 145; 
               const x = Math.cos(angle) * radius;
               const y = Math.sin(angle) * radius;

               return (
                 <button 
                   key={i} 
                   onClick={() => setSelectedDate(d.dateStr)}
                   className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-full border border-white/10 glass-module flex flex-col items-center justify-center transition-all duration-500 hover:border-[#CB9D06]/30 active:scale-95 group"
                   style={{ 
                     transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                     opacity: 0.5 + (i * 0.08)
                   }}
                 >
                    <span className="text-[7px] font-black uppercase text-slate-500 group-hover:text-[#CB9D06]">{d.label.slice(0, 1)}</span>
                    <span className="text-[12px] font-black text-white">{d.num}</span>
                 </button>
               );
             })}
           </div>

        </div>

        {/* PROCESOS DE TRANSFORMACIÓN */}
        <section className="flex flex-col gap-3 mt-4">
           
           <div className="flex justify-between items-end mb-6 px-2">
              <div className="flex flex-col gap-1">
                 <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#CB9D06] animate-essence"></div>
                    <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Materia Prima</h2>
                 </div>
                 <p className="text-[11px] font-medium text-slate-500 italic uppercase tracking-wider">{displayDate}</p>
              </div>
              <Sparkles size={16} className="text-[#CB9D06]/40 mb-1" />
           </div>

           <div className="flex flex-col gap-4">
             {habits.map(habit => (
               <HabitCard key={habit.id} habit={habit} />
             ))}
           </div>

           {isCreating ? (
             <div className="bg-white/[0.03] rounded-[2.5rem] border border-white/5 p-8 flex flex-col gap-8 animate-pop-up mt-6">
                <input 
                  autoFocus 
                  className="w-full bg-transparent border-none outline-none text-2xl font-black text-white text-center italic placeholder:text-slate-800"
                  placeholder="NOMBRAR ELEMENTO" value={newHabitName} onChange={e => setNewHabitName(e.target.value)}
                />
                <button type="button" onClick={handleCreate} className="w-full py-5 bg-[#CB9D06] text-black rounded-full font-black uppercase tracking-[0.2em] text-[10px] active:scale-95 transition-transform">Iniciar Alquimia</button>
                <button type="button" onClick={() => setIsCreating(false)} className="text-[9px] font-black text-slate-700 uppercase tracking-widest hover:text-slate-500 transition-colors">Interrumpir</button>
             </div>
           ) : (
             <button 
               onClick={() => setIsCreating(true)}
               className="mt-8 group w-full py-10 rounded-full border border-white/[0.03] bg-white/[0.01] flex flex-col items-center justify-center gap-3 text-white/10 hover:text-[#CB9D06]/40 hover:bg-white/[0.03] transition-all duration-700"
             >
                <Plus size={32} strokeWidth={1} />
                <span className="text-[9px] font-black uppercase tracking-[0.5em]">Sembrar Nuevo Proceso</span>
             </button>
           )}
        </section>
      </div>
    </div>
  );
}

export default Dashboard;
