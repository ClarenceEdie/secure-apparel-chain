"use client";

export function FaviconIcon({ className }: { className?: string }) {
  // Use logo.svg (yellow background with black star) as the icon
  return (
    <img
      src="/logo.svg"
      alt="Secure Apparel Chain Logo"
      width={48}
      height={48}
      className={className || "w-10 h-10 md:w-12 md:h-12 object-contain rounded"}
    />
  );
}

