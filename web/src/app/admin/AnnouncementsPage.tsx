import { useState } from "react";
import {
  Users,
  Bold,
  Italic,
  List,
  Link2,
  Image,
  Code2,
  Mail,
  Send,
  Lightbulb,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Megaphone,
  Loader2,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { PageHeader } from "@/features/admin/components/ui";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import { QueryBoundary } from "@/features/admin/components/states";
import {
  useAdminCourses,
  useAnnouncements,
  useCreateAnnouncement,
  useDeleteAnnouncement,
} from "@/features/admin/queries";
import type { Announcement } from "@/features/admin/api";
import { sageErrorText } from "@/lib/queryClient";

const PAGE_SIZE = 20;

export default function AnnouncementsPage() {
  const [page, setPage] = useState(1);
  const [courseId, setCourseId] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const { data, isLoading, error, refetch } = useAnnouncements({ page, limit: PAGE_SIZE });
  const { data: courseData } = useAdminCourses({ page: 1, limit: 100 });
  const createAnnouncement = useCreateAnnouncement();
  const deleteAnnouncement = useDeleteAnnouncement();

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const onPublish = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    createAnnouncement.mutate(
      { title: title.trim(), body: body.trim(), courseId: courseId || null },
      {
        onSuccess: () => {
          setTitle("");
          setBody("");
          setCourseId("");
          setPage(1);
        },
        onError: (err) => setFormError(sageErrorText(err)),
      },
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Announcements"
        description="Broadcast important updates, deadlines, and news to your students across all courses."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Composer */}
        <Card className="p-6 lg:col-span-2">
          <form className="space-y-5" onSubmit={onPublish}>
            {formError && (
              <div className="rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm font-medium text-danger">
                {formError}
              </div>
            )}
            <div className="space-y-1.5">
              <label
                htmlFor="ann-course"
                className="text-xs font-semibold uppercase tracking-wider text-admin-text-muted"
              >
                Course Selector
              </label>
              <Select
                id="ann-course"
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
              >
                <option value="">All enrolled students</option>
                {courseData?.items.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} — {c.title}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="ann-recipients"
                className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-admin-text-muted"
              >
                <Users className="h-3.5 w-3.5" />
                Recipient Groups
              </label>
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-admin-outline bg-admin-container-low/50 p-2.5">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-admin-royal-soft px-3 py-1 text-xs font-semibold text-admin-royal">
                  <Users className="h-3 w-3" />
                  {courseId ? "Course students" : "All Enrolled Students"}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="ann-title"
                className="text-xs font-semibold uppercase tracking-wider text-admin-text-muted"
              >
                Title
              </label>
              <Input
                id="ann-title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Midterm Review Session Details"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="ann-body"
                className="text-xs font-semibold uppercase tracking-wider text-admin-text-muted"
              >
                Body
              </label>
              <div className="flex flex-wrap items-center gap-1 rounded-t-lg border border-b-0 border-admin-outline bg-admin-container-low/60 p-1.5">
                {[
                  { icon: Bold, label: "Bold" },
                  { icon: Italic, label: "Italic" },
                  { icon: List, label: "Bulleted list" },
                  { icon: Link2, label: "Insert link" },
                  { icon: Image, label: "Insert image" },
                  { icon: Code2, label: "Insert code" },
                ].map(({ icon: Icon, label }) => (
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
              <Textarea
                id="ann-body"
                rows={6}
                required
                className="rounded-t-none"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write your announcement..."
              />
            </div>

            <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-admin-text-muted">
              <input type="checkbox" className="h-4 w-4 rounded border-admin-outline accent-admin-royal" />
              <Mail className="h-4 w-4" />
              Send Email Notification
            </label>

            <div className="flex flex-wrap items-center gap-3 border-t border-admin-outline pt-4">
              <Button type="submit" disabled={createAnnouncement.isPending}>
                {createAnnouncement.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Publish Now
              </Button>
            </div>
          </form>
        </Card>

        {/* Quick insights */}
        <div className="space-y-6">
          <Card className="p-5">
            <div className="mb-4 flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-admin-gold-dark" />
              <h4 className="text-base font-semibold tracking-tight">
                Quick Insights
              </h4>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 rounded-lg bg-admin-container-low p-3">
                <Megaphone className="h-4 w-4 text-admin-royal" />
                <div>
                  <p className="text-xs text-admin-text-muted">Total Announcements</p>
                  <p className="text-lg font-bold text-text-primary">
                    {total.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-admin-container-low p-3">
                <Users className="h-4 w-4 text-admin-royal" />
                <div>
                  <p className="text-xs text-admin-text-muted">Course Options</p>
                  <p className="text-lg font-bold text-text-primary">
                    {(courseData?.items.length ?? 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Previous announcements */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h4 className="text-lg font-semibold tracking-tight">
              Previous Announcements
            </h4>
            <p className="text-sm text-admin-text-muted">
              Review and manage your historical broadcasts.
            </p>
          </div>
        </div>

        <Card className="overflow-hidden">
          <QueryBoundary
            isLoading={isLoading}
            error={error}
            errorText={sageErrorText(error, "Failed to load announcements.")}
            onRetry={() => refetch()}
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date Posted</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((a: Announcement) => (
                  <TableRow key={a.id}>
                    <TableCell className="whitespace-nowrap text-admin-text-muted">
                      {new Date(a.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <span className="rounded-md bg-admin-container-low px-2 py-1 font-mono text-xs font-semibold text-admin-royal">
                        {a.courseTitle ?? "All courses"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-text-primary">{a.title}</p>
                      <p className="max-w-[380px] truncate text-xs text-admin-text-muted">
                        {a.body}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          aria-label={`Delete ${a.title}`}
                          disabled={deleteAnnouncement.isPending}
                          onClick={() => deleteAnnouncement.mutate(a.id)}
                          className="rounded-lg p-2 text-admin-text-muted transition-colors hover:bg-admin-danger-soft hover:text-danger"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="py-10 text-center text-admin-text-muted">
                      No announcements yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </QueryBoundary>
          <div className="flex items-center justify-between border-t border-admin-outline bg-admin-container-low/50 px-4 py-3">
            <p className="text-sm text-admin-text-muted">
              Page {page} of {totalPages} · {total.toLocaleString()} posts
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
    </div>
  );
}
