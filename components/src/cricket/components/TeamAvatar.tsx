import { Shield, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Team } from "../types";

export function TeamAvatar({ team, size = "md", className }: { team?: Team; size?: "sm" | "md" | "lg"; className?: string }) {
  const dimensions = size === "lg" ? "h-24 w-24 text-2xl" : size === "sm" ? "h-10 w-10 text-xs" : "h-16 w-16 text-lg";
  const colors = team?.colors ?? ["#22d3ee", "#8b5cf6"];

  return (
    <div
      className={cn("relative grid shrink-0 place-items-center rounded-full border border-white/15 bg-black shadow-[0_0_34px_rgba(34,211,238,.35)]", dimensions, className)}
      style={{
        background: `radial-gradient(circle at 35% 20%, ${colors[0]} 0, transparent 28%), linear-gradient(135deg, ${colors[0]}, ${colors[1]} 58%, #050505)`,
      }}
    >
      <div className="absolute inset-1 rounded-full bg-black/55 backdrop-blur-sm" />
      <Shield className="absolute h-3/5 w-3/5 text-white/10" />
      <span className="relative font-black text-white drop-shadow-[0_0_10px_rgba(255,255,255,.75)]">{team?.shortName ?? "XI"}</span>
      {size === "lg" && <Trophy className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-black/80 p-1.5 text-cyan-200" />}
    </div>
  );
}
