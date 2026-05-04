import { useState } from "react";
import { ArrowLeft, CreditCard, Loader2, Smartphone, Wallet } from "lucide-react";
import { toast } from "sonner";
import { useCricketBooking } from "../BookingContext";
import { mockConfirmBooking } from "../mockApi";
import type { PaymentMethod } from "../types";
import { TeamAvatar } from "../components/TeamAvatar";
import { NeonButton } from "../components/NeonButton";
import { VsBadge } from "../components/VsBadge";

const methods: Array<{ value: PaymentMethod; label: string; icon: typeof Smartphone }> = [
  { value: "UPI", label: "Fake UPI", icon: Smartphone },
  { value: "Card", label: "Card", icon: CreditCard },
  { value: "Wallet", label: "Wallet", icon: Wallet },
];

export function ConfirmBet() {
  const { state, teamA, teamB, potentialWin, setStep, setPaymentMethod, completeBooking } = useCricketBooking();
  const [loading, setLoading] = useState(false);

  const confirm = async () => {
    setLoading(true);
    await mockConfirmBooking();
    completeBooking();
    toast.success("Booking confirmed");
    setLoading(false);
  };

  return (
    <section className="mx-auto w-full max-w-4xl pb-28 sm:pb-8">
      <div className="glass-strong rounded-3xl p-4 sm:p-7">
        <button type="button" onClick={() => setStep(1)} className="mb-5 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold text-white hover:bg-white/15">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <div className="grid gap-5 md:grid-cols-[1fr_auto_1fr] md:items-center">
          <TeamSummary name={teamA?.name} side="Team A" />
          <div className="mx-auto"><VsBadge /></div>
          <TeamSummary name={teamB?.name} side="Team B" right />
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-3">
          <Stat label="Amount" value={`Rs ${state.amount.toLocaleString("en-IN")}`} />
          <Stat label="Mock Odds" value={`${state.odds}x`} />
          <Stat label="Potential Win" value={`Rs ${potentialWin.toLocaleString("en-IN")}`} />
        </div>

        <div className="mt-5 rounded-3xl border border-purple-300/15 bg-purple-300/[0.06] p-4">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-purple-100/60">Booking ID</p>
          <p className="mt-1 break-all text-lg font-black text-white">{state.bookingId}</p>
        </div>

        <div className="mt-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-100/70">Mock Payment</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {methods.map((method) => {
              const Icon = method.icon;
              const active = method.value === state.paymentMethod;
              return (
                <button key={method.value} type="button" onClick={() => setPaymentMethod(method.value)} className={`rounded-2xl border p-4 text-left transition ${active ? "border-cyan-300 bg-cyan-300/15 shadow-[0_0_24px_rgba(34,211,238,.25)]" : "border-white/10 bg-white/[0.06] hover:border-cyan-300/40"}`}>
                  <Icon className="mb-3 h-5 w-5 text-cyan-100" />
                  <span className="font-bold text-white">{method.label}</span>
                  <span className="mt-1 block text-xs text-white/45">Demo only</span>
                </button>
              );
            })}
          </div>
        </div>

        <NeonButton onClick={confirm} disabled={loading} className="mt-7 hidden w-full sm:flex">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {loading ? "Confirming..." : "Confirm Bet"}
        </NeonButton>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-black/80 p-3 backdrop-blur-xl sm:hidden">
        <NeonButton onClick={confirm} disabled={loading} className="mx-auto w-full max-w-xl">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {loading ? "Confirming..." : "Confirm Bet"}
        </NeonButton>
      </div>
    </section>
  );

  function TeamSummary({ name, side, right }: { name?: string; side: string; right?: boolean }) {
    const team = right ? teamB : teamA;
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 text-center">
        <TeamAvatar team={team} size="lg" className="mx-auto" />
        <p className="mt-3 text-xs font-bold uppercase tracking-[0.18em] text-white/45">{side}</p>
        <h3 className="mt-1 text-xl font-black text-white">{name}</h3>
      </div>
    );
  }
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/45">{label}</p>
      <p className="mt-1 text-xl font-black text-white">{value}</p>
    </div>
  );
}
