import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Dashboard from '../components/Dashboard';
import { useStore } from '../store/useStore';


vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: [], error: null }),
    })),
  }
}));


vi.mock('modern-screenshot', () => ({
  domToDataUrl: vi.fn().mockResolvedValue('data:image/png;base64,...'),
}));

describe('Manifestación Visual (Dashboard Component)', () => {
  beforeEach(() => {
    
    useStore.setState({
      xp: 100,
      level: 1,
      habits: [],
      settings: { theme: 'Oscuro', displayName: 'Leonardo' },
      globalGoal: { completed: 850, target: 1000 }
    });
  });

  it('debe materializar el título de la Crónica correctamente', () => {
    render(<Dashboard />);
    const title = screen.getByText(/Crónica/i);
    expect(title).toBeInTheDocument();
  });

  it('debe reflejar la Sincronía del Cónclave (Desafío Colectivo)', () => {
    render(<Dashboard />);
    const goalText = screen.getByText(/850 \/ 1000/i);
    expect(goalText).toBeInTheDocument();
    
    const collectiveLabel = screen.getByText(/Sincronía del Cónclave/i);
    expect(collectiveLabel).toBeInTheDocument();
  });

  it('debe mostrar el Grado de Maestría actual del adepto', () => {
    render(<Dashboard />);
    const levelLabel = screen.getByText(/Grado Actual 1/i);
    expect(levelLabel).toBeInTheDocument();
  });

  it('debe permitir interactuar con el entorno (Dashboard principal)', () => {
    render(<Dashboard />);
    
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
    
    
    const progressBar = document.querySelector('svg');
    expect(progressBar).toBeInTheDocument();
  });
});
