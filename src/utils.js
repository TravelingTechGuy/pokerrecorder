export const formatCurrency = (val) => {
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD' 
  }).format(val);
};

export const getInvestedAmount = (game) => {
  if (!game) return 0;
  return (Number(game.buyIns) || 0) * (Number(game.buyInAmount) || 0);
};

export const getProfit = (game) => {
  if (!game) return 0;
  return (Number(game.cashOutAmount) || 0) - getInvestedAmount(game);
};
