import { useState } from "react";
import {
  ShieldCheck,
  Fingerprint,
  History,
  ArrowRight,
  KeyRound,
  Plus,
  Shield,
  Landmark,
  Activity,
  ChevronLeft,
  ChevronRight,
  Info,
  Loader2,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
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
import {
  useGrantPermission,
  useRevokePermission,
  useUserPermissions,
  useUsers,
} from "@/features/admin/queries";
import type { AdminUser } from "@/features/admin/api";
import { sageErrorText } from "@/lib/queryClient";

const AVAILABLE_KEYS = [
  "SYSTEM_ADMIN",
  "DEPARTMENT_HEAD",
  "AUDIT_LOGS",
  "REPORTS",
  "ENROLLMENTS",
  "ANNOUNCEMENTS",
];

const roleCardsIcon = {
  admin_panel_settings: Shield,
  account_balance: Landmark,
  monitoring: Activity,
} as const;

const roleCards = [
  {
    icon: "admin_panel_settings" as const,
    title: "System Roots",
    desc: "Full bypass authority for all institutional nodes. Restricted to Executive Board only.",
  },
  {
    icon: "account_balance" as const,
    title: "Departmental Leads",
    desc: "Curriculum and staff management within specific college branches.",
  },
  {
    icon: "monitoring" as const,
    title: "Audit Officers",
    desc: "Read-only high-level data access for institutional compliance reporting.",
  },
];

function PermissionRow({ user }: { user: AdminUser }) {
  const { data, isLoading } = useUserPermissions(user.id);
  const grant = useGrantPermission(user.id);
  const revoke = useRevokePermission(user.id);
  const [selected, setSelected] = useState("");

  const permissions = data?.permissions ?? [];

  const onAssign = () => {
    if (!selected) return;
    grant.mutate(selected);
    setSelected("");
  };

  return (
    <TableRow key={user.id}>
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar name={user.fullName} size="sm" />
          <div>
            <p className="font-medium text-text-primary">{user.fullName}</p>
            <p className="text-xs text-admin-text-muted">{user.email}</p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        {isLoading ? (
          <span className="text-xs text-admin-text-muted">Loading keys…</span>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {permissions.map((key) => (
              <span
                key={key}
                className="inline-flex items-center gap-1 rounded-full border border-admin-royal-soft bg-admin-royal-soft/50 px-2.5 py-0.5 text-xs font-semibold text-admin-royal"
              >
                <KeyRound className="h-3 w-3" />
                {key}
                <button
                  aria-label={`Revoke ${key}`}
                  disabled={revoke.isPending}
                  onClick={() => revoke.mutate(key)}
                  className="text-admin-royal/60 transition-colors hover:text-danger"
                >
                  ×
                </button>
              </span>
            ))}
            {permissions.length === 0 && (
              <span className="text-xs text-admin-text-muted">No custom keys</span>
            )}
          </div>
        )}
        {grant.error && (
          <p className="mt-1.5 text-xs text-danger">{sageErrorText(grant.error)}</p>
        )}
      </TableCell>
      <TableCell>
        <div className="flex items-center justify-end gap-2">
          <Select
            className="h-9 w-44 py-0 text-xs"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            aria-label={`Assign key to ${user.fullName}`}
          >
            <option value="">Assign Key...</option>
            {AVAILABLE_KEYS.filter((k) => !permissions.includes(k)).map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </Select>
          <button
            aria-label={`Assign key to ${user.fullName}`}
            disabled={!selected || grant.isPending}
            onClick={onAssign}
            className="rounded-lg p-2 text-admin-text-muted transition-colors hover:bg-admin-container-low hover:text-admin-royal disabled:cursor-not-allowed disabled:opacity-40"
          >
            {grant.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </button>
        </div>
      </TableCell>
    </TableRow>
  );
}

export default function PermissionsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error, refetch } = useUsers({ page, limit: 20 });

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / 20));
  const admins = items.filter((u) => u.role === "admin").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Permissions Management"
        description="Configure elevated access levels and system-wide security keys for academic staff."
      />

      {/* Security overview */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="flex items-center gap-4 p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-admin-royal-soft text-admin-royal">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-admin-text-muted">
              Total Users
            </p>
            <p className="text-2xl font-bold leading-none tracking-tight text-text-primary">
              {total.toLocaleString()}
            </p>
          </div>
        </Card>
        <Card className="flex items-center gap-4 p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-success">
            <Fingerprint className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-admin-text-muted">
              Admins (in view)
            </p>
            <p className="text-2xl font-bold leading-none tracking-tight text-text-primary">
              {admins}
            </p>
          </div>
        </Card>
        <Card className="flex flex-row items-center justify-between gap-4 p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-admin-gold-soft text-admin-gold-dark">
              <History className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-admin-text-muted">
                Audit Trail
              </p>
              <p className="text-sm font-semibold text-text-primary">
                Permission changes logged to activity
              </p>
            </div>
          </div>
          <button
            aria-label="View audit history"
            className="rounded-lg p-2 text-admin-royal transition-colors hover:bg-admin-royal-soft"
          >
            <ArrowRight className="h-5 w-5" />
          </button>
        </Card>
      </section>

      {/* Authorized personnel */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h4 className="text-lg font-semibold tracking-tight">
              Authorized Personnel
            </h4>
            <p className="text-sm text-admin-text-muted">
              Grant and revoke access keys per user.
            </p>
          </div>
        </div>

        <Card className="overflow-hidden">
          <QueryBoundary
            isLoading={isLoading}
            error={error}
            errorText={sageErrorText(error, "Failed to load users.")}
            onRetry={() => refetch()}
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Current Access</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((u) => (
                  <PermissionRow key={u.id} user={u} />
                ))}
                {items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="py-10 text-center text-admin-text-muted">
                      No users found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </QueryBoundary>
          <div className="flex flex-col items-center justify-between gap-3 border-t border-admin-outline bg-admin-container-low/50 px-4 py-3 sm:flex-row">
            <p className="text-sm text-admin-text-muted">
              Page {page} of {totalPages} · {total.toLocaleString()} users
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

      {/* Role cards */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {roleCards.map(({ icon, title, desc }) => {
          const Icon = roleCardsIcon[icon] ?? Info;
          return (
            <Card key={title} className="group p-5 transition-colors hover:border-admin-royal/40">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-admin-royal-soft text-admin-royal transition-transform group-hover:scale-105">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <h5 className="text-base font-semibold tracking-tight text-text-primary">
                {title}
              </h5>
              <p className="mt-1.5 text-sm leading-relaxed text-admin-text-muted">
                {desc}
              </p>
            </Card>
          );
        })}
      </section>
    </div>
  );
}
