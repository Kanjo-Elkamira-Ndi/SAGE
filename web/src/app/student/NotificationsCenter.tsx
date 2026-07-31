import { useState } from "react";
import {
  Bell,
  CheckCircle,
  FileText,
  Calendar,
  MessageSquare,
  GraduationCap,
  AlertCircle,
  Info,
  Trash2,
  CheckCheck,
} from "lucide-react";
import StudentLayout from "@/components/layout/StudentLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { TabNav } from "@/components/ui/TabNav";

const notifications = [
  {
    id: "1",
    title: "Assignment Graded",
    message:
      "Your Assignment 1: Basic Programs has been graded. You scored 92/100.",
    time: "2 hours ago",
    type: "grade",
    read: false,
    course: "CS101",
  },
  {
    id: "2",
    title: "New Quiz Available",
    message:
      "Week 8 Quiz: OOP Concepts is now available. Due date: March 30.",
    time: "5 hours ago",
    type: "quiz",
    read: false,
    course: "CS101",
  },
  {
    id: "3",
    title: "Assignment Deadline Approaching",
    message:
      "Assignment 2: Algorithm Implementation is due in 3 days (March 28).",
    time: "1 day ago",
    type: "deadline",
    read: false,
    course: "CS101",
  },
  {
    id: "4",
    title: "New Course Material",
    message:
      "Week 7: Introduction to OOP lecture notes have been uploaded.",
    time: "2 days ago",
    type: "material",
    read: true,
    course: "CS101",
  },
  {
    id: "5",
    title: "Office Hours Change",
    message:
      "Dr. Sarah Chen's office hours for this week have been moved to Thursday 2-4 PM.",
    time: "2 days ago",
    type: "info",
    read: true,
    course: "CS101",
  },
  {
    id: "6",
    title: "Discussion Reply",
    message:
      "Prof. Michael Torres replied to your question in the Data Structures forum.",
    time: "3 days ago",
    type: "message",
    read: true,
    course: "CS201",
  },
  {
    id: "7",
    title: "Quiz Results Available",
    message:
      "Your results for Week 7 Quiz: Searching & Sorting are now available. You scored 11/12 (92%).",
    time: "4 days ago",
    type: "grade",
    read: true,
    course: "CS101",
  },
  {
    id: "8",
    title: "Registration Reminder",
    message:
      "Course registration for Fall 2026 opens next week. Plan your schedule.",
    time: "5 days ago",
    type: "info",
    read: true,
    course: null,
  },
];

const typeMeta: Record<
  string,
  { icon: React.ElementType; className: string }
> = {
  grade: { icon: CheckCircle, className: "bg-green-100 text-green-600" },
  quiz: { icon: AlertCircle, className: "bg-purple-100 text-purple-600" },
  deadline: {
    icon: Calendar,
    className: "bg-amber-100 text-amber-600",
  },
  material: {
    icon: FileText,
    className: "bg-blue-100 text-blue-600",
  },
  info: { icon: Info, className: "bg-gray-100 text-gray-600" },
  message: {
    icon: MessageSquare,
    className: "bg-rose-100 text-rose-600",
  },
};

export default function NotificationsCenter() {
  const [filter, setFilter] = useState("all");
  const [notifs, setNotifs] = useState(notifications);

  const markAsRead = (id: string) => {
    setNotifs((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllRead = () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotif = (id: string) => {
    setNotifs((prev) => prev.filter((n) => n.id !== id));
  };

  const unreadCount = notifs.filter((n) => !n.read).length;

  const filtered =
    filter === "all"
      ? notifs
      : filter === "unread"
        ? notifs.filter((n) => !n.read)
        : notifs;

  return (
    <StudentLayout>
      <div className="space-y-6">
        <PageHeader
          title="Notifications"
          description={`${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`}
        >
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllRead}>
              <CheckCheck className="mr-1 h-4 w-4" />
              Mark All Read
            </Button>
          )}
        </PageHeader>

        <div className="flex gap-2">
          {["all", "unread"].map((f) => (
            <Button
              key={f}
              variant={filter === f ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f)}
            >
              {f === "all" ? "All" : "Unread"}
              {f === "unread" && unreadCount > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-1.5 bg-primary text-white"
                >
                  {unreadCount}
                </Badge>
              )}
            </Button>
          ))}
        </div>

        <div className="space-y-2">
          {filtered.length === 0 ? (
            <Card className="p-8 text-center">
              <Bell className="mx-auto h-10 w-10 text-text-muted" />
              <h3 className="mt-3 font-semibold text-text-primary">
                All caught up!
              </h3>
              <p className="mt-1 text-sm text-text-secondary">
                No notifications to show.
              </p>
            </Card>
          ) : (
            filtered.map((notif) => {
              const meta = typeMeta[notif.type] || typeMeta.info;
              const Icon = meta.icon;

              return (
                <Card
                  key={notif.id}
                  className={`p-4 transition-colors ${
                    !notif.read
                      ? "border-l-4 border-l-primary bg-primary-subtle/30"
                      : "hover:border-primary/30"
                  }`}
                  onClick={() => markAsRead(notif.id)}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${meta.className}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-medium text-text-primary">
                            {notif.title}
                          </h3>
                          {notif.course && (
                            <span className="text-xs text-accent">
                              {notif.course}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs text-text-secondary">
                            {notif.time}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotif(notif.id);
                            }}
                            className="text-text-muted hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <p className="mt-1 text-sm text-text-secondary">
                        {notif.message}
                      </p>
                    </div>
                    {!notif.read && (
                      <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
                    )}
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </StudentLayout>
  );
}
