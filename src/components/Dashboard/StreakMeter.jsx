import React, { useMemo } from 'react';
import { Flame, TrendingDown, Activity } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { formatCurrency } from '../../utils';
import styles from './StreakMeter.module.css';

export function StreakMeter({ games }) {
  const streakData = useMemo(() => {
    if (!games || games.length === 0) {
      return {
        currentStreak: 0,
        currentStreakType: 'none',
        longestWinStreak: 0,
        longestLossStreak: 0,
        recentGames: []
      };
    }

    // Sort games by date ascending
    const sorted = [...games].sort((a, b) => new Date(a.date) - new Date(b.date));

    let maxWinStreak = 0;
    let maxLossStreak = 0;
    let tempWin = 0;
    let tempLoss = 0;

    sorted.forEach(g => {
      const profit = g.cashOutAmount - (g.buyIns * g.buyInAmount);
      if (profit > 0) {
        tempWin++;
        tempLoss = 0;
        maxWinStreak = Math.max(maxWinStreak, tempWin);
      } else if (profit < 0) {
        tempLoss++;
        tempWin = 0;
        maxLossStreak = Math.max(maxLossStreak, tempLoss);
      } else {
        // breakeven
        tempWin = 0;
        tempLoss = 0;
      }
    });

    // Calculate current streak
    let currentStreak = 0;
    let currentStreakType = 'none';

    const lastGame = sorted[sorted.length - 1];
    const lastProfit = lastGame.cashOutAmount - (lastGame.buyIns * lastGame.buyInAmount);

    if (lastProfit > 0) {
      currentStreakType = 'win';
      let count = 0;
      for (let i = sorted.length - 1; i >= 0; i--) {
        const p = sorted[i].cashOutAmount - (sorted[i].buyIns * sorted[i].buyInAmount);
        if (p > 0) {
          count++;
        } else {
          break;
        }
      }
      currentStreak = count;
    } else if (lastProfit < 0) {
      currentStreakType = 'loss';
      let count = 0;
      for (let i = sorted.length - 1; i >= 0; i--) {
        const p = sorted[i].cashOutAmount - (sorted[i].buyIns * sorted[i].buyInAmount);
        if (p < 0) {
          count++;
        } else {
          break;
        }
      }
      currentStreak = count;
    } else {
      currentStreakType = 'none';
      currentStreak = 0;
    }

    // Last 5 games (chronological left-to-right, so newest is last in list)
    const recent = sorted.slice(-5).map(g => {
      const profit = g.cashOutAmount - (g.buyIns * g.buyInAmount);
      return {
        id: g.id,
        profit,
        date: g.date,
        host: g.host,
        type: g.type,
        buyIns: g.buyIns,
        buyInAmount: g.buyInAmount,
        isWin: profit > 0,
        isLoss: profit < 0,
        isBreakeven: profit === 0
      };
    });

    return {
      currentStreak,
      currentStreakType,
      longestWinStreak: maxWinStreak,
      longestLossStreak: maxLossStreak,
      recentGames: recent
    };
  }, [games]);

  const { currentStreak, currentStreakType, longestWinStreak, longestLossStreak, recentGames } = streakData;

  // Decide Icon and style class
  let StreakIcon = Activity;
  let streakLabelClass = styles.streakNeutral;
  let streakText = 'No Active Streak';

  if (currentStreakType === 'win') {
    StreakIcon = Flame;
    streakLabelClass = styles.streakWin;
    streakText = `${currentStreak} Win${currentStreak > 1 ? 's' : ''}`;
  } else if (currentStreakType === 'loss') {
    StreakIcon = TrendingDown;
    streakLabelClass = styles.streakLoss;
    streakText = `${currentStreak} Loss${currentStreak > 1 ? 'es' : ''}`;
  }

  return (
    <div className={styles.streakCard}>
      <div className={styles.streakHeader}>
        <h3 className={styles.streakTitle}>Active Streak</h3>
        <StreakIcon className={`${styles.streakIcon} ${streakLabelClass}`} size={20} />
      </div>
      
      <div className={styles.streakBody}>
        <p className={`${styles.streakValue} ${streakLabelClass}`}>
          {streakText}
        </p>

        {/* Recent Form */}
        <div className={styles.recentFormContainer}>
          <div className={styles.recentFormLabel}>Recent Form</div>
          <div className={styles.recentDotsRow}>
            {games.length === 0 ? (
              <span className={styles.noFormText}>No games played</span>
            ) : (
              recentGames.map((game, index) => {
                let dotClass = styles.dotBreakeven;
                let letter = 'D';
                if (game.isWin) {
                  dotClass = styles.dotWin;
                  letter = 'W';
                } else if (game.isLoss) {
                  dotClass = styles.dotLoss;
                  letter = 'L';
                }

                return (
                  <div key={game.id || index} className={styles.dotWrapper}>
                    <div className={`${styles.recentDot} ${dotClass}`}>
                      {letter}
                    </div>
                    {/* CSS Tooltip */}
                    <div className={styles.tooltip}>
                      <div className={styles.tooltipHeader}>
                        <span className={styles.tooltipDate}>{format(parseISO(game.date), 'MMM d, yyyy')}</span>
                        <span className={styles.tooltipType}>{game.type ? game.type.charAt(0).toUpperCase() + game.type.slice(1) : 'Cash'}</span>
                      </div>
                      <div className={styles.tooltipDivider} />
                      <div className={styles.tooltipBody}>
                        <div className={styles.tooltipRow}>
                          <span className={styles.tooltipLabel}>P/L:</span>
                          <span className={`${styles.tooltipValue} ${game.profit > 0 ? styles.textPositive : game.profit < 0 ? styles.textNegative : ''}`}>
                            {game.profit > 0 ? '+' : ''}{formatCurrency(game.profit)}
                          </span>
                        </div>
                        <div className={styles.tooltipRow}>
                          <span className={styles.tooltipLabel}>Host:</span>
                          <span className={styles.tooltipValue}>{game.host}</span>
                        </div>
                        <div className={styles.tooltipRow}>
                          <span className={styles.tooltipLabel}>Buy-ins:</span>
                          <span className={styles.tooltipValue}>{game.buyIns} × {formatCurrency(game.buyInAmount)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Record Stats */}
        <div className={styles.streakFooter}>
          <span className={styles.recordItem}>Max Win: {longestWinStreak}</span>
          <span className={styles.recordDivider}>•</span>
          <span className={styles.recordItem}>Max Loss: {longestLossStreak}</span>
        </div>
      </div>
    </div>
  );
}
