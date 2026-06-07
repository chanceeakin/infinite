"use client";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-center">
      <h2 className="text-xl font-semibold text-retro-text">Unable to load hotels</h2>
      <p className="text-sm text-retro-text-muted">
        The server could not be reached. Please check your connection and try again.
      </p>
      <button
        onClick={unstable_retry}
        className="rounded-lg bg-retro-primary px-4 py-2 text-sm font-semibold text-retro-surface transition-colors hover:bg-retro-primary-hover"
      >
        Try again
      </button>
    </div>
  );
}
