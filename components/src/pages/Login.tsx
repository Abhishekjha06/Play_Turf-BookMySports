import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MobileShell } from "@/components/layout/MobileShell";
import { BackButton } from "@/components/layout/BackButton";
import {
  signInAdmin,
  signInMock,
  requestOtp,
  signInWithOtp,
  getRemainingAttempts,
  getTimeUntilUnlocked,
} from "@/lib/auth";
import { isMockMode } from "@/lib/api";
import { toast } from "sonner";
import { motion } from "framer-motion";
import heroNight from "@/assets/hero-night-turf.jpg";

const Login = () => {
  const navigate = useNavigate();
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminLoading, setAdminLoading] = useState(false);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [otpRequested, setOtpRequested] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState(2);
  const [timeUntilUnlock, setTimeUntilUnlock] = useState(0);

  // Update attempt counter when email changes
  useEffect(() => {
    setRemainingAttempts(getRemainingAttempts(adminEmail));
    setTimeUntilUnlock(getTimeUntilUnlocked(adminEmail));
  }, [adminEmail]);

  // Timer for lockout countdown
  useEffect(() => {
    if (timeUntilUnlock <= 0) return;

    const interval = setInterval(() => {
      setTimeUntilUnlock((prev) => {
        const next = prev - 1000;
        return next <= 0 ? 0 : next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeUntilUnlock]);

  const handleGoogle = async () => {
    if (!isMockMode) {
      // Real backend wired — redirect to Emergent OAuth flow
      const redirectURL = `${window.location.origin}/auth/callback`;
      window.location.href = `/api/auth/google?redirect=${encodeURIComponent(redirectURL)}`;
      return;
    }
    await signInMock(false);
    toast.success("Signed in");
    navigate("/");
  };

  const handleRequestOtp = async () => {
    if (!phone.trim()) {
      toast.error("Enter your phone number");
      return;
    }
    setOtpLoading(true);
    try {
      await requestOtp(phone.trim());
      setOtpRequested(true);
      toast.success("OTP sent");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      toast.error("Enter OTP");
      return;
    }
    setOtpLoading(true);
    try {
      await signInWithOtp(phone.trim(), otp.trim(), name.trim() || undefined);
      toast.success("Signed in");
      navigate("/");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleAdmin = async () => {
    setAdminLoading(true);
    try {
      await signInAdmin(adminEmail, adminPassword);
      toast.success("Signed in as admin");
      navigate("/admin");
    } catch (e) {
      // Update attempt counter on error
      setRemainingAttempts(getRemainingAttempts(adminEmail));
      setTimeUntilUnlock(getTimeUntilUnlocked(adminEmail));
      toast.error((e as Error).message);
    } finally {
      setAdminLoading(false);
    }
  };

  return (
    <MobileShell>
      <div className="absolute inset-0">
        <img src={heroNight} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/85 to-background" />
      </div>

      <div className="relative z-10 px-5 pt-6">
        <BackButton />
      </div>

      <div className="relative z-10 px-5 pt-20 flex flex-col items-center text-center">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display font-extrabold text-4xl">
            <span className="text-foreground">play</span><span className="neon-text">_Turf</span>
          </h1>
          <p className="mt-2 text-soft text-sm tracking-[0.3em] uppercase">BookMySports</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="mt-10 w-full max-w-sm"
        >
          {!isMockMode ? (
            <div className="rounded-3xl border border-white/10 bg-panel-2/80 p-4 text-left">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted2">Sign in with OTP</p>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="mt-3 h-12 w-full rounded-2xl border border-white/10 bg-background px-4 text-sm outline-none focus:border-primary"
                placeholder="Your name (optional)"
                data-testid="otp-name"
              />
              <input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className="mt-2 h-12 w-full rounded-2xl border border-white/10 bg-background px-4 text-sm outline-none focus:border-primary"
                placeholder="Phone number"
                data-testid="otp-phone"
              />
              {!otpRequested ? (
                <button
                  onClick={handleRequestOtp}
                  disabled={otpLoading}
                  className="mt-3 w-full bg-foreground text-background font-semibold rounded-full py-3 text-sm pressable disabled:opacity-50"
                  data-testid="otp-request"
                >
                  {otpLoading ? "Sending OTP..." : "Send OTP"}
                </button>
              ) : (
                <>
                  <input
                    value={otp}
                    onChange={(event) => setOtp(event.target.value)}
                    className="mt-3 h-12 w-full rounded-2xl border border-white/10 bg-background px-4 text-sm outline-none focus:border-primary"
                    placeholder="Enter OTP"
                    data-testid="otp-code"
                  />
                  <button
                    onClick={handleVerifyOtp}
                    disabled={otpLoading}
                    className="mt-3 w-full bg-foreground text-background font-semibold rounded-full py-3 text-sm pressable disabled:opacity-50"
                    data-testid="otp-verify"
                  >
                    {otpLoading ? "Verifying..." : "Verify & Sign In"}
                  </button>
                </>
              )}
            </div>
          ) : (
            <button
              onClick={handleGoogle}
              className="w-full bg-foreground text-background font-semibold rounded-full py-4 shadow-neon-lg pressable inline-flex items-center justify-center gap-3"
              data-testid="google-signin"
            >
              <GoogleG /> Continue with Google
            </button>
          )}


          <p className="text-[11px] text-muted2 mt-6">
            By continuing, you agree to our Terms and Privacy Policy.
          </p>
        </motion.div>
      </div>
    </MobileShell>
  );
};

function GoogleG() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.6 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 3l5.7-5.7C33.9 5.7 29.2 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 18.9 12 24 12c3 0 5.7 1.1 7.8 3l5.7-5.7C33.9 5.7 29.2 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.1 0 9.7-1.7 13.3-4.7l-6.1-5.2C29 35.4 26.6 36 24 36c-5.3 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.5 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.5l6.1 5.2C40.8 35 44 29.9 44 24c0-1.2-.1-2.4-.4-3.5z" />
    </svg>
  );
}

export default Login;
