"use client";

import QueryBar from "../../components/query/QueryBar";

// Shared layout for the map view (/) and the results view (/results/[jobId]).
// A layout persists across navigation between its child routes, so the
// QueryBar mounted here keeps its state (site, dates, crop) across that move.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 flex flex-col bg-neutral-950 text-white">
      <QueryBar />
      <div className="flex-1 min-h-0 relative">{children}</div>
    </div>
  );
}
