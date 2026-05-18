import { Star } from "lucide-react";

export function RatingInput({
  label,
  value,
  onChange
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm text-vault-muted">{label}</span>
      <span className="flex gap-1">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            type="button"
            className="rounded p-1 text-vault-gold"
            aria-label={`${label}: ${rating}`}
            onClick={() => onChange(rating)}
          >
            <Star size={20} fill={rating <= value ? "currentColor" : "none"} />
          </button>
        ))}
      </span>
    </label>
  );
}
