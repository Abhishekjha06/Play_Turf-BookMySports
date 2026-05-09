import { useEffect, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import type { Banner } from "@/data/seed";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

export function HeroCarousel({ banners }: { banners: Banner[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  // Pause auto-rotation when tab is hidden (Page Visibility API)
  useEffect(() => {
    const onVisibilityChange = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  useEffect(() => {
    if (!banners.length || paused) return;
    const t = setInterval(() => setI((p) => (p + 1) % banners.length), 4500);
    return () => clearInterval(t);
  }, [banners.length, paused]);

  if (!banners.length) return null;
  const b = banners[i];
  const headingParts = b.title.split(b.highlight);

  return (
    <section className="px-4 mt-4" data-testid="hero-carousel">
      <div className="relative h-56 rounded-3xl overflow-hidden card-panel">
        <AnimatePresence mode="wait">
          <motion.div
            key={b.id}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0"
          >
            <img src={b.image} alt={b.title} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-overlay" />
            <div className="absolute inset-0 p-5 flex flex-col justify-between">
              <span className="self-start inline-flex items-center px-3 py-1 rounded-full bg-primary/15 border border-primary/40 text-primary text-[11px] font-semibold tracking-wider">
                {b.badge}
              </span>
              <div>
                <h2 className="font-display font-extrabold text-2xl leading-tight">
                  {headingParts[0]}
                  <span className="neon-text">{b.highlight}</span>
                  {headingParts[1]}
                </h2>
                <p className="text-soft text-sm mt-1 line-clamp-2">{b.subtitle}</p>
                <Link
                  to={b.cta_link}
                  className="mt-3 inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold rounded-full px-4 py-2 text-sm shadow-neon pressable"
                  data-testid="hero-cta"
                >
                  {b.cta_text} <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="flex items-center justify-center gap-1.5 mt-3" role="tablist">
        {banners.map((_, idx) => (
          <button
            key={idx}
            aria-label={`Slide ${idx + 1}`}
            onClick={() => setI(idx)}
            className={cn(
              "h-1.5 rounded-full transition-all",
              idx === i ? "w-7 bg-primary shadow-neon" : "w-1.5 bg-white/25"
            )}
          />
        ))}
      </div>
    </section>
  );
}
