import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useHotelFilters } from "./useHotelFilters";
import type { Hotel } from "@/types/hotel";

function makeHotel(overrides: Partial<Hotel> & Pick<Hotel, "id" | "address" | "star_rating" | "rooms">): Hotel {
  return {
    name: overrides.id,
    description: "",
    overall_rating: 4.0,
    review_count: 100,
    contact: { phone: "", email: "" },
    amenities: [],
    policies: { check_in_time: "15:00", check_out_time: "11:00", cancellation: "" },
    ...overrides,
  } as Hotel;
}

const chicagoRoom = (price: number) => ({
  room_id: `r-${price}`,
  type: "Room",
  bed_type: "King",
  bed_count: 1,
  max_occupancy: 2,
  square_footage: 300,
  price_per_night: price,
  room_amenities: [],
  available_dates: [],
});

const initialHotels: Hotel[] = [
  makeHotel({ id: "h1", star_rating: 5, address: { city: "Chicago", street: "", state: "IL", zip_code: "", country: "USA" }, rooms: [chicagoRoom(299), chicagoRoom(149)] }),
  makeHotel({ id: "h2", star_rating: 3, address: { city: "Paris", street: "", state: "", zip_code: "", country: "France" }, rooms: [chicagoRoom(99)] }),
  makeHotel({ id: "h3", star_rating: 4, address: { city: "Chicago", street: "", state: "IL", zip_code: "", country: "USA" }, rooms: [chicagoRoom(450)] }),
];

describe("useHotelFilters", () => {
  it("returns all hotels with default filters", () => {
    const { result } = renderHook(() => useHotelFilters(initialHotels));
    expect(result.current.filteredHotels).toHaveLength(3);
  });

  it("filters by city", () => {
    const { result } = renderHook(() => useHotelFilters(initialHotels));
    act(() => { result.current.updateFilter("city", "Chicago"); });
    const cities = result.current.filteredHotels.map((h) => h.address.city);
    expect(cities.every((c) => c === "Chicago")).toBe(true);
    expect(result.current.filteredHotels).toHaveLength(2);
  });

  it("filters by minimum star rating", () => {
    const { result } = renderHook(() => useHotelFilters(initialHotels));
    act(() => { result.current.updateFilter("minStars", 5); });
    const filtered = result.current.filteredHotels;
    expect(filtered.every((h) => h.star_rating >= 5)).toBe(true);
    expect(filtered).toHaveLength(1);
  });

  it("returns empty array when price filter matches nothing", () => {
    const { result } = renderHook(() => useHotelFilters(initialHotels));
    act(() => {
      result.current.updateFilter("minPrice", 99999);
      result.current.updateFilter("maxPrice", 99999);
    });
    expect(result.current.filteredHotels).toHaveLength(0);
  });

  it("combined city + star filter", () => {
    const { result } = renderHook(() => useHotelFilters(initialHotels));
    act(() => {
      result.current.updateFilter("city", "Chicago");
      result.current.updateFilter("minStars", 5);
    });
    const hotels = result.current.filteredHotels;
    expect(hotels.every((h) => h.address.city === "Chicago" && h.star_rating >= 5)).toBe(true);
    expect(hotels).toHaveLength(1);
  });

  it("resets filters to defaults", () => {
    const { result } = renderHook(() => useHotelFilters(initialHotels));
    act(() => { result.current.updateFilter("city", "Chicago"); });
    act(() => { result.current.resetFilters(); });
    expect(result.current.filteredHotels).toHaveLength(3);
    expect(result.current.filters.city).toBe("");
  });
});
