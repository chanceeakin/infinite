"use client";

import type { SortOption } from "@/types/hotel";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "", label: "Default" },
  { value: "name_asc", label: "Name (A–Z)" },
  { value: "stars_desc", label: "Stars (high to low)" },
  { value: "rating_desc", label: "Rating (high to low)" },
  { value: "price_asc", label: "Price (low to high)" },
  { value: "price_desc", label: "Price (high to low)" },
];

interface SortControlProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

export function SortControl({ value, onChange }: SortControlProps) {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort-control" className="text-sm font-medium text-retro-text-muted whitespace-nowrap">
        Sort by
      </label>
      <select
        id="sort-control"
        value={value}
        onChange={(e) => onChange(e.target.value as SortOption)}
        className="rounded-md border-2 border-retro-border bg-retro-surface px-3 py-1.5 text-sm text-retro-text shadow-sm focus:border-retro-primary focus:outline-none focus:ring-1 focus:ring-retro-primary"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
