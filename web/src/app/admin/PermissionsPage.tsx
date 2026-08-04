import {
  ShieldCheck,
  Fingerprint,
  History,
  ArrowRight,
  UserPlus,
  Filter,
  Download,
  KeyRound,
  Plus,
  Shield,
  Landmark,
  Activity,
  ChevronLeft,
  ChevronRight,
  Info,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
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
  personnel,
  securityKeys,
  permissionKpis,
  roleCards,
  type Personnel,
} from "@/features/admin/data";

const roleCardsIcon = {
  admin_panel_settings: Shield,
  account_balance: Landmark,
  monitoring: Activity,
} as const;

export default function PermissionsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Permissions Management"
        description="Configure elevated access levels and system-wide security keys for academic staff."
        actions={
          <Button>
            <UserPlus className="h-4 w-4" />
            Assign Key
          </Button>
        }
      />

      {/* Security overview */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="flex items-center gap-4 p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-admin-royal-soft text-admin-royal">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-admin-text-muted">
              Total Administrators
            </p>
            <p className="text-2xl font-bold leading-none tracking-tight text-text-primary">
              {permissionKpis.totalAdmins}
            </p>
          </div>
        </Card>
        <Card className="flex items-center gap-4 p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-success">
            <Fingerprint className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-admin-text-muted">
              Active Sessions
            </p>
            <p className="text-2xl font-bold leading-none tracking-tight text-text-primary">
              {permissionKpis.activeSessions}
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
                Audit History
              </p>
              <p className="text-sm font-semibold text-text-primary">
                Last 24 hours of permission changes
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
          <h4 className="text-lg font-semibold tracking-tight">
            Authorized Personnel
          </h4>
          <div className="flex items-center gap-2">
            <button
              aria-label="Filter"
              className="rounded-lg border border-admin-outline p-2 text-admin-text-muted transition-colors hover:bg-admin-container-low hover:text-admin-royal"
            >
              <Filter className="h-4 w-4" />
            </button>
            <Button variant="secondary" size="sm">
              <Download className="h-4 w-4" />
              Download
            </Button>
          </div>
        </div>

        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Current Access</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {personnel.map((p: Personnel) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar name={p.name} size="sm" />
                      <div>
                        <p className="font-medium text-text-primary">{p.name}</p>
                        <p className="text-xs text-admin-text-muted">{p.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1.5">
                      {p.access.map((key) => (
                        <span
                          key={key}
                          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                            p.restricted
                              ? "border-admin-danger-soft bg-admin-danger-soft/40 text-danger"
                              : "border-admin-royal-soft bg-admin-royal-soft/50 text-admin-royal"
                          }`}
                        >
                          <KeyRound className="h-3 w-3" />
                          {key}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Select
                        className="h-9 w-40 py-0 text-xs"
                        defaultValue="Assign Key..."
                        aria-label={`Assign key to ${p.name}`}
                      >
                        <option disabled>Assign Key...</option>
                        {securityKeys.map((k) => (
                          <option key={k}>{k}</option>
                        ))}
                      </Select>
                      <button
                        aria-label={`Manage key for ${p.name}`}
                        className="rounded-lg p-2 text-admin-text-muted transition-colors hover:bg-admin-container-low hover:text-admin-royal"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex flex-col items-center justify-between gap-3 border-t border-admin-outline bg-admin-container-low/50 px-4 py-3 sm:flex-row">
            <p className="text-sm text-admin-text-muted">
              Showing {personnel.length} of 24 Authorized Personnel
            </p>
            <div className="flex items-center gap-1">
              <button
                aria-label="Previous page"
                className="rounded-lg border border-admin-outline p-1.5 text-admin-text-muted transition-colors hover:bg-white hover:text-admin-royal"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {[1, 2, 3].map((n) => (
                <span
                  key={n}
                  className={`rounded-md px-2.5 py-1 text-sm font-medium ${
                    n === 1
                      ? "bg-admin-royal text-white"
                      : "text-admin-text-muted"
                  }`}
                >
                  {n}
                </span>
              ))}
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

      {/* Role cards */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {roleCards.map(({ icon, title, desc }) => {
          const Icon = roleCardsIcon[icon as keyof typeof roleCardsIcon] ?? Info;
          return (
            <Card key={title} className="group p-5 transition-colors hover:border-admin-royal/40">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-admin-royal-soft text-admin-royal transition-transform group-hover:scale-105">
                  <Icon className="h-5 w-5" />
                </div>
                <button
                  aria-label={`Open ${title}`}
                  className="rounded-lg p-2 text-admin-text-muted transition-colors hover:bg-admin-container-low hover:text-admin-royal"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
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
