import { useEffect, useMemo, useState } from "react";
import {
  Users,
  Activity,
  Clock3,
  Pencil,
  UserX,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
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
import { StatusBadge } from "@/features/admin/components/badges";
import { QueryBoundary } from "@/features/admin/components/states";
import {
  useUsers,
  useUpdateUserRole,
  useUpdateUserStatus,
} from "@/features/admin/queries";
import type { AdminRole, AdminUser } from "@/features/admin/api";
import { sageErrorText } from "@/lib/queryClient";

const PAGE_SIZE = 20;

const roleChip: Record<AdminRole, string> = {
  admin: "bg-admin-royal-soft text-admin-royal",
  lecturer: "bg-[#FBF3DD] text-admin-gold-dark",
  student: "bg-[#E8EEF7] text-[#4059AA]",
};

function userStatus(user: AdminUser): string {
  if (user.isActive) return "Active";
  return user.activatedAt ? "Deactivated" : "Pending";
}

function KpiChip({
  icon,
  label,
  value,
  tag,
  tagClass = "text-admin-text-muted",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tag?: string;
  tagClass?: string;
}) {
  return (
    <Card className="flex items-center gap-4 p-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-admin-royal-soft text-admin-royal">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-admin-text-muted">{label}</p>
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold leading-none tracking-tight text-text-primary">
            {value}
          </span>
          {tag && <span className={`text-xs font-semibold ${tagClass}`}>{tag}</span>}
        </div>
      </div>
    </Card>
  );
}

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [deptFilter, setDeptFilter] = useState<string>("All Departments");
  const [searchInput, setSearchInput] = useState("");
  const [q, setQ] = useState("");
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [editRole, setEditRole] = useState<AdminRole>("student");

  const { data, isLoading, error, refetch } = useUsers({
    page,
    limit: PAGE_SIZE,
    role: (roleFilter as AdminRole) || undefined,
    status: statusFilter as "active" | "pending" | "deactivated" | undefined,
    q: q || undefined,
  });

  useEffect(() => {
    const t = setTimeout(() => setQ(searchInput.trim()), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const rows = useMemo(() => {
    const items = data?.items ?? [];
    if (deptFilter === "All Departments") return items;
    return items.filter((u) => u.departmentName === deptFilter);
  }, [data, deptFilter]);

  const departments = useMemo(() => {
    const set = new Set<string>();
    for (const u of data?.items ?? []) if (u.departmentName) set.add(u.departmentName);
    return [...set].sort();
  }, [data]);

  const updateStatus = useUpdateUserStatus();
  const updateRole = useUpdateUserRole();

  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const openEdit = (user: AdminUser) => {
    setEditUser(user);
    setEditRole(user.role as AdminRole);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        description="Manage credentials, roles, and access levels for all academic participants."
      />

      {/* KPI chips */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiChip
          icon={<Users className="h-5 w-5" />}
          label="Total Users"
          value={total.toLocaleString()}
          tag="All roles"
          tagClass="text-success"
        />
        <KpiChip
          icon={<Activity className="h-5 w-5" />}
          label="Active Users"
          value={(data?.items.filter((u) => u.isActive).length ?? 0).toString()}
          tag="In view"
        />
        <KpiChip
          icon={<Clock3 className="h-5 w-5" />}
          label="Pending Approvals"
          value={(data?.pending ?? 0).toString()}
          tag="Action Required"
          tagClass="text-admin-gold-dark"
        />
        <KpiChip
          icon={<Search className="h-5 w-5" />}
          label="Showing"
          value={(data?.items.length ?? 0).toString()}
          tag="Per page"
        />
      </section>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-admin-text-muted">Filter by</span>
        <Select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPage(1);
          }}
          className="w-44"
          aria-label="Filter by role"
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="lecturer">Lecturer</option>
          <option value="student">Student</option>
        </Select>
        <Select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="w-52"
          aria-label="Filter by status"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="deactivated">Deactivated</option>
        </Select>
        <Select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="w-56"
          aria-label="Filter by department"
        >
          <option>All Departments</option>
          {departments.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </Select>
        <Input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search name or email…"
          className="w-64"
          aria-label="Search users"
        />
      </div>

      {/* User table */}
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
                <TableHead>Name & Identity</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((user: AdminUser) => (
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
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${roleChip[user.role as AdminRole] ?? "bg-admin-container-low text-admin-text-muted"}`}
                    >
                      {user.role}
                    </span>
                  </TableCell>
                  <TableCell className="text-admin-text-muted">
                    {user.departmentName ?? "—"}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={userStatus(user)} />
                  </TableCell>
                  <TableCell className="text-admin-text-muted">
                    {user.lastLoginAt
                      ? new Date(user.lastLoginAt).toLocaleString()
                      : "Never"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        aria-label={`Edit ${user.fullName}`}
                        onClick={() => openEdit(user)}
                        className="rounded-lg p-2 text-admin-text-muted transition-colors hover:bg-admin-container-low hover:text-admin-royal"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      {user.isActive ? (
                        <button
                          aria-label={`Deactivate ${user.fullName}`}
                          disabled={updateStatus.isPending}
                          onClick={() => updateStatus.mutate({ userId: user.id, isActive: false })}
                          className="rounded-lg p-2 text-admin-text-muted transition-colors hover:bg-admin-danger-soft hover:text-danger"
                        >
                          <UserX className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          aria-label={`Activate ${user.fullName}`}
                          disabled={updateStatus.isPending}
                          onClick={() => updateStatus.mutate({ userId: user.id, isActive: true })}
                          className="rounded-lg p-2 text-admin-text-muted transition-colors hover:bg-success/10 hover:text-success"
                        >
                          <UserCheck className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-admin-text-muted">
                    No users match the selected filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </QueryBoundary>
        <div className="flex flex-col items-center justify-between gap-3 border-t border-admin-outline bg-admin-container-low/50 px-4 py-3 sm:flex-row">
          <p className="text-sm text-admin-text-muted">
            Page {page} of {totalPages} · {total.toLocaleString()} results
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

      {/* Edit role modal */}
      <Modal
        open={editUser !== null}
        onClose={() => setEditUser(null)}
        title={editUser ? `Edit ${editUser.fullName}` : "Edit User"}
        icon={<Pencil className="h-5 w-5" />}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditUser(null)}>
              Cancel
            </Button>
            <Button
              disabled={updateRole.isPending}
              onClick={() => {
                if (!editUser) return;
                updateRole.mutate({ userId: editUser.id, role: editRole });
                setEditUser(null);
              }}
            >
              Save Role
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          {updateRole.error && (
            <p className="text-sm text-danger">{sageErrorText(updateRole.error)}</p>
          )}
          <div className="space-y-1.5">
            <label
              htmlFor="edit-role"
              className="text-xs font-semibold uppercase tracking-wider text-admin-text-muted"
            >
              Assigned Role
            </label>
            <Select
              id="edit-role"
              value={editRole}
              onChange={(e) => setEditRole(e.target.value as AdminRole)}
            >
              <option value="student">Student</option>
              <option value="lecturer">Lecturer</option>
              <option value="admin">Admin</option>
            </Select>
          </div>
          <p className="text-sm text-admin-text-muted">
            Changing a role adjusts the user&apos;s access across SAGE immediately.
          </p>
        </div>
      </Modal>
    </div>
  );
}
