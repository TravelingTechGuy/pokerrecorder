import React, { useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { TrendingUp, DollarSign, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { formatCurrency } from '../../utils';
import { StreakMeter } from './StreakMeter';
import styles from './Dashboard.module.css';

export function Dashboard({ games }) {
  const stats = useMemo(() => {
    let totalProfit = 0;
    let totalInvested = 0;
    let gamesPlayed = games.length;

    games.forEach(g => {
      const invested = g.buyIns * g.buyInAmount;
      const profit = g.cashOutAmount - invested;
      totalInvested += invested;
      totalProfit += profit;
    });

    return {
      profit: totalProfit,
      roi: totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0,
      gamesPlayed
    };
  }, [games]);

  const chartData = useMemo(() => {
    let runningTotal = 0;
    // games are in desc order by date in the UI usually, but useData fetches asc.
    // wait, we just use the raw array and map it. 
    // We should ensure it's asc for chart:
    const sorted = [...games].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    return sorted.map(g => {
      const invested = g.buyIns * g.buyInAmount;
      const profit = g.cashOutAmount - invested;
      runningTotal += profit;
      return {
        name: format(parseISO(g.date), 'MMM d'),
        cumulative: runningTotal,
        profit: profit,
        host: g.host
      };
    });
  }, [games]);

  return (
    <div className={styles.dashboard}>
      <div className={styles.dashboardStatsGrid}>
        <div className={styles.dashboardStatCard}>
          <div className={styles.dashboardStatHeader}>
            <h3 className={styles.dashboardStatTitle}>Total Profit</h3>
            <DollarSign className={styles.dashboardStatIcon} size={20} />
          </div>
          <p className={`${styles.dashboardStatValue} ${stats.profit >= 0 ? styles.dashboardPositive : styles.dashboardNegative}`}>
            {stats.profit >= 0 ? '+' : ''}{formatCurrency(stats.profit)}
          </p>
        </div>
        
        <div className={styles.dashboardStatCard}>
          <div className={styles.dashboardStatHeader}>
            <h3 className={styles.dashboardStatTitle}>ROI</h3>
            <TrendingUp className={styles.dashboardStatIcon} size={20} />
          </div>
          <p className={`${styles.dashboardStatValue} ${stats.roi >= 0 ? styles.dashboardPositive : styles.dashboardNegative}`}>
            {stats.roi.toFixed(1)}%
          </p>
        </div>

        <div className={styles.dashboardStatCard}>
          <div className={styles.dashboardStatHeader}>
            <h3 className={styles.dashboardStatTitle}>Games Played</h3>
            <Activity className={styles.dashboardStatIcon} size={20} />
          </div>
          <p className={styles.dashboardStatValue}>{stats.gamesPlayed}</p>
        </div>

        <StreakMeter games={games} />
      </div>

      {chartData.length > 0 && (
        <div className={styles.dashboardChartCard}>
          <h3 className={styles.dashboardChartTitle}>Cumulative P/L Over Time</h3>
          <div className={styles.dashboardChartWrapper}>
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
