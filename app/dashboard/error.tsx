'use client';

import { useEffect } from 'react';

type DashboardErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function DashboardError({ error, reset }: DashboardErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center gap-6 p-8 text-center">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-wide text-rose-500">Something went wrong</p>
        <h1 className="text-3xl font-bold">We couldn't load your dashboard</h1>
        <p className="text-base text-slate-500">
          Please try again in a moment. If the issue persists, contact support and include error digest{' '}
          <code className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-700">{error.digest ?? 'n/a'}</code>.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-500"
        >
          Try again
        </button>
        <a
          href="mailto:support@docwhisper.app"
          className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-300"
        >
          Contact support
        </a>
      </div>
    </main>
  );
}
