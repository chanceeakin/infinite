import type { Room } from "@/types/hotel";
import { Badge } from "@/components/ui/Badge";

interface RoomCardProps {
  room: Room;
}

export function RoomCard({ room }: RoomCardProps) {
  return (
    <div className="rounded-lg border-2 border-retro-border-subtle bg-retro-surface p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-retro-text">{room.type}</h3>
          <p className="text-sm text-retro-text-muted">
            {room.bed_count} {room.bed_type} bed{room.bed_count > 1 ? "s" : ""} · Max {room.max_occupancy} guests · {room.square_footage} sq ft
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-lg font-bold text-retro-text">${room.price_per_night}</p>
          <p className="text-xs text-retro-text-faint">per night</p>
        </div>
      </div>
      {room.room_amenities.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {room.room_amenities.map((a) => (
            <Badge key={a} label={a} variant="green" />
          ))}
        </div>
      )}
    </div>
  );
}
