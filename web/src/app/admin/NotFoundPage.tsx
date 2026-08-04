import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  HelpCircle,
  GraduationCap,
  History,
  BarChart3,
  Settings,
  LockKeyhole,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

const helpfulLinks = [
  { label: "Dashboard", to: "/admin", icon: LayoutDashboard },
  { label: "Courses", to: "/admin/courses", icon: GraduationCap },
  { label: "Activity Logs", to: "/admin/activity", icon: History },
  { label: "Reports", to: "/admin/reports", icon: BarChart3 },
  { label: "Permissions", to: "/admin/permissions", icon: LockKeyhole },
  { label: "Settings", to: "/admin/settings", icon: Settings },
];

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-admin-bg px-6 text-center">
      <p className="text-[96px] font-extrabold leading-none tracking-tight text-admin-royal">
        404
      </p>
      <h1 className="mt-4 text-2xl font-bold tracking-tight text-text-primary">
        Page not found
      </h1>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-admin-text-muted">
        The resource you are looking for might have been removed, had its name
        changed, or is temporarily unavailable.
      </p>
      <Link to="/admin" className="mt-8">
        <Button>
          <LayoutDashboard className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </Link>

      <div className="mt-12 w-full max-w-md">
        <div className="mb-3 flex items-center justify-center gap-2 text-sm font-semibold text-admin-text-muted">
          <HelpCircle className="h-4 w-4" />
          Helpful Links
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {helpfulLinks.map(({ label, to, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-2 rounded-lg border border-admin-outline bg-white px-3 py-2.5 text-sm font-medium text-admin-text-muted transition-colors hover:border-admin-royal hover:text-admin-royal"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
