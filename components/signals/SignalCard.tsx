import { SignalResult } from "@/lib/signalEngine";
import { TrendingUp, TrendingDown, Minus, ShieldAlert } from "lucide-react";
import { RiskCalculator } from "@/components/risk/RiskCalculator";

interface SignalCardProps {
  analysis: SignalResult;
  asset: string;
  marketType: string;
}

export function SignalCard({ analysis, asset, marketType }: SignalCardProps) {
  const { score, direction, trend, momentum, reasons, invalidation, entry, sl, tp1 } = analysis;
  
  const isLong = direction === 'LONG';
  const isShort = direction === 'SHORT';
  const isWait = direction === 'WAIT';

  const dirColor = isLong ? "text-green-600 dark:text-green-400" : isShort ? "text-red-600 dark:text-red-400" : "text-gray-500";
  const dirBg = isLong ? "bg-green-100 dark:bg-green-900/30" : isShort ? "bg-red-100 dark:bg-red-900/30" : "bg-gray-100 dark:bg-gray-700";
  const DirIcon = isLong ? TrendingUp : isShort ? TrendingDown : Minus;

  const displayDirection = marketType === 'FUTURES' ? direction : (direction === 'LONG' ? 'BUY' : direction === 'SHORT' ? 'SELL' : 'WAIT');

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${dirBg}`}>
            <DirIcon className={`w-5 h-5 ${dirColor} ${isShort ? 'rotate-180' : ''}`} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white">{asset}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">{marketType} • {displayDirection}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500 dark:text-gray-400">Signal Score</p>
          <p className={`text-xl font-bold ${dirColor}`}>{score}/100</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs mb-4">
        <div className="bg-gray-50 dark:bg-gray-900/50 p-2 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">Trend</p>
          <p className="font-semibold text-gray-900 dark:text-white">{trend}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900/50 p-2 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">Momentum</p>
          <p className="font-semibold text-gray-900 dark:text-white">{momentum}</p>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Why this signal?</p>
        <ul className="space-y-1">
          {reasons.map((reason, i) => (
            <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-1.5 flex-shrink-0"></span>
              {reason}
            </li>
          ))}
        </ul>
      </div>

      {!isWait && (
        <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-2">
          <ShieldAlert className="w-4 h-4 text-yellow-500 flex-shrink-0" />
          <span><strong>Invalidation:</strong> Price closes beyond {invalidation}</span>
        </div>
      )}

      <RiskCalculator 
        defaultEntry={entry} 
        defaultSL={sl} 
        defaultTP={tp1} 
        direction={direction} 
        asset={asset} 
        marketType={marketType === 'FUTURES' ? 'FUTURES' : 'SPOT'} 
      />
    </div>
  );
}