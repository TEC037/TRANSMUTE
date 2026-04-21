import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Stats from '../components/Stats';
import { useStore } from '../store/useStore';
import { MemoryRouter } from 'react-router-dom';


const mockedUsedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockedUsedNavigate,
  };
});

describe('Geometría del Rosario (Stats Component)', () => {
  beforeEach(() => {
    
    useStore.setState({
      xp: 5000,
      level: 10,
      bestStreak: 33, 
      habits: [
        { 
          id: '1', 
          name: 'Meditación', 
          completedDays: { [new Date().toDateString()]: true },
          streak: 33
        }
      ],
      settings: { theme: 'Oscuro' }
    });
  });

  const renderStats = () => render(
    <MemoryRouter>
      <Stats />
    </MemoryRouter>
  );

  it('debe renderizar el total de transmutaciones y la racha actual', () => {
    renderStats();
    
    
    const streak = screen.getByText('33');
    expect(streak).toBeInTheDocument();
  });

  it('debe contener las perlas del Rosario (días del mes)', () => {
    renderStats();
    
    const day15 = screen.getByText('15');
    expect(day15).toBeInTheDocument();
  });

  it('debe actualizar el Orbe Central al interactuar con una perla', () => {
    renderStats();
    
    
    
    const day10 = screen.getByText('10');
    fireEvent.click(day10);
    
    
    const orbDate = screen.getAllByText(/10/); 
    expect(orbDate.length).toBeGreaterThan(1);
  });

  it('debe aplicar la estética de Fuego si la racha es >= 21', () => {
    const { container } = renderStats();
    
    
    
    const fireBeads = container.getElementsByClassName('bg-orange-500');
    expect(fireBeads.length).toBeGreaterThan(0);
  });

  it('debe navegar de regreso al Dashboard tras pulsar el Chevron', () => {
    renderStats();
    const backButton = screen.getAllByRole('button')[0]; 
    fireEvent.click(backButton);
    expect(mockedUsedNavigate).toHaveBeenCalledWith('/');
  });
});
