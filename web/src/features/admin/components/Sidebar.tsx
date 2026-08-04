import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Landmark,
  GraduationCap,
  History,
  BarChart3,
  LockKeyhole,
  Megaphone,
  Settings,
  LogOut,
  GraduationCap as CapIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const mainNav = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/departments", label: "Departments", icon: Landmark },
  { to: "/admin/courses", label: "Courses", icon: GraduationCap },
  { to: "/admin/announcements", label: "Announcements", icon: Megaphone },
  { to: "/admin/activity", label: "Activity Logs", icon: History },
  { to: "/admin/reports", label: "Reports", icon: BarChart3 },
  { to: "/admin/permissions", label: "Permissions", icon: LockKeyhole },
];

const bottomNav = [
  { to: "/admin/settings", label: "Settings", icon: Settings },
  { to: "/admin/logout", label: "Logout", icon: LogOut },
];

function NavItems({
  items,
  onClick,
}: {
  items: typeof mainNav;
  onClick?: () => void;
}) {
  return (
    <>
      {items.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onClick}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
              isActive
                ? "bg-admin-royal text-white shadow-sm"
                : "text-admin-text-muted hover:bg-admin-container-high hover:text-text-primary"
            )
          }
        >
          <Icon className="h-[18px] w-[18px]" />
          <span>{label}</span>
        </NavLink>
      ))}
    </>
  );
}

interface SidebarProps {
  mobileOpen: boolean;
  onNavigate: () => void;
}

export function Sidebar({ mobileOpen, onNavigate }: SidebarProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-admin-outline bg-white px-4 py-5 lg:flex">
        <SidebarInner onNavigate={onNavigate} />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-[#1A1B20]/50 backdrop-blur-[2px]"
            onClick={onNavigate}
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col bg-white px-4 py-5 shadow-2xl">
            <SidebarInner onNavigate={onNavigate} />
          </aside>
        </div>
      )}
    </>
  );
}

function SidebarInner({ onNavigate }: { onNavigate: () => void }) {
  return (
    <>
      <div className="mb-6 px-2">
        <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-admin-royal">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-admin-royal text-white">
            <CapIcon className="h-5 w-5" />
          </span>
          SAGE
        </h1>
        <p className="mt-1 text-xs font-medium uppercase tracking-wider text-admin-text-muted">
          Academic Admin
        </p>
      </div>
      <nav className="flex-1 space-y-1">
        <NavItems items={mainNav} onClick={onNavigate} />
      </nav>
      <div className="mt-4 space-y-1 border-t border-admin-outline pt-4">
        <NavItems items={bottomNav} onClick={onNavigate} />
      </div>
    </>
  );
}
