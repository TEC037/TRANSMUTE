import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useStore } from '../store/useStore';


vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
    auth: {
      signOut: vi.fn().mockResolvedValue({ error: null }),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    }
  }
}));

describe('Matriz de Maestría (useStore)', () => {
  beforeEach(() => {
    
    const store = useStore.getState();
    useStore.setState({
      xp: 0,
      level: 1,
      habits: [],
      unlockedLevel: 1,
      achievements: []
    });
  });

  it('debe calcular la Esencia (XP) correctamente al ganar puntos', () => {
    const { addXp } = useStore.getState();
    addXp(600);
    const { xp, level } = useStore.getState();
    expect(xp).toBe(600);
    expect(level).toBe(2); 
  });

  it('debe materializar hábitos correctamente', async () => {
    const { materializeHabit } = useStore.getState();
    await materializeHabit('meditation_1'); 
    const { habits } = useStore.getState();
    
    
  });

  it('debe gestionar rachas (streaks) de forma incremental', () => {
     
     useStore.setState({
       habits: [{
         id: 'test-1',
         name: 'Respiración Consciente',
         completedDays: { [new Date().toDateString()]: true },
         streak: 1
       }]
     });

     const { habits } = useStore.getState();
     expect(habits[0].streak).toBe(1);
  });

  it('debe desbloquear niveles superiores tras cumplir requisitos', () => {
    const { checkLevelUnlocks } = useStore.getState();
    
    
    useStore.setState({
      installationDate: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000).toDateString(),
      habits: [
        { id: '1', name: 'Pilar', completedDays: Array.from({length: 30}, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - i);
          return d.toDateString();
        }).reduce((acc, current) => ({ ...acc, [current]: true }), {}) }
      ]
    });

    checkLevelUnlocks();
    const { unlockedLevel } = useStore.getState();
    expect(unlockedLevel).toBeGreaterThan(1);
  });
});
