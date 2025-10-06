"use client";

import QueryPanel from "../components/QueryPanel";

export default function HomePage() {
  return (
    <div className="fixed inset-0 flex bg-neutral-950 text-white">
      {/* LEFT: fixed-width query panel */}
      <div className="w-[340px] border-r border-neutral-800">
        <QueryPanel />
      </div>

      {/* RIGHT: placeholder content (same layout as ResultsPage) */}
      <div className="flex-1 overflow-y-auto p-10 flex items-center justify-center">
        <div className="max-w-2xl text-center space-y-4">
          <h1 className="text-3xl font-bold text-cyan-400">
            DAESIM Simulation Dashboard
          </h1>
          <p className="text-neutral-400 text-sm leading-relaxed">
            Enter your site information, crop type, and sowing/harvest dates in the
            panel on the left. Then click{" "}
            <span className="text-blue-400 font-medium">Run Simulation</span> to
            generate and visualize DAESIM model results.
          </p>
          <p className="text-neutral-500 text-xs italic">
            Once a simulation finishes, the right side will display environmental
            forcing and plant growth plots.
          </p>
        </div>
      </div>
    </div>
  );
}
