import { SignalCard } from "./SignalCard";
import { ChartPlaceholder } from "./ChartPlaceholder";

export function SignalDashboard() {
  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-bold text-gray-900 dark:text-white">Active Setups</h2>
      
      <ChartPlaceholder />

      <div className="space-y-4">
        <SignalCard 
          asset="BTC/USDT"
          type="Futures"
          direction="LONG"
          score={89}
          entry="64,150"
          sl="63,800"
          tp1="64,800"
          tp2="65,500"
          tp3="66,200"
          rr="1:2.4"
        />
      </div>
    </div>
  );
}