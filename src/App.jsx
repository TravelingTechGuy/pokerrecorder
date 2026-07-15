import { useState, useEffect } from 'react';
import { BarChart3, PlusCircle, List, LogOut } from 'lucide-react';
import { useGames, useHosts, useGameTypes } from './hooks/useData';
import { Dashboard } from './components/Dashboard/Dashboard';
import { GameForm } from './components/GameForm/GameForm';
import { HistoryTable } from './components/HistoryTable/HistoryTable';
import { Auth } from './components/Auth/Auth';
import { supabase } from './supabase';
import styles from './App.module.css';

export default function App() {
  const [session, setSession] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const { games, addGame, deleteGame, importGames } = useGames(session);
  const { hosts, addHost } = useHosts(session);
  const { gameTypes } = useGameTypes(session);

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
    setActiveTab('history');
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={`${styles.container} ${styles.headerContainer}`}>
          <div className={styles.logoWrapper}>
            <div className={styles.logoIcon}>
              <span>♠</span>
            </div>
            <h1 className={styles.logoText}>Poker Tracker</h1>
          </div>
          
          <button onClick={handleSignOut} className={styles.signOutBtn} title="Sign Out">
            <LogOut size={18} />
            <span className="hidden sm-inline">Sign Out</span>
          </button>
        </div>
      </header>

      <main className={`${styles.container} ${styles.main}`}>
        {activeTab === 'dashboard' && <Dashboard games={games} />}
        {activeTab === 'add' && <GameForm onSave={handleSaveGame} hosts={hosts} addHost={addHost} gameTypes={gameTypes} />}
        {activeTab === 'history' && <HistoryTable games={games} onDelete={deleteGame} onImport={importGames} />}
      </main>

      <nav className={styles.bottomNav}>
        <div className={styles.navButtons}>
        <button 
          className={`${styles.navItem} ${activeTab === 'dashboard' ? styles.navItemActive : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <BarChart3 size={24} />
          <span>Dashboard</span>
        </button>
        
        <button 
          className={styles.navItem}
          onClick={() => setActiveTab('add')}
        >
          <div className={styles.navAddBtn}>
            <PlusCircle size={28} />
          </div>
          <span className={`${activeTab === 'add' ? styles.navItemActive : ''} ${styles.navAddText}`}>Add Game</span>
        </button>
        
        <button 
          className={`${styles.navItem} ${activeTab === 'history' ? styles.navItemActive : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <List size={24} />
          <span>History</span>
        </button>
        </div>
        <div className="footer-label">
          All rights reserved Traveling Tech Guy LLC {new Date().getFullYear()}
        </div>
      </nav>
    </div>
  );
}
