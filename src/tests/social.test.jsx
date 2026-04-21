import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Accountability from '../components/Accountability';
import { useStore } from '../store/useStore';
import { supabase } from '../lib/supabase';


vi.mock('../lib/supabase', () => {
  const mockLikes = [
    { created_at: new Date().toISOString(), sender: { display_name: 'Leonardo' }, receiver: { display_name: 'Alchemist_X' } }
  ];
  const mockProfiles = [
    { id: '1', display_name: 'Leonardo', avatar: 'Zap', xp: 1200, level: 3, likes: [{ count: 10 }] },
    { id: '2', display_name: 'Alchemist_X', avatar: 'Brain', xp: 800, level: 2, likes: [{ count: 5 }] }
  ];

  const createChain = (data, count = null) => {
    const chain = {
      select: vi.fn((...args) => {
        
        if (args[1]?.count) return Promise.resolve({ count: 24, error: null });
        return chain;
      }),
      eq: vi.fn(() => chain),
      order: vi.fn(() => chain),
      limit: vi.fn(() => Promise.resolve({ data, count, error: null })),
    };
    return chain;
  };

  return {
    supabase: {
      from: vi.fn((table) => {
        if (table === 'likes') return createChain(mockLikes);
        if (table === 'profiles') {
           const c = createChain(mockProfiles, 24);
           
           const originalSelect = c.select;
           c.select = vi.fn((sel, opts) => {
              if (opts?.count) return Promise.resolve({ count: 24, error: null });
              return c;
           });
           return c;
        }
        return createChain([]);
      }),
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'test-user-id' } } })
      }
    }
  };
});

describe('Resonancia del Cónclave (Accountability Component)', () => {
  beforeEach(() => {
    useStore.setState({
      session: { user: { id: 'test-user-id' } },
      settings: { isPublic: true, theme: 'Oscuro' },
      globalStats: {
        totalUsers: 24,
        recentActivity: [
          { 
            created_at: new Date().toISOString(), 
            sender: { display_name: 'Leonardo' }, 
            receiver: { display_name: 'Alchemist_X' } 
          }
        ]
      },
      fetchGlobalGoal: vi.fn(),
      fetchGlobalStats: vi.fn(),
      giveRespect: vi.fn().mockResolvedValue(true)
    });
  });

  it('debe materializar el título de la Alianza y las métricas globales', async () => {
    render(<Accountability />);
    expect(screen.getByText(/Alianza Universalis/i)).toBeInTheDocument();
  });

  it('debe listar a los Maestros del Cónclave (Ranking)', async () => {
    render(<Accountability />);
    
    
    await waitFor(() => {
       expect(screen.getByText(/Leonardo/i)).toBeInTheDocument();
       expect(screen.getByText(/Alchemist_X/i)).toBeInTheDocument();
    });
    
    
    expect(screen.getByText(/GRADO 3/i)).toBeInTheDocument();
  });

  it('debe mostrar el feed de Resonancia Reciente', async () => {
    render(<Accountability />);
    
    await waitFor(() => {
       expect(screen.getByText(/ha emitido Luz hacia/i)).toBeInTheDocument();
       expect(screen.getByText(/Alchemist_X/i)).toBeInTheDocument();
    });
  });

  it('debe permitir alternar la presencia social (Privacidad)', async () => {
    const { updateSettings } = useStore.getState(); 
    const updateSpy = vi.fn();
    useStore.setState({ updateSettings: updateSpy });

    render(<Accountability />);
    
    const privacyBtn = screen.getByText(/Identidad Manifestada/i);
    fireEvent.click(privacyBtn);
    
    expect(updateSpy).toHaveBeenCalled();
  });
});
