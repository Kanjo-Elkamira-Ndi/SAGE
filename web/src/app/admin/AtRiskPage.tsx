import { useMemo, useState } from "react";
import {
  FileDown,
  TriangleAlert,
  CircleAlert,
  TrendingUp,
  GraduationCap,
  SlidersHorizontal,
  Sparkles,
  ShieldAlert,
  RefreshCw,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import { PageHeader } from "@/features/admin/components/ui";
import { RiskBadge } from "@/features/admin/components/badges";
import { ProgressBar } from "@/components/ui/Chart";
import { QueryBoundary } from "@/features/admin/components/states";
import {
  useAtRiskReport,
  useExportAtRisk,
  useRecomputeSnapshots,
} from "@/features/admin/queries";
import type { AtRiskStudent, RiskLevel } from "@/features/admin/api";
import { sageErrorText } from "@/lib/queryClient";

const riskLevelFilters: Array<"All Levels" | RiskLevel> = [
  "All Levels",
  "high",
  "medium",
  "low",
];

function RiskKpi({
  icon,
  label,
  value,
  chipClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  chipClass: string;
}) {
  return (
    <Card className="flex items-center gap-4 p-4">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${chipClass}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-admin-text-muted">{label}</p>
        <p className="text-xl font-bold leading-none tracking-tight text-text-primary">
          {value}
        </p>
      </div>
    </Card>
  );
}

export default function AtRiskPage() {
  const [levelFilter, setLevelFilter] = useState<"All Levels" | RiskLevel>("All Levels");

  const { data, isLoading, error, refetch } = useAtRiskReport({
    level: levelFilter === "All Levels" ? undefined : levelFilter,
  });
  const exportCsv = useExportAtRisk();
  const recompute = useRecomputeSnapshots();

  const items = data?.items ?? [];

  const filtered = useMemo(
    () => items.filter((s) => levelFilter === "All Levels" || s.riskLevel === levelFilter),
    [items, levelFilter],
  );

  const counts = useMemo(() => {
    let high = 0;
    let medium = 0;
    let low = 0;
    for (const s of items) {
      if (s.riskLevel === "high") high += 1;
      else if (s.riskLevel === "medium") medium += 1;
      else low += 1;
    }
    return { high, medium, low };
  }, [items]);

  const avgScore = items.length
    ? Math.round((items.reduce((acc, s) => acc + s.riskScore, 0) / items.length) * 100) / 100
    : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="At-Risk Students Report"
        description="Identification of learners requiring immediate academic intervention based on risk analytics."
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              disabled={exportCsv.isPending}
              onClick={() =>
                exportCsv.mutate({
                  level: levelFilter === "All Levels" ? undefined : levelFilter,
                })
              }
            >
              <FileDown className="h-4 w-4" />
              Export CSV
            </Button>
            <Button
              size="sm"
              disabled={recompute.isPending}
              onClick={() => recompute.mutate(undefined)}
            >
              <RefreshCw className={`h-4 w-4 ${recompute.isPending ? "animate-spin" : ""}`} />
              Recompute Snapshots
            </Button>
          </>
        }
      />

      <QueryBoundary
        isLoading={isLoading}
        error={error}
        errorText={sageErrorText(error, "Failed to load at-risk report.")}
        onRetry={() => refetch()}
      >
        {/* KPI strip */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <RiskKpi
            icon={<TriangleAlert className="h-5 w-5" />}
            label="High Risk"
            value={counts.high.toString()}
            chipClass="bg-admin-danger-soft text-danger"
          />
          <RiskKpi
            icon={<CircleAlert className="h-5 w-5" />}
            label="Medium Risk"
            value={counts.medium.toString()}
            chipClass="bg-amber-50 text-admin-gold-dark"
          />
          <RiskKpi
            icon={<TrendingUp className="h-5 w-5" />}
            label="Avg. Risk Score"
            value={`${avgScore}%`}
            chipClass="bg-admin-royal-soft text-admin-royal"
          />
          <RiskKpi
            icon={<GraduationCap className="h-5 w-5" />}
            label="Low Risk"
            value={counts.low.toString()}
            chipClass="bg-[#E8EEF7] text-[#4059AA]"
          />
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Risk table */}
          <div className="space-y-4 lg:col-span-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-1 flex items-center gap-1.5 text-sm font-medium text-admin-text-muted">
                <SlidersHorizontal className="h-4 w-4" />
                Filter:
              </span>
              {riskLevelFilters.map((f) => (
                <button
                  key={f}
                  onClick={() => setLevelFilter(f)}
                  className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                    levelFilter === f
                      ? "border-admin-royal bg-admin-royal text-white"
                      : "border-admin-outline bg-white text-admin-text-muted hover:border-admin-royal hover:text-admin-royal"
                  }`}
                >
                  {f === "All Levels" ? "All Levels" : f.toUpperCase()}
                </button>
              ))}
              <span className="ml-auto text-sm font-semibold text-admin-text-muted">
                Showing {filtered.length} of {items.length} students
              </span>
            </div>

            <Card className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Risk Level</TableHead>
                    <TableHead>Risk Score</TableHead>
                    <TableHead>GPA</TableHead>
                    <TableHead>Reasons</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((s: AtRiskStudent) => (
                    <TableRow key={s.studentId}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar name={s.name} size="sm" />
                          <div>
                            <p className="font-medium text-text-primary">{s.name}</p>
                            <p className="text-xs text-admin-text-muted">
                              ID: {s.studentId}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-admin-text-muted">{s.email}</TableCell>
                      <TableCell>
                        <RiskBadge level={s.riskLevel.toUpperCase() as "HIGH" | "MEDIUM" | "LOW"} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="w-9 font-semibold text-text-primary">
                            {s.riskScore}%
                          </span>
                          <ProgressBar
                            value={s.riskScore}
                            color={
                              s.riskLevel === "high"
                                ? "#C0362C"
                                : s.riskLevel === "medium"
                                  ? "#FFC641"
                                  : "#1E8E5A"
                            }
                            className="w-16"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-admin-text-muted">
                        {s.gpa ?? "—"}
                      </TableCell>
                      <TableCell className="max-w-[220px]">
                        <p className="truncate text-xs text-admin-text-muted">
                          {s.reasons.length > 0 ? s.reasons.join(" · ") : "—"}
                        </p>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="py-10 text-center text-admin-text-muted">
                        No at-risk students at this level.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Card>
          </div>

          {/* Side panel */}
          <div className="space-y-6">
            <Card className="border-admin-gold-soft bg-admin-gold-soft/40 p-5">
              <div className="mb-3 flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-admin-gold text-text-primary">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-base font-semibold tracking-tight">
                    Automated Intervention Workflow
                  </h4>
                  <p className="text-xs font-medium text-admin-gold-dark">
                    Academic Precision system
                  </p>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-admin-text-muted">
                Our Academic Precision system automatically flags students whose
                scores exceed the 60% risk threshold. Advisors are notified within
                24 hours.
              </p>
              <div className="mt-4 space-y-2.5">
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2 text-sm">
                  <span className="flex items-center gap-2 text-admin-text-muted">
                    <Sparkles className="h-4 w-4 text-admin-royal" />
                    Predictive Analytics
                  </span>
                  <span className="font-semibold text-success">Enabled</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2 text-sm">
                  <span className="flex items-center gap-2 text-admin-text-muted">
                    <ShieldAlert className="h-4 w-4 text-admin-royal" />
                    Snapshot Date
                  </span>
                  <span className="font-semibold text-text-primary">
                    {items[0]?.lastSnapshotDate
                      ? new Date(items[0].lastSnapshotDate).toLocaleDateString()
                      : "—"}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </QueryBoundary>
    </div>
  );
}
