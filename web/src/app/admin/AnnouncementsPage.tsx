import { useState } from "react";
import {
  PencilLine,
  Users,
  Plus,
  Bold,
  Italic,
  List,
  Link2,
  Image,
  Code2,
  Pin,
  Mail,
  Save,
  Send,
  Lightbulb,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Megaphone,
  Gauge,
  CalendarClock,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { PageHeader } from "@/features/admin/components/ui";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import {
  announcements,
  announcementCourses,
  announcementInsights,
} from "@/features/admin/data";

const rte = [
  { icon: Bold, label: "Bold" },
  { icon: Italic, label: "Italic" },
  { icon: List, label: "Bulleted list" },
  { icon: Link2, label: "Insert link" },
  { icon: Image, label: "Insert image" },
  { icon: Code2, label: "Insert code" },
];

export default function AnnouncementsPage() {
  const [recipients, setRecipients] = useState(["All Enrolled Students"]);

  const addRecipient = () => setRecipients((r) => [...r, "Selected Group"]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Announcements Composer"
        description="Broadcast important updates, deadlines, and news to your students across all courses."
        actions={
          <Badge variant="secondary" className="gap-1.5">
            <PencilLine className="h-3.5 w-3.5" />
            Draft Mode
          </Badge>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Composer */}
        <Card className="p-6 lg:col-span-2">
          <form className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-admin-text-muted">
                Course Selector
              </label>
              <Select defaultValue={announcementCourses[0]}>
                <option value="">Select a course...</option>
                {announcementCourses.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-admin-text-muted">
                Recipient Groups
              </label>
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-admin-outline bg-admin-container-low/50 p-2.5">
                {recipients.map((r) => (
                  <span
                    key={r}
                    className="inline-flex items-center gap-1.5 rounded-full bg-admin-royal-soft px-3 py-1 text-xs font-semibold text-admin-royal"
                  >
                    <Users className="h-3 w-3" />
                    {r}
                  </span>
                ))}
                <button
                  type="button"
                  onClick={addRecipient}
                  aria-label="Add recipient group"
                  className="inline-flex items-center gap-1 rounded-full border border-dashed border-admin-outline px-3 py-1 text-xs font-semibold text-admin-text-muted transition-colors hover:border-admin-royal hover:text-admin-royal"
                >
                  <Plus className="h-3 w-3" />
                  Add group
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-admin-text-muted">
                Title
              </label>
              <Input type="text" placeholder="e.g. Midterm Review Session Details" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-admin-text-muted">
                Body (Rich Text Content)
              </label>
              <div className="flex flex-wrap items-center gap-1 rounded-t-lg border border-b-0 border-admin-outline bg-admin-container-low/60 p-1.5">
                {rte.map(({ icon: Icon, label }) => (
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
                rows={6}
                className="rounded-t-none"
                placeholder="Write your announcement..."
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-admin-text-muted">
                <input type="checkbox" className="h-4 w-4 rounded border-admin-outline accent-admin-royal" />
                <Pin className="h-4 w-4" />
                Pin to Top
              </label>
              <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-admin-text-muted">
                <input type="checkbox" className="h-4 w-4 rounded border-admin-outline accent-admin-royal" />
                <Mail className="h-4 w-4" />
                Send Email Notification
              </label>
            </div>

            <div className="flex flex-wrap items-center gap-3 border-t border-admin-outline pt-4">
              <Button variant="secondary">
                <Save className="h-4 w-4" />
                Save as Draft
              </Button>
              <Button>
                <Send className="h-4 w-4" />
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
                  <p className="text-xs text-admin-text-muted">Total Active Posts</p>
                  <p className="text-lg font-bold text-text-primary">
                    {announcementInsights.activePosts}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-admin-container-low p-3">
                <Gauge className="h-4 w-4 text-admin-royal" />
                <div>
                  <p className="text-xs text-admin-text-muted">Average Reach</p>
                  <p className="text-lg font-bold text-text-primary">
                    {announcementInsights.avgReach}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-admin-container-low p-3">
                <CalendarClock className="h-4 w-4 text-admin-gold-dark" />
                <div>
                  <p className="text-xs text-admin-text-muted">Scheduled Posts</p>
                  <p className="text-lg font-bold text-text-primary">
                    {announcementInsights.scheduled}
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
          <Select className="w-44" defaultValue="All Courses" aria-label="Filter by course">
            <option>All Courses</option>
            {announcementCourses.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </Select>
        </div>

        <Card className="overflow-hidden">
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
              {announcements.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="whitespace-nowrap text-admin-text-muted">
                    {a.time}
                  </TableCell>
                  <TableCell>
                    <span className="rounded-md bg-admin-container-low px-2 py-1 font-mono text-xs font-semibold text-admin-royal">
                      {a.course}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium text-text-primary">
                    {a.title}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        aria-label={`Edit ${a.title}`}
                        className="rounded-lg p-2 text-admin-text-muted transition-colors hover:bg-admin-container-low hover:text-admin-royal"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        aria-label={`Delete ${a.title}`}
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
          <div className="flex items-center justify-between border-t border-admin-outline bg-admin-container-low/50 px-4 py-3">
            <p className="text-sm text-admin-text-muted">1-4</p>
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
                    n === 1 ? "bg-admin-royal text-white" : "text-admin-text-muted"
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
    </div>
  );
}
