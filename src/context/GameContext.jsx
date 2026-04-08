import React, { createContext, useContext, useState, useEffect } from 'react';

const GameContext = createContext();

const defaultHabitos = [
  { 
    id: 'habit-1', 
    name: 'Desconexión Digital', 
    completedDays: {}, // Objeto de fechas: { "Tue Apr 07 2026": true }
    streak: 0
  }
];

export function GameProvider({ children }) {
  const [habits, setHabits] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toDateString());

  // Cargar datos persistidos
  useEffect(() => {
    const saved = localStorage.getItem('TRANSMUTE_DATA');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setHabits(parsed.habits || defaultHabitos);
      } catch (e) {
        setHabits(defaultHabitos);
      }
    } else {
      setHabits(defaultHabitos);
    }
    setIsLoaded(true);
  }, []);

  // Persistir datos
  useEffect(() => {
    if(!isLoaded) return;
    localStorage.setItem('TRANSMUTE_DATA', JSON.stringify({ habits }));
  }, [habits, isLoaded]);

  // Cálculo de racha en tiempo real para cualquier hábito
  const calculateStreak = (completedDays) => {
    if (!completedDays || Object.keys(completedDays).length === 0) return 0;
    
    let count = 0;
    const today = new Date();
    const todayStr = today.toDateString();
    
    // Si hoy está marcado, empezamos racha en 1
    if (completedDays[todayStr]) {
      count = 1;
    }
    
    // Miramos hacia atrás empezando desde ayer
    const checkDate = new Date();
    checkDate.setDate(checkDate.getDate() - 1);
    
    while (true) {
      if (completedDays[checkDate.toDateString()]) {
        count++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    return count;
  };

  const toggleHabit = (id, dateStr = selectedDate) => {
    setHabits(prev => prev.map(h => {
      if (h.id === id) {
        const newCompletedDays = { ...(h.completedDays || {}) };
        if (newCompletedDays[dateStr]) {
          delete newCompletedDays[dateStr];
        } else {
          newCompletedDays[dateStr] = true;
        }
        
        return { 
          ...h, 
          completedDays: newCompletedDays,
          streak: calculateStreak(newCompletedDays)
        };
      }
      return h;
    }));
  };

  const addHabit = (name) => {
    const newHabit = {
      id: `habit-${Date.now()}`,
      name,
      completedDays: {},
      streak: 0
    };
    setHabits(prev => [...prev, newHabit]);
  };

  const updateHabit = (id, newName) => {
    setHabits(prev => prev.map(h => h.id === id ? { ...h, name: newName } : h));
  };

  const deleteHabit = (id) => {
    setHabits(prev => prev.filter(h => h.id !== id));
  };

  return (
    <GameContext.Provider value={{ 
      habits, 
      toggleHabit,
      addHabit,
      updateHabit,
      deleteHabit,
      selectedDate,
      setSelectedDate,
      isLoaded 
    }}>
      {children}
    </GameContext.Provider>
  );
}

export const useGame = () => useContext(GameContext);
