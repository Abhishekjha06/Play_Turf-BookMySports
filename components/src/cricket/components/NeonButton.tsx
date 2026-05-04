import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function NeonButton({ className, variant = "primary", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "danger" }) {
  return (
    <button
      className={cn(
        "pressable inline-flex h-12 items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold transition-all duration-300 disabled:pointer-events-none disabled:opacity-45",
        variant === "primary" && "bg-cyan-300 text-black shadow-[0_0_26px_rgba(34,211,238,.55)] hover:bg-lime-300 hover:shadow-[0_0_34px_rgba(163,230,53,.5)]",
        variant === "ghost" && "border border-white/12 bg-white/7 text-white hover:border-cyan-300/50 hover:bg-cyan-300/10",
        variant === "danger" && "border border-rose-400/30 bg-rose-500/10 text-rose-100 hover:bg-rose-500/20",
        className,
      )}
      {...props}
    />
  );
}
