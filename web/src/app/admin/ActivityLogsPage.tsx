import { useMemo, useState } from "react";
import {
  Download,
  FilterX,
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
import { QueryBoundary } from "@/features/admin/components/states";
import { useActivityLogs } from "@/features/admin/queries";
import type { ActivityLogRow } from "@/features/admin/api";
import { sageErrorText } from "@/lib/queryClient";

const PAGE_SIZE = 20;

function humanizeAction(action: string): string {
  const text = action.replace(/_/g, " ").trim();
  if (!text) return "System event";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

const entityStyles: Record<string, string> = {
  user: "bg-admin-royal-soft text-admin-royal",
  course: "bg-[#E8EEF7] text-[#4059AA]",
  department: "bg-[#FBF3DD] text-admin-gold-dark",
  permission: "bg-admin-danger-soft text-danger",
  announcement: "bg-green-50 text-success",
};

export default function ActivityLogsPage() {
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState("All Actions");
  const [entityFilter, setEntityFilter] = useState("All Entities");
  const [identity, setIdentity] = useState("");

  const { data, isLoading, error, refetch } = useActivityLogs({
    page,
    limit: PAGE_SIZE,
    action: actionFilter === "All Actions" ? undefined : actionFilter,
  });

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const actionOptions = useMemo(() => {
    const set = new Set<string>();
    for (const log of items) if (log.action) set.add(log.action);
    return [...set];
  }, [items]);

  const entityOptions = useMemo(() => {
    const set = new Set<string>();
    for (const log of items) if (log.entityType) set.add(log.entityType);
    return [...set];
  }, [items]);

  const filtered = useMemo(() => {
    const lower = identity.trim().toLowerCase();
    return items.filter(
      (log) =>
        (entityFilter === "All Entities" || log.entityType === entityFilter) &&
        (lower === "" || (log.userName ?? "").toLowerCase().includes(lower))
    );
  }, [items, entityFilter, identity]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Activity Logs"
        description="Audit trail and event tracking for SAGE Institution"
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setActionFilter("All Actions");
                setEntityFilter("All Entities");
                setIdentity("");
                setPage(1);
              }}
            >
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
      <Card className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-3">
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
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPage(1);
            }}
          >
            <option>All Actions</option>
            {actionOptions.map((a) => (
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
            {entityOptions.map((e) => (
              <option key={e}>{e}</option>
            ))}
          </Select>
        </div>
      </Card>

      {/* Log table */}
      <Card className="overflow-hidden">
        <QueryBoundary
          isLoading={isLoading}
          error={error}
          errorText={sageErrorText(error, "Failed to load activity logs.")}
          onRetry={() => refetch()}
        >
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
              {filtered.map((log: ActivityLogRow) => (
                <TableRow key={log.id}>
                  <TableCell className="whitespace-nowrap font-mono text-xs text-admin-text-muted">
                    {new Date(log.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <Avatar name={log.userName ?? "System"} size="sm" />
                      <div>
                        <p className="text-sm font-medium text-text-primary">
                          {log.userName ?? "SAGE Core"}
                        </p>
                        {log.ipAddress && (
                          <p className="text-xs text-admin-text-muted">{log.ipAddress}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[280px]">
                    <p className="truncate text-sm text-text-primary">
                      {humanizeAction(log.action)}
                    </p>
                  </TableCell>
                  <TableCell>
                    {log.entityType ? (
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${entityStyles[log.entityType] ?? "bg-admin-container-low text-admin-text-muted"}`}
                      >
                        {log.entityType}
                      </span>
                    ) : (
                      <span className="text-xs text-admin-text-muted">—</span>
                    )}
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
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-admin-text-muted">
                    No activity logs match the selected filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </QueryBoundary>
        <div className="flex flex-col items-center justify-between gap-3 border-t border-admin-outline bg-admin-container-low/50 px-4 py-3 sm:flex-row">
          <p className="text-sm text-admin-text-muted">
            Page {page} of {totalPages} · {total.toLocaleString()} logs
          </p>
          <div className="flex items-center gap-1">
            <button
              aria-label="Previous page"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-admin-outline p-1.5 text-admin-text-muted transition-colors hover:bg-white hover:text-admin-royal disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-2 text-sm font-medium text-text-primary">{page}</span>
            <button
              aria-label="Next page"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-lg border border-admin-outline p-1.5 text-admin-text-muted transition-colors hover:bg-white hover:text-admin-royal disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
