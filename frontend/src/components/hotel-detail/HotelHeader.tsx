import type { Hotel } from "@/types/hotel";
import { StarRating } from "@/components/ui/StarRating";

interface HotelHeaderProps {
  hotel: Hotel;
}

export function HotelHeader({ hotel }: HotelHeaderProps) {
  return (
    <div className="border-b-2 border-retro-border pb-6">
      <h1 className="text-3xl font-bold text-retro-text">{hotel.name}</h1>
      <p className="mt-1 text-retro-text-muted">
        {hotel.address.street}, {hotel.address.city}, {hotel.address.state}{" "}
        {hotel.address.zip_code}, {hotel.address.country}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-4">
        <StarRating rating={hotel.star_rating} size="lg" />
        <div className="flex items-center gap-1.5">
          <span className="rounded-full bg-retro-primary px-2.5 py-0.5 text-sm font-bold text-retro-surface">
            {hotel.overall_rating.toFixed(1)}
          </span>
          <span className="text-sm text-retro-text-muted">
            {hotel.review_count.toLocaleString()} reviews
          </span>
        </div>
      </div>
      <p className="mt-4 max-w-2xl leading-relaxed text-retro-text-muted">{hotel.description}</p>
      <div className="mt-3 flex gap-4 text-sm text-retro-text-faint">
        <span>📞 {hotel.contact.phone}</span>
        <span>✉️ {hotel.contact.email}</span>
      </div>
    </div>
  );
}
