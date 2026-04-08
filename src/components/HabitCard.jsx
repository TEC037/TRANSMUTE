import React, { useState } from 'react';
import { Flame, Check, X, Trash2, Zap, Sparkles, Hexagon } from 'lucide-react';
import { useGame } from '../context/GameContext';

function HabitCard({ habit }) {
  const { toggleHabit, updateHabit, deleteHabit, selectedDate } = useGame();
  const [editMode, setEditMode] = useState(false);
  const [editedName, setEditedName] = useState(habit.name);
  
  const isCompleted = habit.completedDays && habit.completedDays[selectedDate];
  const momentum = habit.streak || 0;
  
  const handleUpdate = (e) => {
    e.stopPropagation();
    updateHabit(habit.id, editedName);
    setEditMode(false);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (confirm('¿Disolver este proceso alquímico?')) deleteHabit(habit.id);
  };

  if (editMode) {
    return (
      <div className="bg-white/[0.03] rounded-3xl border border-white/5 p-4 mb-4 animate-pop-up flex items-center gap-4 glass-module">
        <input 
          autoFocus 
          className="flex-1 bg-transparent border-none outline-none text-xl font-black text-white italic px-4 placeholder:text-slate-800"
          value={editedName} 
          onChange={e => setEditedName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleUpdate(e)}
        />
        <div className="flex gap-2 pr-2">
          <button onClick={handleDelete} className="p-3 text-red-500/40 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
          <button onClick={() => setEditMode(false)} className="p-3 text-slate-700"><X size={16}/></button>
          <button onClick={handleUpdate} className="p-3 bg-[#CB9D06] text-black rounded-full shadow-lg shadow-yellow-900/20"><Check size={20}/></button>
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={() => toggleHabit(habit.id, selectedDate)}
      onContextMenu={(e) => { e.preventDefault(); setEditMode(true); }}
      className={`relative group w-full rounded-[2.5rem] p-5 pl-7 mb-4 transition-all duration-700 cursor-pointer overflow-hidden border ${
        isCompleted 
          ? 'bg-yellow-500/[0.03] border-[#CB9D06]/30 shadow-[0_10px_40px_rgba(203,157,6,0.05)]' 
          : 'bg-white/[0.01] border-white/[0.05]'
      }`}
    >
      {/* Aura de Transmutación */}
      {isCompleted && (
        <div className="absolute top-0 left-0 w-1 h-full bg-[#CB9D06] shadow-[0_0_15px_#CB9D06]"></div>
      )}

      <div className="flex justify-between items-center gap-4 relative z-10">
        <div className="flex items-center gap-6 min-w-0">
          
          {/* Potency Indicator (Streak) */}
          <div className={`relative flex flex-col items-center justify-center transition-all duration-700 ${
            isCompleted ? 'text-[#CB9D06] gold-glow' : 'text-slate-800'
          }`}>
             <Flame size={20} fill={isCompleted ? "#CB9D06" : "transparent"} strokeWidth={isCompleted ? 0 : 2} />
             <span className="text-[9px] font-black tabular-nums mt-0.5">{momentum}</span>
          </div>

          <div className="flex flex-col gap-0.5 overflow-hidden">
             <h3 className={`text-xl font-black tracking-tight leading-none transition-all duration-700 truncate ${
               isCompleted ? 'text-white italic tracking-[0.05em] uppercase' : 'text-slate-500 lowercase opacity-60'
             }`}>
               {habit.name}
             </h3>
             <span className={`text-[8px] font-bold uppercase tracking-[0.3em] transition-opacity duration-700 ${
               isCompleted ? 'text-[#CB9D06] opacity-100' : 'text-slate-800 opacity-0'
             }`}>
                materia transmutada
             </span>
          </div>
        </div>

        {/* Elixir Hub (Action) */}
        <div className={`w-14 h-14 rounded-full border flex items-center justify-center transition-all duration-700 shrink-0 ${
          isCompleted 
            ? 'bg-[#CB9D06] border-[#FFD700] shadow-[0_0_30px_rgba(203,157,6,0.5)] scale-[0.85]' 
            : 'bg-white/[0.02] border-white/5 group-hover:border-white/20'
        }`}>
           {isCompleted ? (
             <Sparkles size={24} strokeWidth={3} className="text-black animate-essence" />
           ) : (
             <Hexagon size={18} strokeWidth={1} className="text-white/10" />
           )}
        </div>
      </div>
    </div>
  );
}

export default HabitCard;
