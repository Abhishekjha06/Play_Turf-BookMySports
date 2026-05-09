import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { MobileShell } from "@/layout/MobileShell";
import { AppHeader } from "@/layout/AppHeader";
import { BottomNav } from "@/layout/BottomNav";
import { SearchBar } from "@/home/SearchBar";
import { LocationFilter } from "@/home/LocationFilter";
import { HeroCarousel } from "@/home/HeroCarousel";
import { CategoryPills } from "@/home/CategoryPills";
import { SectionHeader } from "@/home/SectionHeader";
import TurfCard from "@/turf/TurfCard";
import { CompactTurfCard } from "@/turf/CompactTurfCard";
import { OfferCard } from "@/offers/OfferCard";
import { BookingRow } from "@/booking/BookingRow";
import { getPopularTurfs, getNearbyTurfs, getAllTurfs } from "@/services/turfService";
import { getOffers } from "@/services/offerService";
import { api } from "@/lib/api";
import type { Banner, Booking, Turf, Offer } from "@/data/seed";
import { toast } from "sonner";

const cityCoords: Record<string, { lat: number; lon: number }> = {
  Bangalore: { lat: 12.9716, lon: 77.5946 },
  Mumbai: { lat: 19.076, lon: 72.8777 },
  Hyderabad: { lat: 17.385, lon: 78.4867 },
  Delhi: { lat: 28.6139, lon: 77.209 },
};

function closestCity(lat: number, lon: number, cities: string[]) {
  return cities.reduce(
    (best, city) => {
      const coords = cityCoords[city];
      if (!coords) return best;
      const score = Math.hypot(coords.lat - lat, coords.lon - lon);
      return score < best.score ? { city, score } : best;
    },
    { city: cities[0] || "", score: Number.POSITIVE_INFINITY },
  ).city;
}

