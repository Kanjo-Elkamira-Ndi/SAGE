import { useMemo, useState } from "react";
import {
  FileDown,
  Mail,
  TriangleAlert,
  CircleAlert,
  TrendingUp,
  GraduationCap,
  SlidersHorizontal,
  Eye,
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
import { RiskBadge, StatusBadge } from "@/features/admin/components/badges";
import { ProgressBar } from "@/components/ui/Chart";
import { atRiskKpis, atRiskStudents, riskFactors, type AtRiskStudent } from "@/features/admin/data";

const riskLevelFilters = ["All Levels", "HIGH", "MEDIUM", "LOW"];

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
  const [levelFilter, setLevelFilter] = useState("All Levels");

  const filtered = useMemo(() => {
    return atRiskStudents.filter(
      (s) => levelFilter === "All Levels" || s.level === levelFilter
    );
  }, [levelFilter]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="At-Risk Students Report"
        description="Identification of learners requiring immediate academic intervention based on Q3 analytics."
        actions={
          <>
            <Button variant="secondary" size="sm">
              <FileDown className="h-4 w-4" />
              Export
            </Button>
            <Button size="sm">
              <Mail className="h-4 w-4" />
              Notify Advisors
            </Button>
          </>
        }
      />

      {/* KPI strip */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <RiskKpi
          icon={<TriangleAlert className="h-5 w-5" />}
          label="High Risk"
          value={atRiskKpis.high}
          chipClass="bg-admin-danger-soft text-danger"
        />
        <RiskKpi
          icon={<CircleAlert className="h-5 w-5" />}
          label="Medium Risk"
          value={atRiskKpis.medium}
          chipClass="bg-amber-50 text-admin-gold-dark"
        />
        <RiskKpi
          icon={<TrendingUp className="h-5 w-5" />}
          label="Avg. Risk Score"
          value={atRiskKpis.avgScore}
          chipClass="bg-admin-royal-soft text-admin-royal"
        />
        <RiskKpi
          icon={<GraduationCap className="h-5 w-5" />}
          label="Active Actions"
          value={atRiskKpis.activeActions}
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
                {f}
              </button>
            ))}
            <span className="ml-auto text-sm font-semibold text-admin-text-muted">
              Showing 1-{filtered.length} of 170 students
            </span>
          </div>

          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Risk Level</TableHead>
                  <TableHead>Risk Score</TableHead>
                  <TableHead>Primary Factor</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((s: AtRiskStudent) => (
                  <TableRow key={s.id}>
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
                    <TableCell>
                      <p className="text-sm font-medium text-text-primary">
                        {s.course}
                      </p>
                      <p className="text-xs text-admin-text-muted">
                        {s.department}
                      </p>
                    </TableCell>
                    <TableCell>
                      <RiskBadge level={s.level} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="w-9 font-semibold text-text-primary">
                          {s.score}%
                        </span>
                        <ProgressBar
                          value={s.score}
                          color={
                            s.level === "HIGH"
                              ? "#C0362C"
                              : s.level === "MEDIUM"
                                ? "#FFC641"
                                : "#1E8E5A"
                          }
                          className="w-16"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={s.factor} />
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        <button
                          aria-label={`View details for ${s.name}`}
                          className="flex items-center gap-1.5 rounded-lg border border-admin-outline px-3 py-1.5 text-sm font-medium text-admin-royal transition-colors hover:bg-admin-royal-soft"
                        >
                          <Eye className="h-4 w-4" />
                          View Details
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex items-center justify-between border-t border-admin-outline bg-admin-container-low/50 px-4 py-3">
              <p className="text-sm text-admin-text-muted">Previous</p>
              <div className="flex items-center gap-1">
                <span className="rounded-md bg-admin-royal px-2.5 py-1 text-sm font-medium text-white">
                  1
                </span>
                <span className="px-1 text-sm text-admin-text-muted">17</span>
              </div>
              <p className="text-sm text-admin-text-muted">Next</p>
            </div>
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
                  Next Batch
                </span>
                <span className="font-semibold text-text-primary">08:00 AM</span>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h4 className="text-base font-semibold tracking-tight">
                Risk Factor Distribution
              </h4>
              <Button variant="secondary" size="sm">
                <RefreshCw className="h-3.5 w-3.5" />
                Recalculate
              </Button>
            </div>
            <div className="space-y-4">
              {riskFactors.map((f) => (
                <div key={f.label}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="text-admin-text-muted">{f.label}</span>
                    <span className="font-semibold text-text-primary">
                      {f.value}%
                    </span>
                  </div>
                  <ProgressBar
                    value={f.value}
                    color={f.label === "LMS Engagement" ? "#90A8FF" : "#00236F"}
                  />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
