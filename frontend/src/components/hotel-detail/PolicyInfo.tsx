import type { Policy } from "@/types/hotel";

interface PolicyInfoProps {
  policies: Policy;
}

export function PolicyInfo({ policies }: PolicyInfoProps) {
  return (
    <div className="rounded-lg border-2 border-retro-border bg-retro-surface-alt p-4">
      <h2 className="text-lg font-semibold text-retro-text">Hotel Policies</h2>
      <dl className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-retro-text-faint">Check-in</dt>
          <dd className="mt-0.5 text-sm font-medium text-retro-text">{policies.check_in_time}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-retro-text-faint">Check-out</dt>
          <dd className="mt-0.5 text-sm font-medium text-retro-text">{policies.check_out_time}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-retro-text-faint">Cancellation</dt>
          <dd className="mt-0.5 text-sm font-medium text-retro-text">{policies.cancellation}</dd>
        </div>
      </dl>
    </div>
  );
}
