import { Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";

export function AppHeader() {
  const { user } = useAuth();
  const initial = (user?.name || "P").charAt(0).toUpperCase();
  return (
    <header className="sticky top-0 z-40 glass px-4 pt-4 pb-3" data-testid="app-header">
      <div className="flex items-center justify-between">
        <Link to="/" className="leading-tight" data-testid="header-logo">
          <h1 className="font-display font-extrabold text-2xl tracking-tight">
            <span className="text-foreground">play</span>
            <span className="neon-text">_Turf</span>
          </h1>
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted2">BookMySports</p>
        </Link>
        <div className="flex items-center gap-3">
          <button
            aria-label="Notifications"
            className="relative h-10 w-10 rounded-full bg-panel-2 grid place-items-center pressable"
            data-testid="header-notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary shadow-neon" />
          </button>
          <Link
            to={user ? "/more" : "/login"}
            aria-label="Profile"
            className="h-10 w-10 rounded-full bg-gradient-neon text-primary-foreground grid place-items-center font-semibold pressable"
            data-testid="header-avatar"
          >
            {initial}
          </Link>
        </div>
      </div>
    </header>
  );
}
