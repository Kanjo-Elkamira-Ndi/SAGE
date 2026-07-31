import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  School,
  FileText,
  Brain,
  BarChart3,
  Bell,
  User,
  Settings,
  CircleHelp,
  Search,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/student", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/student/courses", icon: School, label: "My Courses" },
  { href: "/student/assignments", icon: FileText, label: "Assignments" },
  { href: "/student/quizzes", icon: Brain, label: "Quizzes" },
  { href: "/student/performance", icon: BarChart3, label: "Performance" },
  { href: "/student/notifications", icon: Bell, label: "Notifications" },
  { href: "/student/profile", icon: User, label: "Profile" },
];

const bottomItems = [
  { href: "/student/settings", icon: Settings, label: "Settings" },
  { href: "/student/help", icon: CircleHelp, label: "Help" },
];

export default function StudentLayout({ children }: { children?: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const isActive = (href: string) => location.pathname === href || location.pathname.startsWith(href + "/");

  return (
    <div className="flex min-h-screen bg-surface">
      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-primary transition-transform lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Branding */}
        <div className="flex h-16 items-center gap-3 border-b border-white/10 px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 text-lg font-bold text-white">
            S
          </div>
          <div>
            <p className="text-sm font-bold text-white">EduPortal</p>
            <p className="text-[11px] text-white/60">Academic Management</p>
          </div>
          <button
            className="ml-auto rounded-lg p-1.5 text-white/60 hover:bg-white/10 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-white/15 text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Academic Support section */}
        <div className="border-t border-white/10 px-3 py-3">
          <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-white/40">
            Academic Support
          </p>
          {bottomItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-white/15 text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </aside>

      {/* Main area */}
      <div className="flex flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-white px-4 lg:px-6">
          <button
            className="rounded-lg p-2 text-text-secondary hover:bg-surface lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex flex-1 items-center gap-4">
            <h1 className="text-lg font-bold text-text-primary lg:text-xl">
              Academic Portal
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-surface">
              <Search className="h-5 w-5" />
            </button>
            <button className="relative rounded-lg p-2 text-text-secondary transition-colors hover:bg-surface">
              <Bell className="h-5 w-5" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-accent" />
            </button>
            <button className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-surface">
              <Settings className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2 border-l border-border pl-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                AC
              </div>
              <div className="hidden text-sm lg:block">
                <p className="font-medium text-text-primary">Alex Carter</p>
                <p className="text-xs text-text-secondary">Senior Student</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
