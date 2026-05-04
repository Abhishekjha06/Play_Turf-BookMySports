import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Download,
  IndianRupee,
  Loader2,
  Share2,
  ShieldCheck,
  Smartphone,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { MobileShell } from "@/components/layout/MobileShell";
import { BackButton } from "@/components/layout/BackButton";
import { api } from "@/lib/api";
import type { Booking as TurfBooking, Turf } from "@/data/seed";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { CricketBookingProvider, useCricketBooking } from "@/cricket/BookingContext";
import { quickAmounts } from "@/cricket/data";
import type { PaymentMethod } from "@/cricket/types";
import { TeamAvatar } from "@/cricket/components/TeamAvatar";
import { TeamSearchSelect } from "@/cricket/components/TeamSearchSelect";
import { TeamManagerModal } from "@/cricket/components/TeamManagerModal";
import { VsBadge } from "@/cricket/components/VsBadge";

type Step = "pick" | "confirm" | "success";

const slots = ["06:00", "07:00", "08:00", "09:00", "10:00", "12:00", "14:00", "16:00", "18:00", "19:00", "20:00", "22:00"];

const paymentMethods: Array<{ value: PaymentMethod; label: string; icon: typeof Smartphone }> = [
  { value: "UPI", label: "Fake UPI", icon: Smartphone },
  { value: "Card", label: "Card", icon: CreditCard },
  { value: "Wallet", label: "Wallet", icon: Wallet },
];

function dateLabels() {
  const out: { iso: string; day: string; num: string }[] = [];
  for (let i = 0; i < 8; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    out.push({
      iso: d.toISOString().slice(0, 10),
      day: d.toLocaleDateString(undefined, { weekday: "short" }).toUpperCase(),
      num: String(d.getDate()),
    });
  }
  return out;
}

