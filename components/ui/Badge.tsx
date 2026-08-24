import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "success" | "warning" | "neutral" | "danger";
  className?: string;
}

export function Badge({ children, variant = "neutral", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide",
        variant === "success" && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
        variant === "warning" && "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
        variant === "neutral" && "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
        variant === "danger" && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
        className
      )}
    >
      {children}
    </span>
  );
}