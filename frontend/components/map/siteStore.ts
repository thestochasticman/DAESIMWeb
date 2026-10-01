// The site (lat, lon) shared between the persistent query bar and the map.
// A tiny module-level store (same idea as PaddockTSWeb's mapStore): the bar
// and the map never hold refs to each other, they both talk to this.
export type Site = { lat: number; lon: number };
export type Source = "map" | "panel";
type Listener = (site: Site, source: Source) => void;

const LS_KEY = "DAESIM:last_site";
export const DEFAULT_SITE: Site = { lat: -33.504, lon: 148.4 };

let current: Site | null = null;
const listeners = new Set<Listener>();

export function getSite(): Site | null {
  return current;
}

export function setSite(site: Site, source: Source) {
  current = site;
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(site));
  } catch {}
  listeners.forEach((fn) => fn(site, source));
}

export function subscribe(fn: Listener): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function loadInitialSite(): Site {
  if (current) return current;
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      const lat = Number(p.lat), lon = Number(p.lon);
      if (Number.isFinite(lat) && Number.isFinite(lon)) {
        current = { lat, lon };
        return current;
      }
    }
  } catch {}
  current = DEFAULT_SITE;
  return current;
}

/** "lat, lon" (also accepts whitespace separation) -> Site, or null. */
export function parseSite(text: string): Site | null {
  const parts = text.trim().split(/[,\s]+/).filter((p) => p.length > 0);
  if (parts.length < 2) return null;
  const lat = Number(parts[0]), lon = Number(parts[1]);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  if (Math.abs(lat) > 90 || Math.abs(lon) > 180) return null;
  return { lat, lon };
}

export function formatSite(s: Site): string {
  return `${s.lat.toFixed(5)}, ${s.lon.toFixed(5)}`;
}
