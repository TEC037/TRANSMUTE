import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { getRango } from '../domain/InvocadorSystem';

/**
 * OracleInsight — El Observador del Sistema.
 *
 * Lee el estado conductual del usuario y emite un análisis calibrado.
 * NO usa "cuántico" como palabra comodín. Cada concepto referencia
 * un mecanismo real: neuroplasticidad, práctica deliberada, bucles de
 * retroalimentación, aprendizaje por refuerzo, etc.
 *
 * El tono es el de un analista muy preciso con aprecio por la narrativa —
 * no un oráculo vago, sino un sistema que describe exactamente lo que ve.
 */




const OBSERVACIONES = [
  
  {
    id: 'vacio',
    condicion: (s) => s.habitCount === 0,
    nivel: 'Estado: Latente',
    texto: 'El sistema no tiene entradas. Sin datos de comportamiento, no hay nada que analizar ni que optimizar. El primer hábito es el único que requiere decisión pura — los siguientes se apoyan en la inercia del anterior.',
  },

  
  {
    id: 'inicio',
    condicion: (s) => s.habitCount > 0 && s.maxStreak === 0,
    nivel: 'Fase: Inicio de ciclo',
    texto: 'Día cero. La neuroplasticidad funciona por repetición espaciada: el primer registro activa la ruta, la repetición la fortalece. El sistema espera tus primeros datos.',
  },

  
  {
    id: 'dia_perfecto',
    condicion: (s) => s.hasPerfectDay,
    nivel: 'Coherencia: Máxima',
    texto: 'Todos los hábitos completados. En términos de aprendizaje por refuerzo, este es el estado que el sistema intenta replicar: dolor cero de incumplimiento, máxima liberación de dopamina por cierre de bucle. Bien ejecutado.',
  },

  
  {
    id: 'racha_baja',
    condicion: (s) => s.maxStreak >= 3 && s.maxStreak < 7,
    nivel: 'Consolidación: Inicial',
    texto: `Racha de ${'{streak}'} días. La investigación de Phillippa Lally (UCL) muestra que los hábitos toman entre 18 y 254 días en automatizarse, con 66 como mediana. Tres días es suficiente para establecer la señal —todavía no para estabilizarla.`,
    valor: (s) => `${s.maxStreak}`,
  },

  
  {
    id: 'racha_semana',
    condicion: (s) => s.maxStreak >= 7 && s.maxStreak < 14,
    nivel: 'Consolidación: Activa',
    texto: 'Una semana de datos consistentes. El loop hábito ya tiene estructura: señal → rutina → recompensa. La consistencia a esta escala empieza a reducir la carga cognitiva de la decisión. Cada repetición hace el siguiente ciclo más barato en términos de fuerza de voluntad.',
  },

  
  {
    id: 'racha_catorce',
    condicion: (s) => s.maxStreak >= 14 && s.maxStreak < 21,
    nivel: 'Consolidación: Avanzada',
    texto: 'Dos semanas de ejecución sostenida. El sistema nervioso autónomo empieza a anticipar la rutina antes de que la conciencia la active. Esto no es metáfora: es el efecto real de la mielinización de rutas usadas con frecuencia.',
  },

  
  {
    id: 'racha_veintiuno',
    condicion: (s) => s.maxStreak >= 21 && s.maxStreak < 30,
    nivel: 'Automatización: Parcial',
    texto: '21 días es un mito popular — pero el mecanismo es real. A estas alturas, la ruta neural tiene suficiente refuerzo como para persistir sin supervisión constante. La decisión de ejecutar ya no consume el mismo nivel de recursos prefrontales del día uno.',
  },

  
  {
    id: 'racha_mes',
    condicion: (s) => s.maxStreak >= 30,
    nivel: 'Automatización: Consolidada',
    texto: 'Un mes de ejecución sin interrupción. La conducta ha superado el umbral de la práctica deliberada para entrar en el territorio de la identidad conductual. No haces el hábito — eres el tipo de persona que hace ese hábito. Esa diferencia importa.',
  },

  
  {
    id: 'progreso_bajo',
    condicion: (s) => s.dailyProgress < 0.3 && s.habitCount > 0,
    nivel: 'Estado: Rezago diario',
    texto: 'El día tiene más hábitos pendientes que completados. El efecto de compleción de tareas (Zeigarnik) hace que los ítems abiertos generen más tensión cognitiva que los cerrados. Cerrar uno ahora libera carga mental.',
  },

  
  {
    id: 'progreso_medio',
    condicion: (s) => s.dailyProgress >= 0.3 && s.dailyProgress < 1,
    nivel: 'Estado: En progreso',
    texto: 'El día avanza. Mantener el momentum es más económico que reiniciarlo: el estado de flujo activo tiene inercia positiva. Los hábitos restantes son más fáciles de ejecutar ahora que mañana desde cero.',
  },
];

const OBSERVACION_BASE = {
  nivel: 'Análisis: General',
  texto: 'El sistema registra tus datos de comportamiento. Cada completitud es un punto de evidencia. La consistencia, no la intensidad, es el predictor más robusto de cambio conductual a largo plazo.',
};


function OracleInsight({ compact = false }) {
  const { habits, selectedDate, bestStreak, xp } = useStore();

  const estado = useMemo(() => {
    const maxStreak      = habits.reduce((max, h) => Math.max(max, h.streak || 0), 0);
    const habitCount     = habits.length;
    const completadosHoy = habits.filter(h => h.completedDays?.[selectedDate]).length;
    const dailyProgress  = habitCount > 0 ? completadosHoy / habitCount : 0;
    const hasPerfectDay  = habitCount > 0 && completadosHoy === habitCount;
    return { maxStreak, habitCount, dailyProgress, hasPerfectDay };
  }, [habits, selectedDate]);

  
  const observacion = useMemo(() => {
    const match = OBSERVACIONES.find(o => o.condicion(estado));
    if (!match) return OBSERVACION_BASE;
    
    const texto = match.valor
      ? match.texto.replace('{streak}', match.valor(estado))
      : match.texto;
    return { nivel: match.nivel, texto };
  }, [estado]);

  const rangoActual = getRango(xp);

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="flex items-start gap-2"
      >
        <span className="text-[var(--color-gold)] text-lg flex-shrink-0 leading-tight mt-0.5" aria-hidden>
          {rangoActual.icon}
        </span>
        <p className="text-sm font-serif opacity-80 leading-relaxed italic">
          {observacion.texto}
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="glass-card p-5 border border-[var(--color-midnight)]/5"
    >
      {}
      <p className="text-2xl md:text-3xl font-serif italic opacity-90 leading-snug tracking-tight py-6 text-center" style={{ color: "var(--color-midnight)" }}>
        "{observacion.texto}"
      </p>

      {}
      <div className="mt-2 flex items-center gap-3">
        <div className="h-px flex-1 bg-[var(--color-midnight)]/10" />
        <span className="text-[10px] font-sans font-black uppercase tracking-[0.2em] opacity-40 flex items-center gap-2">
          {rangoActual.icon} {observacion.nivel}
        </span>
        <div className="h-px flex-1 bg-[var(--color-midnight)]/10" />
      </div>
    </motion.div>
  );
}

export default OracleInsight;
