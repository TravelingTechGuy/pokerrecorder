import React, { useState } from 'react';
import { format } from 'date-fns';
import styles from './GameForm.module.css';

export function GameForm({ onSave, hosts, addHost, gameTypes }) {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [host, setHost] = useState('');
  const [type, setType] = useState('cash');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    let finalHost = host;
    if (isAddingHost && newHost.trim()) {
      finalHost = newHost.trim();
      await addHost(finalHost);
    }

    const game = {
      date,
      host: finalHost,
      type,
      buyIns: Number(buyIns),
      buyInAmount: Number(buyInAmount),
      cashOutAmount: Number(cashOutAmount),
    };

    onSave(game);
    
    // Reset form
    setDate(format(new Date(), 'yyyy-MM-dd'));
    setType('cash');
    setBuyIns(1);
    setBuyInAmount(50);
    setCashOutAmount(0);
    setIsAddingHost(false);
    setNewHost('');
  };

  const currentProfit = cashOutAmount - (buyIns * buyInAmount);

  return (
    <div className={styles.gameFormCard}>
      <h2 className={styles.gameFormTitle}>Record a Game</h2>
      
      <form onSubmit={handleSubmit} className={styles.gameForm}>
        <div className={styles.gameFormGroup}>
          <label className={styles.gameFormLabel}>Date</label>
          <input 
            type="date" 
            className={styles.gameFormInput} 
            value={date} 
            onChange={e => setDate(e.target.value)}
            required
          />
        </div>

        <div className={styles.gameFormGroup}>
          <label className={styles.gameFormLabel}>Host</label>
          {!isAddingHost ? (
            <div className={styles.gameFormHostRow}>
              <select 
                className={styles.gameFormInput} 
                value={host} 
                onChange={e => setHost(e.target.value)}
                required
              >
                {hosts.map(h => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
              <button type="button" className={styles.gameFormBtnOutline} onClick={() => setIsAddingHost(true)}>
                New
              </button>
            </div>
          ) : (
            <div className={styles.gameFormHostRow}>
              <input 
                type="text" 
                className={styles.gameFormInput} 
                placeholder="Enter new host name" 
                value={newHost}
                onChange={e => setNewHost(e.target.value)}
                required
              />
              <button type="button" className={styles.gameFormBtnOutline} onClick={() => setIsAddingHost(false)}>
                Cancel
              </button>
            </div>
          )}
        </div>

        <div className={styles.gameFormGroup}>
          <label className={styles.gameFormLabel}>Game Type</label>
          <select 
            className={styles.gameFormInput} 
            value={type} 
            onChange={e => setType(e.target.value)}
            required
          >
            {gameTypes && gameTypes.map(t => (
              <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </select>
        </div>

        <div className={styles.gameFormGrid}>
          <div className={styles.gameFormGridItem}>
            <label className={styles.gameFormLabel}>Buy-ins</label>
            <input 
              type="number" 
              className={styles.gameFormInput} 
              min="1" 
              step="1"
              value={buyIns} 
              onChange={e => setBuyIns(e.target.value)}
              required
            />
          </div>
          <div className={styles.gameFormGridItem}>
            <label className={styles.gameFormLabel}>Amount per Buy-in ($)</label>
            <input 
              type="number" 
              className={styles.gameFormInput} 
              min="0" 
              step="1"
              value={buyInAmount} 
              onChange={e => setBuyInAmount(e.target.value)}
              required
            />
          </div>
        </div>

        <div className={styles.gameFormGroup}>
          <label className={styles.gameFormLabel}>Cash Out Amount ($)</label>
          <input 
            type="number" 
            className={styles.gameFormInput} 
            min="0" 
            step="1"
            value={cashOutAmount} 
            onChange={e => setCashOutAmount(e.target.value)}
            required
          />
        </div>

        <div className={styles.gameFormEstimate}>
          <div className={styles.gameFormEstimateRow}>
            <span className={styles.gameFormEstimateLabel}>Estimated Net:</span>
            <span className={`${styles.gameFormEstimateValue} ${currentProfit >= 0 ? styles.gameFormEstimatePositive : styles.gameFormEstimateNegative}`}>
              {currentProfit >= 0 ? '+' : '-'}${Math.abs(currentProfit)}
            </span>
          </div>
        </div>

        <button type="submit" className={styles.gameFormSubmitBtn}>
          Save Game
        </button>
      </form>
    </div>
  );
}
