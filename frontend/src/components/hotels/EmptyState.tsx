export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-retro-border py-16 text-center">
      <span className="text-4xl">🏨</span>
      <h3 className="mt-3 text-base font-semibold text-retro-text">No hotels found</h3>
      <p className="mt-1 text-sm text-retro-text-muted">
        Try adjusting your filters to see more results.
      </p>
    </div>
  );
}