const BookingContent = () => {
  const { turfId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const cricket = useCricketBooking();
  const dates = useMemo(dateLabels, []);

  const [turf, setTurf] = useState<Turf | null>(null);
  const [step, setStep] = useState<Step>("pick");
  const [date, setDate] = useState(dates[0].iso);
  const [slot, setSlot] = useState<string | null>(null);
  const [hours, setHours] = useState(1);
  const [booking, setBooking] = useState<TurfBooking | null>(null);
  const [paying, setPaying] = useState(false);
  const [managerOpen, setManagerOpen] = useState(false);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);

  useEffect(() => {
    if (turfId) api.getTurf(turfId).then(setTurf);
  }, [turfId]);

  useEffect(() => {
    if (!turfId || !date) return;
    api.bookedSlots(turfId, date).then((booked) => {
      setBookedSlots(booked);
      if (slot && booked.includes(slot)) setSlot(null);
    });
  }, [turfId, date, slot]);

  const total = (turf?.price_per_hour ?? 0) * hours;
  const placedAt = cricket.state.placedAt ? new Date(cricket.state.placedAt) : new Date();

  const onBack = () => {
    if (step === "confirm") setStep("pick");
    else if (step === "success") navigate("/");
    else if (window.history.length > 1) navigate(-1);
    else navigate("/");
  };

  const proceed = async () => {
    if (!user) {
      toast.error("Please sign in first");
      navigate("/login");
      return;
    }
    if (!slot) {
      toast.error("Pick a time slot");
      return;
    }
    if (!cricket.teamA || !cricket.teamB || cricket.teamA.id === cricket.teamB.id) {
      toast.error("Pick two different teams");
      return;
    }
    if (!turf) return;

    try {
      const b = await api.createBooking({ turf_id: turf.id, date, start_time: slot, hours });
      setBooking(b);
      setStep("confirm");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const pay = async () => {
    if (!booking) return;
    setPaying(true);
    try {
      const b = await api.payMock(booking.id);
      setBooking(b);
      cricket.completeBooking();
      setStep("success");
      toast.success("Payment successful");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setPaying(false);
    }
  };

  if (!turf) {
    return (
      <MobileShell>
        <div className="p-6 text-soft">Loading...</div>
      </MobileShell>
    );
  }

  return (
    <MobileShell>
      <header className="sticky top-0 z-30 glass flex items-center gap-3 px-4 py-3">
        <BackButton onClick={onBack} />
        <div className="flex-1">
          <p className="text-[11px] uppercase tracking-wider text-muted2">Step {step === "pick" ? 1 : step === "confirm" ? 2 : 3} of 3</p>
          <p className="line-clamp-1 text-sm font-semibold">{turf.name}</p>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {step === "pick" && (
          <motion.div key="pick" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="pb-32">
            <section className="mt-4 px-4">
              <h2 className="font-display text-lg font-bold">Select a date</h2>
              <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
                {dates.map((d) => (
                  <button
                    key={d.iso}
                    onClick={() => setDate(d.iso)}
                    className={cn(
                      "pressable flex h-20 w-14 shrink-0 flex-col items-center justify-center rounded-2xl border",
                      date === d.iso ? "border-primary bg-primary text-primary-foreground shadow-neon" : "border-white/5 bg-panel-2 text-soft",
                    )}
                    data-testid={`date-${d.iso}`}
                  >
                    <span className="text-[11px] font-semibold">{d.day}</span>
                    <span className="mt-1 text-2xl font-extrabold leading-none">{d.num}</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="mt-6 px-4">
              <h2 className="font-display text-lg font-bold">Pick a time slot</h2>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {slots.map((s) => (
                  (() => {
                    const booked = bookedSlots.includes(s);
                    return (
                  <button
                    key={s}
                    onClick={() => !booked && setSlot(s)}
                    disabled={booked}
                    className={cn(
                      "pressable h-12 rounded-xl border text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-35",
                      slot === s ? "border-primary bg-primary text-primary-foreground shadow-neon" : "border-white/5 bg-panel-2 text-soft",
                    )}
                    data-testid={`slot-${s}`}
                  >
                    {booked ? "Booked" : s}
                  </button>
                    );
                  })()
                ))}
              </div>
            </section>

            <section className="mt-6 px-4">
              <h2 className="font-display text-lg font-bold">Duration</h2>
              <div className="mt-3 flex gap-2">
                {[1, 2, 3].map((h) => (
                  <button
                    key={h}
                    onClick={() => setHours(h)}
                    className={cn(
                      "pressable h-12 flex-1 rounded-xl border font-semibold",
                      hours === h ? "border-primary bg-primary text-primary-foreground shadow-neon" : "border-white/5 bg-panel-2 text-soft",
                    )}
                    data-testid={`hours-${h}`}
                  >
                    {h} {h === 1 ? "hr" : "hrs"}
                  </button>
                ))}
              </div>
            </section>

            <section className="mt-6 px-4">
              <div className="relative overflow-hidden rounded-3xl border border-cyan-300/20 bg-[#050810]/90 p-4 shadow-[0_0_54px_rgba(34,211,238,.14)]">
                <div className="absolute inset-x-7 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300 to-transparent" />
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-cyan-100/70">After Book Now</p>
                    <h2 className="font-display text-xl font-black">Pick Cricket Match</h2>
                  </div>
                  <button onClick={() => setManagerOpen(true)} className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-bold text-cyan-100">
                    Teams
                  </button>
                </div>

                <div className="mt-4 grid gap-3">
                  <TeamSearchSelect label="Team A" teams={cricket.state.teams} value={cricket.state.teamAId} blockedId={cricket.state.teamBId} onChange={cricket.setTeamA} />
                  <div className="grid place-items-center py-1">
                    <VsBadge />
                  </div>
                  <TeamSearchSelect label="Team B" teams={cricket.state.teams} value={cricket.state.teamBId} blockedId={cricket.state.teamAId} onChange={cricket.setTeamB} />
                </div>

                <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.06] p-3">
                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                    <TeamAvatar team={cricket.teamA} size="md" className="mx-auto" />
                    <span className="neon-text text-lg font-black">VS</span>
                    <TeamAvatar team={cricket.teamB} size="md" className="mx-auto" />
                    <p className="truncate text-center text-xs font-bold">{cricket.teamA?.name}</p>
                    <span />
                    <p className="truncate text-center text-xs font-bold">{cricket.teamB?.name}</p>
                  </div>
                </div>

                <div className="mt-5">
                  <label className="text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-100/70">Bet / Booking Amount</label>
                  <div className="mt-2 flex rounded-2xl border border-white/10 bg-white/[0.06] p-2">
                    <span className="grid w-10 place-items-center text-sm font-black text-lime-200">Rs</span>
                    <input
                      type="number"
                      min={0}
                      value={cricket.state.amount}
                      onChange={(event) => cricket.setAmount(Number(event.target.value))}
                      className="h-11 min-w-0 flex-1 bg-transparent text-xl font-black text-white outline-none"
                    />
                  </div>
                  <div className="mt-3 grid grid-cols-4 gap-2">
                    {quickAmounts.map((amount) => (
                      <button key={amount} onClick={() => cricket.setAmount(amount)} className="rounded-xl border border-white/10 bg-white/[0.06] py-2 text-xs font-bold text-white">
                        Rs {amount}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <div className="fixed bottom-3 left-1/2 z-40 flex w-[calc(100%-1.5rem)] max-w-[456px] -translate-x-1/2 items-center justify-between rounded-2xl p-3 glass-strong">
              <div>
                <p className="text-[11px] text-muted2">Turf Total</p>
                <p className="neon-text text-lg font-bold">Rs {total}</p>
              </div>
              <button
                onClick={proceed}
                disabled={!slot}
                className="pressable rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-neon disabled:opacity-50 disabled:shadow-none"
                data-testid="proceed-btn"
              >
                Continue
              </button>
            </div>
          </motion.div>
        )}

        {step === "confirm" && booking && (
          <motion.div key="confirm" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="mt-4 px-4 pb-32">
            <h2 className="font-display text-2xl font-bold">Confirm Bet & Pay</h2>

            <div className="relative mt-4 overflow-hidden rounded-3xl border border-cyan-300/20 bg-[#050810]/90 p-4 shadow-[0_0_54px_rgba(34,211,238,.14)]">
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                <TeamSummary team={cricket.teamA} />
                <VsBadge />
                <TeamSummary team={cricket.teamB} />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                <MiniStat label="Amount" value={`Rs ${cricket.state.amount}`} />
                <MiniStat label="Odds" value={`${cricket.state.odds}x`} />
                <MiniStat label="Win" value={`Rs ${cricket.potentialWin}`} />
              </div>
              <div className="mt-3 rounded-2xl border border-purple-300/15 bg-purple-300/[0.06] p-3">
                <p className="text-[11px] uppercase tracking-wider text-muted2">Booking ID</p>
                <p className="break-all text-sm font-bold">{cricket.state.bookingId}</p>
              </div>
            </div>

            <div className="card-panel mt-4 space-y-3 rounded-3xl p-4">
              <div className="flex items-center gap-3">
                <img src={turf.image} alt={turf.name} className="h-16 w-16 rounded-xl object-cover" />
                <div>
                  <p className="font-semibold">{turf.name}</p>
                  <p className="text-xs text-muted2">{turf.city}</p>
                </div>
              </div>
              <Row icon={Calendar} label="Date" value={booking.date} />
              <Row icon={Clock} label="Time" value={`${booking.start_time} - ${booking.end_time}`} />
              <Row icon={IndianRupee} label="Turf Amount" value={`Rs ${booking.amount}`} valueClass="neon-text font-bold" />
            </div>

            <div className="card-panel mt-4 rounded-2xl border border-warning/30 bg-warning/5 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-warning">
                <ShieldCheck className="h-4 w-4" /> MOCK PAYMENT
              </div>
              <p className="mt-1 text-sm text-soft">Select a fake payment option. This confirms the booking instantly without a real charge.</p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  const active = method.value === cricket.state.paymentMethod;
                  return (
                    <button
                      key={method.value}
                      onClick={() => cricket.setPaymentMethod(method.value)}
                      className={cn("rounded-xl border p-3 text-left text-xs font-bold", active ? "border-primary bg-primary/15 text-primary" : "border-white/10 bg-white/[0.04] text-soft")}
                    >
                      <Icon className="mb-2 h-4 w-4" /> {method.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={pay}
              disabled={paying}
              className="pressable mt-5 w-full rounded-full bg-primary py-4 font-semibold text-primary-foreground shadow-neon disabled:opacity-50"
              data-testid="pay-btn"
            >
              {paying ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Processing...
                </span>
              ) : (
                `Pay Rs ${booking.amount} & Confirm`
              )}
            </button>
          </motion.div>
        )}

        {step === "success" && booking && (
          <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative px-4 pb-36 pt-5 text-center">
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
              {Array.from({ length: 24 }).map((_, index) => (
                <span
                  key={index}
                  className="animate-confetti absolute h-2 w-2 rounded-full"
                  style={{
                    left: `${(index * 37) % 100}%`,
                    animationDelay: `${(index % 8) * 0.16}s`,
                    background: index % 3 === 0 ? "#a3e635" : index % 3 === 1 ? "#22d3ee" : "#c084fc",
                  }}
                />
              ))}
              {Array.from({ length: 18 }).map((_, index) => (
                <span
                  key={`particle-${index}`}
                  className="absolute h-1 w-1 animate-float rounded-full bg-cyan-300/70 shadow-[0_0_14px_rgba(0,217,255,.9)]"
                  style={{ left: `${(index * 19) % 100}%`, top: `${12 + ((index * 23) % 72)}%`, animationDelay: `${index * 0.13}s` }}
                />
              ))}
            </div>

            <div className="mx-auto max-w-3xl overflow-hidden rounded-[2rem] border border-cyan-300/20 bg-[#0B1020]/90 text-left shadow-[0_0_80px_rgba(0,217,255,.16)] backdrop-blur-2xl">
              <div className="relative overflow-hidden border-b border-white/10 p-5 text-center">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(57,255,20,.18),transparent_35%),radial-gradient(circle_at_18%_18%,rgba(0,217,255,.16),transparent_30%),linear-gradient(180deg,rgba(122,92,255,.15),transparent)]" />
                <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-[#00D9FF] to-transparent" />
                <div className="relative">
                  <p className="text-[11px] font-black uppercase tracking-[0.32em] text-cyan-100/75">PLAY_TURF</p>
                  <h2 className="mt-1 font-display text-3xl font-black text-[#F5F7FA]">Payment Receipt</h2>
                  <p className="mt-2 text-xs font-semibold text-white/60">Your Match. Your Turf. Your Victory.</p>
                </div>
              </div>

              <div className="p-5">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 220 }} className="neon-ring-lg mx-auto grid h-24 w-24 place-items-center rounded-full bg-[#39FF14]/15">
                  <CheckCircle2 className="h-14 w-14 text-[#39FF14]" strokeWidth={2.2} />
                </motion.div>
                <div className="mt-5 text-center">
                  <h1 className="font-display text-3xl font-black text-white">Payment Successful</h1>
                  <p className="mt-2 text-sm text-white/60">Your booking has been confirmed successfully.</p>
                </div>

                <div className="mt-6 rounded-3xl border border-cyan-300/20 bg-white/[0.06] p-4">
                  <p className="mb-4 text-xs font-black uppercase tracking-[0.22em] text-cyan-100/70">Team Showcase</p>
                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-center">
                    <TeamAvatar team={cricket.teamA} size="lg" className="mx-auto transition hover:scale-105 hover:shadow-[0_0_50px_rgba(57,255,20,.35)]" />
                    <VsBadge />
                    <TeamAvatar team={cricket.teamB} size="lg" className="mx-auto transition hover:scale-105 hover:shadow-[0_0_50px_rgba(0,217,255,.35)]" />
                    <p className="truncate text-sm font-black text-white">{cricket.teamA?.name}</p>
                    <span />
                    <p className="truncate text-sm font-black text-white">{cricket.teamB?.name}</p>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <ReceiptPanel title="Match Details">
                    <ReceiptRow label="Match" value={`${cricket.teamA?.name} VS ${cricket.teamB?.name}`} />
                    <ReceiptRow label="Bet Type" value="Match Winner" />
                    <ReceiptRow label="Selected Team" value={cricket.teamA?.name || "Team A"} />
                    <ReceiptRow label="Booking ID" value={cricket.state.bookingId} />
                    <ReceiptRow label="Transaction ID" value={booking.payment_id || "TXN-PENDING"} />
                    <ReceiptRow label="Date & Time" value={placedAt.toLocaleString()} />
                  </ReceiptPanel>

                  <ReceiptPanel title="Payment Details">
                    <ReceiptRow label="Bet Amount" value={`Rs ${cricket.state.amount.toLocaleString("en-IN")}`} />
                    <ReceiptRow label="Platform Fee" value="Rs 20" />
                    <ReceiptRow label="GST" value="Rs 3.60" />
                    <ReceiptRow label="Total Paid" value={`Rs ${(cricket.state.amount + 23.6).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} strong />
                    <ReceiptRow label="Payment Method" value={cricket.state.paymentMethod} />
                    <ReceiptRow label="Payment Status" value="SUCCESS" success />
                  </ReceiptPanel>
                </div>

                <div className="mt-5 rounded-3xl border border-[#39FF14]/20 bg-[#39FF14]/[0.06] p-4">
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-lime-100/70">Turf Booking</p>
                  <div className="mt-3 space-y-3">
                    <p className="font-semibold text-white">{booking.turf_name}</p>
                    <Row icon={Calendar} label="Date" value={booking.date} />
                    <Row icon={Clock} label="Time" value={`${booking.start_time} - ${booking.end_time}`} />
                    <Row icon={IndianRupee} label="Turf Amount" value={`Rs ${booking.amount}`} valueClass="neon-text font-bold" />
                  </div>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-[auto_1fr] md:items-center">
                  <div className="mx-auto grid h-36 w-36 grid-cols-5 gap-1 rounded-3xl border border-white/10 bg-white p-3 shadow-[0_0_34px_rgba(0,217,255,.22)]">
                    {Array.from({ length: 25 }).map((_, index) => (
                      <span key={index} className={`rounded-sm ${index % 2 === 0 || index % 7 === 0 ? "bg-black" : "bg-transparent"}`} />
                    ))}
                  </div>
                  <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-4">
                    <div className="inline-flex items-center gap-2 rounded-full border border-[#39FF14]/25 bg-[#39FF14]/10 px-3 py-1 text-xs font-bold text-lime-100">
                      <ShieldCheck className="h-4 w-4" /> Secure Transaction
                    </div>
                    <p className="mt-3 text-sm text-white/70">This receipt is digitally generated by Play_Turf.</p>
                    <p className="mt-1 text-xs text-white/45">Encrypted payment note: verified receipt reference {booking.id}</p>
                  </div>
                </div>

                <div className="mt-6 hidden grid-cols-2 gap-3 sm:grid">
                  <ReceiptButton onClick={() => downloadReceipt(booking, cricket)} label="Download Receipt" icon={Download} primary />
                  <ReceiptButton onClick={() => shareReceipt(booking, cricket)} label="Share Receipt" icon={Share2} />
                  <ReceiptButton onClick={() => navigate("/")} label="Back to Home" />
                  <ReceiptButton onClick={() => navigate(`/booking/new/${turf.id}`)} label="Book Another Match" primary />
                </div>

                <footer className="mt-6 border-t border-white/10 pt-4 text-center">
                  <p className="text-xs text-white/50">© 2026 Play_Turf — All Rights Reserved</p>
                  <div className="mt-2 flex flex-wrap justify-center gap-3 text-[11px] text-cyan-100/60">
                    <span>Terms & Conditions</span>
                    <span>Privacy Policy</span>
                    <span>Responsible Gaming</span>
                    <span>Support</span>
                  </div>
                </footer>
              </div>
            </div>

            <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#0B1020]/90 p-3 backdrop-blur-xl sm:hidden">
              <div className="mx-auto grid max-w-[456px] grid-cols-4 gap-2">
                <button onClick={() => downloadReceipt(booking, cricket)} className="pressable rounded-2xl bg-[#39FF14] py-3 text-xs font-black text-black shadow-[0_0_24px_rgba(57,255,20,.45)]">Download</button>
                <button onClick={() => shareReceipt(booking, cricket)} className="pressable rounded-2xl border border-white/10 bg-white/10 py-3 text-xs font-bold text-white">Share</button>
                <button onClick={() => navigate("/")} className="pressable rounded-2xl border border-white/10 bg-white/10 py-3 text-xs font-bold text-white">Home</button>
                <button onClick={() => navigate(`/booking/new/${turf.id}`)} className="pressable rounded-2xl bg-[#00D9FF] py-3 text-xs font-black text-black shadow-[0_0_24px_rgba(0,217,255,.35)]">Again</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <TeamManagerModal open={managerOpen} onOpenChange={setManagerOpen} />
    </MobileShell>
  );
};

function TeamSummary({ team }: { team: ReturnType<typeof useCricketBooking>["teamA"] }) {
  return (
    <div className="min-w-0 text-center">
      <TeamAvatar team={team} size="lg" className="mx-auto" />
      <p className="mt-2 truncate text-sm font-black">{team?.name}</p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.06] p-3 text-center">
      <p className="text-[10px] uppercase tracking-wider text-muted2">{label}</p>
      <p className="mt-1 text-sm font-black">{value}</p>
    </div>
  );
}

function Row({ icon: Icon, label, value, valueClass }: { icon: typeof Calendar; label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="inline-flex items-center gap-2 text-muted2">
        <Icon className="h-4 w-4" />
        {label}
      </span>
      <span className={valueClass ?? "text-soft"}>{value}</span>
    </div>
  );
}

function ReceiptPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
      <p className="mb-3 text-xs font-black uppercase tracking-[0.22em] text-cyan-100/70">{title}</p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function ReceiptRow({ label, value, strong, success }: { label: string; value: string; strong?: boolean; success?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-white/5 pb-2 text-sm last:border-b-0 last:pb-0">
      <span className="text-white/48">{label}</span>
      <span className={`max-w-[58%] text-right font-semibold ${strong ? "text-[#39FF14]" : success ? "text-lime-200" : "text-white"}`}>{value}</span>
    </div>
  );
}

function ReceiptButton({ label, icon: Icon, onClick, primary }: { label: string; icon?: LucideIcon; onClick: () => void; primary?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`pressable inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black transition ${
        primary
          ? "bg-gradient-to-r from-[#39FF14] to-[#00D9FF] text-black shadow-[0_0_28px_rgba(57,255,20,.32)]"
          : "border border-white/10 bg-white/10 text-white hover:border-cyan-300/40"
      }`}
    >
      {Icon ? <Icon className="h-4 w-4" /> : null}
      {label}
    </button>
  );
}

function receiptText(booking: TurfBooking, cricket: ReturnType<typeof useCricketBooking>) {
  const totalPaid = cricket.state.amount + 23.6;
  return [
    "PLAY_TURF Payment Receipt",
    "Your Match. Your Turf. Your Victory.",
    `Turf Booking: ${booking.id}`,
    `Turf: ${booking.turf_name}`,
    `Match: ${cricket.teamA?.name} vs ${cricket.teamB?.name}`,
    "Bet Type: Match Winner",
    `Selected Team: ${cricket.teamA?.name}`,
    `Booking ID: ${cricket.state.bookingId}`,
    `Transaction ID: ${booking.payment_id || "TXN-PENDING"}`,
    `Bet Amount: Rs ${cricket.state.amount}`,
    "Platform Fee: Rs 20",
    "GST: Rs 3.60",
    `Total Paid: Rs ${totalPaid.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    `Payment Method: ${cricket.state.paymentMethod}`,
    "Payment Status: SUCCESS",
    `Payment: ${booking.payment_id}`,
    "This receipt is digitally generated by Play_Turf.",
  ].join("\n");
}

function downloadReceipt(booking: TurfBooking, cricket: ReturnType<typeof useCricketBooking>) {
  const blob = new Blob([receiptText(booking, cricket)], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${booking.id}-receipt.txt`;
  anchor.click();
  URL.revokeObjectURL(url);
}

async function shareReceipt(booking: TurfBooking, cricket: ReturnType<typeof useCricketBooking>) {
  const text = receiptText(booking, cricket);
  if (navigator.share) {
    await navigator.share({ title: "play_Turf Booking", text });
  } else {
    await navigator.clipboard.writeText(text);
    toast.success("Receipt copied");
  }
}

const Booking = () => (
  <CricketBookingProvider>
    <BookingContent />
  </CricketBookingProvider>
);

export default Booking;
