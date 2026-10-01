"use client";

import { useEffect, useState } from "react";
import SubplotFigure from "../../../../components/SubPlotFigure";
import { BASE } from "../../../../components/api";

type Result = {
  status: string;
  plots: any;
  meta: any;
  error?: string | null;
};

// Results view. The query bar lives in the shared (app) layout and fills
// itself from this job's meta, so this page only renders the plots.
export default function ResultsPage({ params }: { params: { jobId: string } }) {
  const { jobId } = params;
  const [data, setData] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchResults() {
      try {
        const res = await fetch(`${BASE}/results/${jobId}`);
        if (!res.ok) throw new Error(await res.text());
        const json: Result = await res.json();
        if (cancelled) return;
        setData(json);
        // still running (e.g. a shared link): keep checking
        if (json.status === "running") setTimeout(fetchResults, 4000);
      } catch (err: any) {
        if (!cancelled) setError(err.message || "Failed to load results");
      }
    }
    fetchResults();
    return () => {
      cancelled = true;
    };
  }, [jobId]);

  return (
    <div className="absolute inset-0 overflow-y-auto p-10 space-y-12">
      {error && (
        <p className="text-red-400 text-sm border border-red-400/30 rounded-md p-3 bg-red-950/10">{error}</p>
      )}
      {!data && !error && <p className="text-neutral-400 animate-pulse">Loading results…</p>}

      {data && data.status !== "done" && (
        <p
          className={
            data.status === "error"
              ? "text-red-400 text-sm border border-red-400/30 rounded-md p-3 bg-red-950/10"
              : "text-neutral-400 animate-pulse"
          }
        >
          {data.status === "error" ? (data.error ?? "Run failed") : "Simulation still running…"}
        </p>
      )}

      {data && data.status === "done" && (
        <>
          <div className="grid grid-cols-1 2xl:grid-cols-2 gap-x-20 gap-y-16 w-full">
            <div className="pr-10">
              <SubplotFigure plots={data.plots.forcing} title="Environmental Forcing" />
            </div>
            <div className="pl-10 border-l border-neutral-800">
              <SubplotFigure plots={data.plots.outputs} title="DAESIM Plant Growth Summary" />
            </div>
          </div>

          <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-2 text-cyan-400">Metadata</h3>
            <pre className="text-xs text-neutral-300 whitespace-pre-wrap break-words">
              {JSON.stringify(data.meta, null, 2)}
            </pre>
          </div>
        </>
      )}
    </div>
  );
}
