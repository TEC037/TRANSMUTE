import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useStore } from '../store/useStore.jsx';
import HabitCard from './HabitCard';
import Plus from 'lucide-react/dist/esm/icons/plus';
import Camera from 'lucide-react/dist/esm/icons/camera';
import BookOpen from 'lucide-react/dist/esm/icons/book-open';
import FlameIcon from 'lucide-react/dist/esm/icons/flame';
import Zap from 'lucide-react/dist/esm/icons/zap';
import ChevronDown from 'lucide-react/dist/esm/icons/chevron-down';
import ArrowLeft from 'lucide-react/dist/esm/icons/arrow-left';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { haptics } from '../utils/haptics';
import { domToPng } from 'modern-screenshot';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { ExportManuscriptView } from './ExportManuscriptView';
import Check       from 'lucide-react/dist/esm/icons/check';
import Pencil      from 'lucide-react/dist/esm/icons/pencil';
import OracleInsight from './OracleInsight';
import MonolithText from './MonolithText';
import AlchemicalGeode from './AlchemicalGeode';
import { HABIT_ICONS, ICON_CATEGORIES, resolveHabitIcon } from '../constants/habitIcons';
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
} from "@/components/ui/drawer"
import { getRango, getProgresoEnRango } from '../domain/InvocadorSystem';
import { habitDefinitions } from '../data/habitDefinitions';
import { evolveHabitTitle } from '../domain/HabitDomain';

/**
 * DASHBOARD v5.0 — MOBILE FIRST: EL ATANOR EN LA PALMA
 * Los habitos son lo primordial. Todo lo demas es secundario.
 * Arquitectura: Habitos → Metricas compactas → Oraculo
 */
