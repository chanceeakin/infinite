import { notFound } from "next/navigation";
import Link from "next/link";
import { fetchHotel } from "@/lib/api";
import { HotelHeader } from "@/components/hotel-detail/HotelHeader";
import { AmenitiesList } from "@/components/hotel-detail/AmenitiesList";
import { PolicyInfo } from "@/components/hotel-detail/PolicyInfo";
import { RoomAvailabilityChecker } from "@/components/rooms/RoomAvailabilityChecker";

export default async function HotelDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const hotel = await fetchHotel(id);

  if (!hotel) notFound();

  const allDates = hotel.rooms.flatMap((r) => r.available_dates).sort();
  const minDate = allDates[0];
  const maxDate = allDates[allDates.length - 1];

  return (
    <div className="max-w-4xl">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-retro-primary hover:underline"
      >
        ← Back to search
      </Link>

      <div className="flex flex-col gap-6">
        <HotelHeader hotel={hotel} />
        <AmenitiesList amenities={hotel.amenities} />
        <PolicyInfo policies={hotel.policies} />
        <RoomAvailabilityChecker hotelId={hotel.id} minDate={minDate} maxDate={maxDate} />
      </div>
    </div>
  );
}
