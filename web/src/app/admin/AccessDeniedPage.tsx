import { Link } from "react-router-dom";
import { LockKeyhole, LayoutDashboard, ArrowLeft, HelpCircle, Mail } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function AccessDeniedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-admin-bg px-6 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-admin-danger-soft text-danger">
        <LockKeyhole className="h-10 w-10" strokeWidth={1.75} />
      </div>
      <p className="text-sm font-bold uppercase tracking-widest text-admin-text-muted">
        Error Code: 403
      </p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight text-text-primary">
        Access Denied
      </h1>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-admin-text-muted">
        You do not have the necessary permissions to access this administrative
        module. This resource is restricted to authorized academic personnel
        only.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link to="/admin">
          <Button>
            <LayoutDashboard className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
        <Button variant="secondary">
          <HelpCircle className="h-4 w-4" />
          Get Help
        </Button>
        <Button variant="ghost">
          <Mail className="h-4 w-4" />
          Contact Support
        </Button>
      </div>
      <p className="mt-10 flex items-center gap-1.5 text-sm text-admin-text-muted">
        <ArrowLeft className="h-4 w-4" />
        If you believe this is an error, please contact your System Administrator.
      </p>
    </div>
  );
}
