import { Check, Download, RotateCcw, Share2 } from "lucide-react";
import { toast } from "sonner";
import { useCricketBooking } from "../BookingContext";
import { TeamAvatar } from "../components/TeamAvatar";
import { NeonButton } from "../components/NeonButton";

export function SuccessScreen() {
  const { state, teamA, teamB, potentialWin, resetFlow } = useCricketBooking();
  const timestamp = state.placedAt ? new Date(state.placedAt) : new Date();

  const receipt = [
    "play_Turf Receipt",
    `Booking ID: ${state.bookingId}`,
    `Match: ${teamA?.name} vs ${teamB?.name}`,
    `Amount: Rs ${state.amount}`,
    `Mock Odds: ${state.odds}x`,
    `Potential Win: Rs ${potentialWin}`,
    `Payment: ${state.paymentMethod}`,
    `Timestamp: ${timestamp.toLocaleString()}`,
  ].join("\n");

  const downloadReceipt = () => {
    const blob = new Blob([receipt], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${state.bookingId}-receipt.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success("Receipt downloaded");
  };

  const shareReceipt = async () => {
    if (navigator.share) {
      await navigator.share({ title: "Bet Placed Successfully", text: receipt });
      return;
    }
    await navigator.clipboard.writeText(receipt);
    toast.success("Receipt copied");
  };

  return (
    <section className="mx-auto w-full max-w-4xl pb-8">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        {Array.from({ length: 28 }).map((_, index) => (
          <span
            key={index}
            className="absolute h-2 w-2 animate-confetti rounded-full bg-cyan-300"
            style={{
              left: `${(index * 37) % 100}%`,
              animationDelay: `${(index % 9) * 0.18}s`,
              background: index % 3 === 0 ? "#a3e635" : index % 3 === 1 ? "#22d3ee" : "#c084fc",
            }}
          />
        ))}
      </div>

      <div className="glass-strong relative overflow-hidden rounded-3xl p-5 text-center shadow-[0_0_90px_rgba(34,211,238,.18)] sm:p-8">
        <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300 to-transparent" />
        <div className="mx-auto grid h-24 w-24 place-items-center rounded-full border border-lime-300/40 bg-lime-300/15 shadow-[0_0_44px_rgba(163,230,53,.45)]">
          <Check className="h-12 w-12 animate-scale-in text-lime-200" />
        </div>
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.24em] text-lime-200/70">Bet Placed Successfully</p>
        <h2 className="mt-2 text-3xl font-black text-white sm:text-5xl">You are booked in</h2>

        <div className="mx-auto mt-7 grid max-w-2xl grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-3xl border border-white/10 bg-black/35 p-4">
          <TeamAvatar team={teamA} size="lg" className="mx-auto" />
          <span className="neon-text text-xl font-black">VS</span>
          <TeamAvatar team={teamB} size="lg" className="mx-auto" />
          <p className="truncate text-sm font-bold text-white">{teamA?.name}</p>
          <span />
          <p className="truncate text-sm font-bold text-white">{teamB?.name}</p>
        </div>

        <div className="mt-5 grid gap-3 text-left sm:grid-cols-2">
          <Summary label="Bet Amount" value={`Rs ${state.amount.toLocaleString("en-IN")}`} />
          <Summary label="Booking ID" value={state.bookingId} />
          <Summary label="Timestamp" value={timestamp.toLocaleString()} />
          <Summary label="Potential Winning" value={`Rs ${potentialWin.toLocaleString("en-IN")}`} />
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-3">
          <NeonButton onClick={resetFlow}><RotateCcw className="h-4 w-4" /> Book Another Match</NeonButton>
          <NeonButton variant="ghost" onClick={downloadReceipt}><Download className="h-4 w-4" /> Download Receipt</NeonButton>
          <NeonButton variant="ghost" onClick={shareReceipt}><Share2 className="h-4 w-4" /> Share</NeonButton>
        </div>
      </div>
    </section>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/45">{label}</p>
      <p className="mt-1 break-words text-sm font-black text-white sm:text-base">{value}</p>
    </div>
  );
}
