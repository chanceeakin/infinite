"use client";

import { useState, useEffect } from "react";
import type { Room } from "@/types/hotel";
import { fetchAvailableRooms } from "@/lib/api";

export function useRoomAvailability(hotelId: string) {
  const [checkIn, setCheckIn] = useState<string>("");
  const [checkOut, setCheckOut] = useState<string>("");
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasSearched = Boolean(checkIn && checkOut && checkIn < checkOut);

  useEffect(() => {
    if (!checkIn || !checkOut || checkIn >= checkOut) {
      setAvailableRooms([]);
      setError(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchAvailableRooms(hotelId, checkIn, checkOut)
      .then((rooms) => {
        if (!cancelled) setAvailableRooms(rooms);
      })
      .catch(() => {
        if (!cancelled) {
          setAvailableRooms([]);
          setError("Unable to reach the server. Please try again later.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [hotelId, checkIn, checkOut]);

  return { checkIn, checkOut, setCheckIn, setCheckOut, availableRooms, loading, hasSearched, error };
}
