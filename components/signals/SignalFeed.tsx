if (isLoading) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">G-Chat Signal</h1>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">Live Futures Feed</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-yellow-600 dark:text-yellow-400">
            <RefreshCw className="w-3 h-3 animate-spin" />
            LOADING
          </div>
        </div>
      </div>

      {/* Debug Info */}
      <div className="p-4 mt-4">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-400 mb-2">
            🔍 Debug Info:
          </p>
          <p className="text-xs text-yellow-700 dark:text-yellow-500 font-mono">
            {debugInfo || 'Initializing...'}
          </p>
        </div>
        
        <div className="mt-4 text-center">
          <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Zap className="w-8 h-8 text-primary-500" />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Please wait while we scan the markets...
          </p>
        </div>
      </div>
    </div>
  );
}