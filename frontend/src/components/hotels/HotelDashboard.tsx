"use client";

import { useMemo } from "react";
import type { Hotel } from "@/types/hotel";
import { getUniqueCities, getPriceRange } from "@/lib/hotels";
import { useHotelFilters } from "@/hooks/useHotelFilters";
import { FilterPanel } from "@/components/filters/FilterPanel";
import { SortControl } from "@/components/filters/SortControl";
import { HotelGrid } from "@/components/hotels/HotelGrid";

interface HotelDashboardProps {
  initialHotels: Hotel[];
}

export function HotelDashboard({ initialHotels }: HotelDashboardProps) {
  const cities = useMemo(() => getUniqueCities(initialHotels), [initialHotels]);
  const priceRange = useMemo(() => getPriceRange(initialHotels), [initialHotels]);
  const { filters, filteredHotels, updateFilter, resetFilters } =
    useHotelFilters(initialHotels);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-retro-text">Find Your Hotel</h1>
        <p className="mt-1 text-sm text-retro-text-muted">
          Browse {initialHotels.length} properties across {cities.length} cities worldwide
        </p>
      </div>
      <div className="mb-4 flex justify-end">
        <SortControl
          value={filters.sortBy}
          onChange={(v) => updateFilter("sortBy", v)}
        />
      </div>
      <div className="flex flex-col gap-6 lg:flex-row">
        <FilterPanel
          filters={filters}
          onUpdate={updateFilter}
          onReset={resetFilters}
          resultCount={filteredHotels.length}
          cities={cities}
          globalMin={priceRange.min}
          globalMax={priceRange.max}
        />
        <HotelGrid hotels={filteredHotels} />
      </div>
    </div>
  );
}
