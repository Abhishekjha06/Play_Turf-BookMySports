import { Link } from "react-router-dom";
import type { Turf } from "@/data/seed";
import { api } from "@/lib/api";

export function CompactTurfCard({ turf, userLocation }: { turf: Turf; userLocation?: { lat: number; lng: number } | null }) {
  const km = userLocation ? api.distanceKm(userLocation, turf) : null;
  return (
    <Link
      to={`/turf/${turf.id}`}
      className="shrink-0 w-40 card-panel rounded-2xl overflow-hidden pressable"
      data-testid={`compact-turf-${turf.id}`}
    >
      <div className="relative aspect-[4/3]">
        <img src={turf.image} alt={turf.name} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
      </div>
      <div className="p-2.5">
        <h4 className="text-xs font-semibold line-clamp-1">{turf.name}</h4>
        <p className="text-[11px] text-muted2 line-clamp-1">{turf.address}</p>
        {km !== null && Number.isFinite(km) && <p className="mt-1 text-[11px] text-soft">{km.toFixed(1)} km away</p>}
        <p className="text-[12px] mt-1">
          <span className="neon-text font-bold">₹{turf.price_per_hour}</span>
          <span className="text-muted2">/hr</span>
        </p>
      </div>
    </Link>
  );
}
