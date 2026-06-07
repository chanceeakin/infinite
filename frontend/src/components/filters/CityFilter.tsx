"use client";

interface CityFilterProps {
  cities: string[];
  value: string;
  onChange: (city: string) => void;
}

export function CityFilter({ cities, value, onChange }: CityFilterProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor="city-filter" className="text-sm font-medium text-retro-text-muted">
        City
      </label>
      <select
        id="city-filter"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border-2 border-retro-border bg-retro-surface px-3 py-2 text-sm text-retro-text shadow-sm focus:border-retro-primary focus:outline-none focus:ring-1 focus:ring-retro-primary"
      >
        <option value="">All Cities</option>
        {cities.map((city) => (
          <option key={city} value={city}>
            {city}
          </option>
        ))}
      </select>
    </div>
  );
}
