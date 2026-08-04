import * as React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/Card";

/* ============================================================
 * PageHeader — consistent page title block with optional actions
 * ============================================================ */
interface PageHeaderProps {
  title: string;
  description: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col justify-between gap-4 md:flex-row md:items-end",
        className
      )}
    >
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-primary">{title}</h2>
        <p className="mt-1 text-sm text-admin-text-muted">{description}</p>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2.5">{actions}</div>}
    </div>
  );
}

/* ============================================================
 * StatCard — KPI metric card with icon chip + trend tag
 * ============================================================ */
export interface StatCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  trend?: { text: string; tone?: "positive" | "neutral" | "warning" };
  iconChipClass?: string;
  iconToneClass?: string;
  className?: string;
}

export function StatCard({
  label,
  value,
  icon,
  trend,
  iconChipClass = "bg-admin-royal-soft text-admin-royal",
  className,
}: StatCardProps) {
  const toneClass =
    trend?.tone === "positive"
      ? "text-success"
      : trend?.tone === "warning"
        ? "text-admin-gold-dark"
        : "text-admin-text-muted";

  return (
    <Card className="flex flex-col justify-between p-4">
      <div className="mb-3 flex items-start justify-between">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg",
            iconChipClass
          )}
        >
          {icon}
        </div>
        {trend && (
          <span className={cn("flex items-center gap-1 text-xs font-semibold", toneClass)}>
            {trend.text}
          </span>
        )}
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-admin-text-muted">
          {label}
        </p>
        <p className="mt-1 text-2xl font-bold leading-none tracking-tight text-text-primary">
          {value}
        </p>
      </div>
    </Card>
  );
}
