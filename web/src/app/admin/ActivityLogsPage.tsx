import { useMemo, useState } from "react";
import {
  Download,
  FilterX,
  CalendarDays,
  UserSearch,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
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
import {
  activityLogs,
  logActionTypes,
  logEntityTypes,
  type ActivityLog,
  type LogCategory,
} from "@/features/admin/data";

const categoryStyles: Record<LogCategory, string> = {
  Academic: "bg-admin-royal-soft text-admin-royal",
  Evaluation: "bg-[#E8EEF7] text-[#4059AA]",
  Security: "bg-admin-danger-soft text-danger",
  System: "bg-admin-container-low text-admin-text-muted",
  Organization: "bg-[#FBF3DD] text-admin-gold-dark",
  Finance: "bg-green-50 text-success",
};

export default function ActivityLogsPage() {
  const [actionFilter, setActionFilter] = useState("All Actions");
  const [entityFilter, setEntityFilter] = useState("All Entities");
  const [identity, setIdentity] = useState("");

  const filtered = useMemo(() => {
    return activityLogs.filter((log: ActivityLog) => {
      const matchesAction =
        actionFilter === "All Actions" || log.action.startsWith(actionFilter.replace("s$", ""));
      const matchesEntity =
        entityFilter === "All Entities" || log.category === entityFilter;
      const matchesIdentity =
        identity.trim() === "" ||
        log.user.toLowerCase().includes(identity.toLowerCase());
      return matchesAction && matchesEntity && matchesIdentity;
    });
  }, [actionFilter, entityFilter, identity]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Activity Logs"
        description="Audit trail and event tracking for SAGE Institution"
        actions={
          <>
            <Button variant="secondary" size="sm">
              <FilterX className="h-4 w-4" />
              Clear
            </Button>
            <Button size="sm">
              <Download className="h-4 w-4" />
              Export Logs
            </Button>
          </>
        }
      />

      {/* Filters */}
      <Card className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-admin-text-muted">
            <CalendarDays className="h-3.5 w-3.5" />
            Date Range
          </label>
          <Input type="date" defaultValue="2023-10-01" />
        </div>
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-admin-text-muted">
            <UserSearch className="h-3.5 w-3.5" />
            User Identity
          </label>
          <Input
            type="text"
            placeholder="Search user..."
            value={identity}
            onChange={(e) => setIdentity(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-admin-text-muted">
            Action Type
          </label>
          <Select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
          >
            {logActionTypes.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </Select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-admin-text-muted">
            Entity Type
          </label>
          <Select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
          >
            <option>All Entities</option>
            {logEntityTypes.map((e) => (
              <option key={e}>{e}</option>
            ))}
          </Select>
        </div>
      </Card>

      {/* Log table */}
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Entity Type</TableHead>
              <TableHead className="text-right">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((log: ActivityLog) => (
              <TableRow key={log.id}>
                <TableCell className="whitespace-nowrap font-mono text-xs text-admin-text-muted">
                  {log.timestamp}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <Avatar name={log.user} size="sm" />
                    <div>
                      <p className="text-sm font-medium text-text-primary">
                        {log.user}
                      </p>
                      <p className="text-xs text-admin-text-muted">{log.role}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="max-w-[280px]">
                  <p className="truncate text-sm text-text-primary">{log.action}</p>
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${categoryStyles[log.category]}`}
                  >
                    {log.category}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end">
                    <button
                      aria-label={`View details for ${log.action}`}
                      className="rounded-lg p-2 text-admin-text-muted transition-colors hover:bg-admin-container-low hover:text-admin-royal"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex flex-col items-center justify-between gap-3 border-t border-admin-outline bg-admin-container-low/50 px-4 py-3 sm:flex-row">
          <p className="text-sm text-admin-text-muted">
            Showing {filtered.length} of 1,248 logs
          </p>
          <div className="flex items-center gap-1">
            <button
              aria-label="Previous page"
              className="rounded-lg border border-admin-outline p-1.5 text-admin-text-muted transition-colors hover:bg-white hover:text-admin-royal"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="rounded-md bg-admin-royal px-2.5 py-1 text-sm font-medium text-white">
              1
            </span>
            <span className="px-1 text-sm text-admin-text-muted">48</span>
            <button
              aria-label="Next page"
              className="rounded-lg border border-admin-outline p-1.5 text-admin-text-muted transition-colors hover:bg-white hover:text-admin-royal"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
