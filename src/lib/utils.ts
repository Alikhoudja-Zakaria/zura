/**
 * Merge class names conditionally
 */
export function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(" ");
}

/**
 * Format a timestamp to a relative time string
 */
export function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

  return new Date(timestamp).toLocaleDateString();
}

/**
 * Get country flag emoji
 */
export function getCountryFlag(country: string): string {
  switch (country) {
    case "algeria":
      return "🇩🇿";
    case "morocco":
      return "🇲🇦";
    case "tunisia":
      return "🇹🇳";
    default:
      return "🌍";
  }
}

/**
 * Get country display name
 */
export function getCountryName(country: string): string {
  switch (country) {
    case "algeria":
      return "Algeria";
    case "morocco":
      return "Morocco";
    case "tunisia":
      return "Tunisia";
    default:
      return country;
  }
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}
