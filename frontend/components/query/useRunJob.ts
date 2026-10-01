"use client";

import { useCallback, useEffect, useState } from "react";
import { BASE } from "../api";

export type RunBody = {
  xsite: string;
  lat: number;
  lon: number;
  crop_type: string;
  sowing_date: string;   // yyyy-mm-dd
  harvest_date: string;  // yyyy-mm-dd
};

export type RunStatus = "idle" | "submitting" | "polling" | "done" | "error";

// POST /run, then poll GET /results/{job_id} until the backend reports done
// or error. The backend keys jobs by their inputs, so a repeat of an earlier
// request comes back "done" immediately.
export function useRunJob() {
  const [status, setStatus] = useState<RunStatus>("idle");
  const [jobId, setJobId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status !== "polling" || !jobId) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${BASE}/results/${jobId}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.status === "done") setStatus("done");
        else if (data.status === "error") {
          setError(data.error || "Run failed");
          setStatus("error");
        }
      } catch {
        /* transient */
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [status, jobId]);

  const run = useCallback(async (body: RunBody) => {
    setStatus("submitting");
    setError(null);
    try {
      const res = await fetch(`${BASE}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        let msg = await res.text();
        try {
          const j = JSON.parse(msg);
          msg = Array.isArray(j.detail) ? j.detail.map((d: any) => d.msg).join("; ") : (j.detail ?? msg);
        } catch {}
        throw new Error(msg);
      }
      const json = await res.json();
      setJobId(json.job_id);
      setStatus(json.status === "done" ? "done" : "polling");
    } catch (err: any) {
      setError(err.message || "Run failed");
      setStatus("error");
    }
  }, []);

  const reset = useCallback(() => {
    setStatus("idle");
    setError(null);
  }, []);

  return { run, status, error, jobId, reset };
}
