import { ReactNode } from "react";
import { Link } from "react-router-dom";

export function SectionHeader({
  title, action, to,
}: { title: string; action?: ReactNode; to?: string }) {
  return (
    <div className="flex items-center justify-between px-4 mt-7 mb-3">
      <h2 className="text-lg font-display font-bold tracking-tight">{title}</h2>
      {to ? (
        <Link to={to} className="text-xs text-primary font-semibold">
          {action ?? "See all"}
        </Link>
      ) : action}
    </div>
  );
}
