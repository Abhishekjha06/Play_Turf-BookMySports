import { Home, CalendarCheck, Trophy, MoreHorizontal, Goal } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const items = [
  { to: "/", label: "Home", icon: Home, testid: "nav-home" },
  { to: "/bookings", label: "Bookings", icon: CalendarCheck, testid: "nav-bookings" },
  { to: "/tournaments", label: "Tournaments", icon: Trophy, testid: "nav-tournaments" },
  { to: "/more", label: "More", icon: MoreHorizontal, testid: "nav-more" },
];

export function BottomNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  return (
    <>
      {/* spacer */}
      <div className="h-24" aria-hidden />
      <nav
        className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-1.5rem)] max-w-[456px] glass-strong rounded-full px-3 py-2 flex items-center justify-between"
        data-testid="bottom-nav"
      >
        {items.slice(0, 2).map((it) => (
          <NavItem key={it.to} {...it} active={pathname === it.to} />
        ))}

        {/* Central FAB */}
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => navigate("/")}
          aria-label="Quick book"
          className="relative -mt-10 h-16 w-16 rounded-full bg-gradient-neon text-primary-foreground grid place-items-center animate-pulse-glow"
          data-testid="fab-book"
        >
          <Goal className="h-7 w-7" strokeWidth={2.5} />
        </motion.button>

        {items.slice(2).map((it) => (
          <NavItem key={it.to} {...it} active={pathname === it.to} />
        ))}
      </nav>
    </>
  );
}

function NavItem({
  to, label, icon: Icon, active, testid,
}: { to: string; label: string; icon: typeof Home; active: boolean; testid: string }) {
  return (
    <Link
      to={to}
      data-testid={testid}
      className={cn(
        "flex flex-col items-center justify-center gap-0.5 h-12 w-16 rounded-2xl pressable",
        active ? "text-[#7fb8f5]" : "text-muted2"
      )}
    >
      <Icon className="h-5 w-5" />
      <span className="text-[10px] font-medium tracking-wide">{label}</span>
    </Link>
  );
}
