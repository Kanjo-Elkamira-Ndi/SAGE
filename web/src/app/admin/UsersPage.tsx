import { useMemo, useState } from "react";
import {
  Users,
  Activity,
  Clock3,
  ShieldCheck,
  Plus,
  Pencil,
  UserX,
  Info,
  ChevronLeft,
  ChevronRight,
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
import { users, userKpis, departments, type AppUser, type UserRole } from "@/features/admin/data";

const roleChip = {
  Admin: "bg-admin-royal-soft text-admin-royal",
  Lecturer: "bg-[#FBF3DD] text-admin-gold-dark",
  Student: "bg-[#E8EEF7] text-[#4059AA]",
} as const;

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
  tag: string;
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
          <span className={`text-xs font-semibold ${tagClass}`}>{tag}</span>
        </div>
      </div>
    </Card>
  );
}

export default function UsersPage() {
  const [roleFilter, setRoleFilter] = useState<string>("All Roles");
  const [deptFilter, setDeptFilter] = useState<string>("All Departments");
  const [createOpen, setCreateOpen] = useState(false);

  const filtered = useMemo(() => {
    return users.filter(
      (u) =>
        (roleFilter === "All Roles" || u.role === roleFilter) &&
        (deptFilter === "All Departments" || u.department === deptFilter)
    );
  }, [roleFilter, deptFilter]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        description="Manage credentials, roles, and access levels for all academic participants."
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            Create New Account
          </Button>
        }
      />

      {/* KPI chips */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiChip
          icon={<Users className="h-5 w-5" />}
          label="Total Users"
          value={userKpis.totalUsers}
          tag={userKpis.totalUsersDelta}
          tagClass="text-success"
        />
        <KpiChip
          icon={<Activity className="h-5 w-5" />}
          label="Active Now"
          value={userKpis.activeNow}
          tag={userKpis.activeNowTag}
        />
        <KpiChip
          icon={<Clock3 className="h-5 w-5" />}
          label="Pending Approvals"
          value={userKpis.pendingApprovals}
          tag={userKpis.pendingApprovalsTag}
          tagClass="text-admin-gold-dark"
        />
        <KpiChip
          icon={<ShieldCheck className="h-5 w-5" />}
          label="Security Alerts"
          value={userKpis.securityAlerts}
          tag="0 threats"
          tagClass="text-success"
        />
      </section>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-admin-text-muted">
          Filter by
        </span>
        <Select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="w-44"
          aria-label="Filter by role"
        >
          <option>All Roles</option>
          <option>Admin</option>
          <option>Lecturer</option>
          <option>Student</option>
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
      </div>

      {/* User table */}
      <Card className="overflow-hidden">
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
            {filtered.map((user: AppUser) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar name={user.name} size="sm" />
                    <div>
                      <p className="font-medium text-text-primary">{user.name}</p>
                      <p className="text-xs text-admin-text-muted">{user.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${roleChip[user.role as UserRole]}`}
                  >
                    {user.role}
                  </span>
                </TableCell>
                <TableCell className="text-admin-text-muted">
                  {user.department}
                </TableCell>
                <TableCell>
                  <StatusBadge status={user.status} />
                </TableCell>
                <TableCell className="text-admin-text-muted">
                  {user.lastLogin}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      aria-label={`Edit ${user.name}`}
                      className="rounded-lg p-2 text-admin-text-muted transition-colors hover:bg-admin-container-low hover:text-admin-royal"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      aria-label={`Deactivate ${user.name}`}
                      className="rounded-lg p-2 text-admin-text-muted transition-colors hover:bg-admin-danger-soft hover:text-danger"
                    >
                      <UserX className="h-4 w-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-admin-text-muted">
                  No users match the selected filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <div className="flex flex-col items-center justify-between gap-3 border-t border-admin-outline bg-admin-container-low/50 px-4 py-3 sm:flex-row">
          <p className="text-sm text-admin-text-muted">
            Showing 1-{filtered.length} of 1,284 results
          </p>
          <div className="flex items-center gap-1">
            <button
              aria-label="Previous page"
              className="rounded-lg border border-admin-outline p-1.5 text-admin-text-muted transition-colors hover:bg-white hover:text-admin-royal"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-2 text-sm font-medium text-text-primary">1</span>
            <button
              aria-label="Next page"
              className="rounded-lg border border-admin-outline p-1.5 text-admin-text-muted transition-colors hover:bg-white hover:text-admin-royal"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </Card>

      {/* Create account modal */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create New Account"
        icon={<Plus className="h-5 w-5" />}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setCreateOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={() => setCreateOpen(false)}>
              Create Account
            </Button>
          </>
        }
      >
        <form className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-admin-text-muted">
                First Name
              </label>
              <Input type="text" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-admin-text-muted">
                Last Name
              </label>
              <Input type="text" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-admin-text-muted">
              Email Address
            </label>
            <Input type="email" placeholder="username@sage.edu" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-admin-text-muted">
                Assigned Role
              </label>
              <Select defaultValue="Student">
                <option>Student</option>
                <option>Lecturer</option>
                <option>Admin</option>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-admin-text-muted">
                Department
              </label>
              <Select defaultValue="Computer Science">
                {departments.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </Select>
            </div>
          </div>
          <div className="flex gap-3 rounded-lg border border-admin-royal-soft bg-admin-royal-soft/40 p-4">
            <Info className="h-5 w-5 shrink-0 text-admin-royal" />
            <p className="text-sm text-admin-text-muted">
              A temporary password and setup instructions will be sent to the
              user&apos;s registered email address immediately upon creation.
            </p>
          </div>
        </form>
      </Modal>
    </div>
  );
}
