import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

export function useGames() {
  const [games, setGames] = useState([]);

  const fetchGames = async () => {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .order('date', { ascending: true });
      
    if (error) {
      console.error('Error fetching games:', error);
    } else if (data) {
      setGames(data);
    }
  };

  useEffect(() => {
    fetchGames();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        fetchGames();
      } else {
        setGames([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

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
      fetchGames();
    }
  };

  return { games, addGame, deleteGame, importGames };
}

export function useHosts() {
  const [hosts, setHosts] = useState([]);

  const fetchHosts = async () => {
    const { data, error } = await supabase
      .from('hosts')
      .select('name');
      
    if (error) {
      console.error('Error fetching hosts:', error);
    } else if (data) {
      setHosts(data.map(h => h.name));
    }
  };

  useEffect(() => {
    fetchHosts();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        fetchHosts();
      } else {
        setHosts([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

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

export function useGameTypes() {
  const [gameTypes, setGameTypes] = useState(['cash', 'tournament', 'mixed']);

  const fetchGameTypes = async () => {
    const { data, error } = await supabase
      .from('game_types')
      .select('name');
      
    if (error) {
      console.error('Error fetching game types:', error);
    } else if (data && data.length > 0) {
      setGameTypes(data.map(gt => gt.name));
    }
  };

  useEffect(() => {
    fetchGameTypes();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        fetchGameTypes();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return { gameTypes };
}
