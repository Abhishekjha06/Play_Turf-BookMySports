import type { Booking } from "@/data/seed";
import { Calendar, Clock } from "lucide-react";
import { Link } from "react-router-dom";

const statusStyle: Record<string, string> = {
  CONFIRMED: "bg-primary/15 text-primary border border-primary/40",
  PENDING: "bg-warning/15 text-warning border border-warning/40",
  CANCELLED: "bg-destructive/15 text-destructive border border-destructive/40",
  COMPLETED: "bg-white/10 text-soft border border-white/15",
};

export function BookingRow({ booking }: { booking: Booking }) {
  return (
    <Link
      to={`/booking/${booking.id}`}
      className="flex items-center gap-3 card-panel rounded-2xl p-3 pressable"
      data-testid={`booking-row-${booking.id}`}
    >
      <img src={booking.turf_image} alt={booking.turf_name} className="h-14 w-14 rounded-xl object-cover" />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm line-clamp-1">{booking.turf_name}</p>
        <div className="flex items-center gap-3 text-[11px] text-muted2 mt-0.5">
          <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" />{booking.date}</span>
          <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{booking.start_time}</span>
        </div>
        <div className="flex items-center justify-between mt-1.5">
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${statusStyle[booking.status]}`}>
            {booking.status}
          </span>
          <p className="text-sm font-bold neon-text">₹{booking.amount}</p>
        </div>
      </div>
    </Link>
  );
}
