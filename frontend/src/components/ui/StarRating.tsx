interface StarRatingProps {
  rating: number;
  max?: number;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = { sm: "text-sm", md: "text-base", lg: "text-xl" };

export function StarRating({ rating, max = 5, size = "md" }: StarRatingProps) {
  return (
    <span className={`${sizeClasses[size]} tracking-tight`} aria-label={`${rating} out of ${max} stars`}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={i < rating ? "text-retro-star" : "text-retro-border"}>
          ★
        </span>
      ))}
    </span>
  );
}
