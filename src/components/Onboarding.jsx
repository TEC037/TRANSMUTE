import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore.jsx';
import User from 'lucide-react/dist/esm/icons/user';
import Sparkles from 'lucide-react/dist/esm/icons/sparkles';
import Zap from 'lucide-react/dist/esm/icons/zap';
import Brain from 'lucide-react/dist/esm/icons/brain';
import Moon from 'lucide-react/dist/esm/icons/moon';
import Crown from 'lucide-react/dist/esm/icons/crown';
import ArrowRight from 'lucide-react/dist/esm/icons/arrow-right';
import { haptics } from '../utils/haptics';
import MonolithText from './MonolithText';
import AlchemyBackground from './AlchemyBackground';
import AlchemicalGeode from './AlchemicalGeode';

/**
 * ONBOARDING v4.0: EL RITUAL DE INICIACIÓN
 * Rediseño inmersivo alineado con la Piedra Filosofal:
 * - Glassmorphism de alta fidelidad.
 * - Narrativa de sintonía del Ser.
 * - Feedback visual táctil y premium.
 */
const AVATARS = [
  { id: 'User',     icon: User,     label: 'Adepto' },
  { id: 'Sparkles', icon: Sparkles, label: 'Visión' },
  { id: 'Zap',      icon: Zap,      label: 'Fuerza' },
  { id: 'Brain',    icon: Brain,    label: 'Mente' },
  { id: 'Moon',     icon: Moon,     label: 'Sombras' },
  { id: 'Crown',    icon: Crown,    label: 'Cenit' },
];

