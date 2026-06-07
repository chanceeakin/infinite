import type { Hotel } from "@/types/hotel";

export function getUniqueCities(hotels: Hotel[]): string[] {
  return Array.from(new Set(hotels.map((h) => h.address.city))).sort();
}

export function getPriceRange(hotels: Hotel[]): { min: number; max: number } {
  const allPrices = hotels.flatMap((h) => h.rooms.map((r) => r.price_per_night));
  if (allPrices.length === 0) return { min: 0, max: 1000 };
  return {
    min: Math.floor(Math.min(...allPrices)),
    max: Math.ceil(Math.max(...allPrices)),
  };
}

export function getLowestRoomPrice(hotel: Hotel): number {
  if (hotel.rooms.length === 0) return 0;
  return Math.min(...hotel.rooms.map((r) => r.price_per_night));
}
