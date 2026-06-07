"use client";

import { useRoomAvailability } from "@/hooks/useRoomAvailability";
import { DateRangePicker } from "./DateRangePicker";
import { RoomCard } from "./RoomCard";
import { NoRoomsState } from "./NoRoomsState";

interface RoomAvailabilityCheckerProps {
  hotelId: string;
  minDate?: string;
  maxDate?: string;
}

export function RoomAvailabilityChecker({ hotelId, minDate, maxDate }: RoomAvailabilityCheckerProps) {
  const { checkIn, checkOut, setCheckIn, setCheckOut, availableRooms, loading, hasSearched, error } =
    useRoomAvailability(hotelId);

  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold text-retro-text">Room Availability</h2>
      <div className="mt-4 rounded-lg border-2 border-retro-border bg-retro-surface-alt p-5">
        <DateRangePicker
          checkIn={checkIn}
          checkOut={checkOut}
          onCheckInChange={setCheckIn}
          onCheckOutChange={setCheckOut}
          minDate={minDate}
          maxDate={maxDate}
        />
        <div className="mt-6">
          {loading ? (
            <p className="text-sm text-retro-text-muted">Checking availability...</p>
          ) : error ? (
            <p className="text-sm text-retro-error">{error}</p>
          ) : hasSearched && availableRooms.length > 0 ? (
            <>
              <p className="mb-3 text-sm font-medium text-retro-text-muted">
                {availableRooms.length} room{availableRooms.length > 1 ? "s" : ""} available
              </p>
              <div className="flex flex-col gap-3">
                {availableRooms.map((room) => (
                  <RoomCard key={room.room_id} room={room} />
                ))}
              </div>
            </>
          ) : (
            <NoRoomsState hasSearched={hasSearched} />
          )}
        </div>
      </div>
    </section>
  );
}
