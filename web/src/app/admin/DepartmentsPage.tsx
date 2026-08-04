import { useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Landmark,
  Gauge,
  Info,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
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
import {
  departmentsList,
  facultyOptions,
  departmentCapacity,
  type Department,
} from "@/features/admin/data";

const facultyFilters = ["All Faculty", "STEM", "Arts"];

export default function DepartmentsPage() {
  const [facultyFilter, setFacultyFilter] = useState("All Faculty");
  const [addOpen, setAddOpen] = useState(false);

  const filtered = departmentsList.filter((d) => {
    if (facultyFilter === "All Faculty") return true;
    if (facultyFilter === "STEM")
      return ["Faculty of Engineering", "Faculty of Science"].includes(d.faculty);
    if (facultyFilter === "Arts") return d.faculty.includes("Humanities");
    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Department Management"
        description="Organize and monitor academic divisions, faculty resources, and curriculum density."
        actions={
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Department
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-sm font-medium text-admin-text-muted">
          Filter by:
        </span>
        {facultyFilters.map((f) => (
          <button
            key={f}
            onClick={() => setFacultyFilter(f)}
            className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
              facultyFilter === f
                ? "border-admin-royal bg-admin-royal text-white"
                : "border-admin-outline bg-white text-admin-text-muted hover:border-admin-royal hover:text-admin-royal"
            }`}
          >
            {f}
          </button>
        ))}
        <span className="ml-2 rounded-full bg-admin-container-low px-3 py-1 text-sm font-semibold text-admin-text-muted">
          {filtered.length} departments
        </span>
      </div>

      {/* Department table */}
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Department Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Courses</TableHead>
              <TableHead>Lecturers</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((d: Department) => (
              <TableRow key={d.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-admin-royal-soft text-admin-royal">
                      <Landmark className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium text-text-primary">{d.name}</p>
                      <p className="text-xs text-admin-text-muted">{d.faculty}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="rounded-md bg-admin-container-low px-2 py-1 font-mono text-xs font-semibold text-admin-royal">
                    {d.code}
                  </span>
                </TableCell>
                <TableCell className="font-semibold text-text-primary">
                  {d.courses}
                </TableCell>
                <TableCell className="text-admin-text-muted">
                  {d.lecturers}
                </TableCell>
                <TableCell>
                  <StatusBadge status={d.status} />
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      aria-label={`Edit ${d.name}`}
                      className="rounded-lg p-2 text-admin-text-muted transition-colors hover:bg-admin-container-low hover:text-admin-royal"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      aria-label={`Delete ${d.name}`}
                      className="rounded-lg p-2 text-admin-text-muted transition-colors hover:bg-admin-danger-soft hover:text-danger"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex flex-col items-center justify-between gap-3 border-t border-admin-outline bg-admin-container-low/50 px-4 py-3 sm:flex-row">
          <p className="text-sm text-admin-text-muted">Page 1 of 3</p>
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

      {/* Capacity banner */}
      <Card className="flex flex-col gap-4 bg-admin-royal text-white sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-6">
        <div className="flex items-center gap-4 p-5 sm:p-0">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white/15">
            <Gauge className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-white/70">
              Total Capacity
            </p>
            <p className="text-2xl font-bold leading-none text-white">
              {departmentCapacity.total}
            </p>
          </div>
          <div className="h-10 w-px bg-white/20" />
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-white/70">
              Students / Dept Avg.
            </p>
            <p className="text-2xl font-bold leading-none text-white">
              {departmentCapacity.perDept}
            </p>
          </div>
        </div>
        <p className="px-5 pb-5 text-sm text-white/80 sm:p-0">
          {departmentCapacity.note}
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
            <Button onClick={() => setAddOpen(false)}>Create Department</Button>
          </>
        }
      >
        <form className="space-y-5">
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
            <Input type="text" placeholder="e.g. Astrophysics" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-admin-text-muted">
              Department Code
            </label>
            <Input type="text" placeholder="e.g. ASTRO-SCI" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-admin-text-muted">
              Faculty / School
            </label>
            <Select defaultValue={facultyOptions[0]}>
              {facultyOptions.map((f) => (
                <option key={f}>{f}</option>
              ))}
            </Select>
          </div>
        </form>
      </Modal>
    </div>
  );
}
