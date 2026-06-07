import type { Hotel } from "@/types/hotel";
import { HotelCard } from "./HotelCard";
import { EmptyState } from "./EmptyState";

interface HotelGridProps {
  hotels: Hotel[];
}

export function HotelGrid({ hotels }: HotelGridProps) {
  if (hotels.length === 0) return <EmptyState />;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {hotels.map((hotel) => (
        <HotelCard key={hotel.id} hotel={hotel} />
      ))}
    </div>
  );
}
