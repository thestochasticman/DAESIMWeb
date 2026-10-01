"use client";

import SiteMap from "../../components/map/SiteMap";

// Map view: pick the site by clicking the map or dragging the marker; the
// query bar above shows the same coordinates and accepts "lat, lon" typed in.
export default function HomePage() {
  return (
    <div className="absolute inset-0">
      <SiteMap />
    </div>
  );
}
