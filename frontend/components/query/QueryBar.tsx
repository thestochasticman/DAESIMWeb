"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { BASE } from "../api";
import { formatSite, getSite, loadInitialSite, parseSite, setSite, subscribe } from "../map/siteStore";
import { useRunJob } from "./useRunJob";

const INPUT =
  "bg-neutral-900 border border-neutral-800 rounded-md px-2 py-1.5 text-sm text-white focus:outline-none focus:border-neutral-600 disabled:opacity-50";
const LABEL = "text-[11px] uppercase tracking-wide text-neutral-500";

// Horizontal query strip. Lives in the shared (app) layout so it keeps its
// state across the map view (/) and the results view (/results/[jobId]),
// like PaddockTSWeb's QueryBar.
export default function QueryBar() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ jobId?: string }>();
  const jobOnPage = pathname?.startsWith("/results/") ? params?.jobId : undefined;

  const [xsite, setXsite] = useState("test_1");
  const [coords, setCoords] = useState("");
  const [coordsValid, setCoordsValid] = useState(true);
  const [crop, setCrop] = useState("wheat");
  const [sowingDate, setSowingDate] = useState("2020-01-01");
  const [harvestDate, setHarvestDate] = useState("2020-12-31");
  const { run, status, error, jobId, reset } = useRunJob();
  const isBusy = status === "submitting" || status === "polling";
  const loadedJobRef = useRef<string | null>(null);

  // Site <-> map sync through siteStore.
  useEffect(() => {
    setCoords(formatSite(loadInitialSite()));
    return subscribe((s, source) => {
      if (source === "map") {
        setCoords(formatSite(s));
        setCoordsValid(true);
      }
    });
  }, []);

  const handleCoordsChange = (text: string) => {
    setCoords(text);
    const s = parseSite(text);
    setCoordsValid(s !== null || text.trim() === "");
    if (s) setSite(s, "panel");
  };

  // Opening a results link directly: fill the bar from that job's meta once.
  useEffect(() => {
    if (!jobOnPage || loadedJobRef.current === jobOnPage) return;
    loadedJobRef.current = jobOnPage;
    fetch(`${BASE}/results/${jobOnPage}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        const m = d?.meta;
        if (!m) return;
        if (m.XSite) setXsite(String(m.XSite));
        if (m.cropType) setCrop(String(m.cropType).toLowerCase());
        if (m.sowingDate) setSowingDate(String(m.sowingDate).replaceAll("/", "-"));
        if (m.harvestDate) setHarvestDate(String(m.harvestDate).replaceAll("/", "-"));
        if (Number.isFinite(m.Lat) && Number.isFinite(m.Lon)) {
          setSite({ lat: m.Lat, lon: m.Lon }, "panel");
          setCoords(formatSite({ lat: m.Lat, lon: m.Lon }));
        }
      })
      .catch(() => {});
  }, [jobOnPage]);

  // When a run finishes (or was already cached), show it and go idle.
  useEffect(() => {
    if (status === "done" && jobId) {
      router.push(`/results/${jobId}`);
      reset();
    }
  }, [status, jobId, router, reset]);

  const handleRun = () => {
    const s = parseSite(coords) ?? getSite();
    if (!s) return;
    run({
      xsite: xsite.trim() || "site",
      lat: s.lat,
      lon: s.lon,
      crop_type: crop.trim() || "wheat",
      sowing_date: sowingDate,
      harvest_date: harvestDate,
    });
  };

  return (
    <div className="shrink-0 border-b border-neutral-800 bg-neutral-950 px-4 py-2 flex flex-wrap items-end gap-x-4 gap-y-2">
      <Link href="/" className="text-lg font-semibold text-cyan-400 self-center pr-2 no-underline">
        DAESIM
      </Link>

      <label className="flex flex-col gap-0.5 w-32">
        <span className={LABEL}>Site label</span>
        <input className={INPUT} value={xsite} onChange={(e) => setXsite(e.target.value)} disabled={isBusy} placeholder="test_1" />
      </label>

      <label className="flex flex-col gap-0.5 w-52">
        <span className={LABEL}>Coordinates (lat, lon)</span>
        <input
          className={`${INPUT} font-mono ${coordsValid ? "" : "border-red-500"}`}
          value={coords}
          onChange={(e) => handleCoordsChange(e.target.value)}
          disabled={isBusy}
          placeholder="-33.504, 148.4"
          title="Type lat, lon or click / drag the marker on the map"
        />
      </label>

      <label className="flex flex-col gap-0.5 w-28">
        <span className={LABEL}>Crop</span>
        <input className={INPUT} value={crop} onChange={(e) => setCrop(e.target.value)} disabled={isBusy} placeholder="wheat" />
      </label>

      <label className="flex flex-col gap-0.5 w-40">
        <span className={LABEL}>Sowing</span>
        <input type="date" className={INPUT} value={sowingDate} onChange={(e) => setSowingDate(e.target.value)} disabled={isBusy} />
      </label>

      <label className="flex flex-col gap-0.5 w-40">
        <span className={LABEL}>Harvest</span>
        <input type="date" className={INPUT} value={harvestDate} onChange={(e) => setHarvestDate(e.target.value)} disabled={isBusy} />
      </label>

      <div className="flex items-center gap-2">
        {pathname !== "/" && (
          <Link href="/" className="px-3 py-1.5 rounded-md border border-neutral-700 text-sm text-neutral-300 hover:border-neutral-500 no-underline">
            Map
          </Link>
        )}
        <button
          type="button"
          onClick={handleRun}
          disabled={isBusy || !coordsValid}
          className={`px-4 py-1.5 rounded-md text-sm font-medium text-white transition ${
            isBusy ? "bg-neutral-700 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {status === "submitting" ? "Submitting…" : status === "polling" ? "Running…" : "Run"}
        </button>
      </div>

      {status === "polling" && (
        <span className="text-xs text-yellow-400 animate-pulse self-center">Simulation running (about a minute)…</span>
      )}
      {status === "error" && error && (
        <span className="text-xs text-red-400 self-center max-w-xl truncate" title={error}>{error}</span>
      )}
    </div>
  );
}
