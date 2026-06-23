import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { format, parseISO } from 'date-fns';
import { formatCurrency } from '../utils';

export function Dashboard({ games }) {
  const stats = useMemo(() => {
    let totalBuyIn = 0;
    let totalCashOut = 0;
    
    games.forEach(g => {
      totalBuyIn += g.buyInAmount * g.buyIns;
      totalCashOut += g.cashOutAmount;
    });

    const profit = totalCashOut - totalBuyIn;
    
    return {
      profit,
      totalBuyIn,
      totalCashOut,
      gamesPlayed: games.length
    };
  }, [games]);

  const chartData = useMemo(() => {
    let cumulative = 0;
    
    return games.map((g, i) => {
      const pl = g.cashOutAmount - (g.buyInAmount * g.buyIns);
      cumulative += pl;
      return {
        name: format(parseISO(g.date), 'MMM d'),
        date: g.date,
        pl,
        cumulative,
        host: g.host,
        gameNumber: i + 1
      };
    });
  }, [games]);

  return (
    <div className="flex-col gap-6 animate-fade-in">
      <div className="card">
        <h2 className="text-sm font-semibold text-secondary mb-2">Total Profit / Loss</h2>
        <p className={`text-2xl font-bold ${stats.profit >= 0 ? 'text-accent' : 'text-danger'}`}>
          {stats.profit >= 0 ? '+' : ''}{formatCurrency(stats.profit)}
        </p>
      </div>

      <div className="grid-2 mt-4">
        <div className="card w-full">
          <h3 className="text-sm text-secondary">Games Played</h3>
          <p className="text-xl font-semibold mt-2">{stats.gamesPlayed}</p>
        </div>
        <div className="card w-full">
          <h3 className="text-sm text-secondary">Avg P/L per Game</h3>
          <p className={`text-xl font-semibold mt-2 ${stats.gamesPlayed > 0 && stats.profit >= 0 ? 'text-accent' : stats.gamesPlayed > 0 ? 'text-danger' : 'text-secondary'}`}>
            {stats.gamesPlayed > 0 ? formatCurrency(stats.profit / stats.gamesPlayed) : '$0.00'}
          </p>
        </div>
      </div>

      {chartData.length > 0 && (
        <div className="card mt-4">
          <h3 className="text-sm font-semibold text-secondary mb-4">Cumulative P/L Over Time</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="name" stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }}
                  itemStyle={{ color: '#f8fafc' }}
                  labelStyle={{ color: '#a1a1aa', marginBottom: '4px' }}
                  formatter={(value) => [formatCurrency(value), 'Cumulative P/L']}
                  labelFormatter={(label, payload) => payload[0] ? `${label} at ${payload[0].payload.host}` : label}
                />
                <ReferenceLine y={0} stroke="#52525b" strokeDasharray="3 3" />
                <Line 
                  type="monotone" 
                  dataKey="cumulative" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#18181b', stroke: '#10b981', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
