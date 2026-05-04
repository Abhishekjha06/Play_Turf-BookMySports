import { useMemo } from "react";
import { LocateFixed, MapPin } from "lucide-react";
import type { Turf } from "@/data/seed";

export function LocationFilter({
  turfs,
  city,
  area,
  locating,
  onCity,
  onArea,
  onNearMe,
  sport,
  amenity,
  maxPrice,
  minRating,
  openNow,
  onSport,
  onAmenity,
  onMaxPrice,
  onMinRating,
  onOpenNow,
}: {
  turfs: Turf[];
  city: string;
  area: string;
  locating: boolean;
  onCity: (city: string) => void;
  onArea: (area: string) => void;
  onNearMe: () => void;
  sport: string;
  amenity: string;
  maxPrice: string;
  minRating: string;
  openNow: boolean;
  onSport: (value: string) => void;
  onAmenity: (value: string) => void;
  onMaxPrice: (value: string) => void;
  onMinRating: (value: string) => void;
  onOpenNow: (value: boolean) => void;
}) {
  const cities = useMemo(() => Array.from(new Set(turfs.map((t) => t.city))).sort(), [turfs]);
  const sports = useMemo(() => Array.from(new Set(turfs.flatMap((t) => t.sport_types))).sort(), [turfs]);
  const amenities = useMemo(() => Array.from(new Set(turfs.flatMap((t) => t.amenities))).sort(), [turfs]);
  const areas = useMemo(
    () =>
      Array.from(
        new Set(
          turfs
            .filter((t) => !city || t.city === city)
            .map((t) => t.address.split(",")[0]?.trim())
            .filter(Boolean),
        ),
      ).sort(),
    [turfs, city],
  );

  return (
    <section className="mt-3 px-4">
      <div className="glass-strong grid gap-2 rounded-2xl p-3">
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <label className="flex h-11 items-center gap-2 rounded-xl border border-white/10 bg-panel-2 px-3">
            <MapPin className="h-4 w-4 text-primary" />
            <select value={city} onChange={(event) => onCity(event.target.value)} className="min-w-0 flex-1 rounded-lg bg-black/45 px-2 py-1 text-sm font-semibold text-white outline-none">
              <option className="bg-black text-white" value="">All cities</option>
              {cities.map((item) => (
                <option className="bg-black text-white" key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={onNearMe}
            disabled={locating}
            className="pressable inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-3 text-xs font-bold text-primary-foreground shadow-neon disabled:opacity-60"
          >
            <LocateFixed className="h-4 w-4" />
            {locating ? "Locating..." : "Near Me"}
          </button>
        </div>

        <select value={area} onChange={(event) => onArea(event.target.value)} className="h-11 rounded-xl border border-white/10 bg-black/45 px-3 text-sm font-semibold text-white outline-none">
          <option className="bg-black text-white" value="">All areas</option>
          {areas.map((item) => (
            <option className="bg-black text-white" key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <div className="grid grid-cols-2 gap-2">
          <select value={sport} onChange={(event) => onSport(event.target.value)} className="h-11 rounded-xl border border-white/10 bg-black/45 px-3 text-sm font-semibold text-white outline-none">
            <option className="bg-black text-white" value="">All sports</option>
            {sports.map((item) => (
              <option className="bg-black text-white" key={item} value={item}>{item}</option>
            ))}
          </select>
          <select value={amenity} onChange={(event) => onAmenity(event.target.value)} className="h-11 rounded-xl border border-white/10 bg-black/45 px-3 text-sm font-semibold text-white outline-none">
            <option className="bg-black text-white" value="">All amenities</option>
            {amenities.map((item) => (
              <option className="bg-black text-white" key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
          <input value={maxPrice} onChange={(event) => onMaxPrice(event.target.value)} inputMode="numeric" placeholder="Max price" className="h-11 rounded-xl border border-white/10 bg-black/45 px-3 text-sm font-semibold text-white outline-none placeholder:text-white/45" />
          <select value={minRating} onChange={(event) => onMinRating(event.target.value)} className="h-11 rounded-xl border border-white/10 bg-black/45 px-3 text-sm font-semibold text-white outline-none">
            <option className="bg-black text-white" value="">Any rating</option>
            <option className="bg-black text-white" value="4.5">4.5+</option>
            <option className="bg-black text-white" value="4.7">4.7+</option>
            <option className="bg-black text-white" value="4.8">4.8+</option>
          </select>
          <button type="button" onClick={() => onOpenNow(!openNow)} className={`h-11 rounded-xl border px-3 text-xs font-bold ${openNow ? "border-primary bg-primary text-primary-foreground" : "border-white/10 bg-black/45 text-white"}`}>
            Open
          </button>
        </div>
      </div>
    </section>
  );
}
