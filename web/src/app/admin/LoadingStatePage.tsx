import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/features/admin/components/ui";

const skeletons = {
  stat: (key: number) => (
    <Card key={key} className="p-4">
      <div className="mb-4 h-10 w-10 animate-pulse rounded-lg bg-admin-container-high" />
      <div className="h-3 w-24 animate-pulse rounded bg-admin-container-high" />
      <div className="mt-2 h-6 w-16 animate-pulse rounded bg-admin-container-high" />
    </Card>
  ),
  chart: (key: number) => (
    <Card key={key} className="p-5">
      <div className="mb-6 h-4 w-48 animate-pulse rounded bg-admin-container-high" />
      <div className="flex h-44 items-end gap-2">
        {[40, 65, 50, 80, 60, 90, 55, 75].map((h, i) => (
          <div
            key={i}
            className="flex-1 animate-pulse rounded-t-sm bg-admin-container-high"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </Card>
  ),
  table: (key: number) => (
    <Card key={key} className="overflow-hidden">
      <div className="flex items-center gap-3 border-b border-admin-outline bg-admin-container-low/50 px-4 py-3">
        <div className="h-2.5 w-8 animate-pulse rounded bg-admin-container-high" />
        <div className="h-2.5 w-32 animate-pulse rounded bg-admin-container-high" />
        <div className="ml-auto h-2.5 w-16 animate-pulse rounded bg-admin-container-high" />
      </div>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-4 border-b border-admin-outline/60 px-4 py-4 last:border-0">
          <div className="h-8 w-8 animate-pulse rounded-full bg-admin-container-high" />
          <div className="flex-1 space-y-1.5">
            <div className="h-2.5 w-40 animate-pulse rounded bg-admin-container-high" />
            <div className="h-2 w-24 animate-pulse rounded bg-admin-container-high" />
          </div>
          <div className="h-5 w-16 animate-pulse rounded-full bg-admin-container-high" />
        </div>
      ))}
    </Card>
  ),
};

export default function LoadingStatePage() {
  const [delay] = useState(0);
  const [visible, setVisible] = useState(false);
  const loading = !visible;

  useMemo(() => {
    const t = setTimeout(() => setVisible(true), Math.max(0, delay));
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard Loading State"
        description="Skeleton preview shown while system metrics are being fetched."
        actions={
          <button
            onClick={() => setVisible(false)}
            className="rounded-lg border border-admin-outline px-3.5 py-2 text-sm font-medium text-admin-royal transition-colors hover:bg-admin-royal-soft"
          >
            Replay skeleton
          </button>
        }
      />
      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[0, 1, 2, 3].map(skeletons.stat)}
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">{skeletons.chart(0)}</div>
            {skeletons.table(1)}
          </div>
        </div>
      ) : (
        <Card className="flex flex-col items-center justify-center px-6 py-16 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-admin-royal-soft text-admin-royal">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-admin-royal border-t-transparent" />
          </div>
          <p className="text-lg font-semibold text-text-primary">Loaded</p>
          <p className="mt-1 max-w-md text-sm text-admin-text-muted">
            All system metrics have been fetched successfully. Select "Replay
            skeleton" to preview the loading state again.
          </p>
        </Card>
      )}
    </div>
  );
}
