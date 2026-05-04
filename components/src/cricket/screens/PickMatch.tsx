import { useState } from "react";
import { RotateCcw, Settings2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { quickAmounts } from "../data";
import { useCricketBooking } from "../BookingContext";
import { TeamAvatar } from "../components/TeamAvatar";
import { TeamSearchSelect } from "../components/TeamSearchSelect";
import { TeamManagerModal } from "../components/TeamManagerModal";
import { NeonButton } from "../components/NeonButton";
import { VsBadge } from "../components/VsBadge";

export function PickMatch() {
  const { state, teamA, teamB, setTeamA, setTeamB, setAmount, setStep, resetFlow } = useCricketBooking();
  const [managerOpen, setManagerOpen] = useState(false);

  const continueFlow = () => {
    if (!teamA || !teamB) return toast.error("Select two teams");
    if (teamA.id === teamB.id) return toast.error("Choose different teams");
    if (state.amount < 100) return toast.error("Minimum booking amount is Rs 100");
    setStep(2);
  };

  return (
    <section className="mx-auto grid w-full max-w-6xl gap-5 pb-28 lg:grid-cols-[1.15fr_.85fr] lg:pb-8">
      <div className="glass-strong rounded-3xl p-4 shadow-[0_30px_120px_rgba(0,0,0,.45)] sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-lime-200/70">Step 1</p>
            <h2 className="text-2xl font-black text-white sm:text-4xl">Pick Match</h2>
          </div>
          <button type="button" onClick={() => setManagerOpen(true)} className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/10 text-cyan-100 hover:border-cyan-300/50">
            <Settings2 className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-end">
          <TeamSearchSelect label="Team A" teams={state.teams} value={state.teamAId} blockedId={state.teamBId} onChange={setTeamA} />
          <div className="mx-auto hidden pb-3 md:block">
            <VsBadge />
          </div>
          <TeamSearchSelect label="Team B" teams={state.teams} value={state.teamBId} blockedId={state.teamAId} onChange={setTeamB} />
        </div>

        <div className="my-6 grid place-items-center md:hidden">
          <VsBadge />
        </div>

        <div className="mt-6 rounded-3xl border border-cyan-300/15 bg-black/35 p-4">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <TeamPreview side="A" />
            <div className="text-center">
              <p className="text-xs font-bold text-white/45">LIVE PREVIEW</p>
              <p className="neon-text text-2xl font-black">VS</p>
            </div>
            <TeamPreview side="B" />
          </div>
        </div>

        <div className="mt-6">
          <label className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-100/70">Booking Amount</label>
          <div className="mt-2 flex rounded-2xl border border-white/10 bg-white/[0.06] p-2">
            <span className="grid w-12 place-items-center text-lg font-black text-lime-200">Rs</span>
            <input
              type="number"
              min={0}
              value={state.amount}
              onChange={(event) => setAmount(Number(event.target.value))}
              className="h-12 min-w-0 flex-1 bg-transparent text-2xl font-black text-white outline-none"
            />
          </div>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {quickAmounts.map((amount) => (
              <button key={amount} type="button" onClick={() => setAmount(amount)} className="rounded-xl border border-white/10 bg-white/[0.06] py-3 text-sm font-bold text-white transition hover:border-lime-300/50 hover:bg-lime-300/10">
                Rs {amount}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 hidden gap-3 sm:flex">
          <NeonButton onClick={continueFlow} className="flex-1">
            <Sparkles className="h-4 w-4" /> Continue
          </NeonButton>
          <NeonButton variant="ghost" onClick={resetFlow}>
            <RotateCcw className="h-4 w-4" /> Reset
          </NeonButton>
        </div>
      </div>

      <aside className="glass rounded-3xl p-5">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-purple-100/60">Market Pulse</p>
        <h3 className="mt-2 text-2xl font-black text-white">Neon match room</h3>
        <div className="mt-5 space-y-3">
          {["Auto-save enabled", "Same-team protection", "Editable team roster", "Mock payment ready"].map((item) => (
            <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-3">
              <span className="h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_16px_rgba(34,211,238,.8)]" />
              <span className="text-sm font-semibold text-white/80">{item}</span>
            </div>
          ))}
        </div>
      </aside>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-black/80 p-3 backdrop-blur-xl sm:hidden">
        <div className="mx-auto flex max-w-xl gap-2">
          <NeonButton onClick={continueFlow} className="flex-1">Continue</NeonButton>
          <NeonButton variant="ghost" onClick={resetFlow} className="px-4"><RotateCcw className="h-4 w-4" /></NeonButton>
        </div>
      </div>

      <TeamManagerModal open={managerOpen} onOpenChange={setManagerOpen} />
    </section>
  );

  function TeamPreview({ side }: { side: "A" | "B" }) {
    const team = side === "A" ? teamA : teamB;
    return (
      <div className="min-w-0 text-center">
        <TeamAvatar team={team} size="lg" className="mx-auto" />
        <p className="mt-3 truncate text-sm font-black text-white sm:text-lg">{team?.name}</p>
      </div>
    );
  }
}
