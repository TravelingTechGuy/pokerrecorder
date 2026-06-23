import React, { useRef, useState, useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { Download, Upload, Trash2, ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react';
import { formatCurrency } from '../utils';

export function HistoryTable({ games, onDelete, onImport }) {
  const fileInputRef = useRef(null);
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  
  const sortedGames = useMemo(() => {
    let sortableGames = [...games];
    sortableGames.sort((a, b) => {
      const aInvested = a.buyIns * a.buyInAmount;
      const bInvested = b.buyIns * b.buyInAmount;
      const aPl = a.cashOutAmount - aInvested;
      const bPl = b.cashOutAmount - bInvested;

      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      if (sortConfig.key === 'in') {
        aValue = aInvested;
        bValue = bInvested;
      } else if (sortConfig.key === 'out') {
        aValue = a.cashOutAmount;
        bValue = b.cashOutAmount;
      } else if (sortConfig.key === 'pl') {
        aValue = aPl;
        bValue = bPl;
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    return sortableGames;
  }, [games, sortConfig]);

  const requestSort = (key) => {
    let direction = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return <ArrowUpDown size={14} className="opacity-50" />;
    return sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };
  
  const handleExportCSV = () => {
    if (games.length === 0) return;
    
    const headers = ['Date', 'Host', 'Type', 'Buy-ins', 'Buy-in Amount', 'Total Invested', 'Cash Out', 'Profit/Loss'];
    
    const rows = games.map(g => {
      const totalInvested = g.buyIns * g.buyInAmount;
      const pl = g.cashOutAmount - totalInvested;
      return [
        g.date,
        g.host,
        g.type || 'cash',
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
          let typeStr = 'cash';
          let offset = 0;
          if (isNaN(parseInt(cols[2], 10))) {
            typeStr = cols[2];
            offset = 1;
          }
          
          return {
            date: cols[0],
            host: cols[1],
            type: typeStr.toLowerCase(),
            buyIns: parseInt(cols[2 + offset], 10) || 1,
            buyInAmount: parseFloat(cols[3 + offset]) || 0,
            // cols[4+offset] is Total Invested, we don't store it
            cashOutAmount: parseFloat(cols[5 + offset]) || 0
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
      <div className="flex justify-between items-center mb-6" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <h2 className="text-xl font-bold">Game History</h2>
        
        <div className="flex items-center gap-4" style={{ flexWrap: 'wrap' }}>
          <div className="mobile-only">
            <select 
              className="input"
              style={{ padding: '0.4rem 0.75rem', width: 'auto' }}
              value={`${sortConfig.key}-${sortConfig.direction}`}
              onChange={(e) => {
                const [key, direction] = e.target.value.split('-');
                setSortConfig({ key, direction });
              }}
            >
              <option value="date-desc">Sort: Date (Newest)</option>
              <option value="date-asc">Sort: Date (Oldest)</option>
              <option value="pl-desc">Sort: Profit (High to Low)</option>
              <option value="pl-asc">Sort: Profit (Low to High)</option>
              <option value="in-desc">Sort: Invested (High to Low)</option>
              <option value="in-asc">Sort: Invested (Low to High)</option>
              <option value="host-asc">Sort: Host (A-Z)</option>
              <option value="type-asc">Sort: Type (A-Z)</option>
            </select>
          </div>

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
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th onClick={() => requestSort('date')} className="th-sortable">
                <div className="flex items-center gap-1">Date <SortIcon columnKey="date" /></div>
              </th>
              <th onClick={() => requestSort('host')} className="th-sortable">
                <div className="flex items-center gap-1">Host <SortIcon columnKey="host" /></div>
              </th>
              <th onClick={() => requestSort('type')} className="th-sortable">
                <div className="flex items-center gap-1">Type <SortIcon columnKey="type" /></div>
              </th>
              <th onClick={() => requestSort('buyIns')} className="th-sortable">
                <div className="flex items-center gap-1"># Buy-ins <SortIcon columnKey="buyIns" /></div>
              </th>
              <th onClick={() => requestSort('in')} className="th-sortable">
                <div className="flex items-center gap-1">In <SortIcon columnKey="in" /></div>
              </th>
              <th onClick={() => requestSort('out')} className="th-sortable">
                <div className="flex items-center gap-1">Out <SortIcon columnKey="out" /></div>
              </th>
              <th onClick={() => requestSort('pl')} className="th-sortable">
                <div className="flex items-center gap-1">P/L <SortIcon columnKey="pl" /></div>
              </th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {sortedGames.map(g => {
              const totalInvested = g.buyIns * g.buyInAmount;
              const pl = g.cashOutAmount - totalInvested;
              return (
                <tr key={g.id}>
                  <td data-label="Date" className="whitespace-nowrap">{format(parseISO(g.date), 'MMM d, yyyy')}</td>
                  <td data-label="Host">{g.host}</td>
                  <td data-label="Type" className="capitalize">{g.type || 'cash'}</td>
                  <td data-label="# Buy-ins">{g.buyIns}</td>
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
