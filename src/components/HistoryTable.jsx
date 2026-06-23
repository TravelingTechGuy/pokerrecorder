import React, { useRef } from 'react';
import { format, parseISO } from 'date-fns';
import { Download, Upload, Trash2 } from 'lucide-react';
import { formatCurrency } from '../utils';

export function HistoryTable({ games, onDelete, onImport }) {
  const fileInputRef = useRef(null);
  
  const handleExportCSV = () => {
    if (games.length === 0) return;
    
    const headers = ['Date', 'Host', 'Buy-ins', 'Buy-in Amount', 'Total Invested', 'Cash Out', 'Profit/Loss'];
    
    const rows = games.map(g => {
      const totalInvested = g.buyIns * g.buyInAmount;
      const pl = g.cashOutAmount - totalInvested;
      return [
        g.date,
        g.host,
        g.buyIns,
        g.buyInAmount,
        totalInvested,
        g.cashOutAmount,
        pl
      ];
    });
    
    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const latestGameDate = games.length > 0 ? games[0].date : format(new Date(), 'yyyy-MM-dd');
    link.setAttribute('download', `poker_history_${latestGameDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.split('\n').map(line => line.trim()).filter(line => line);
      
      if (lines.length <= 1) return; // Only header or empty
      
      const parsedGames = lines.slice(1).map(line => {
        const cols = line.split(',');
        if (cols.length >= 6) {
          return {
            date: cols[0],
            host: cols[1],
            buyIns: parseInt(cols[2], 10) || 1,
            buyInAmount: parseFloat(cols[3]) || 0,
            // cols[4] is Total Invested, we don't store it
            cashOutAmount: parseFloat(cols[5]) || 0
          };
        }
        return null;
      }).filter(g => g !== null);

      if (parsedGames.length > 0 && onImport) {
        onImport(parsedGames);
      }
    };
    reader.readAsText(file);
    e.target.value = null; // reset input
  };

  return (
    <div className="card animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Game History</h2>
        <div className="flex gap-2">
          <input 
            type="file" 
            accept=".csv" 
            ref={fileInputRef} 
            onChange={handleImportCSV} 
            style={{ display: 'none' }} 
          />
          <button className="btn btn-outline flex items-center gap-2" onClick={() => fileInputRef.current.click()}>
            <Upload size={16} />
            <span className="hidden sm-inline">Import</span>
          </button>
          <button className="btn btn-outline flex items-center gap-2" onClick={handleExportCSV}>
            <Download size={16} />
            <span className="hidden sm-inline">Export</span>
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Host</th>
              <th>In</th>
              <th>Out</th>
              <th>P/L</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {[...games].reverse().map(g => {
              const totalInvested = g.buyIns * g.buyInAmount;
              const pl = g.cashOutAmount - totalInvested;
              return (
                <tr key={g.id}>
                  <td data-label="Date" className="whitespace-nowrap">{format(parseISO(g.date), 'MMM d, yyyy')}</td>
                  <td data-label="Host">{g.host}</td>
                  <td data-label="In">{formatCurrency(totalInvested)}</td>
                  <td data-label="Out">{formatCurrency(g.cashOutAmount)}</td>
                  <td data-label="P/L" className={`font-semibold ${pl >= 0 ? 'positive' : 'negative'}`}>
                    {pl >= 0 ? '+' : ''}{formatCurrency(pl)}
                  </td>
                  <td data-label="Actions">
                    <button 
                      className="btn-ghost" 
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this game?')) {
                          onDelete(g.id);
                        }
                      }}
                      title="Delete game"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
