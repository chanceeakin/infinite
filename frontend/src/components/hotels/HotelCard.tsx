import Link from "next/link";
import type { Hotel } from "@/types/hotel";
import { StarRating } from "@/components/ui/StarRating";
import { getLowestRoomPrice } from "@/lib/hotels";

interface HotelCardProps {
  hotel: Hotel;
}

export function HotelCard({ hotel }: HotelCardProps) {
  const lowestPrice = getLowestRoomPrice(hotel);

  return (
    <Link
      href={`/hotels/${hotel.id}`}
      className="group block rounded-lg border-2 border-retro-border-subtle bg-retro-surface p-5 shadow-sm transition-all hover:border-retro-primary hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-serif font-semibold text-retro-text transition-colors group-hover:text-retro-primary">
          {hotel.name}
        </h3>
        <span className="shrink-0 rounded-full border border-retro-border bg-retro-surface-alt px-2 py-0.5 text-xs font-bold text-retro-accent">
          {hotel.overall_rating.toFixed(1)}
        </span>
      </div>
      <p className="mt-0.5 text-sm text-retro-text-muted">
        {hotel.address.city}, {hotel.address.country}
      </p>
      <div className="mt-2 flex items-center gap-2">
        <StarRating rating={hotel.star_rating} size="sm" />
        <span className="text-xs text-retro-text-faint">
          ({hotel.review_count.toLocaleString()} reviews)
        </span>
      </div>
      <p className="mt-3 line-clamp-2 text-sm text-retro-text-muted">{hotel.description}</p>
      <div className="mt-4 flex items-center justify-between">
        <div className="flex flex-wrap gap-1">
          {hotel.amenities.slice(0, 3).map((a) => (
            <span
              key={a}
              className="rounded-full bg-retro-surface-alt px-2 py-0.5 text-xs text-retro-text-muted"
            >
              {a.replace(/_/g, " ")}
            </span>
          ))}
          {hotel.amenities.length > 3 && (
            <span className="text-xs text-retro-text-faint">+{hotel.amenities.length - 3} more</span>
          )}
        </div>
        {lowestPrice > 0 && (
          <p className="shrink-0 text-sm font-bold text-retro-text">
            from ${lowestPrice}/night
          </p>
        )}
      </div>
    </Link>
  );
}
