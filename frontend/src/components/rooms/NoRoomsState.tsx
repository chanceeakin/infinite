interface NoRoomsStateProps {
  hasSearched: boolean;
}

export function NoRoomsState({ hasSearched }: NoRoomsStateProps) {
  if (!hasSearched) {
    return (
      <p className="text-sm text-retro-text-muted">
        Select check-in and check-out dates to see available rooms.
      </p>
    );
  }
  return (
    <div className="rounded-lg border-2 border-dashed border-retro-border py-10 text-center">
      <span className="text-3xl">😔</span>
      <p className="mt-2 text-sm font-medium text-retro-text">No rooms available for these dates</p>
      <p className="mt-1 text-xs text-retro-text-muted">Try different check-in or check-out dates.</p>
    </div>
  );
}
