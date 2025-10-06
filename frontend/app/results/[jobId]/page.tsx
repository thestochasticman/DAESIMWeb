"use client";

import { useEffect, useState } from "react";
import QueryPanel from "../../../components/QueryPanel";
import SubplotFigure from "../../../components/SubPlotFigure";

const BASE = (process.env.NEXT_PUBLIC_API_URL || "/api").replace(/\/+$/, "");

const API_RAW = process.env.NEXT_PUBLIC_API_URL ?? "/api";
const API = API_RAW.replace(/\/+$/, ""); // strip trailing slashes

type Result = {
  status: string;
  plots: any;
  meta: any;
};

export default function ResultsPage({ params }: { params: { jobId: string } }) {
  const { jobId } = params;
  const [data, setData] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 🔄 Fetch results including query details (meta)
  useEffect(() => {
    async function fetchResults() {
      try {
        const res = await fetch(`${API}/results/${jobId}`);
        if (!res.ok) throw new Error(await res.text());
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message || "Failed to load results");
      }
    }
    fetchResults();
  }, [jobId]);

  return (
    <div className="fixed inset-0 flex bg-neutral-950 text-white">
      {/* LEFT: fixed-width query panel */}
      <div className="w-[340px] border-r border-neutral-800">
        {/* 👇 Pass query details (meta) to the panel */}
        <QueryPanel />
      </div>

      {/* RIGHT: results display */}
      <div className="flex-1 overflow-y-auto p-10 space-y-12">
        {error && (
          <p className="text-red-400 text-sm border border-red-400/30 rounded-md p-3 bg-red-950/10">
            {error}
          </p>
        )}
        {!data && !error && (
          <p className="text-neutral-400 animate-pulse">Loading results…</p>
        )}

        {data && (
          <>
            {/* <header className="border-b border-neutral-800 pb-2">
              <h1 className="text-3xl font-bold text-cyan-400">
                Job {jobId}
              </h1>
              <p className="text-neutral-400 mt-1 text-sm">
                Status: {data.status}
              </p>
            </header> */}

            {/* Wide plots */}
            <div className="grid grid-cols-1 2xl:grid-cols-2 gap-x-20 gap-y-16 w-full">
              <div className="pr-10">
                <SubplotFigure
                  plots={data.plots.forcing}
                  title="Environmental Forcing"
                />
              </div>
              <div className="pl-10 border-l border-neutral-800">
                <SubplotFigure
                  plots={data.plots.outputs}
                  title="DAESIM Plant Growth Summary"
                />
              </div>
            </div>

            {/* Metadata */}
            <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-2 text-cyan-400">
                Metadata
              </h3>
              <pre className="text-xs text-neutral-300 whitespace-pre-wrap break-words">
                {JSON.stringify(data.meta, null, 2)}
              </pre>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
