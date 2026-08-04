import { cn } from "@/lib/utils";

/* ============================================================
 * StatusBadge — semantic status pill (Active / Registration / Archived / ...)
 * ============================================================ */
type StatusTone = "active" | "warning" | "muted" | "danger" | "info";

const tones: Record<StatusTone, string> = {
  active: "bg-green-50 text-success border border-green-200",
  warning: "bg-amber-50 text-admin-gold-dark border border-amber-200",
  muted: "bg-admin-container-low text-admin-text-muted border border-admin-outline",
  danger: "bg-red-50 text-danger border border-red-200",
  info: "bg-admin-royal-soft/60 text-admin-royal border border-admin-royal-soft",
};

export function statusTone(status: string): StatusTone {
  const s = status.toLowerCase();
  if (s.includes("active") || s.includes("healthy") || s.includes("open")) return "active";
  if (s.includes("registration") || s.includes("pending") || s.includes("warning")) return "warning";
  if (s.includes("archived") || s.includes("restricted") || s.includes("inactive")) return "muted";
  if (s.includes("high") || s.includes("denied") || s.includes("failed") || s.includes("error")) return "danger";
  return "info";
}

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        tones[statusTone(status)],
        className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {status}
    </span>
  );
}

/* ============================================================
 * RiskBadge — HIGH / MEDIUM / LOW risk with icon
 * ============================================================ */
export function RiskBadge({ level }: { level: "HIGH" | "MEDIUM" | "LOW" }) {
  const cls =
    level === "HIGH"
      ? "bg-red-50 text-danger border-red-200"
      : level === "MEDIUM"
        ? "bg-amber-50 text-admin-gold-dark border-amber-200"
        : "bg-green-50 text-success border-green-200";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold",
        cls
      )}
    >
      {level}
    </span>
  );
}
