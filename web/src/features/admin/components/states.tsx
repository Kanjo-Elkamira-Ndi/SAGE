import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

/** Centered loading state for data-backed admin pages. */
export function PageLoading({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-admin-outline border-t-admin-royal" />
      <p className="text-sm text-admin-text-muted">{label}</p>
    </div>
  );
}

/** Centered error state with a retry action. */
export function PageError({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="max-w-md text-sm text-admin-text-muted">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      )}
    </div>
  );
}

/** Renders PageLoading / PageError / children for a react-query result. */
export function QueryBoundary({
  isLoading,
  error,
  errorText,
  onRetry,
  children,
}: {
  isLoading: boolean;
  error: unknown;
  errorText: string;
  onRetry?: () => void;
  children: React.ReactNode;
}) {
  if (isLoading) return <PageLoading />;
  if (error) return <PageError message={errorText} onRetry={onRetry} />;
  return <>{children}</>;
}
