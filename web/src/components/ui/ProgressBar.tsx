import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  label?: string;
  size?: "sm" | "md";
  color?: string;
  className?: string;
}

export function ProgressBar({
  value,
  label,
  size = "md",
  color,
  className,
}: ProgressBarProps) {
  return (
    <div className={cn("w-full", className)}>
      {(label || value !== undefined) && (
        <div className="mb-1 flex items-center justify-between text-xs">
          {label && <span className="text-text-secondary">{label}</span>}
          <span className="font-medium text-text-primary">
            {Math.round(value)}%
          </span>
        </div>
      )}
      <div
        className={cn(
          "w-full overflow-hidden rounded-full bg-border",
          size === "sm" ? "h-1.5" : "h-2.5"
        )}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300",
            color || "bg-accent"
          )}
          style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
        />
      </div>
    </div>
  );
}
