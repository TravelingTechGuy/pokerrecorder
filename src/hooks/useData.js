import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

export function useGames(session) {
  const [games, setGames] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!session) {
      Promise.resolve().then(() => setGames(prev => prev.length > 0 ? [] : prev));
      return;
    }

    let active = true;
    supabase
      .from('games')
      .select('*')
      .order('date', { ascending: true })
      .then(({ data, error }) => {
        if (active) {
          if (error) {
            console.error('Error fetching games:', error);
          } else if (data) {
            setGames(data);
          }
        }
      });

    return () => {
      active = false;
    };
  }, [session, refreshKey]);

  const addGame = async (game) => {
    const { data, error } = await supabase
      .from('games')
      .insert([game])
      .select();
      
    if (error) {
      console.error('Error saving game:', error);
    } else if (data && data.length > 0) {
      setGames(prev => {
        const newGames = [data[0], ...prev];
        return newGames.sort((a, b) => new Date(a.date) - new Date(b.date));
      });
    }
  };

  const deleteGame = async (id) => {
    const { error } = await supabase
      .from('games')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error('Error deleting game:', error);
    } else {
      setGames(prev => prev.filter(g => g.id !== id));
    }
  };

  const importGames = async (parsedGames) => {
    const { error } = await supabase
      .from('games')
      .insert(parsedGames);
      
    if (error) {
      console.error('Error importing games:', error);
    } else {
      setRefreshKey(prev => prev + 1);
    }
  };

  return { games, addGame, deleteGame, importGames };
}

export function useHosts(session) {
  const [hosts, setHosts] = useState([]);

  useEffect(() => {
    if (!session) {
      Promise.resolve().then(() => setHosts(prev => prev.length > 0 ? [] : prev));
      return;
    }

    let active = true;
    supabase
      .from('hosts')
      .select('name')
      .then(({ data, error }) => {
        if (active) {
          if (error) {
            console.error('Error fetching hosts:', error);
          } else if (data) {
            setHosts(data.map(h => h.name));
          }
        }
      });

    return () => {
      active = false;
    };
  }, [session]);

  const addHost = async (host) => {
    if (host && !hosts.includes(host)) {
      const { error } = await supabase
        .from('hosts')
        .insert([{ name: host }]);
        
      if (error) {
        console.error('Error adding host:', error);
      } else {
        setHosts(prev => [...prev, host]);
      }
    }
  };

  return { hosts, addHost };
}

export function useGameTypes(session) {
  const [gameTypes, setGameTypes] = useState(['cash', 'tournament', 'mixed']);

  useEffect(() => {
    if (!session) return;

    let active = true;
    supabase
      .from('game_types')
      .select('name')
      .then(({ data, error }) => {
        if (active) {
          if (error) {
            console.error('Error fetching game types:', error);
          } else if (data && data.length > 0) {
            setGameTypes(data.map(gt => gt.name));
          }
        }
      });

    return () => {
      active = false;
    };
  }, [session]);

  return { gameTypes };
}
