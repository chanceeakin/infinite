"use client";

import { useState, useMemo } from "react";
import type { Hotel, FilterState } from "@/types/hotel";
import { getPriceRange, getLowestRoomPrice } from "@/lib/hotels";

export function useHotelFilters(initialHotels: Hotel[]) {
  const { min: globalMin, max: globalMax } = useMemo(
    () => getPriceRange(initialHotels),
    [initialHotels]
  );

  const [filters, setFilters] = useState<FilterState>({
    city: "",
    minStars: 0,
    minPrice: globalMin,
    maxPrice: globalMax,
    sortBy: "",
  });

  const filteredHotels = useMemo<Hotel[]>(() => {
    const filtered = initialHotels.filter((hotel) => {
      if (filters.city && hotel.address.city !== filters.city) return false;
      if (filters.minStars > 0 && hotel.star_rating < filters.minStars) return false;
      const hasRoomInRange = hotel.rooms.some(
        (r) =>
          r.price_per_night >= filters.minPrice &&
          r.price_per_night <= filters.maxPrice
      );
      if (!hasRoomInRange) return false;
      return true;
    });

    if (!filters.sortBy) return filtered;

    return [...filtered].sort((a, b) => {
      switch (filters.sortBy) {
        case "name_asc":
          return a.name.localeCompare(b.name);
        case "stars_desc":
          return b.star_rating - a.star_rating;
        case "rating_desc":
          return b.overall_rating - a.overall_rating;
        case "price_asc":
          return getLowestRoomPrice(a) - getLowestRoomPrice(b);
        case "price_desc":
          return getLowestRoomPrice(b) - getLowestRoomPrice(a);
        default:
          return 0;
      }
    });
  }, [initialHotels, filters]);

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () =>
    setFilters({ city: "", minStars: 0, minPrice: globalMin, maxPrice: globalMax, sortBy: "" });

  return { filters, filteredHotels, updateFilter, resetFilters, globalMin, globalMax };
}
