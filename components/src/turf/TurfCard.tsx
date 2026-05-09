import { motion } from "framer-motion";
import { Heart, Star, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import type { Turf } from "@/data/seed";
import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";

export function TurfCard({ turf, index = 0, userLocation }: { turf: Turf; index?: number; userLocation?: { lat: number; lng: number } | null }) {
  const [fav, setFav] = useState(false);
  const km = userLocation ? api.distanceKm(userLocation, turf) : null;

  // Respect prefers-reduced-motion: disable Framer Motion animations
  const prefersReducedMotion = typeof window !== "undefined"
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    api.listFavorites().then((favorites) => setFav(favorites.includes(turf.id)));
  }, [turf.id]);

  const toggleFav = async (e: React.MouseEvent) => {
    e.preventDefault();
    const next = await api.toggleFavorite(turf.id);
    const active = next.includes(turf.id);
    setFav(active);
    toast.success(active ? "Added to favorites" : "Removed from favorites");
  };

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
      whileInView={prefersReducedMotion ? false : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.35, delay: Math.min(index, 6) * 0.05 }}
      className="card-panel rounded-2xl overflow-hidden flex flex-col"
      data-testid={`turf-card-${turf.id}`}
    >
      <div className="relative aspect-[4/3]">
        <img src={turf.image} alt={turf.name} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/60 to-transparent" />
        <button
          onClick={toggleFav}
          aria-label="Favourite"
          className="absolute top-2 right-2 h-8 w-8 grid place-items-center rounded-full glass pressable"
          data-testid={`fav-${turf.id}`}
        >
          <Heart className={`h-4 w-4 ${fav ? "fill-primary text-primary" : "text-white"}`} />
        </button>
        <div className="absolute bottom-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full glass text-[11px]">
          <Star className="h-3 w-3 fill-primary text-primary" /> {turf.rating}
        </div>
        {km !== null && Number.isFinite(km) && (
          <div className="absolute bottom-2 right-2 rounded-full glass px-2 py-0.5 text-[11px] font-semibold">
            {km.toFixed(1)} km
          </div>
        )}
      </div>
      <div className="p-3 flex flex-col gap-2 flex-1">
        <div>
          <h3 className="font-semibold text-sm leading-tight line-clamp-1">{turf.name}</h3>
          <p className="text-[11px] text-muted2 line-clamp-1">{turf.address}</p>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-soft">
          <Clock className="h-3 w-3" /> <span className="line-clamp-1">{turf.timing}</span>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm">
            <span className="font-bold neon-text">₹{turf.price_per_hour}</span>
            <span className="text-muted2 text-[11px]">/hr</span>
          </p>
        </div>
        <Link
          to={`/turf/${turf.id}`}
          className="mt-1 w-full text-center bg-primary text-primary-foreground font-semibold rounded-full py-2 text-xs shadow-neon pressable"
          data-testid={`book-${turf.id}`}
        >
          Book Now
        </Link>
      </div>
    </motion.div>
  );
}

export default React.memo(TurfCard);
