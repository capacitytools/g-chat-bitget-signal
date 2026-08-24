import { Bot, TrendingUp, Search, Bitcoin, BarChart3, LineChart, Shield, Image } from "lucide-react";

const quickActions = [
  { label: "Find best setup", icon: TrendingUp },
  { label: "Scan Bitget", icon: Search },
  { label: "BTC analysis", icon: Bitcoin },
  { label: "Top 10 assets", icon: BarChart3 },
  { label: "Spot opportunities", icon: LineChart },
  { label: "Futures opportunities", icon: LineChart },
  { label: "Risk check", icon: Shield },
  { label: "Open chart", icon: Image },
];

export function ChatInterface() {
  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      <div className="flex-1 p-4 space-y-4">
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
            <Bot className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-tl-none p-4 shadow-sm max-w-[85%]">
            <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
              Welcome to <span className="font-semibold text-primary-600 dark:text-primary-400">G-Chat Signal</span>. I can scan Bitget markets, explain technical conditions, compare Spot and Futures setups, and help you manage trading risk.
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              How can I help you analyze the market today?
            </p>
          </div>
        </div>

        <div className="pl-11">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Quick Actions</p>
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  className="flex items-center gap-2 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-left text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-95 transition-all shadow-sm"
                >
                  <Icon className="w-4 h-4 text-primary-500" />
                  {action.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-full px-4 py-2">
          <input
            type="text"
            placeholder="Ask about a market or setup..."
            className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 outline-none"
          />
          <button className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white shadow-md active:scale-95 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}