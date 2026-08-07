import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ChevronRight,
  LayoutTemplate,
  Info,
  History,
  Save,
  HelpCircle,
  Loader2,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { PageHeader } from "@/features/admin/components/ui";
import { QueryBoundary } from "@/features/admin/components/states";
import {
  useCourse,
  useCreateCourse,
  useUpdateCourse,
  useDepartments,
} from "@/features/admin/queries";
import { sageErrorText } from "@/lib/queryClient";

export default function CourseFormPage() {
  const { courseId } = useParams<{ courseId?: string }>();
  const isEdit = Boolean(courseId);
  const navigate = useNavigate();

  const { data: courseData, isLoading, error, refetch } = useCourse(courseId);
  const { data: deptData } = useDepartments({ page: 1, limit: 100 });
  const createCourse = useCreateCourse();
  const updateCourse = useUpdateCourse(courseId ?? "");

  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [creditUnits, setCreditUnits] = useState("3");
  const [semester, setSemester] = useState("");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!courseData) return;
    const c = courseData.course;
    setTitle(c.title ?? "");
    setCode(c.code ?? "");
    setDepartmentId(c.departmentId ?? "");
    setCreditUnits(String(c.creditUnits ?? 3));
    setSemester(c.semester ?? "");
    setDescription(c.description ?? "");
  }, [courseData]);

  const saving = createCourse.isPending || updateCourse.isPending;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const payload = {
      title: title.trim(),
      code: code.trim(),
      description: description.trim() || undefined,
      departmentId: departmentId || undefined,
      creditUnits: Number(creditUnits) || undefined,
      semester: semester.trim() || undefined,
    };
    if (isEdit) {
      updateCourse.mutate(payload, {
        onSuccess: () => navigate("/admin/courses"),
        onError: (err) => setFormError(sageErrorText(err)),
      });
    } else {
      createCourse.mutate(payload, {
        onSuccess: () => navigate("/admin/courses"),
        onError: (err) => setFormError(sageErrorText(err)),
      });
    }
  };

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-1.5 text-sm text-admin-text-muted">
        <Link to="/admin/courses" className="transition-colors hover:text-admin-royal">
          Courses
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-text-primary">
          {isEdit ? "Edit Course" : "Create New Course"}
        </span>
      </nav>

      <PageHeader
        title={isEdit ? "Edit Course" : "Create New Course"}
        description="Define the foundation of your academic program for the upcoming semester."
        actions={
          <Button variant="secondary" size="sm">
            <HelpCircle className="h-4 w-4" />
            Need Help?
          </Button>
        }
      />

      <QueryBoundary
        isLoading={isLoading}
        error={error}
        errorText={sageErrorText(error, "Failed to load course.")}
        onRetry={() => refetch()}
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Form card */}
          <Card className="p-6 lg:col-span-2">
            <div className="mb-6 flex items-center gap-3 rounded-lg border border-admin-royal-soft bg-admin-royal-soft/40 p-4">
              <LayoutTemplate className="h-5 w-5 shrink-0 text-admin-royal" />
              <p className="text-sm text-admin-text-muted">
                {isEdit
                  ? "Edit the course details below. Changes apply immediately."
                  : "Fill in the details below, then publish the course."}
              </p>
            </div>

            <form className="space-y-5" onSubmit={onSubmit}>
              {formError && (
                <div className="rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm font-medium text-danger">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label
                    htmlFor="course-title"
                    className="text-xs font-semibold uppercase tracking-wider text-admin-text-muted"
                  >
                    Course Title
                  </label>
                  <Input
                    id="course-title"
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Advanced Quantum Mechanics"
                  />
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor="course-code"
                    className="text-xs font-semibold uppercase tracking-wider text-admin-text-muted"
                  >
                    Course Code
                  </label>
                  <Input
                    id="course-code"
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g. PHYS-430"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label
                    htmlFor="course-dept"
                    className="text-xs font-semibold uppercase tracking-wider text-admin-text-muted"
                  >
                    Department
                  </label>
                  <Select
                    id="course-dept"
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                  >
                    <option value="">No department</option>
                    {deptData?.items.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="course-units"
                      className="text-xs font-semibold uppercase tracking-wider text-admin-text-muted"
                    >
                      Credit Units
                    </label>
                    <Select
                      id="course-units"
                      value={creditUnits}
                      onChange={(e) => setCreditUnits(e.target.value)}
                    >
                      <option>1</option>
                      <option>2</option>
                      <option>3</option>
                      <option>4</option>
                      <option>5</option>
                      <option>6</option>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label
                      htmlFor="course-semester"
                      className="text-xs font-semibold uppercase tracking-wider text-admin-text-muted"
                    >
                      Semester
                    </label>
                    <Input
                      id="course-semester"
                      type="text"
                      value={semester}
                      onChange={(e) => setSemester(e.target.value)}
                      placeholder="e.g. Fall 2025"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="course-description"
                  className="text-xs font-semibold uppercase tracking-wider text-admin-text-muted"
                >
                  Brief Description
                </label>
                <Textarea
                  id="course-description"
                  rows={6}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Outline the learning objectives, outcomes, and assessment structure for this course..."
                />
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link to="/admin/courses">
                  <Button variant="secondary" type="button">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
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
                  Course codes must be unique and follow the SAGE naming
                  convention.
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
                <p className="text-sm font-semibold text-text-primary">
                  Version history
                </p>
                <p className="mt-1 text-xs text-admin-text-muted">
                  {isEdit && courseData
                    ? `Last modified ${new Date(courseData.course.updatedAt).toLocaleString()}`
                    : "New draft · not yet published"}
                </p>
              </div>
            </Card>
          </div>
        </div>
      </QueryBoundary>
    </div>
  );
}
