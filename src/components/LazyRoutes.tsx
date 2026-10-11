import { lazy, Suspense, ReactNode } from 'react';

export const LazyDashboard = lazy(() =>
  import('./Dashboard').then((m) => ({ default: m.Dashboard }))
);
export const LazySimulationEngine = lazy(() =>
  import('./SimulationEngine').then((m) => ({ default: m.SimulationEngine }))
);
export const LazyCharts = lazy(() =>
  import('./Charts').then((m) => ({ default: m.Charts }))
);

function LoadingSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading content"
      aria-live="polite"
      className="flex h-64 w-full items-center justify-center"
    >
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}

export function SuspenseWrapper({ children }: { children: ReactNode }) {
  return <Suspense fallback={<LoadingSkeleton />}>{children}</Suspense>;
}
