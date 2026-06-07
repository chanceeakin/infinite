interface BadgeProps {
  label: string;
  variant?: "default" | "warm" | "green";
}

const variantClasses = {
  default: "bg-retro-surface-alt text-retro-text-muted",
  warm: "bg-retro-badge-warm-bg text-retro-badge-warm-text",
  green: "bg-retro-badge-green-bg text-retro-badge-green-text",
};

export function Badge({ label, variant = "default" }: BadgeProps) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${variantClasses[variant]}`}>
      {label.replace(/_/g, " ")}
    </span>
  );
}
