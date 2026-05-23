import profile from "@/context/content/en/profile.json";
import site from "@/context/content/en/site.json";
import landing from "@/context/content/en/landing.json";
import booking from "@/context/content/en/booking.json";
import aiWidget from "@/context/content/en/ai-widget.json";

/**
 * English copy bundle. Add `de`, `ar`, etc. alongside `en` and switch the
 * default export when you wire internationalization.
 */
export const contentEn = {
  profile,
  site,
  landing,
  booking,
  aiWidget,
} as const;

export const content = contentEn;
