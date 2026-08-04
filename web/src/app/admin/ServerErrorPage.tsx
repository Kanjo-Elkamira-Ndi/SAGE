import { TriangleAlert, RefreshCw, LifeBuoy } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function ServerErrorPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-admin-bg px-6 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-admin-danger-soft text-danger">
        <TriangleAlert className="h-10 w-10" strokeWidth={1.75} />
      </div>
      <p className="text-sm font-bold uppercase tracking-widest text-admin-text-muted">
        Error Code 500
      </p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight text-text-primary">
        Something went wrong
      </h1>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-admin-text-muted">
        The server encountered an unexpected condition that prevented it from
        fulfilling your request. Our technical team has been notified.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button onClick={() => window.location.reload()}>
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
        <Button variant="secondary">
          <LifeBuoy className="h-4 w-4" />
          Contact Support
        </Button>
      </div>
    </div>
  );
}
