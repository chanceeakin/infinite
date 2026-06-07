"use client";

import { useEffect, useState } from "react";

interface PriceRangeFilterProps {
  min: number;
  max: number;
  globalMin: number;
  globalMax: number;
  onMinChange: (v: number) => void;
  onMaxChange: (v: number) => void;
}

export function PriceRangeFilter({
  min,
  max,
  globalMin,
  globalMax,
  onMinChange,
  onMaxChange,
}: PriceRangeFilterProps) {
  const [minInput, setMinInput] = useState(String(min));
  const [maxInput, setMaxInput] = useState(String(max));

  useEffect(() => setMinInput(String(min)), [min]);
  useEffect(() => setMaxInput(String(max)), [max]);

  function commitMin(raw: string) {
    const parsed = Number(raw);
    if (isNaN(parsed)) return;
    const v = Math.max(globalMin, Math.min(parsed, globalMax));
    onMinChange(v);
    if (v > max) onMaxChange(v);
  }

  function commitMax(raw: string) {
    const parsed = Number(raw);
    if (isNaN(parsed)) return;
    const v = Math.min(globalMax, Math.max(parsed, globalMin));
    onMaxChange(v);
    if (v < min) onMinChange(v);
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-retro-text-muted">
        Price per Night: ${min} – ${max}
      </span>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-retro-text-faint">Min price</label>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={globalMin}
            max={globalMax}
            value={min}
            onChange={(e) => {
              const v = Number(e.target.value);
              if (v <= max) onMinChange(v);
            }}
            className="flex-1 accent-retro-primary"
          />
          <input
            type="number"
            min={globalMin}
            max={max}
            value={minInput}
            onChange={(e) => setMinInput(e.target.value)}
            onBlur={() => commitMin(minInput)}
            onKeyDown={(e) => e.key === "Enter" && commitMin(minInput)}
            className="w-20 rounded border border-retro-border bg-retro-surface px-2 py-0.5 text-xs text-retro-text"
          />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-retro-text-faint">Max price</label>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={globalMin}
            max={globalMax}
            value={max}
            onChange={(e) => {
              const v = Number(e.target.value);
              if (v >= min) onMaxChange(v);
            }}
            className="flex-1 accent-retro-primary"
          />
          <input
            type="number"
            min={min}
            max={globalMax}
            value={maxInput}
            onChange={(e) => setMaxInput(e.target.value)}
            onBlur={() => commitMax(maxInput)}
            onKeyDown={(e) => e.key === "Enter" && commitMax(maxInput)}
            className="w-20 rounded border border-retro-border bg-retro-surface px-2 py-0.5 text-xs text-retro-text"
          />
        </div>
      </div>
    </div>
  );
}
