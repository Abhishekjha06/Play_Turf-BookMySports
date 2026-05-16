import { useState } from "react";
import { Link } from "react-router-dom";
import { CalendarCheck, MapPin, Tag, Trophy, MoreHorizontal } from "lucide-react";
import { TossModal } from "./TossModal";
import headsImg from "@/assets/heads.png";

const cats = [
  { label: "My Bookings", icon: CalendarCheck, to: "/bookings" },
  { label: "Near Me", icon: MapPin, to: "/?nearby=1" },
  { label: "Offers", icon: Tag, to: "/offers" },
  { label: "Tournaments", icon: Trophy, to: "/tournaments" },
  { label: "More", icon: MoreHorizontal, to: "/more" },
];

export function CategoryPills() {
  const [tossOpen, setTossOpen] = useState(false);

  return (
    <section className="mt-5" data-testid="category-pills">
      <div className="flex gap-3 overflow-x-auto no-scrollbar px-4">
        {/* ── Toss Time (Shortcut with PNG in Panel) ── */}
        <button
          onClick={() => setTossOpen(true)}
          className="shrink-0 flex flex-col items-center w-16 pressable bg-transparent border-none outline-none cursor-pointer"
        >
          <div className="h-14 w-14 rounded-full grid place-items-center bg-panel-2 border border-primary/40 shadow-[0_0_18px_rgba(198,248,6,0.18)]">
            <img src={headsImg} alt="Toss" className="h-7 w-7 object-contain drop-shadow-[0_0_8px_rgba(242,202,80,0.3)]" />
          </div>
          <span className="mt-1 text-[11px] text-soft text-center leading-tight">Toss Time</span>
        </button>

        {/* ── Other shortcuts (Standard Style) ── */}
        {cats.map((c) => (
          <Link key={c.label} to={c.to} className="shrink-0 flex flex-col items-center w-16 pressable">
            <div className="h-14 w-14 rounded-full grid place-items-center bg-panel-2 border border-primary/40 shadow-[0_0_18px_rgba(198,248,6,0.18)]">
              <c.icon className="h-6 w-6 text-primary" />
            </div>
            <span className="mt-1 text-[11px] text-soft text-center leading-tight">{c.label}</span>
          </Link>
        ))}
      </div>

      {/* Toss Time Modal */}
      <TossModal open={tossOpen} onClose={() => setTossOpen(false)} />
    </section>
  );
}
