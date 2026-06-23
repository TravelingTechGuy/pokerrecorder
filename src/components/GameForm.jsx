import React, { useState } from 'react';
import { format } from 'date-fns';

export function GameForm({ onSave, hosts, addHost }) {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [host, setHost] = useState('');
  const [newHost, setNewHost] = useState('');
  const [isAddingHost, setIsAddingHost] = useState(false);
  const [buyIns, setBuyIns] = useState(1);
  const [buyInAmount, setBuyInAmount] = useState(50);
  const [cashOutAmount, setCashOutAmount] = useState(0);

  // Initialize selected host once async hosts load
  React.useEffect(() => {
    if (hosts.length > 0 && !host) {
      setHost(hosts[0]);
    }
  }, [hosts, host]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    let finalHost = host;
    if (isAddingHost && newHost.trim()) {
      finalHost = newHost.trim();
      addHost(finalHost);
    }

    const game = {
      date,
      host: finalHost,
      buyIns: Number(buyIns),
      buyInAmount: Number(buyInAmount),
      cashOutAmount: Number(cashOutAmount),
    };

    onSave(game);
    
    // Reset form
    setDate(format(new Date(), 'yyyy-MM-dd'));
    setBuyIns(1);
    setBuyInAmount(50);
    setCashOutAmount(0);
    setIsAddingHost(false);
    setNewHost('');
  };

  const currentProfit = cashOutAmount - (buyIns * buyInAmount);

  return (
    <div className="card animate-fade-in">
      <h2 className="text-xl font-bold mb-6">Record a Game</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="label">Date</label>
          <input 
            type="date" 
            className="input" 
            value={date} 
            onChange={e => setDate(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="label">Host</label>
          {!isAddingHost ? (
            <div className="flex gap-2">
              <select 
                className="input" 
                value={host} 
                onChange={e => setHost(e.target.value)}
                required
              >
                {hosts.map(h => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
              <button type="button" className="btn btn-outline" onClick={() => setIsAddingHost(true)}>
                New
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input 
                type="text" 
                className="input" 
                placeholder="Enter new host name" 
                value={newHost}
                onChange={e => setNewHost(e.target.value)}
                required
              />
              <button type="button" className="btn btn-outline" onClick={() => setIsAddingHost(false)}>
                Cancel
              </button>
            </div>
          )}
        </div>

        <div className="grid-2">
          <div className="form-group w-full">
            <label className="label">Buy-ins</label>
            <input 
              type="number" 
              className="input" 
              min="1" 
              step="1"
              value={buyIns} 
              onChange={e => setBuyIns(e.target.value)}
              required
            />
          </div>
          <div className="form-group w-full">
            <label className="label">Amount per Buy-in ($)</label>
            <input 
              type="number" 
              className="input" 
              min="0" 
              step="1"
              value={buyInAmount} 
              onChange={e => setBuyInAmount(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="label">Cash Out Amount ($)</label>
          <input 
            type="number" 
            className="input" 
            min="0" 
            step="1"
            value={cashOutAmount} 
            onChange={e => setCashOutAmount(e.target.value)}
            required
          />
        </div>

        <div className="mt-6 estimate-box">
          <div className="flex justify-between items-center">
            <span className="text-sm text-secondary">Estimated Net:</span>
            <span className={`text-xl font-bold ${currentProfit >= 0 ? 'text-accent' : 'text-danger'}`}>
              {currentProfit >= 0 ? '+' : '-'}${Math.abs(currentProfit)}
            </span>
          </div>
        </div>

        <button type="submit" className="btn btn-primary w-full mt-6">
          Save Game
        </button>
      </form>
    </div>
  );
}
