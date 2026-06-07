"use client";

interface DateRangePickerProps {
  checkIn: string;
  checkOut: string;
  onCheckInChange: (v: string) => void;
  onCheckOutChange: (v: string) => void;
  minDate?: string;
  maxDate?: string;
}

export function DateRangePicker({
  checkIn,
  checkOut,
  onCheckInChange,
  onCheckOutChange,
  minDate,
  maxDate,
}: DateRangePickerProps) {
  const today = new Date().toISOString().split("T")[0];
  // Use the first available date as the min if it's in the future, so the
  // calendar opens with unavailable months already greyed out.
  const effectiveMin = minDate && minDate > today ? minDate : today;
  // Check-out can be the morning after the last available night.
  const checkOutMax = maxDate
    ? new Date(new Date(maxDate).getTime() + 86_400_000).toISOString().split("T")[0]
    : undefined;

  return (
    <div className="flex flex-wrap gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="check-in" className="text-sm font-medium text-retro-text-muted">
          Check-in
        </label>
        <input
          id="check-in"
          type="date"
          value={checkIn}
          min={effectiveMin}
          max={maxDate}
          onChange={(e) => onCheckInChange(e.target.value)}
          className="rounded-md border-2 border-retro-border bg-retro-surface px-3 py-2 text-sm text-retro-text shadow-sm focus:border-retro-primary focus:outline-none focus:ring-1 focus:ring-retro-primary"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="check-out" className="text-sm font-medium text-retro-text-muted">
          Check-out
        </label>
        <input
          id="check-out"
          type="date"
          value={checkOut}
          min={checkIn || effectiveMin}
          max={checkOutMax}
          onChange={(e) => onCheckOutChange(e.target.value)}
          className="rounded-md border-2 border-retro-border bg-retro-surface px-3 py-2 text-sm text-retro-text shadow-sm focus:border-retro-primary focus:outline-none focus:ring-1 focus:ring-retro-primary"
        />
      </div>
    </div>
  );
}
