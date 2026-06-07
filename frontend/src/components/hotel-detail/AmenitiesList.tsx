import { Badge } from "@/components/ui/Badge";

interface AmenitiesListProps {
  amenities: string[];
}

export function AmenitiesList({ amenities }: AmenitiesListProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-retro-text">Amenities</h2>
      <div className="mt-2 flex flex-wrap gap-2">
        {amenities.map((a) => (
          <Badge key={a} label={a} variant="warm" />
        ))}
      </div>
    </div>
  );
}
