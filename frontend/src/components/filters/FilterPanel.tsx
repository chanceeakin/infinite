"use client";

import type { FilterState } from "@/types/hotel";
import { CityFilter } from "./CityFilter";
import { StarRatingFilter } from "./StarRatingFilter";
import { PriceRangeFilter } from "./PriceRangeFilter";

interface FilterPanelProps {
  filters: FilterState;
  onUpdate: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  onReset: () => void;
  resultCount: number;
  cities: string[];
  globalMin: number;
  globalMax: number;
}

export function FilterPanel({
  filters,
  onUpdate,
  onReset,
  resultCount,
  cities,
  globalMin,
  globalMax,
}: FilterPanelProps) {
  return (
    <aside className="w-full self-start rounded-lg border-2 border-retro-border bg-retro-surface-alt p-5 shadow-sm lg:w-72 lg:shrink-0">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-retro-text">Filters</h2>
        <button
          onClick={onReset}
          className="text-xs font-medium text-retro-primary hover:underline"
        >
          Reset all
        </button>
      </div>
      <div className="flex flex-col gap-5">
        <CityFilter
          cities={cities}
          value={filters.city}
          onChange={(v) => onUpdate("city", v)}
        />
        <StarRatingFilter
          value={filters.minStars}
          onChange={(v) => onUpdate("minStars", v)}
        />
        <PriceRangeFilter
          min={filters.minPrice}
          max={filters.maxPrice}
          globalMin={globalMin}
          globalMax={globalMax}
          onMinChange={(v) => onUpdate("minPrice", v)}
          onMaxChange={(v) => onUpdate("maxPrice", v)}
        />
      </div>
      <p className="mt-5 text-xs text-retro-text-muted">
        {resultCount} {resultCount === 1 ? "property" : "properties"} found
      </p>
    </aside>
  );
}
