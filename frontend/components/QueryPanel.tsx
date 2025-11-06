"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const BASE = (process.env.NEXT_PUBLIC_API_URL || "/api").replace(/\/+$/, "");

const API_RAW = process.env.NEXT_PUBLIC_API_URL ?? "/api";
const API = API_RAW.replace(/\/+$/, ""); // strip trailing slashes

// helper: convert yyyy/mm/dd → yyyy-mm-dd for backend
const normalizeDate = (dateStr: string) => dateStr.replaceAll("/", "-");

export default function QueryPanel() {
  const router = useRouter();

  // default values
  const [xsite, setXsite] = useState("test_1");
  const [lat, setLat] = useState("-33.504");
  const [lon, setLon] = useState("148.4");
  const [crop, setCrop] = useState("wheat");
  const [sowingDate, setSowingDate] = useState("2020/01/01");   // yyyy/mm/dd
  const [harvestDate, setHarvestDate] = useState("2020/12/31"); // yyyy/mm/dd

  const [status, setStatus] = useState<"idle" | "running" | "done" | "error">(
    "idle"
  );
  const [jobId, setJobId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  //  Poll job status
  useEffect(() => {
    if (status !== "running" || !jobId) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API}/results/${jobId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === "done") {
            setStatus("done");
            router.push(`/results/${jobId}`);
          }
        }
      } catch {
        /* ignore transient errors */
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [status, jobId, router]);

  //  Run simulation
  async function handleRun() {
    setStatus("running");
    setError(null);
    try {
      const body = {
        xsite,
        lat: parseFloat(lat),
        lon: parseFloat(lon),
        crop_type: crop,
        // convert to ISO-style yyyy-mm-dd before sending
        sowing_date: normalizeDate(sowingDate),
        harvest_date: normalizeDate(harvestDate),
      };

      const res = await fetch(`${BASE}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      const newJobId = json.job_id ?? json.jobId ?? xsite;
      setJobId(newJobId);
      setStatus("running");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Run failed");
      setStatus("error");
    }
  }

  return (
    <div className="h-screen bg-neutral-950 border-r border-neutral-800 p-6 flex flex-col gap-6 text-white">
      <h2 className="text-xl font-semibold">DAESIM Query</h2>

      <div className="flex flex-col gap-4 overflow-y-auto pr-1">
        {/* Site ID */}
        <label className="text-sm text-neutral-400">Site ID</label>
        <input
          value={xsite}
          onChange={(e) => setXsite(e.target.value)}
          className="bg-neutral-900 border border-neutral-800 rounded-md p-2 text-sm text-white"
          placeholder="test_1"
        />

        {/* Latitude */}
        <label className="text-sm text-neutral-400">Latitude</label>
        <input
          value={lat}
          onChange={(e) => setLat(e.target.value)}
          className="bg-neutral-900 border border-neutral-800 rounded-md p-2 text-sm text-white"
          placeholder="-33.504"
        />

        {/* Longitude */}
        <label className="text-sm text-neutral-400">Longitude</label>
        <input
          value={lon}
          onChange={(e) => setLon(e.target.value)}
          className="bg-neutral-900 border border-neutral-800 rounded-md p-2 text-sm text-white"
          placeholder="148.4"
        />

        {/* Crop type */}
        <label className="text-sm text-neutral-400">Crop Type</label>
        <input
          value={crop}
          onChange={(e) => setCrop(e.target.value)}
          className="bg-neutral-900 border border-neutral-800 rounded-md p-2 text-sm text-white"
          placeholder="wheat"
        />

        {/* 🌱 Sowing Date */}
        <label className="text-sm text-neutral-400">Sowing Date (yyyy/mm/dd)</label>
        <input
          type="text"
          value={sowingDate}
          onChange={(e) => setSowingDate(e.target.value)}
          onFocus={(e) => e.target.showPicker?.()} // optional native picker if browser supports it
          className="bg-neutral-900 border border-neutral-800 rounded-md p-2 text-sm text-white"
          placeholder="2020/01/01"
        />

        {/* Harvest Date */}
        <label className="text-sm text-neutral-400">Harvest Date (yyyy/mm/dd)</label>
        <input
          type="text"
          value={harvestDate}
          onChange={(e) => setHarvestDate(e.target.value)}
          onFocus={(e) => e.target.showPicker?.()}
          className="bg-neutral-900 border border-neutral-800 rounded-md p-2 text-sm text-white"
          placeholder="2020/12/31"
        />
      </div>

      <button
        disabled={status === "running"}
        onClick={handleRun}
        className={`mt-6 py-2 rounded-md text-white text-sm font-medium transition ${
          status === "running"
            ? "bg-neutral-700 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {status === "running" ? "Running..." : "Run Simulation"}
      </button>

      {/* Status messages */}
      <div className="mt-4 text-sm">
        {status === "running" && (
          <p className="text-yellow-400 animate-pulse">⏳ Simulation running...</p>
        )}
        {status === "done" && <p className="text-green-400">✅ Completed</p>}
        {status === "error" && <p className="text-red-400">❌ {error}</p>}
      </div>
    </div>
  );
}
