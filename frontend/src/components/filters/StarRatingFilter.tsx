"use client";

interface StarRatingFilterProps {
  value: number;
  onChange: (stars: number) => void;
}

const options = [0, 3, 4, 5] as const;

export function StarRatingFilter({ value, onChange }: StarRatingFilterProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm font-medium text-retro-text-muted">Minimum Stars</span>
      <div className="flex gap-2">
        {options.map((stars) => (
          <button
            key={stars}
            onClick={() => onChange(stars)}
            className={`rounded-md border-2 px-3 py-1.5 text-sm font-semibold transition-colors ${
              value === stars
                ? "border-retro-primary bg-retro-primary text-retro-surface"
                : "border-retro-border bg-retro-surface text-retro-text-muted hover:border-retro-primary hover:text-retro-primary"
            }`}
          >
            {stars === 0 ? "Any" : `${stars}+★`}
          </button>
        ))}
      </div>
    </div>
  );
}
