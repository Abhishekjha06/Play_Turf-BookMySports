import { Link, useNavigate } from "react-router-dom";
import { MobileShell } from "@/components/layout/MobileShell";
import { AppHeader } from "@/components/layout/AppHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { useAuth } from "@/hooks/use-auth";
import { signOut } from "@/lib/auth";
import { LogOut, ShieldCheck, Bell, HelpCircle, FileText, ChevronRight, UserCircle2 } from "lucide-react";
import { toast } from "sonner";

const More = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const items = [
    { label: "Notifications", icon: Bell, to: "#" },
    { label: "Terms of Service", icon: FileText, to: "#" },
    { label: "Help & Support", icon: HelpCircle, to: "#" },
    ...(user?.is_admin ? [{ label: "Admin Panel", icon: ShieldCheck, to: "/admin" }] : []),
  ];

  return (
    <MobileShell>
      <AppHeader />
      <section className="px-4 mt-4">
        <div className="card-panel rounded-3xl p-4 flex items-center gap-3">
          <div className="h-14 w-14 rounded-full bg-gradient-neon text-primary-foreground grid place-items-center font-bold text-xl">
            {user ? (user.name[0] ?? "U").toUpperCase() : <UserCircle2 className="h-6 w-6" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">{user?.name ?? "Guest"}</p>
            <p className="text-xs text-muted2 truncate">{user?.email ?? "Sign in to start booking"}</p>
          </div>
          {!user && (
            <Link to="/login" className="bg-primary text-primary-foreground rounded-full px-4 py-2 text-xs font-semibold shadow-neon">
              Sign in
            </Link>
          )}
        </div>
      </section>

      <section className="px-4 mt-5 flex flex-col gap-2">
        {items.map((it) => (
          <Link key={it.label} to={it.to} className="card-panel rounded-2xl px-4 py-3 flex items-center gap-3 pressable">
            <div className="h-9 w-9 rounded-full bg-panel-3 grid place-items-center"><it.icon className="h-4 w-4 text-primary" /></div>
            <span className="flex-1 text-sm">{it.label}</span>
            <ChevronRight className="h-4 w-4 text-muted2" />
          </Link>
        ))}
        {user && (
          <button
            onClick={async () => { await signOut(); toast.success("Signed out"); navigate("/"); }}
            className="card-panel rounded-2xl px-4 py-3 flex items-center gap-3 pressable text-left"
            data-testid="logout-btn"
          >
            <div className="h-9 w-9 rounded-full bg-destructive/15 grid place-items-center"><LogOut className="h-4 w-4 text-destructive" /></div>
            <span className="flex-1 text-sm">Log out</span>
          </button>
        )}
      </section>
      <BottomNav />
    </MobileShell>
  );
};

export default More;
