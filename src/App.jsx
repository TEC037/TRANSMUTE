import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import { useGame } from './context/GameContext';

function App() {
  const { isLoaded } = useGame();

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
        <div className="w-10 h-10 border-2 border-white/5 border-t-[#CB9D06] rounded-full animate-spin shadow-[0_0_15px_rgba(203,157,6,0.2)]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505]">
      <Routes>
        <Route path="/" element={<Dashboard />} />
        {/* SPA Router: Redirección a Home para rutas no válidas */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
