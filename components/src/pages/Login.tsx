import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MobileShell } from "@/layout/MobileShell";
import { BackButton } from "@/layout/BackButton";
import {
  signInAdmin,
  signInUser,
  signInMock,
  requestOtp,
  signInWithOtp,
  getRemainingAttempts,
  getTimeUntilUnlocked,
} from "@/lib/auth";
import { isMockMode } from "@/lib/api";
import { GoogleLoginButton } from "@/components/GoogleLoginButton";
import { toast } from "sonner";
import { motion } from "framer-motion";
import heroNight from "@/assets/hero-night-turf.jpg";

const Login = () => {
  const navigate = useNavigate();
  const [loginId, setLoginId] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [otpRequested, setOtpRequested] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState(2);
  const [timeUntilUnlock, setTimeUntilUnlock] = useState(0);

  // Update attempt counter when login ID changes
  useEffect(() => {
    setRemainingAttempts(getRemainingAttempts(loginId));
    setTimeUntilUnlock(getTimeUntilUnlocked(loginId));
  }, [loginId]);

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

  const handleLogin = async () => {
    if (!loginId.trim() || !loginPassword.trim()) {
      setLoginError("Please enter your credentials");
      return;
    }
    setLoginError("");
    setLoginLoading(true);
    try {
      const user = await signInUser(loginId, loginPassword);

      // Role-based routing
      if (user.role === "admin") {
        toast.success("Signed in as admin");
        navigate("/admin");
      } else if (user.role === "client") {
        toast.success("Signed in as client");
        navigate("/client/dashboard");
      } else {
        toast.success("Signed in successfully");
        navigate("/");
      }
    } catch (e) {
      setRemainingAttempts(getRemainingAttempts(loginId));
      setTimeUntilUnlock(getTimeUntilUnlocked(loginId));
      setLoginError((e as Error).message);
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <MobileShell>
      <div className="absolute inset-0">
        <img src={heroNight} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover opacity-40" />
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
            <div className="space-y-4">
              <GoogleLoginButton onSuccess={() => navigate("/")} />

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
            </div>
          ) : (
            <div className="space-y-4">
              <GoogleLoginButton onSuccess={() => navigate("/")} />

              <div className="rounded-3xl border border-white/10 bg-panel-2/80 p-4 text-left">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted2">Admin / Client Login</p>
                <input
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  className="mt-3 h-12 w-full rounded-2xl border border-white/10 bg-background px-4 text-sm outline-none focus:border-primary"
                  placeholder="Email or Client ID"
                  data-testid="login-id"
                  type="text"
                />
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="mt-2 h-12 w-full rounded-2xl border border-white/10 bg-background px-4 text-sm outline-none focus:border-primary"
                  placeholder="Password"
                  data-testid="login-password"
                />
                {loginError && <p className="mt-2 text-xs text-destructive">{loginError}</p>}
                <button
                  onClick={handleLogin}
                  disabled={loginLoading}
                  className="mt-3 w-full bg-foreground text-background font-semibold rounded-full py-3 text-sm pressable disabled:opacity-50"
                  data-testid="login-submit"
                >
                  {loginLoading ? "Signing in..." : "Sign In"}
                </button>
                <div className="mt-3 rounded-2xl border border-white/5 bg-white/5 p-3 text-xs text-muted2 space-y-1">
                  <p className="font-semibold text-soft">Demo Credentials:</p>
                  <p>Admin: <span className="text-primary">admin@playturf.app</span> / <span className="text-primary">admin123</span></p>
                  <p>Client: <span className="text-primary">demo_client</span> / <span className="text-primary">demo123</span></p>
                </div>
              </div>
            </div>
          )}


          <p className="text-[11px] text-muted2 mt-6">
            By continuing, you agree to our Terms and Privacy Policy.
          </p>
        </motion.div>
      </div>
    </MobileShell>
  );
};

export default Login;