function AlchemistDashboard() {
  const {
    habits, level, xp, selectedDate, setSelectedDate, settings,
    fetchGlobalStats, isResetting, materializeHabit, addHabit,
    _hasHydrated, pulseEvent
  } = useStore();

  const geodeRef = useRef(null);
  const [activeParticles, setActiveParticles] = useState([]);

  
  useEffect(() => {
    if (pulseEvent && pulseEvent.id > 0) {
      const targetRect = geodeRef.current?.getBoundingClientRect();
      if (targetRect) {
        const particle = {
          id: pulseEvent.id,
          startX: pulseEvent.x,
          startY: pulseEvent.y,
          endX: targetRect.left + targetRect.width / 2,
          endY: targetRect.top + targetRect.height / 2
        };
        setActiveParticles(prev => [...prev, particle]);
        
        setTimeout(() => {
          setActiveParticles(prev => prev.filter(p => p.id !== particle.id));
        }, 1200);
      }
    }
  }, [pulseEvent]);

  
  const [customName, setCustomName]               = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [selectedIcon, setSelectedIcon]           = useState('diamond');
  const [showIconPicker, setShowIconPicker]       = useState(false);
  const [drawerView, setDrawerView]               = useState('menu'); 
  const [isLibraryOpen, setIsLibraryOpen]         = useState(false);
  const [visibleIconsCount, setVisibleIconsCount] = useState(20);
  const [isCapturing, setIsCapturing]             = useState(false);
  const manuscriptRef = useRef(null);

  
  useEffect(() => {
    if (!isCapturing) return;
    const handleCapture = async () => {
      try {
        toast.loading("Emanando Códice del Ser...", { id: 'capture' });
        await new Promise(r => setTimeout(r, 600)); 
        const dataUrl = await domToPng(manuscriptRef.current, { quality: 1, scale: 2 });
        
        
        const canShare = await Share.canShare();
        
        if (canShare.value) {
          try {
            const fileName = `Codice-Transmute-${Date.now()}.png`;
            
            const base64Data = dataUrl.split(',')[1];
            
            const savedFile = await Filesystem.writeFile({
              path: fileName,
              data: base64Data,
              directory: Directory.Cache
            });

            await Share.share({
              title: 'Códice Transmute',
              text: 'Mi progreso en la Gran Obra del Alquimista.',
              files: [savedFile.uri],
              dialogTitle: 'Emanar Códice'
            });
          } catch (e) {
            
            await Share.share({
              title: 'Códice Transmute',
              url: dataUrl
            });
          }
        } else {
          
          const link = document.createElement('a');
          link.download = `Codice-Transmute-${Date.now()}.png`;
          link.href = dataUrl;
          link.click();
        }
        
        toast.success("Emanación Consolidada", { id: 'capture' });
      } catch (err) { 
        toast.error("Error en el Atanor", { id: 'capture' }); 
      } finally { setIsCapturing(false); }
    };
    handleCapture();
  }, [isCapturing]);

  
  const stableHabits = useMemo(() => {
    return [...habits].sort((a, b) => (a.id > b.id ? 1 : -1));
  }, [habits]);

  const rangoActual = useMemo(() => getRango(xp), [xp]);
  const progresoRango = useMemo(() => getProgresoEnRango(xp), [xp]);

  useEffect(() => { fetchGlobalStats(); }, [fetchGlobalStats]);

  
  const dayNumbers = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const isoDate = d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0');
    return {
      num: d.getDate(),
      label: d.toLocaleDateString('es-ES', { weekday: 'short' })[0].toUpperCase(),
      dateStr: isoDate,
      isToday: i === 6,
    };
  });

  const done = habits.filter(h => h?.completedDays?.[selectedDate]).length;
  const completionRate = habits.length > 0 ? done / habits.length : 0;
  const xpProgress = progresoRango * 100;

  return (
    <div className="max-w-2xl mx-auto flex flex-col pb-32 relative z-10">

      {}
      <AnimatePresence>
        {isResetting && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="fixed inset-0 z-[1000] bg-[var(--bg-porcelain)] flex flex-col items-center justify-center p-8 text-[var(--color-midnight)] font-serif text-6xl tracking-tighter uppercase font-black"
          >
            CALCINANDO MATERIA
          </motion.div>
        )}
      </AnimatePresence>



      {}
      <div className="fixed pointer-events-none" style={{ top: '-10000px', left: '-10000px', width: '600px' }}>
        <ExportManuscriptView ref={manuscriptRef} habits={habits} date={selectedDate} userName={settings.displayName} />
      </div>

      <motion.div animate={{ opacity: isResetting || isCapturing ? 0.3 : 1 }} className="flex flex-col">

        {/* ─────────────────────────────────────────────────────────────
            ENCABEZADO: LA GRAN OBRA
        ───────────────────────────────────────────────────────────── */}
        <header className="px-5 pt-6 mb-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--color-gold)] font-serif block">
              Proceso de Alquimia Individual
            </span>
            <h2 className="text-4xl md:text-5xl font-black font-serif leading-none mt-1 tracking-tighter uppercase">
              <MonolithText text="La Gran Obra" isActive={true} />
            </h2>
            <div className="flex items-center gap-1.5 mt-2 opacity-60">
              <span className="text-[11px] font-sans font-black uppercase tracking-[0.2em]">Transmutación de</span>
              <span className="text-[12px] font-sans font-black uppercase tracking-widest text-[var(--color-gold)]">
                {settings.displayName || "Adepto"}
              </span>
            </div>
            <div className="h-0.5 w-12 bg-[var(--color-gold)] mt-4 opacity-30" />
          </div>
        </header>

        {/* ─────────────────────────────────────────────────────────────
            TIRA DE FECHAS — Pegada al top, compacta, scrollable
        ───────────────────────────────────────────────────────────── */}
        <div className="sticky top-0 z-30 glass-card border-b border-[var(--color-midnight)]/5 px-2 py-2 flex items-center gap-1 mb-6">
          {dayNumbers.map(d => {
            const isSelected = d.dateStr === selectedDate;
            return (
              <button
                key={d.dateStr}
                onClick={() => { setSelectedDate(d.dateStr); haptics.impactLight(); }}
                className={`flex-1 h-14 flex flex-col items-center justify-center rounded-xl transition-all duration-300 relative ${
                  isSelected
                    ? 'bg-[var(--color-midnight)] text-[var(--bg-porcelain)]'
                    : 'opacity-30 hover:opacity-70 active:opacity-100'
                }`}
              >
                <span className="text-[11px] font-sans font-black uppercase tracking-widest leading-none mb-1 opacity-80">{d.label}</span>
                <span className="text-xl font-serif font-black tabular-nums leading-tight">{d.num}</span>
                {isSelected && (
                  <motion.div layoutId="day-pill" className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[var(--color-gold)]" />
                )}
              </button>
            );
          })}
          
          <button
            onClick={() => setIsCapturing(true)}
            className="w-14 h-14 flex items-center justify-center opacity-30 hover:opacity-100 hover:text-[var(--color-gold)] transition-all ml-1 flex-shrink-0"
          >
            <Camera size={18} />
          </button>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            HABITOS — LO PRIMORDIAL: lo primero que ve el usuario
        ───────────────────────────────────────────────────────────── */}
        <section className="flex flex-col gap-3 px-3">
          <AnimatePresence mode="popLayout">
            {stableHabits.length > 0 ? stableHabits.map(habit => (
              <motion.div
                key={habit.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <HabitCard habit={habit} selectedDate={selectedDate} />
              </motion.div>
            )) : (
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-20 text-center flex flex-col items-center gap-8"
              >
                <div className="w-24 h-24 border-2 border-dashed border-[var(--color-midnight)]/20 flex items-center justify-center opacity-30 rounded-full">
                  <BookOpen size={40} strokeWidth={1} />
                </div>
                <div className="flex flex-col gap-3 max-w-xs mx-auto">
                  <span className="text-2xl font-serif opacity-30 uppercase font-black tracking-tight">Sin Forma</span>
                  <p className="text-xs font-serif opacity-30 uppercase leading-relaxed font-black">
                    El atanor espera materia prima para iniciar la gran obra.
                  </p>
                  {!settings.isGuidedMode && (
                    <button
                      onClick={() => setIsLibraryOpen(true)}
                      className="text-[var(--color-gold)] text-[11px] font-black uppercase tracking-widest hover:scale-105 transition-all mt-4"
                    >
                      Crear primer hábito
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!settings.isGuidedMode && (
            <button
              onClick={() => setIsLibraryOpen(true)}
              className="flex items-center gap-4 px-5 py-4 rounded-2xl border-2 border-dashed border-[var(--color-midnight)]/10 text-[var(--color-midnight)]/40 hover:border-[var(--color-midnight)]/30 hover:text-[var(--color-midnight)]/70 transition-all duration-300 w-full mt-1"
            >
              <div className="w-10 h-10 rounded-full border-2 border-dashed border-current flex items-center justify-center flex-shrink-0">
                <Plus size={16} strokeWidth={2} />
              </div>
              <span className="text-[10px] font-sans font-black uppercase tracking-widest">Nuevo hábito</span>
            </button>
          )}
        </section>

        {/* ─────────────────────────────────────────────────────────────
            ESTADO DE LA MATERIA — Visualización circular y mística
        ───────────────────────────────────────────────────────────── */}
        <section className="mx-3 mt-10">
          <div className="flex items-center gap-2 mb-6 opacity-30 px-1 justify-center">
            <span className="text-xs font-sans font-black uppercase tracking-[0.3em] opacity-80">La Piedra Filosofal</span>
          </div>

          <div className="glass-card rounded-3xl p-8 flex flex-col items-center gap-8 relative overflow-hidden text-center">
            {}
            <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-gold)]/5 to-transparent pointer-events-none" />

            <div className="flex items-center justify-center w-full relative z-10 flex-col gap-6">
              {}
              <div className="text-4xl font-serif font-black tabular-nums tracking-tighter" style={{ color: "var(--color-gold)" }}>
                {Math.round(completionRate * 100)}<span className="text-xl opacity-70 ml-0.5">%</span>
              </div>

              {}
              <div className="relative transform scale-125 my-4" ref={geodeRef}>
                <motion.div 
                  animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -inset-8 bg-[var(--color-gold)] blur-3xl rounded-full pointer-events-none" 
                />
                <AlchemicalGeode progress={completionRate} />
              </div>

              {}
              <div className="flex flex-col items-center text-center gap-1">
                <span 
                  className="text-base font-black uppercase tracking-widest transition-colors duration-1000"
                  style={{ color: rangoActual.color }}
                >
                  {rangoActual.nombre}
                </span>
                <span 
                  className="text-xs font-serif italic tracking-wider opacity-60"
                  style={{ color: rangoActual.color }}
                >
                  {rangoActual.subtitulo}
                </span>
                {!_hasHydrated ? (
                  <div className="mt-2 w-4 h-4 border-2 border-[var(--color-gold)]/20 border-t-[var(--color-gold)] rounded-full animate-spin" />
                ) : (
                  <div className="mt-2 text-sm font-sans font-black uppercase tracking-tighter opacity-90">
                    {xp.toLocaleString()} XP
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            ORÁCULO — Siempre visible para guiar la transmutación
        ───────────────────────────────────────────────────────────── */}
        <section className="mx-3 mt-4 pb-20">
          <OracleInsight />
        </section>

      </motion.div>

      {}
      <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
        <AnimatePresence>
          {activeParticles.map(p => (
            <motion.div
              key={p.id}
              initial={{ 
                left: p.startX, 
                top: p.startY, 
                scale: 0, 
                opacity: 0,
                boxShadow: '0 0 20px var(--color-gold)'
              }}
              animate={{ 
                left: [p.startX, p.endX], 
                top: [p.startY, p.endY], 
                scale: [1, 2, 0.5], 
                opacity: [0, 1, 0.8, 0],
                filter: ['blur(0px)', 'blur(4px)', 'blur(0px)']
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="absolute w-4 h-4 bg-[var(--color-gold)] rounded-full"
            />
          ))}
        </AnimatePresence>
      </div>

      {}
      <Drawer open={isLibraryOpen} onOpenChange={(open) => { 
        setIsLibraryOpen(open); 
        if (!open) { 
          setDrawerView('menu'); 
          setCustomName(''); 
          setCustomDescription('');
          setSelectedIcon('dumbbell'); 
        } 
      }}>
        <DrawerContent aria-describedby={undefined} className="bg-[var(--bg-porcelain)] border-t border-black/5 text-[var(--color-midnight)] h-fit max-h-[92vh] outline-none rounded-t-[32px] backdrop-blur-3xl overflow-hidden shadow-2xl">
          <DrawerTitle className="sr-only">Nuevo habito</DrawerTitle>
          <div className="max-w-2xl mx-auto w-full p-6 pb-12 overflow-y-auto max-h-[92vh] scrollbar-hide">

            <AnimatePresence mode="wait">

              {}
              {drawerView === 'menu' && (
                <motion.div key="menu" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="flex flex-col gap-6">

                  {}
                  <button
                    onClick={() => { setDrawerView('custom'); haptics.impactLight?.(); }}
                    className="flex items-center gap-4 p-5 glass-card rounded-2xl border border-[var(--color-gold)]/20 hover:border-[var(--color-gold)]/50 transition-all active:scale-[0.98] group"
                  >
                    <div className="w-12 h-12 rounded-xl border-2 border-dashed border-[var(--color-midnight)]/20 flex items-center justify-center group-hover:border-[var(--color-gold)] transition-colors">
                      <Plus size={20} className="opacity-40 group-hover:opacity-100 group-hover:text-[var(--color-gold)]" strokeWidth={2} />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-lg font-serif font-black uppercase">Hábito propio</span>
                      <span className="text-[11px] uppercase tracking-widest opacity-60 font-black mt-0.5">Nombre e ícono personalizados</span>
                    </div>
                  </button>

                  {}
                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-[var(--color-midnight)]/12" />
                    <span className="text-[11px] font-black uppercase tracking-widest opacity-40">O elige uno</span>
                    <div className="h-px flex-1 bg-[var(--color-midnight)]/12" />
                  </div>

                  {}
                  <div className="flex flex-col gap-2">
                    {useStore.getState().getAvailableDefinitions().map((def) => (
                      <button
                        key={def.id}
                        onClick={() => { materializeHabit(def.id); setIsLibraryOpen(false); haptics.impactMedium?.(); }}
                        className="flex items-center gap-4 p-4 text-left glass-card rounded-2xl hover:bg-[var(--color-gold)]/10 hover:border-[var(--color-gold)]/30 border border-transparent transition-all active:scale-[0.98] group"
                      >
                        {}
                        <div className="w-10 h-10 flex shrink-0 items-center justify-center opacity-40 group-hover:opacity-100 transition-opacity">
                          {resolveHabitIcon(def.icon, 'w-6 h-6')}
                        </div>
                        <span className="text-base font-serif font-black leading-tight uppercase group-hover:text-[var(--color-gold)] transition-colors">
                          {evolveHabitTitle({ name: def.name, streak: 0 }, habitDefinitions)}
                        </span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {}
              {drawerView === 'custom' && (
                <motion.div key="custom" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="flex flex-col gap-6">

                  {}
                  <div className="flex items-center gap-3">
                    <button onClick={() => setDrawerView('menu')} className="opacity-30 hover:opacity-70 transition-opacity">
                      <ArrowLeft size={18} />
                    </button>
                    <span className="text-xs font-black uppercase tracking-widest opacity-40">Diseñar Hábito</span>
                  </div>

                  {}
                  <div className="flex flex-col items-center gap-2">
                    <div className="relative">
                      <div className="w-20 h-20 glass-card rounded-[28px] flex items-center justify-center text-[var(--color-gold)] shadow-xl shadow-[var(--color-gold)]/5">
                        {resolveHabitIcon(selectedIcon, 'w-10 h-10')}
                      </div>
                      <button 
                        onClick={() => { setShowIconPicker(!showIconPicker); haptics.impactLight(); }}
                        className={`absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-[var(--bg-porcelain)] transition-all ${
                          showIconPicker 
                            ? 'bg-[var(--color-gold)] text-[var(--color-midnight)] scale-110' 
                            : 'bg-[var(--color-midnight)] text-[var(--bg-porcelain)]'
                        }`}
                      >
                        {showIconPicker ? <Check size={14} strokeWidth={3} /> : <Plus size={14} />}
                      </button>
                    </div>
                  </div>

                  {}
                  <AnimatePresence>
                    {showIconPicker && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex flex-col gap-3 overflow-hidden"
                      >
                        <div className="flex justify-between items-center px-1">
                          <label className="text-[11px] font-black uppercase tracking-widest opacity-70">Emanaciones Disponibles</label>
                          <span className="text-[10px] font-black opacity-50 uppercase">{visibleIconsCount} / {HABIT_ICONS.length}</span>
                        </div>
                        
                        <div 
                          className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 snap-x"
                          onScroll={(e) => {
                            const target = e.target;
                            if (target.scrollLeft + target.clientWidth >= target.scrollWidth - 50) {
                              if (visibleIconsCount < HABIT_ICONS.length) {
                                setVisibleIconsCount(prev => Math.min(prev + 12, HABIT_ICONS.length));
                              }
                            }
                          }}
                        >
                          {HABIT_ICONS.slice(0, visibleIconsCount).map(({ key, Component, label }) => {
                            const isActive = selectedIcon === key;
                            return (
                              <button
                                key={key}
                                onClick={() => { setSelectedIcon(key); haptics.impactLight(); }}
                                className={`flex flex-col items-center justify-center min-w-[58px] h-[58px] rounded-xl transition-all snap-center ${
                                  isActive
                                    ? 'bg-[var(--color-gold)] text-[var(--color-midnight)] shadow-lg shadow-[var(--color-gold)]/10 scale-105'
                                    : 'glass-card opacity-30 hover:opacity-100'
                                }`}
                              >
                                <Component size={20} strokeWidth={1.5} />
                                <span className="text-[9px] font-black uppercase tracking-tighter mt-1.5 opacity-70 whitespace-nowrap overflow-hidden text-ellipsis w-full px-1">{label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex flex-col gap-5 mt-2">
                    {}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] font-black uppercase tracking-widest opacity-40 italic">Nombre de la esencia</label>
                      <input
                        type="text"
                        value={customName}
                        onChange={e => setCustomName(e.target.value)}
                        placeholder="Ej. Ayuno Digital"
                        maxLength={40}
                        className="w-full bg-transparent border-b border-[var(--color-midnight)]/10 focus:border-[var(--color-gold)] outline-none py-2 text-xl font-serif font-black uppercase tracking-tight transition-colors"
                      />
                    </div>

                    {}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-black uppercase tracking-widest opacity-70 italic">Declaración de Intención</label>
                      <textarea
                        value={customDescription}
                        onChange={e => setCustomDescription(e.target.value)}
                        placeholder="Define el propósito de esta transformación..."
                        rows={1}
                        maxLength={140}
                        className="w-full bg-transparent border-b border-[var(--color-midnight)]/10 focus:border-[var(--color-gold)] outline-none py-1 text-xs font-serif opacity-50 transition-colors resize-none"
                      />
                    </div>
                  </div>

                  {}
                  <button
                    disabled={!customName.trim()}
                    onClick={() => {
                      if (!customName.trim()) return;
                      addHabit(customName.trim(), { 
                        icon: selectedIcon,
                        description: customDescription.trim() 
                      });
                      setIsLibraryOpen(false);
                      setCustomName('');
                      setCustomDescription('');
                      setSelectedIcon('diamond');
                      setShowIconPicker(false);
                      setDrawerView('menu');
                      toast.success('Hábito consolidado');
                    }}
                    className="w-full py-4 bg-[var(--color-midnight)] text-[var(--bg-porcelain)] font-black uppercase tracking-widest text-sm rounded-2xl transition-all active:scale-[0.98] disabled:opacity-10 hover:opacity-90 mt-2"
                  >
                    Establecer Hábito
                  </button>
                </motion.div>
              )}


            </AnimatePresence>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

export default AlchemistDashboard;
