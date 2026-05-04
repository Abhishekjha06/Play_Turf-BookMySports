export function VsBadge() {
  return (
    <div className="relative grid h-20 w-20 place-items-center rounded-full border border-cyan-300/40 bg-black/80 shadow-[0_0_36px_rgba(34,211,238,.45)]">
      <div className="absolute inset-0 animate-ping rounded-full border border-purple-300/30" />
      <div className="absolute inset-2 rounded-full bg-gradient-to-br from-cyan-300 via-purple-400 to-lime-300 opacity-30 blur-md" />
      <span className="relative text-2xl font-black text-white drop-shadow-[0_0_12px_rgba(34,211,238,.85)]">VS</span>
    </div>
  );
}
