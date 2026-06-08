import type { Hotel, Room } from "@/types/hotel";

// Client-side: NEXT_PUBLIC_API_URL="" so CloudFront routes /api/* to the backend App Runner service.
// Server-side (SSR): relative URLs don't work — use BACKEND_URL (runtime env var injected by App Runner).
// Local dev: set NEXT_PUBLIC_API_URL=http://localhost:8080 in .env.local.
const API_URL =
  typeof window === "undefined"
    ? (process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "")
    : (process.env.NEXT_PUBLIC_API_URL ?? "");

export interface HotelsResponse {
  hotels: Hotel[];
  total: number;
}

export interface RoomsResponse {
  rooms: Room[];
  total: number;
  hotel_id: string;
  check_in: string;
  check_out: string;
}

export async function fetchHotels(): Promise<Hotel[]> {
  const res = await fetch(`${API_URL}/api/hotels`, { cache: "no-store" });
  if (!res.ok) throw new Error(`fetchHotels failed: ${res.status}`);
  const body: HotelsResponse = await res.json();
  return body.hotels;
}

export async function fetchHotel(id: string): Promise<Hotel | null> {
  const res = await fetch(`${API_URL}/api/hotels/${id}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`fetchHotel failed: ${res.status}`);
  return res.json();
}

export async function fetchAvailableRooms(
  hotelId: string,
  checkIn: string,
  checkOut: string
): Promise<Room[]> {
  const params = new URLSearchParams({ check_in: checkIn, check_out: checkOut });
  const res = await fetch(`${API_URL}/api/hotels/${hotelId}/rooms?${params}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`fetchAvailableRooms failed: ${res.status}`);
  const body: RoomsResponse = await res.json();
  return body.rooms;
}
