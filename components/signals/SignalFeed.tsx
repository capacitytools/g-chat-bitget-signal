// ... (all the previous code for SignalCard, SignalRecordCard, TabSelector)

export function SignalFeed() {
  const [activeTab, setActiveTab] = useState<TabType>('FUTURES');
  const [marketType, setMarketType] = useState<'FUTURES' | 'SPOT'>('FUTURES');
  const { signals, signalRecord, isLoading, isScanning } = useSignalFeed(marketType);

  useEffect(() => {
    if (activeTab === 'FUTURES') setMarketType('FUTURES');
    else if (activeTab === 'SPOT') setMarketType('SPOT');
  }, [activeTab]);

  const totalWins = signalRecord.filter(s => s.status === 'WIN').length;
  const totalLosses = signalRecord.filter(s => s.status === 'LOSS').length;
  const winRate = signalRecord.length > 0 ? ((totalWins / signalRecord.length) * 100).toFixed(1) : '0.0';
  const totalPnl = signalRecord.reduce((sum, s) => sum + (s.pnl || 0), 0);

  if (isLoading || (signals.length === 0 && isScanning && activeTab !== 'RECORD')) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Search className="w-10 h-10 text-primary-500 animate-spin" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Scanning {marketType} Markets...</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Analyzing price action for high-probability setups</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <div className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">G-Chat Signal</h1>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">{activeTab === 'RECORD' ? 'Signal History' : `Live ${marketType} Feed`}</p>
            </div>
          </div>
          {activeTab !== 'RECORD' && (
            <div className="flex items-center gap-1.5 text-xs font-medium text-green-600 dark:text-green-400">
              <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span></span>
              LIVE
            </div>
          )}        </div>
        <TabSelector selected={activeTab} onChange={setActiveTab} recordCount={signalRecord.length} />
      </div>

      <div className="p-4 space-y-4">
        {activeTab !== 'RECORD' && (
          <>
            {signals.length > 0 ? signals.map(signal => <SignalCard key={signal.id} signal={signal} />) : (
              <div className="text-center py-8">
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-3 animate-spin" />
                <p className="text-sm text-gray-500 dark:text-gray-400">All signals expired. Scanning for new setups...</p>
              </div>
            )}
          </>
        )}

        {activeTab === 'RECORD' && (
          <div>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-4">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary-500" /> Signal Performance
              </h2>
              <div className="grid grid-cols-4 gap-2">
                <div className="text-center"><p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase">Total</p><p className="text-lg font-bold text-gray-900 dark:text-white">{signalRecord.length}</p></div>
                <div className="text-center"><p className="text-[10px] text-green-500 uppercase">Wins</p><p className="text-lg font-bold text-green-600 dark:text-green-400">{totalWins}</p></div>
                <div className="text-center"><p className="text-[10px] text-red-500 uppercase">Losses</p><p className="text-lg font-bold text-red-600 dark:text-red-400">{totalLosses}</p></div>
                <div className="text-center"><p className="text-[10px] text-primary-500 uppercase">Win Rate</p><p className="text-lg font-bold text-primary-600 dark:text-primary-400">{winRate}%</p></div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 text-center">
                <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase">Total P/L</p>
                <p className={`text-xl font-bold ${totalPnl >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {totalPnl >= 0 ? '+' : ''}{totalPnl.toFixed(2)}%
                </p>
              </div>
            </div>

            {signalRecord.length > 0 ? (
              <div>
                <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-3">All Expired Signals ({signalRecord.length})</h2>
                {signalRecord.map(signal => <SignalRecordCard key={signal.id} signal={signal} />)}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">No Records Yet</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Expired signals will appear here automatically</p>
              </div>
            )}          </div>
        )}
      </div>
    </div>
  );
}