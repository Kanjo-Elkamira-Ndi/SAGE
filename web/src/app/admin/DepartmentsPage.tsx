import { useState } from "react";
import {
  Plus,
  Pencil,
  Landmark,
  Gauge,
  Info,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
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
  useCreateDepartment,
  useDepartments,
  useUpdateDepartment,
} from "@/features/admin/queries";
import type { AdminDepartment } from "@/features/admin/api";
import { sageErrorText } from "@/lib/queryClient";

const PAGE_SIZE = 20;

export default function DepartmentsPage() {
  const [page, setPage] = useState(1);
  const [addOpen, setAddOpen] = useState(false);
  const [editDept, setEditDept] = useState<AdminDepartment | null>(null);

  const { data, isLoading, error, refetch } = useDepartments({ page, limit: PAGE_SIZE });

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [editName, setEditName] = useState("");
  const [editCode, setEditCode] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const createDept = useCreateDepartment();
  const updateDept = useUpdateDepartment();

  const openCreate = () => {
    setName("");
    setCode("");
    setFormError(null);
    setAddOpen(true);
  };

  const openEdit = (d: AdminDepartment) => {
    setEditDept(d);
    setEditName(d.name);
    setEditCode(d.code);
    setFormError(null);
  };

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const avgLecturers =
    items.length > 0
      ? (items.reduce((acc, d) => acc + d.lecturerCount, 0) / items.length).toFixed(1)
      : "0.0";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Department Management"
        description="Organize and monitor academic divisions and faculty resources."
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Add Department
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-sm font-medium text-admin-text-muted">
          Showing
        </span>
        <span className="rounded-full bg-admin-container-low px-3 py-1 text-sm font-semibold text-admin-text-muted">
          {total.toLocaleString()} departments
        </span>
      </div>

      {/* Department table */}
      <Card className="overflow-hidden">
        <QueryBoundary
          isLoading={isLoading}
          error={error}
          errorText={sageErrorText(error, "Failed to load departments.")}
          onRetry={() => refetch()}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Department Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Lecturers</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((d: AdminDepartment) => (
                <TableRow key={d.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-admin-royal-soft text-admin-royal">
                        <Landmark className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium text-text-primary">{d.name}</p>
                        <p className="text-xs text-admin-text-muted">
                          Added {new Date(d.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="rounded-md bg-admin-container-low px-2 py-1 font-mono text-xs font-semibold text-admin-royal">
                      {d.code}
                    </span>
                  </TableCell>
                  <TableCell className="font-semibold text-text-primary">
                    {d.lecturerCount}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status="Active" />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        aria-label={`Edit ${d.name}`}
                        onClick={() => openEdit(d)}
                        className="rounded-lg p-2 text-admin-text-muted transition-colors hover:bg-admin-container-low hover:text-admin-royal"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-admin-text-muted">
                    No departments yet.
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

      {/* Capacity banner */}
      <Card className="flex flex-col gap-4 bg-admin-royal text-white sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-6">
        <div className="flex items-center gap-4 p-5 sm:p-0">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white/15">
            <Gauge className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-white/70">
              Total Departments
            </p>
            <p className="text-2xl font-bold leading-none text-white">
              {total.toLocaleString()}
            </p>
          </div>
          <div className="h-10 w-px bg-white/20" />
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-white/70">
              Lecturers / Dept
            </p>
            <p className="text-2xl font-bold leading-none text-white">
              {avgLecturers}
            </p>
          </div>
        </div>
        <p className="px-5 pb-5 text-sm text-white/80 sm:p-0">
          Academic divisions, faculty resources, and curriculum density across the
          institution.
        </p>
      </Card>

      {/* Add department modal */}
      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add Department"
        icon={<Landmark className="h-5 w-5" />}
        footer={
          <>
            <Button variant="secondary" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={createDept.isPending}
              onClick={() => {
                setFormError(null);
                createDept.mutate(
                  { name: name.trim(), code: code.trim() },
                  {
                    onSuccess: () => setAddOpen(false),
                    onError: (err) => setFormError(sageErrorText(err)),
                  },
                );
              }}
            >
              Create Department
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          {formError && <p className="text-sm text-danger">{formError}</p>}
          <div className="flex gap-3 rounded-lg border border-admin-royal-soft bg-admin-royal-soft/40 p-4">
            <Info className="h-5 w-5 shrink-0 text-admin-royal" />
            <p className="text-sm text-admin-text-muted">
              Fill in the primary details to register a new academic department
              into the SAGE ecosystem.
            </p>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-admin-text-muted">
              Department Name
            </label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Astrophysics"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-admin-text-muted">
              Department Code
            </label>
            <Input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. ASTRO-SCI"
            />
          </div>
        </div>
      </Modal>

      {/* Edit department modal */}
      <Modal
        open={editDept !== null}
        onClose={() => setEditDept(null)}
        title={editDept ? `Edit ${editDept.name}` : "Edit Department"}
        icon={<Pencil className="h-5 w-5" />}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditDept(null)}>
              Cancel
            </Button>
            <Button
              disabled={updateDept.isPending}
              onClick={() => {
                if (!editDept) return;
                setFormError(null);
                updateDept.mutate(
                  {
                    id: editDept.id,
                    input: { name: editName.trim(), code: editCode.trim() },
                  },
                  {
                    onSuccess: () => setEditDept(null),
                    onError: (err) => setFormError(sageErrorText(err)),
                  },
                );
              }}
            >
              Save Changes
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          {formError && <p className="text-sm text-danger">{formError}</p>}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-admin-text-muted">
              Department Name
            </label>
            <Input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-admin-text-muted">
              Department Code
            </label>
            <Input
              type="text"
              value={editCode}
              onChange={(e) => setEditCode(e.target.value)}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
