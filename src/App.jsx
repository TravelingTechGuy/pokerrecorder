import React, { useState, useEffect } from 'react';
import { BarChart3, PlusCircle, List, LogOut } from 'lucide-react';
import { useGames, useHosts } from './hooks/useData';
import { Dashboard } from './components/Dashboard';
import { GameForm } from './components/GameForm';
import { HistoryTable } from './components/HistoryTable';
import { Auth } from './components/Auth';
import { supabase } from './supabase';
import './index.css';

function App() {
  const [session, setSession] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const { games, addGame, deleteGame, importGames } = useGames();
  const { hosts, addHost } = useHosts();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!session) {
    return <Auth />;
  }

  const handleSaveGame = (game) => {
    addGame(game);
    setActiveTab('dashboard'); // Redirect to dashboard after saving
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header glass">
        <div className="header-container container flex justify-between items-center w-full">
          <div className="flex items-center gap-3">
            <h1 className="logo-text">Poker Tracker</h1>
            <div className="logo-icon"><span>♠</span></div>
          </div>
          <button 
            onClick={() => supabase.auth.signOut()} 
            className="text-secondary hover:text-danger flex items-center gap-1 text-sm transition-colors"
            title="Sign Out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mt-2">
        {activeTab === 'dashboard' && <Dashboard games={games} />}
        {activeTab === 'add' && <GameForm onSave={handleSaveGame} hosts={hosts} addHost={addHost} />}
        {activeTab === 'history' && <HistoryTable games={games} onDelete={deleteGame} onImport={importGames} />}
      </main>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <button 
          className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <BarChart3 size={24} />
          <span>Dashboard</span>
        </button>
        <button 
          className={`nav-item ${activeTab === 'add' ? 'active' : ''}`}
          onClick={() => setActiveTab('add')}
        >
          <div className="nav-add-btn">
            <PlusCircle size={28} />
          </div>
          <span className="mt-2">Add Game</span>
        </button>
        <button 
          className={`nav-item ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <List size={24} />
          <span>History</span>
        </button>
      </nav>
    </div>
  );
}

export default App;
