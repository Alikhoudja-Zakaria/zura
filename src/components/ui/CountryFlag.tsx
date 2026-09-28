import React from "react";

interface FlagProps {
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
  xs: "w-4 h-3",
  sm: "w-5 h-3.5",
  md: "w-6 h-4.5",
  lg: "w-8 h-6",
  xl: "w-10 h-7.5",
};

export function AlgeriaFlag({ className = "", size = "md" }: FlagProps) {
  return (
    <svg
      viewBox="0 0 900 600"
      className={`inline-block shrink-0 rounded-xs shadow-xs object-cover border border-black/10 ${sizeClasses[size]} ${className}`}
      aria-label="Algeria Flag"
    >
      <rect width="450" height="600" fill="#006233" />
      <rect x="450" width="450" height="600" fill="#ffffff" />
      {/* Red Crescent */}
      <circle cx="450" cy="300" r="150" fill="#D21034" />
      <circle cx="487.5" cy="300" r="120" fill="#ffffff" />
      {/* Red Star */}
      <polygon
        points="450,215 464,258 509,258 473,284 487,327 450,301 413,327 427,284 391,258 436,258"
        fill="#D21034"
      />
    </svg>
  );
}

export function MoroccoFlag({ className = "", size = "md" }: FlagProps) {
  return (
    <svg
      viewBox="0 0 900 600"
      className={`inline-block shrink-0 rounded-xs shadow-xs object-cover border border-black/10 ${sizeClasses[size]} ${className}`}
      aria-label="Morocco Flag"
    >
      <rect width="900" height="600" fill="#C1272D" />
      {/* Green Pentagram with hollow center */}
      <polygon
        points="450,165 487,280 608,280 510,351 547,466 450,395 353,466 390,351 292,280 413,280"
        fill="none"
        stroke="#006233"
        strokeWidth="18"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function TunisiaFlag({ className = "", size = "md" }: FlagProps) {
  return (
    <svg
      viewBox="0 0 900 600"
      className={`inline-block shrink-0 rounded-xs shadow-xs object-cover border border-black/10 ${sizeClasses[size]} ${className}`}
      aria-label="Tunisia Flag"
    >
      <rect width="900" height="600" fill="#E70013" />
      {/* White Central Disc */}
      <circle cx="450" cy="300" r="150" fill="#ffffff" />
      {/* Red Crescent */}
      <circle cx="450" cy="300" r="105" fill="#E70013" />
      <circle cx="475" cy="300" r="84" fill="#ffffff" />
      {/* Red Star */}
      <polygon
        points="462,240 472,272 506,272 478,292 489,324 462,304 435,324 446,292 418,272 452,272"
        fill="#E70013"
      />
    </svg>
  );
}

interface CountryFlagProps extends FlagProps {
  country: string;
}

export function CountryFlag({ country, className = "", size = "md" }: CountryFlagProps) {
  const c = (country || "").toLowerCase().trim();
  switch (c) {
    case "algeria":
    case "dz":
      return <AlgeriaFlag className={className} size={size} />;
    case "morocco":
    case "ma":
      return <MoroccoFlag className={className} size={size} />;
    case "tunisia":
    case "tn":
      return <TunisiaFlag className={className} size={size} />;
    default:
      return <span className="text-base leading-none">🌍</span>;
  }
}
