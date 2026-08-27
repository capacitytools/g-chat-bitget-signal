function SignalRecordCard({ signal }: { signal: FeedSignal }) {
  const isWin = signal.status === 'WIN';
  const isLong = signal.direction === 'LONG';
  const date = new Date(signal.signalTime);
  const formattedDate = date.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
  const startTime = date.toLocaleTimeString();
  const endTime = new Date(signal.expireTime).toLocaleTimeString();
  
  // FIX: Use signal.pnl directly
  const finalPnl = signal.pnl || 0;

  return (
    <div className={`border-l-4 rounded-xl p-4 w-full max-w-2xl mx-auto mb-3 bg-white dark:bg-gray-800 shadow-sm ${isWin ? 'border-l-green-500' : 'border-l-red-500'}`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isLong ? 'bg-green-500' : 'bg-red-500'}`}>
            {isLong ? <TrendingUp className="w-7 h-7 text-white" /> : <TrendingDown className="w-7 h-7 text-white" />}
          </div>
          <div>
            <p className="text-base font-bold text-gray-900 dark:text-white">{signal.asset}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{signal.timeframe} • {signal.direction} • {signal.marketType}</p>
          </div>
        </div>
        <div className={`px-3 py-1.5 rounded-lg ${isWin ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
          <div className="flex items-center gap-1">
            {isWin ? <Trophy className="w-4 h-4 text-green-600 dark:text-green-400" /> : <X className="w-4 h-4 text-red-600 dark:text-red-400" />}
            <span className={`text-sm font-bold ${isWin ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {isWin ? 'WIN' : 'LOSS'}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 mb-3">
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <p className="text-gray-500 dark:text-gray-400 mb-1">Signal Time</p>
            <p className="font-semibold text-gray-900 dark:text-white">{startTime}</p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400 mb-1">Expired Time</p>
            <p className="font-semibold text-gray-900 dark:text-white">{endTime}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
          <Clock className="w-4 h-4" />
          <span>{formattedDate}</span>
        </div>
        <div className={`text-lg font-black ${isWin ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
          {finalPnl >= 0 ? '+' : ''}{finalPnl.toFixed(2)}%
        </div>
      </div>
    </div>
  );
}