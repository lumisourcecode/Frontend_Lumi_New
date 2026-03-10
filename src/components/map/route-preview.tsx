"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useScript } from "@/lib/use-script";

type LatLng = { lat: number; lng: number };

export function RoutePreview({
  origin,
  destination,
  className,
}: {
  origin: LatLng | null;
  destination: LatLng | null;
  className?: string;
}) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const mapRef = useRef<HTMLDivElement>(null);
  const [meta, setMeta] = useState<{ distanceText: string; durationText: string } | null>(null);
  const [err, setErr] = useState<string>("");

  const scriptLoaded = useScript(
    apiKey ? `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places` : null,
  );

  const canRender = useMemo(
    () => Boolean(apiKey && scriptLoaded && origin && destination && typeof google !== "undefined"),
    [apiKey, scriptLoaded, origin, destination],
  );

  useEffect(() => {
    if (!canRender || !mapRef.current || !origin || !destination) return;

    setErr("");
    setMeta(null);

    const map = new google.maps.Map(mapRef.current, {
      center: origin,
      zoom: 12,
      mapTypeControl: false,
      fullscreenControl: false,
      streetViewControl: false,
    });

    const renderer = new google.maps.DirectionsRenderer({
      map,
      suppressMarkers: false,
      polylineOptions: { strokeColor: "#17206D", strokeOpacity: 0.9, strokeWeight: 5 },
    });
    const service = new google.maps.DirectionsService();

    service.route(
      {
        origin,
        destination,
        travelMode: google.maps.TravelMode.DRIVING,
        provideRouteAlternatives: false,
      },
      (result, status) => {
        if (status !== "OK" || !result) {
          setErr(`Route unavailable (${status}). Check your Maps API key + enabled APIs.`);
          return;
        }
        renderer.setDirections(result);
        const leg = result.routes?.[0]?.legs?.[0];
        const distanceText = leg?.distance?.text ?? "—";
        const durationText = leg?.duration?.text ?? "—";
        setMeta({ distanceText, durationText });
      },
    );

    return () => {
      renderer.setMap(null);
    };
  }, [canRender, origin, destination]);

  if (!apiKey) {
    return (
      <div className={className}>
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-3 text-xs text-slate-600">
          Add <code className="font-mono">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to enable live route preview.
        </div>
      </div>
    );
  }

  if (!origin || !destination) {
    return (
      <div className={className}>
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-3 text-xs text-slate-600">
          Select a pickup and destination to preview the route.
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {meta ? (
        <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-slate-700">
          <span className="rounded-full bg-slate-100 px-3 py-1">
            Distance: <strong>{meta.distanceText}</strong>
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1">
            ETA: <strong>{meta.durationText}</strong>
          </span>
        </div>
      ) : null}
      {err ? <p className="mb-2 text-xs text-red-600">{err}</p> : null}
      <div ref={mapRef} className="h-64 w-full overflow-hidden rounded-2xl border border-slate-200" />
    </div>
  );
}