function Onboarding() {
  const { theme, settings, updateSettings } = useStore();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(0);

  const [form, setForm] = useState({
    displayName: settings.displayName || '',
    avatar: settings.avatar || 'User',
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const nextStep = () => { 
    haptics.impactMedium(); 
    setStep(step + 1);
  };
  
  const finish = async () => {
    haptics.notificationSuccess();
    await updateSettings({ ...form, hasFinishedOnboarding: true });
    navigate('/', { replace: true });
  };

  const variants = {
    enter: { opacity: 0, scale: 0.9, y: 10 },
    center: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 1.1, y: -10 },
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center p-6 md:p-12 overflow-hidden">
      <AlchemyBackground />
      
      {}
      <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 flex items-center gap-6 glass-card px-8 py-3 rounded-full opacity-60">
        <div className="w-8 h-8 scale-50">
           <AlchemicalGeode progress={step / 4} />
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.4em] font-serif">Iniciación: Fase {step + 1}</span>
      </div>

      <div className="relative z-10 w-full max-w-xl">
        <AnimatePresence mode="wait">

          {}
          {step === 0 && (
            <motion.div key="s0" variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.6 }} className="glass-card p-12 md:p-16 rounded-[48px] text-center flex flex-col items-center gap-10">
               <div className="w-20 h-20 bg-[var(--color-gold)]/10 rounded-3xl flex items-center justify-center text-[var(--color-gold)] text-3xl">⚗️</div>
               <div className="flex flex-col gap-4">
                  <span className="text-[11px] font-black uppercase tracking-[0.5em] opacity-40">Despertar del Observador</span>
                  <h2 className="text-5xl md:text-6xl font-serif font-black tracking-tighter leading-none uppercase">
                     <MonolithText text="EL LLAMADO" isActive={true} />
                  </h2>
               </div>
               <div className="space-y-6">
                  <p className="text-xl font-serif font-black uppercase leading-tight opacity-70">
                    "Arquitecto, abre tus ojos. Ante ti no hay una herramienta, sino un espejo de tu voluntad."
                  </p>
                  <p className="text-sm opacity-40 leading-relaxed font-medium">
                    Te encuentras en la fase Nigredo. Para ascender, deberás purificar tu forma a través del sello de tus disciplinas diarias.
                  </p>
               </div>
               <button onClick={nextStep} className="h-20 w-full bg-[var(--color-midnight)] text-[var(--bg-porcelain)] rounded-2xl font-black uppercase tracking-[0.4em] text-[13px] hover:bg-[var(--color-gold)] transition-all shadow-xl group flex items-center justify-center gap-6">
                  Entrar en la Visión
                  <ArrowRight className="group-hover:translate-x-2 transition-transform" />
               </button>
            </motion.div>
          )}

          {}
          {step === 1 && (
            <motion.div key="s1" variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.6 }} className="glass-card p-12 md:p-16 rounded-[48px] flex flex-col gap-12">
               <div className="flex flex-col items-center gap-4 text-center">
                  <span className="text-[11px] font-black uppercase tracking-[0.5em] opacity-40">Materia en Movimiento</span>
                  <h2 className="text-5xl md:text-6xl font-serif font-black tracking-tighter leading-none uppercase text-center">
                     <MonolithText text="EL ATANOR" isActive={true} />
                  </h2>
               </div>
               
               <div className="bg-black/5 p-10 rounded-[32px] flex flex-col items-center gap-8 relative overflow-hidden">
                  <div className="flex items-center gap-8 z-10">
                     <div className="w-20 h-20 bg-[var(--color-midnight)] text-[var(--bg-porcelain)] rounded-2xl flex items-center justify-center text-3xl shadow-xl">
                        🔥
                     </div>
                     <div className="flex flex-col gap-3">
                        <div className="h-4 w-40 bg-[var(--color-midnight)] opacity-10 rounded-full" />
                        <div className="h-2 w-24 bg-[var(--color-gold)] opacity-40 rounded-full" />
                     </div>
                  </div>
                  <div className="w-full h-2 bg-black/5 overflow-hidden rounded-full font-serif italic">
                     <motion.div animate={{ x: [-200, 400] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} className="h-full w-40 bg-[var(--color-gold)] shadow-[0_0_15px_var(--color-gold)]" />
                  </div>
               </div>

               <p className="text-lg opacity-60 leading-relaxed font-serif uppercase font-black text-center px-4 italic">
                  "Aquí forjarás tus disciplinas. Cada sello es una destilación que estabiliza tu arquitectura interior."
               </p>

               <button onClick={nextStep} className="h-16 w-full bg-[var(--color-midnight)] text-[var(--bg-porcelain)] rounded-2xl font-black uppercase tracking-[0.4em] text-[12px] hover:bg-[var(--color-gold)] transition-all shadow-xl">
                  Siguiente Emanación
               </button>
            </motion.div>
          )}

          {}
          {step === 2 && (
            <motion.div key="s2" variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.6 }} className="glass-card p-12 md:p-16 rounded-[48px] flex flex-col gap-12 text-center">
               <div className="flex flex-col items-center gap-4">
                  <span className="text-[11px] font-black uppercase tracking-[0.5em] opacity-40">Fruto de la Gran Obra</span>
                  <h2 className="text-5xl md:text-6xl font-serif font-black tracking-tighter leading-none uppercase">
                     <MonolithText text="ESENCIA" isActive={true} />
                  </h2>
               </div>
               
               <div className="flex items-center justify-center relative py-12">
                  <motion.div 
                    animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute w-72 h-72 border border-[var(--color-gold)]/10 rounded-full border-dashed"
                  />
                  <div className="w-32 h-32 bg-[var(--color-gold)] text-[var(--bg-porcelain)] rounded-[40px] flex items-center justify-center relative shadow-[0_20px_50px_rgba(232,192,108,0.3)]">
                     <Sparkles size={48} />
                  </div>
               </div>

               <p className="text-lg opacity-60 leading-relaxed font-serif uppercase font-black text-center italic">
                  "Todo acto genera Esencia. Al acumularla, tu Rango de Adepto ascenderá, revelando nuevas dimensiones de tu Ser."
               </p>

               <button onClick={nextStep} className="h-16 w-full bg-[var(--color-midnight)] text-[var(--bg-porcelain)] rounded-2xl font-black uppercase tracking-[0.4em] text-[12px] hover:bg-[var(--color-gold)] transition-all shadow-xl">
                  Consolidar Identidad
               </button>
            </motion.div>
          )}

          {}
          {step === 3 && (
            <motion.div key="s3" variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.6 }} className="glass-card p-12 md:p-16 rounded-[48px] flex flex-col gap-12">
               <header className="flex flex-col gap-4 text-center">
                  <span className="text-[11px] font-black uppercase tracking-[0.5em] opacity-40 font-serif">Protocolo Final</span>
                  <h2 className="text-5xl md:text-6xl font-serif font-black tracking-tighter leading-none uppercase">
                     <MonolithText text="LA FIRMA" isActive={true} />
                  </h2>
               </header>

               <div className="flex flex-col gap-10">
                  <div className="relative group">
                     <p className="text-[10px] font-black uppercase tracking-widest opacity-30 text-center mb-4">Muestra tu nombre ante el Concilio</p>
                     <input 
                       value={form.displayName}
                       onChange={(e) => setForm({...form, displayName: e.target.value})}
                       className="w-full bg-black/5 hover:bg-black/10 border-b-2 border-transparent focus:border-[var(--color-gold)] py-6 text-4xl font-serif font-black text-[var(--color-midnight)] outline-none transition-all text-center placeholder:opacity-5 uppercase rounded-2xl"
                       placeholder="TU NOMBRE..."
                     />
                  </div>

                  <div className="flex flex-col gap-4">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-30 text-center">Elige tu Avatar Vibracional</p>
                    <div className="grid grid-cols-3 gap-4">
                       {AVATARS.map(av => (
                         <button 
                           key={av.id} 
                           onClick={() => setForm({...form, avatar: av.id})}
                           className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${form.avatar === av.id ? 'bg-[var(--color-midnight)] border-[var(--color-midnight)] text-[var(--bg-porcelain)] shadow-xl scale-105' : 'bg-transparent border-black/5 text-black/20 hover:border-[var(--color-gold)]/20'}`}
                         >
                           <av.icon size={24} strokeWidth={form.avatar === av.id ? 3 : 1.5} />
                           <span className="text-[9px] font-black uppercase tracking-widest">{av.label}</span>
                         </button>
                       ))}
                    </div>
                  </div>
               </div>

               <div className="flex flex-col gap-4">
                  <button disabled={!form.displayName} onClick={finish} className="h-20 w-full bg-[var(--color-gold)] text-[var(--bg-porcelain)] rounded-2xl font-black uppercase tracking-[0.6em] text-[14px] shadow-2xl active:scale-95 transition-all outline-none">
                     Manifestación
                  </button>
                  <button onClick={() => setStep(step - 1)} className="text-[10px] font-black uppercase tracking-widest opacity-20 hover:opacity-50 transition-opacity">Volver a la Visión</button>
               </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {}
      <div className="fixed bottom-12 flex gap-4 opacity-20">
         {[0, 1, 2, 3].map(i => (
           <div key={i} className={`h-1.5 rounded-full transition-all duration-700 ${step === i ? 'w-12 bg-[var(--color-gold)] opacity-100' : 'w-1.5 bg-current'}`} />
         ))}
      </div>
    </div>
  );
}

export default Onboarding;
