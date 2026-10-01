"use client";

import { useEffect, useState } from "react";
import { APIProvider, Map, Marker, useMap, type MapMouseEvent } from "@vis.gl/react-google-maps";
import { apiKey } from "../api";
import { getSite, loadInitialSite, setSite, subscribe, type Site } from "./siteStore";

// Marker + two-way sync with siteStore. Must be a child of <Map> so useMap()
// works. Clicking the map or dragging the marker moves the site; typing
// coordinates in the query bar pans the map to the site.
function SiteMarker() {
  const map = useMap();
  const [site, setLocal] = useState<Site>(() => getSite() ?? loadInitialSite());

  useEffect(() => {
    return subscribe((s, source) => {
      setLocal(s);
      if (source === "panel" && map) map.panTo({ lat: s.lat, lng: s.lon });
    });
  }, [map]);

  return (
    <Marker
      position={{ lat: site.lat, lng: site.lon }}
      draggable
      onDragEnd={(e: google.maps.MapMouseEvent) => {
        const ll = e.latLng;
        if (ll) setSite({ lat: ll.lat(), lon: ll.lng() }, "map");
      }}
    />
  );
}

export default function SiteMap() {
  const [initial] = useState<Site>(() => loadInitialSite());

  if (!apiKey) {
    return (
      <div className="w-full h-full flex items-center justify-center text-neutral-400 text-sm">
        Google Maps key missing: set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY (see .env.example).
      </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey}>
      <Map
        defaultCenter={{ lat: initial.lat, lng: initial.lon }}
        defaultZoom={9}
        mapTypeId="hybrid"
        gestureHandling="greedy"
        className="w-full h-full"
        disableDefaultUI={false}
        mapTypeControl
        zoomControl
        onClick={(e: MapMouseEvent) => {
          const ll = e.detail.latLng;
          if (ll) setSite({ lat: ll.lat, lon: ll.lng }, "map");
        }}
      >
        <SiteMarker />
      </Map>
    </APIProvider>
  );
}
