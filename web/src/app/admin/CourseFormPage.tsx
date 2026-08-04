import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ChevronRight,
  LayoutTemplate,
  Info,
  History,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  Link2,
  Image,
  Save,
  HelpCircle,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { PageHeader } from "@/features/admin/components/ui";
import { facultyOptions } from "@/features/admin/data";

const toolbar = [
  { icon: Bold, label: "Bold" },
  { icon: Italic, label: "Italic" },
  { icon: Underline, label: "Underline" },
  { icon: List, label: "Bulleted list" },
  { icon: ListOrdered, label: "Numbered list" },
  { icon: AlignLeft, label: "Align left" },
  { icon: AlignCenter, label: "Align center" },
  { icon: Link2, label: "Insert link" },
  { icon: Image, label: "Insert image" },
];

export default function CourseFormPage() {
  const { courseId } = useParams<{ courseId?: string }>();
  const isEdit = Boolean(courseId);
  const [autosavedAt] = useState("14:32");

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-1.5 text-sm text-admin-text-muted">
        <Link to="/admin/courses" className="transition-colors hover:text-admin-royal">
          My Courses
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-text-primary">
          {isEdit ? "Edit Course" : "Create New Course"}
        </span>
      </nav>

      <PageHeader
        title="Course Curriculum Architect"
        description="Define the foundation of your academic program for the upcoming semester."
        actions={
          <Button variant="secondary" size="sm">
            <HelpCircle className="h-4 w-4" />
            Need Help?
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Form card */}
        <Card className="p-6 lg:col-span-2">
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-admin-royal-soft bg-admin-royal-soft/40 p-4">
            <LayoutTemplate className="h-5 w-5 shrink-0 text-admin-royal" />
            <p className="text-sm text-admin-text-muted">
              Autosaved at {autosavedAt}. Changes are saved as you type.
            </p>
          </div>

          <form className="space-y-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-admin-text-muted">
                  Course Title
                </label>
                <Input type="text" placeholder="e.g. Advanced Quantum Mechanics" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-admin-text-muted">
                  Course Code
                </label>
                <Input type="text" placeholder="e.g. PHYS-430" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-admin-text-muted">
                  Department
                </label>
                <Select defaultValue={facultyOptions[0]}>
                  {facultyOptions.map((f) => (
                    <option key={f}>{f}</option>
                  ))}
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-admin-text-muted">
                    Credit Units
                  </label>
                  <Select defaultValue="3">
                    <option>1</option>
                    <option>2</option>
                    <option>3</option>
                    <option>4</option>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-admin-text-muted">
                    Semester
                  </label>
                  <Select defaultValue="Fall 2024">
                    <option>Fall 2024</option>
                    <option>Spring 2025</option>
                    <option>Summer 2025</option>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-admin-text-muted">
                Brief Description
              </label>
              <Textarea
                rows={6}
                placeholder="Outline the learning objectives, outcomes, and assessment structure for this course..."
              />
            </div>

            {/* Rich text toolbar */}
            <div className="flex flex-wrap items-center gap-1 rounded-lg border border-admin-outline bg-admin-container-low/60 p-1.5">
              {toolbar.map(({ icon: Icon, label }) => (
                <button
                  key={label}
                  type="button"
                  aria-label={label}
                  title={label}
                  className="rounded-md p-2 text-admin-text-muted transition-colors hover:bg-white hover:text-admin-royal"
                >
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button variant="secondary">Cancel Changes</Button>
              <Button>
                <Save className="h-4 w-4" />
                {isEdit ? "Save Changes" : "Publish Course"}
              </Button>
            </div>
          </form>
        </Card>

        {/* Side info */}
        <div className="space-y-6">
          <Card className="p-5">
            <div className="mb-3 flex items-center gap-2 text-admin-royal">
              <Info className="h-5 w-5" />
              <h4 className="text-base font-semibold tracking-tight">Guidelines</h4>
            </div>
            <ul className="space-y-3 text-sm text-admin-text-muted">
              <li className="flex gap-2.5">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-admin-gold" />
                Course codes must be unique and follow the SAGE naming convention.
              </li>
              <li className="flex gap-2.5">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-admin-gold" />
                Syllabi are reviewed by the department chair before publishing.
              </li>
              <li className="flex gap-2.5">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-admin-gold" />
                Required fields must be populated before the course goes live.
              </li>
            </ul>
          </Card>

          <Card className="flex items-start gap-3 p-5">
            <History className="mt-0.5 h-5 w-5 shrink-0 text-admin-royal" />
            <div>
              <p className="text-sm font-semibold text-text-primary">Version history</p>
              <p className="mt-1 text-xs text-admin-text-muted">
                Draft v1.0 · Last modified today at {autosavedAt}
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
