import { cn } from "@/lib/utils";
import { DataStatus } from "@/types/market";

interface StatusBadgeProps {
  status: DataStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = {
    LIVE: { color: "bg-green-500", text: "text-green-600 dark:text-green-400", label: "LIVE" },
    STALE: { color: "bg-yellow-500", text: "text-yellow-600 dark:text-yellow-400", label: "STALE" },
    OFFLINE: { color: "bg-red-500", text: "text-red-600 dark:text-red-400", label: "OFFLINE" },
    LOADING: { color: "bg-gray-400", text: "text-gray-600 dark:text-gray-400", label: "SYNCING" },
  };

  const current = config[status];

  return (
    <div className={cn("flex items-center gap-1.5 px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800", current.text)}>
      <span className={cn("w-1.5 h-1.5 rounded-full", current.color, status === 'LIVE' && "animate-pulse")} />
      <span className="text-[10px] font-bold uppercase tracking-wider">{current.label}</span>
    </div>
  );
}