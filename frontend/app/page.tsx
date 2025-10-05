"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const BASE = (process.env.NEXT_PUBLIC_API_URL || "/api").replace(/\/+$/, "");

export default function HomePage() {
  const router = useRouter();

  const [xsite, setXsite] = useState("Milgadara_2018");           // required
  const [lat, setLat] = useState(-33.5040);  // required
  const [lon, setLon] = useState(148.4);  // required
  const [sowingDate, setSowingDate] = useState("2018-01-01"); // required
  const [harvestDate, setHarvestDate] = useState("2018-12-12"); // required
  const [cropType, setCropType] = useState("Wheat");     // required

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const body = {
        xsite: xsite.trim(),
        lat: lat,
        lon: lon,
        sowing_date: sowingDate,
        harvest_date: harvestDate,
        crop_type: cropType,
      };

      const res = await fetch(`${BASE}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();

      router.push(`/results/${data.job_id}`);
    } catch (err: any) {
      setError(err.message || "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid md:grid-cols-2 gap-6">
      <section className="card">
        <h2 className="text-xl font-medium mb-4">Enter Query</h2>
        <form className="space-y-3" onSubmit={onSubmit}>
          <div>
            <label className="label">XSite</label>
            <input
              className="input"
              type="text"
              value={xsite}
              onChange={(e) => setXsite(e.target.value)}
              required
              placeholder="e.g., Site123"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Latitude</label>
              <input className="input" type="number" step="any" value={lon} onChange={e=>setLat(parseFloat(e.target.value))} />
            </div>
            <div>
              <label className="label">Longitude</label>
                <input className="input" type="number" step="any" value={lon} onChange={e=>setLon(parseFloat(e.target.value))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Sowing date</label>
              <input
                className="input"
                type="date"
                value={sowingDate}
                onChange={(e) => setSowingDate(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">Harvest date</label>
              <input
                className="input"
                type="date"
                value={harvestDate}
                onChange={(e) => setHarvestDate(e.target.value)}
                required
              />
            </div>
          </div>
          <div>
            <label className="label">Crop type</label>
            <input
              className="input"
              type="text"
              value={cropType}
              onChange={(e) => setCropType(e.target.value)}
              required
              placeholder="e.g., Canola"
            />
          </div>
          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Running..." : "Run"}
          </button>
          {error && <p className="text-red-400 text-sm">{error}</p>}
        </form>
      </section>

      <section className="card">
        <h2 className="text-xl font-medium mb-2">What is DAESIM</h2>
        <p className="text-neutral-300">
          PaddockTS captures how your paddock changes over time, tracking vegetation, soil, and weather using satellite images and climate data.
        </p>
        <ul className="list-disc ml-6 mt-3 text-neutral-400 text-sm">
          <li>Dates are ISO (YYYY-MM-DD)</li>
          <li>All fields are required — no defaults for site info</li>
        </ul>
      </section>
    </main>
  );
}
