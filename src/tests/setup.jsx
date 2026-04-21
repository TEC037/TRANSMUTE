import React from 'react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';


vi.mock('framer-motion', async () => {
  const actual = await vi.importActual('framer-motion');
  return {
    ...actual,
    motion: {
      ...actual.motion,
      div: ({ children, ...props }) => <div {...props}>{children}</div>,
      button: ({ children, ...props }) => <button {...props}>{children}</button>,
      header: ({ children, ...props }) => <header {...props}>{children}</header>,
      span: ({ children, ...props }) => <span {...props}>{children}</span>,
      section: ({ children, ...props }) => <section {...props}>{children}</section>,
      circle: ({ children, ...props }) => <circle {...props}>{children}</circle>,
    },
    AnimatePresence: ({ children }) => <>{children}</>,
  };
});


vi.mock('@capacitor/haptics', () => ({
  Haptics: {
    impact: vi.fn(),
    notification: vi.fn(),
    vibrate: vi.fn(),
  },
  ImpactStyle: {
    Light: 'LIGHT',
    Medium: 'MEDIUM',
    Heavy: 'HEAVY',
  }
}));

vi.mock('@capacitor/share', () => ({
  Share: {
    share: vi.fn(),
  }
}));
