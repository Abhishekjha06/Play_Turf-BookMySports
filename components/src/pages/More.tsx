import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { MobileShell } from "@/components/layout/MobileShell";
import { AppHeader } from "@/components/layout/AppHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { useAuth } from "@/hooks/use-auth";
import { signOut, signInAdmin } from "@/lib/auth";
import { LogOut, ShieldCheck, Bell, FileText, ChevronRight, UserCircle2, Lock } from "lucide-react";
import { toast } from "sonner";

const More = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const regularItems = [
    { label: "Notifications", icon: Bell, to: "#" },
    { label: "Terms of Service", icon: FileText, to: "#" },
  ];

  const isAdmin = user?.is_admin ?? false;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signInAdmin(email, password);
      toast.success("Admin login successful");
      // The auth state will update via useAuth, causing re-render
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

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
        {regularItems.map((it) => (
          <Link
            key={it.label}
            to={it.to}
            className="card-panel rounded-2xl px-4 py-3 flex items-center gap-3 pressable"
          >
            <div className="h-9 w-9 rounded-full bg-panel-3 grid place-items-center"><it.icon className="h-4 w-4 text-primary" /></div>
            <span className="flex-1 text-sm">{it.label}</span>
            <ChevronRight className="h-4 w-4 text-muted2" />
          </Link>
        ))}

        {/* Admin Panel / Login */}
        <div className="card-panel rounded-2xl px-4 py-3 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-panel-3 grid place-items-center">
              {isAdmin ? (
                <ShieldCheck className="h-4 w-4 text-primary" />
              ) : (
                <Lock className="h-4 w-4 text-primary" />
              )}
            </div>
            <span className="flex-1 text-sm font-semibold">
              {isAdmin ? "Admin Panel" : "Admin Login"}
            </span>
            {isAdmin && <ChevronRight className="h-4 w-4 text-muted2" />}
          </div>

          {isAdmin ? (
            <>
              <p className="text-xs text-muted2">Manage turfs, bookings, offers, etc.</p>
              <Link
                to="/admin"
                className="pressable mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-primary py-2 px-4 text-xs font-semibold text-primary-foreground shadow-neon"
              >
                Go to Admin Dashboard
              </Link>
            </>
          ) : (
            <form onSubmit={handleAdminLogin}>
              <div className="mt-4 rounded-3xl border border-white/10 bg-panel-2/80 p-4 text-left">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted2">Admin access</p>
                <input
                  className="mt-3 h-12 w-full rounded-2xl border border-white/10 bg-background px-4 text-sm outline-none focus:border-primary"
                  placeholder="Gmail / admin ID"
                  data-testid="admin-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="text"
                  required
                />
                <input
                  type="password"
                  className="mt-2 h-12 w-full rounded-2xl border border-white/10 bg-background px-4 text-sm outline-none focus:border-primary"
                  placeholder="Password"
                  data-testid="admin-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-3 w-full bg-panel-2 border border-white/10 text-soft font-semibold rounded-full py-3 text-sm pressable disabled:opacity-50"
                  data-testid="admin-signin"
                >
                  {loading ? "Signing in..." : "Admin Login"}
                </button>
              </div>
            </form>
          )}
        </div>

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
