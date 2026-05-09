import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MobileShell } from "@/layout/MobileShell";
import { BackButton } from "@/layout/BackButton";
import { api } from "@/lib/api";
import type { Turf } from "@/data/seed";
import type { Review } from "@/data/seed";
import { Star, MapPin, Clock, Heart, Share2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const TurfDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [turf, setTurf] = useState<Turf | null>(null);
  const [favorite, setFavorite] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (id) api.getTurf(id).then(setTurf).catch(() => navigate("/"));
  }, [id, navigate]);

  useEffect(() => {
    if (!id) return;
    api.listFavorites().then((favorites) => setFavorite(favorites.includes(id)));
    api.listReviews(id).then(setReviews);
  }, [id]);

  const toggleFavorite = async () => {
    if (!id) return;
    const next = await api.toggleFavorite(id);
    const active = next.includes(id);
    setFavorite(active);
    toast.success(active ? "Added to favorites" : "Removed from favorites");
  };

  const submitReview = async () => {
    if (!id) return;
    try {
      await api.addReview(id, rating, comment);
      setComment("");
      setRating(5);
      setReviews(await api.listReviews(id));
      toast.success("Review added");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const handleShare = async () => {
    if (!turf) return;
    const text = [
      `Play Turf - ${turf.name}`,
      `📍 ${turf.address}`,
      `⏰ ${turf.timing}`,
      `₹${turf.price_per_hour}/hr`,
      `⭐ ${turf.rating} rating`,
    ].join("\n");
    if (navigator.share) {
      await navigator.share({ title: turf.name, text, url: window.location.href });
    } else {
      await navigator.clipboard.writeText(text);
      toast.success("Turf details copied!");
    }
  };

  if (!turf) return <MobileShell><div className="p-6 text-soft">Loading…</div></MobileShell>;

  return (
    <MobileShell>
      <div className="relative h-72">
        <img src={turf.image} alt={turf.name} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-background" />
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <BackButton />
          <div className="flex gap-2">
            <button onClick={handleShare} className="h-10 w-10 rounded-full glass grid place-items-center pressable" aria-label="Share">
              <Share2 className="h-5 w-5" />
            </button>
            <button onClick={toggleFavorite} className="h-10 w-10 rounded-full glass grid place-items-center pressable" aria-label="Favourite">
              <Heart className={`h-5 w-5 ${favorite ? "fill-primary text-primary" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="px-4 -mt-10 relative z-10"
      >
        <div className="card-panel rounded-3xl p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="font-display font-bold text-xl leading-tight">{turf.name}</h1>
              <p className="text-sm text-muted2 inline-flex items-center gap-1 mt-1">
                <MapPin className="h-3.5 w-3.5" /> {turf.address}
              </p>
            </div>
            <div className="inline-flex items-center gap-1 bg-primary/15 text-primary border border-primary/40 px-2 py-1 rounded-full text-xs font-semibold">
              <Star className="h-3 w-3 fill-primary" /> {turf.rating}
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3 text-sm text-soft">
            <Clock className="h-4 w-4" /> {turf.timing}
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {turf.sport_types.map((s) => (
              <span key={s} className="text-[11px] bg-panel-2 px-2 py-1 rounded-full border border-white/5">{s}</span>
            ))}
          </div>
        </div>

        <section className="mt-5">
          <h3 className="font-semibold text-sm">About</h3>
          <p className="text-soft text-sm mt-1">{turf.description}</p>
        </section>

        <section className="mt-5">
          <h3 className="font-semibold text-sm">Amenities</h3>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {turf.amenities.map((a) => (
              <div key={a} className="text-xs bg-panel-2 rounded-xl px-3 py-2 border border-white/5">
                {a}
              </div>
            ))}
          </div>
        </section>

        {turf.gallery.length > 1 && (
          <section className="mt-5">
            <h3 className="font-semibold text-sm">Gallery</h3>
            <div className="flex gap-2 mt-2 overflow-x-auto no-scrollbar">
              {turf.gallery.map((g, i) => (
                <img key={i} src={g} alt="gallery" loading="lazy" decoding="async" className="h-24 w-32 rounded-xl object-cover" />
              ))}
            </div>
          </section>
        )}

        {(turf.videos?.length ?? 0) > 0 && (
          <section className="mt-5">
            <h3 className="font-semibold text-sm">Videos</h3>
            <div className="mt-2 flex gap-2 overflow-x-auto no-scrollbar">
              {turf.videos?.map((video, i) => (
                <video key={i} src={video} controls className="h-32 w-56 shrink-0 rounded-xl bg-panel-2 object-cover" />
              ))}
            </div>
          </section>
        )}

        <section className="mt-5">
          <h3 className="font-semibold text-sm">Ratings & Reviews</h3>
          <div className="card-panel mt-2 rounded-2xl p-3">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <button key={value} onClick={() => setRating(value)} className="pressable">
                  <Star className={`h-5 w-5 ${value <= rating ? "fill-primary text-primary" : "text-muted2"}`} />
                </button>
              ))}
            </div>
            <textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              className="mt-3 w-full rounded-xl border border-white/10 bg-panel-2 px-3 py-2 text-sm outline-none focus:border-primary"
              rows={3}
              placeholder="Write a quick review..."
            />
            <button onClick={submitReview} className="pressable mt-3 w-full rounded-full bg-primary py-2 text-sm font-semibold text-primary-foreground shadow-neon">
              Add Review
            </button>
          </div>

          <div className="mt-3 space-y-2">
            {reviews.length === 0 && <p className="text-sm text-muted2">No reviews yet.</p>}
            {reviews.map((review) => (
              <div key={review.id} className="rounded-2xl border border-white/10 bg-panel-2 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">{review.user_name}</p>
                  <span className="inline-flex items-center gap-1 text-xs text-primary"><Star className="h-3 w-3 fill-primary" /> {review.rating}</span>
                </div>
                <p className="mt-1 text-sm text-soft">{review.comment}</p>
              </div>
            ))}
          </div>
        </section>
      </motion.div>

      <div className="h-28" />

      <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-1.5rem)] max-w-[456px] glass-strong rounded-2xl p-3 flex items-center justify-between">
        <div>
          <p className="text-[11px] text-muted2">Starting at</p>
          <p className="font-bold text-lg neon-text">₹{turf.price_per_hour}<span className="text-muted2 text-xs">/hr</span></p>
        </div>
        <button
          onClick={() => navigate(`/booking/new/${turf.id}`)}
          className="bg-primary text-primary-foreground font-semibold rounded-full px-6 py-3 shadow-neon pressable"
          data-testid="detail-book-now"
        >
          Book Now
        </button>
      </div>
    </MobileShell>
  );
};

export default TurfDetail;