const Home = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const q = params.get("q") || "";
  const nearby = params.get("nearby") === "1";
  const selectedCity = params.get("city") || "";
  const selectedArea = params.get("area") || "";
  const selectedSport = params.get("sport") || "";
  const selectedAmenity = params.get("amenity") || "";
  const maxPrice = params.get("maxPrice") || "";
  const minRating = params.get("minRating") || "";
  const openNow = params.get("openNow") === "1";

  // ── Section data via service layer (mock → Supabase ready) ────────
  const [banners, setBanners] = useState<Banner[]>([]);
  const [allTurfs, setAllTurfs] = useState<Turf[]>([]);
  const [popular, setPopular] = useState<Turf[]>([]);
  const [near, setNear] = useState<Turf[]>([]);
  const [results, setResults] = useState<Turf[] | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [upcoming, setUpcoming] = useState<Booking[]>([]);
  const [locating, setLocating] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    void Promise.all([
      // Banners & bookings still use the legacy api (no service yet)
      api.listBanners().then(setBanners),
      api.upcomingBookings().then(setUpcoming),
      // Turf & offer data via the new service layer
      getAllTurfs().then(setAllTurfs),
      getPopularTurfs(10).then(setPopular),
      getNearbyTurfs(null, 10).then(setNear),
      getOffers(10).then(setOffers),
    ]);
  }, []);

  // ── Memoized filter options ────────────────────────────────────────
  const filterOpts = useMemo(() => ({
    q,
    city: selectedCity,
    area: selectedArea,
    sport: selectedSport,
    amenity: selectedAmenity,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    minRating: minRating ? Number(minRating) : undefined,
    openNow,
    userLocation: userLocation || undefined,
  }), [q, selectedCity, selectedArea, selectedSport, selectedAmenity, maxPrice, minRating, openNow, userLocation]);

  const hasActiveFilter = !!(q || selectedCity || selectedArea || selectedSport || selectedAmenity || maxPrice || minRating || openNow);

  // ── Search / filter logic ─────────────────────────────────────────
  useEffect(() => {
    if (hasActiveFilter)
      api.listTurfs(filterOpts).then(setResults);
    else if (nearby)
      api.listTurfs({ nearby: true, userLocation: userLocation || undefined }).then(setResults);
    else setResults(null);
  }, [hasActiveFilter, nearby, filterOpts, userLocation]);


  useEffect(() => {
    if (!nearby || selectedCity || !navigator.geolocation || allTurfs.length === 0) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const cities = Array.from(new Set(allTurfs.map((t) => t.city)));
        const city = closestCity(position.coords.latitude, position.coords.longitude, cities);
        setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        setLocating(false);
        if (city) {
          toast.success(`Showing turfs near ${city}`);
          updateLocation(city, "");
        }
      },
      () => {
        setLocating(false);
        toast.error("Location permission blocked. Please select your city.");
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 },
    );
  }, [nearby, selectedCity, allTurfs]);

  const setParam = useCallback((key: string, value: string | boolean) => {
    const next = new URLSearchParams(params);
    next.delete("nearby");
    if (value === "" || value === false) next.delete(key);
    else next.set(key, value === true ? "1" : String(value));
    navigate(`/?${next.toString()}`);
  }, [params, navigate]);

  const updateLocation = useCallback((city: string, area = selectedArea) => {
    const next = new URLSearchParams(params);
    next.delete("q");
    next.delete("nearby");
    if (city) next.set("city", city);
    else next.delete("city");
    if (area) next.set("area", area);
    else next.delete("area");
    navigate(`/?${next.toString()}`);
  }, [params, navigate, selectedArea]);

  const requestNearMe = useCallback(() => {
    const next = new URLSearchParams(params);
    next.set("nearby", "1");
    next.delete("city");
    next.delete("area");
    next.delete("q");
    navigate(`/?${next.toString()}`);
  }, [params, navigate]);

  return (
    <MobileShell>
      <AppHeader />
      <SearchBar />
      <LocationFilter
        turfs={allTurfs}
        city={selectedCity}
        area={selectedArea}
        locating={locating}
        onCity={(city) => updateLocation(city, "")}
        onArea={(area) => updateLocation(selectedCity, area)}
        onNearMe={requestNearMe}
        sport={selectedSport}
        amenity={selectedAmenity}
        maxPrice={maxPrice}
        minRating={minRating}
        openNow={openNow}
        onSport={(value) => setParam("sport", value)}
        onAmenity={(value) => setParam("amenity", value)}
        onMaxPrice={(value) => setParam("maxPrice", value)}
        onMinRating={(value) => setParam("minRating", value)}
        onOpenNow={(value) => setParam("openNow", value)}
      />

      {results ? (
        <>
          <SectionHeader title={q ? `Results for "${q}"` : selectedArea ? selectedArea : selectedCity ? selectedCity : "Near you"} />
          <div className="grid grid-cols-2 gap-3 px-4">
            {results.map((t, i) => (<TurfCard key={t.id} turf={t} index={i} userLocation={userLocation} />))}
            {results.length === 0 && <p className="col-span-2 text-sm text-muted2 text-center py-8">No turfs found.</p>}
          </div>
        </>
      ) : (
        <>
          <HeroCarousel banners={banners} />
          <CategoryPills />

          {/* ── Popular Turfs ──────────────────────────────────────── */}
          <SectionHeader title="Popular Turfs" to="/?nearby=1" action="See all" />
          <div className="grid grid-cols-2 gap-3 px-4">
            {popular.slice(0, 4).map((t, i) => (
              <TurfCard key={t.id} turf={t} index={i} userLocation={userLocation} />
            ))}
          </div>

          {/* ── Top Picks Near You ─────────────────────────────────── */}
          <SectionHeader title="Top Picks Near You" to="/?nearby=1" action="See all" />
          <div className="flex gap-3 overflow-x-auto no-scrollbar px-4 pb-1">
            {near.map((t) => (
              <CompactTurfCard key={t.id} turf={t} userLocation={userLocation} />
            ))}
          </div>

          {/* ── Offers & Deals ─────────────────────────────────────── */}
          <SectionHeader title="Offers & Deals" to="/offers" action="See all" />
          <div className="flex gap-3 overflow-x-auto no-scrollbar px-4 pb-1">
            {offers.map((o) => (
              <OfferCard key={o.id} offer={o} />
            ))}
          </div>

          {/* ── Upcoming Bookings ──────────────────────────────────── */}
          {upcoming.length > 0 && (
            <>
              <SectionHeader title="Upcoming Bookings" to="/bookings" action="See all" />
              <motion.div
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="px-4 flex flex-col gap-2"
              >
                {upcoming.slice(0, 3).map((b) => (<BookingRow key={b.id} booking={b} />))}
              </motion.div>
            </>
          )}

          <div className="h-6" />
        </>
      )}

      <BottomNav />
    </MobileShell>
  );
};

export default Home;
