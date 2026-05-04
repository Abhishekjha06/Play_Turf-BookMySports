import { useMemo, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Team } from "../types";
import { TeamAvatar } from "./TeamAvatar";

export function TeamSearchSelect({
  label,
  teams,
  value,
  blockedId,
  onChange,
}: {
  label: string;
  teams: Team[];
  value: string;
  blockedId?: string;
  onChange: (teamId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const selected = teams.find((team) => team.id === value);
  const filtered = useMemo(() => teams.filter((team) => team.name.toLowerCase().includes(query.toLowerCase())), [teams, query]);

  return (
    <div className="relative">
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-cyan-100/70">{label}</p>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-3 text-left transition hover:border-cyan-300/50 hover:bg-cyan-300/10"
      >
        <TeamAvatar team={selected} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-base font-black text-white">{selected?.name}</span>
          <span className="text-xs text-white/45">Tap to search team</span>
        </span>
        <ChevronDown className={cn("h-5 w-5 text-cyan-200 transition", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-2xl border border-cyan-300/20 bg-[#050810]/95 shadow-[0_20px_80px_rgba(0,0,0,.65)] backdrop-blur-2xl">
          <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2">
            <Search className="h-4 w-4 text-cyan-200" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-10 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/35"
              placeholder="Search teams..."
            />
          </div>
          <div className="max-h-72 overflow-auto p-2">
            {filtered.map((team) => {
              const disabled = team.id === blockedId;
              return (
                <button
                  key={team.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    onChange(team.id);
                    setOpen(false);
                    setQuery("");
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition",
                    team.id === value && "bg-cyan-300/15",
                    disabled ? "cursor-not-allowed opacity-35" : "hover:bg-white/10",
                  )}
                >
                  <TeamAvatar team={team} size="sm" />
                  <span className="font-semibold text-white">{team.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
