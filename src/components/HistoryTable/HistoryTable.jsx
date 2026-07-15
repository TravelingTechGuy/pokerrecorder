import { useRef, useState, useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { Download, Upload, Trash2, ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react';
import { formatCurrency, getInvestedAmount, getProfit } from '../../utils';
import styles from './HistoryTable.module.css';

export function HistoryTable({ games, onDelete, onImport }) {
  const fileInputRef = useRef(null);
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  
  const sortedGames = useMemo(() => {
    let sortableGames = [...games];
    sortableGames.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      if (sortConfig.key === 'in') {
        aValue = getInvestedAmount(a);
        bValue = getInvestedAmount(b);
      } else if (sortConfig.key === 'out') {
        aValue = a.cashOutAmount;
        bValue = b.cashOutAmount;
      } else if (sortConfig.key === 'pl') {
        aValue = getProfit(a);
        bValue = getProfit(b);
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

  const renderSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) return <ArrowUpDown size={14} className={styles.historyTableIconOpacity} />;
    return sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };
  
  const handleExportCSV = () => {
    if (games.length === 0) return;
    
    const headers = ['Date', 'Host', 'Type', 'Buy-ins', 'Buy-in Amount', 'Total Invested', 'Cash Out', 'Profit/Loss'];
    
    const rows = games.map(g => {
      const totalInvested = getInvestedAmount(g);
      const pl = getProfit(g);
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
    const latestGameDate = games.length > 0 ? games[games.length - 1].date : format(new Date(), 'yyyy-MM-dd');
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
    <div className={styles.historyTableCard}>
      <div className={styles.historyTableHeader}>
        <h2 className={styles.historyTableTitle}>Game History</h2>
        
        <div className={styles.historyTableActions}>
          <div className={styles.historyTableSelectWrapper}>
            <select 
              className={styles.historyTableSelect}
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

          <div className={styles.historyTableBtnGroup}>
            <input 
              type="file" 
              accept=".csv" 
              ref={fileInputRef} 
              onChange={handleImportCSV} 
              style={{ display: 'none' }} 
            />
            <button className={styles.historyTableBtnOutline} onClick={() => fileInputRef.current.click()}>
              <Upload size={16} />
              <span className={styles.historyTableHiddenSm}>Import</span>
            </button>
            <button className={styles.historyTableBtnOutline} onClick={handleExportCSV}>
              <Download size={16} />
              <span className={styles.historyTableHiddenSm}>Export</span>
            </button>
          </div>
        </div>
      </div>

      <div className={styles.historyTableContainer}>
        <table className={styles.historyTable}>
          <thead>
            <tr>
              <th onClick={() => requestSort('date')} className={styles.historyTableSortableTh}>
                <div className={styles.historyTableThContent}>Date {renderSortIcon('date')}</div>
              </th>
              <th onClick={() => requestSort('host')} className={styles.historyTableSortableTh}>
                <div className={styles.historyTableThContent}>Host {renderSortIcon('host')}</div>
              </th>
              <th onClick={() => requestSort('type')} className={styles.historyTableSortableTh}>
                <div className={styles.historyTableThContent}>Type {renderSortIcon('type')}</div>
              </th>
              <th onClick={() => requestSort('buyIns')} className={styles.historyTableSortableTh}>
                <div className={styles.historyTableThContent}># Buy-ins {renderSortIcon('buyIns')}</div>
              </th>
              <th onClick={() => requestSort('in')} className={styles.historyTableSortableTh}>
                <div className={styles.historyTableThContent}>In {renderSortIcon('in')}</div>
              </th>
              <th onClick={() => requestSort('out')} className={styles.historyTableSortableTh}>
                <div className={styles.historyTableThContent}>Out {renderSortIcon('out')}</div>
              </th>
              <th onClick={() => requestSort('pl')} className={styles.historyTableSortableTh}>
                <div className={styles.historyTableThContent}>P/L {renderSortIcon('pl')}</div>
              </th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {sortedGames.map(g => {
              const totalInvested = getInvestedAmount(g);
              const pl = getProfit(g);
              return (
                <tr key={g.id}>
                  <td data-label="Date" className={styles.historyTableWhitespaceNowrap}>{format(parseISO(g.date), 'MMM d, yyyy')}</td>
                  <td data-label="Host">{g.host}</td>
                  <td data-label="Type" className={styles.historyTableCapitalize}>{g.type || 'cash'}</td>
                  <td data-label="# Buy-ins">{g.buyIns}</td>
                  <td data-label="In">{formatCurrency(totalInvested)}</td>
                  <td data-label="Out">{formatCurrency(g.cashOutAmount)}</td>
                  <td data-label="P/L" className={pl >= 0 ? styles.historyTablePositive : styles.historyTableNegative}>
                    {pl >= 0 ? '+' : ''}{formatCurrency(pl)}
                  </td>
                  <td data-label="Actions">
                    <button 
                      className={styles.historyTableBtnGhost} 
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
