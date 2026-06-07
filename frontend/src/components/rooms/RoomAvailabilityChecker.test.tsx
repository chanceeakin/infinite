import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RoomAvailabilityChecker } from "./RoomAvailabilityChecker";
import type { Room } from "@/types/hotel";

const mockRoom: Room = {
  room_id: "r1",
  type: "Deluxe King",
  bed_type: "King",
  bed_count: 1,
  max_occupancy: 2,
  square_footage: 400,
  price_per_night: 299,
  room_amenities: ["city_view"],
  available_dates: [],
};

// Mock the api module so tests don't make real HTTP calls
vi.mock("@/lib/api", () => ({
  fetchAvailableRooms: vi.fn(),
}));

import { fetchAvailableRooms } from "@/lib/api";
const mockFetch = fetchAvailableRooms as ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
});

describe("RoomAvailabilityChecker", () => {
  it("shows prompt when no dates are selected", () => {
    render(<RoomAvailabilityChecker hotelId="hotel-01" />);
    expect(screen.getByText(/Select check-in and check-out dates/i)).toBeInTheDocument();
  });

  it("shows available rooms returned from the API", async () => {
    mockFetch.mockResolvedValue([mockRoom]);
    const user = userEvent.setup();
    render(<RoomAvailabilityChecker hotelId="hotel-01" />);

    await user.type(screen.getByLabelText("Check-in"), "2026-07-10");
    await user.type(screen.getByLabelText("Check-out"), "2026-07-12");

    await waitFor(() => expect(screen.getByText("Deluxe King")).toBeInTheDocument());
    expect(mockFetch).toHaveBeenCalledWith("hotel-01", "2026-07-10", "2026-07-12");
  });

  it("shows no-rooms state when API returns empty list", async () => {
    mockFetch.mockResolvedValue([]);
    const user = userEvent.setup();
    render(<RoomAvailabilityChecker hotelId="hotel-01" />);

    await user.type(screen.getByLabelText("Check-in"), "2026-12-01");
    await user.type(screen.getByLabelText("Check-out"), "2026-12-03");

    await waitFor(() =>
      expect(screen.getByText(/No rooms available for these dates/i)).toBeInTheDocument()
    );
  });
});
