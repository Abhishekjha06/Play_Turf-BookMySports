import { Link } from "react-router-dom";
import type { Offer } from "@/data/seed";

export function OfferCard({ offer }: { offer: Offer }) {
  return (
    <Link
      to="/offers"
      className="relative shrink-0 w-72 h-36 rounded-2xl overflow-hidden card-panel pressable"
      data-testid={`offer-${offer.id}`}
    >
      <img src={offer.image} alt={offer.title} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-overlay" />
      <div className="absolute inset-0 p-3 flex flex-col justify-between">
        <span className="self-start inline-flex items-center px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold tracking-wider">
          {offer.badge}
        </span>
        <div>
          <h4 className="font-semibold text-sm leading-tight">{offer.title}</h4>
          <p className="text-[11px] text-soft line-clamp-1">{offer.subtitle}</p>
        </div>
      </div>
    </Link>
  );
}
