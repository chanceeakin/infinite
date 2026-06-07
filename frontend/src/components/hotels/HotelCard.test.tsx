import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { HotelCard } from "./HotelCard";
import type { Hotel } from "@/types/hotel";

const mockHotel: Hotel = {
  id: "hotel-test",
  name: "The Test Palace",
  description: "A lovely test hotel.",
  star_rating: 4,
  overall_rating: 4.5,
  review_count: 500,
  address: { street: "1 Test St", city: "Chicago", state: "IL", zip_code: "60601", country: "USA" },
  contact: { phone: "+1-000-000-0000", email: "test@hotel.com" },
  amenities: ["pool", "free Wi-Fi", "spa"],
  policies: {
    check_in_time: "15:00",
    check_out_time: "11:00",
    cancellation: "Free cancellation",
  },
  rooms: [
    {
      room_id: "r1",
      type: "Deluxe King",
      bed_type: "King",
      bed_count: 1,
      max_occupancy: 2,
      square_footage: 400,
      price_per_night: 250,
      room_amenities: [],
      available_dates: ["2026-07-10"],
    },
    {
      room_id: "r2",
      type: "Standard Queen",
      bed_type: "Queen",
      bed_count: 1,
      max_occupancy: 2,
      square_footage: 300,
      price_per_night: 150,
      room_amenities: [],
      available_dates: [],
    },
  ],
};

describe("HotelCard", () => {
  it("renders the hotel name", () => {
    render(<HotelCard hotel={mockHotel} />);
    expect(screen.getByText("The Test Palace")).toBeInTheDocument();
  });

  it("renders city and country", () => {
    render(<HotelCard hotel={mockHotel} />);
    expect(screen.getByText("Chicago, USA")).toBeInTheDocument();
  });

  it("renders the overall rating", () => {
    render(<HotelCard hotel={mockHotel} />);
    expect(screen.getByText("4.5")).toBeInTheDocument();
  });

  it("renders the lowest room price", () => {
    render(<HotelCard hotel={mockHotel} />);
    expect(screen.getByText("from $150/night")).toBeInTheDocument();
  });

  it("renders amenity badges (up to 3)", () => {
    render(<HotelCard hotel={mockHotel} />);
    expect(screen.getByText("pool")).toBeInTheDocument();
    expect(screen.getByText("free Wi-Fi")).toBeInTheDocument();
    expect(screen.getByText("spa")).toBeInTheDocument();
  });

  it("links to the hotel detail page", () => {
    render(<HotelCard hotel={mockHotel} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/hotels/hotel-test");
  });
});
