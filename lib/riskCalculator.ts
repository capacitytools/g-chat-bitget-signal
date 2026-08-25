export interface RiskInputs {
  balance: number;
  riskPercent: number;
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  leverage: number;
}

export interface RiskResults {
  riskAmount: number;
  positionSize: number;
  marginRequired: number;
  potentialLoss: number;
  potentialProfit: number;
  riskRewardRatio: number;
  isValid: boolean;
  errorMessage?: string;
}

export function calculateRisk(inputs: RiskInputs): RiskResults {
  const { balance, riskPercent, entryPrice, stopLoss, takeProfit, leverage } = inputs;

  if (entryPrice <= 0 || stopLoss <= 0 || takeProfit <= 0) {
    return {
      riskAmount: 0, positionSize: 0, marginRequired: 0,
      potentialLoss: 0, potentialProfit: 0, riskRewardRatio: 0,
      isValid: false, errorMessage: "Prices must be greater than 0."
    };
  }

  if (stopLoss === entryPrice) {
    return {
      riskAmount: 0, positionSize: 0, marginRequired: 0,
      potentialLoss: 0, potentialProfit: 0, riskRewardRatio: 0,
      isValid: false, errorMessage: "Stop loss cannot equal entry price."
    };
  }

  const riskAmount = balance * (riskPercent / 100);
  const slDistancePercent = Math.abs(entryPrice - stopLoss) / entryPrice;
  
  // Position size is determined by how much we can lose divided by the SL distance
  const positionSize = riskAmount / slDistancePercent;
  const marginRequired = positionSize / leverage;

  if (marginRequired > balance) {
    return {
      riskAmount, positionSize, marginRequired,
      potentialLoss: 0, potentialProfit: 0, riskRewardRatio: 0,
      isValid: false, errorMessage: `Margin required ($${marginRequired.toFixed(2)}) exceeds balance ($${balance}). Lower leverage or increase balance.`
    };
  }

  const tpDistancePercent = Math.abs(takeProfit - entryPrice) / entryPrice;
  const potentialProfit = positionSize * tpDistancePercent;
  const riskRewardRatio = potentialProfit / riskAmount;

  return {
    riskAmount,
    positionSize,
    marginRequired,
    potentialLoss: riskAmount, // By definition, if SL is hit, we lose the risk amount
    potentialProfit,
    riskRewardRatio,
    isValid: true
  };
}