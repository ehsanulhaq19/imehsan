/**
 * Maps `context/fonts/font_families.json` into Tailwind `theme.extend` fragments.
 * Fluid sizes use clamp() between mobile and desktop pixel intentions from JSON.
 */
import fc from "../context/fonts/font_families.json";

const desktop = fc.fontSizes.desktop;
const tracking = fc.letterSpacing;

type DesktopKey = keyof typeof desktop;

/** Fluid font-size clamps (mobile-first, aligns with JSON mobile/desktop pairing). */
const fluidSize: Partial<Record<DesktopKey, string>> = {
  heroTitle: "clamp(2.5rem, 4vw + 1.5rem, 3.5rem)",
  heroSubtitle: "clamp(1.125rem, 2.75vw + 0.625rem, 1.375rem)",
  sectionTitle: "clamp(1.875rem, 4vw + 0.875rem, 2.375rem)",
  subHeading: "clamp(1.25rem, 3vw + 0.8125rem, 1.5rem)",
  cardTitle: "clamp(1.125rem, 2.75vw + 0.75rem, 1.375rem)",
  body: "clamp(0.9375rem, 1vw + 0.78rem, 1rem)",
  smallText: "clamp(0.8125rem, 0.8vw + 0.72rem, 0.875rem)",
  button: "clamp(0.875rem, 1.2vw + 0.7rem, 0.9375rem)",
  navItem: "clamp(0.875rem, 1.2vw + 0.7rem, 0.9375rem)",
  tag: "clamp(0.75rem, 1vw + 0.65rem, 0.8125rem)",
};

function entry(
  key: DesktopKey,
  fontSize: string,
  extra?: { letterSpacing?: string },
): [string, { lineHeight: string; letterSpacing?: string }] {
  const d = desktop[key];
  if (!d || typeof d === "string") {
    throw new Error(`font_families: missing desktop token ${String(key)}`);
  }
  return [
    fontSize,
    {
      lineHeight: String(d.lineHeight),
      ...(extra?.letterSpacing ? { letterSpacing: extra.letterSpacing } : {}),
    },
  ];
}

export function buildFontThemeExtend() {
  const fontSize: Record<string, [string, { lineHeight: string; letterSpacing?: string }]> = {
    "fp-hero": entry("heroTitle", fluidSize.heroTitle!, { letterSpacing: tracking.heroTitle }),
    "fp-hero-sub": entry("heroSubtitle", fluidSize.heroSubtitle!),
    "fp-section": entry("sectionTitle", fluidSize.sectionTitle!, { letterSpacing: tracking.sectionTitle }),
    "fp-sub": entry("subHeading", fluidSize.subHeading!),
    "fp-card": entry("cardTitle", fluidSize.cardTitle!),
    "fp-body": entry("body", fluidSize.body!, { letterSpacing: tracking.body }),
    "fp-small": entry("smallText", fluidSize.smallText!),
    "fp-caption": entry("caption", `${parseInt(desktop.caption.size, 10) / 16}rem`),
    "fp-button": entry("button", fluidSize.button!, { letterSpacing: tracking.button }),
    "fp-nav": entry("navItem", fluidSize.navItem!),
    "fp-tag": entry("tag", fluidSize.tag!),
  };

  const fontWeight: Record<string, string> = {
    "fp-regular": String(fc.fontWeights.regular),
    "fp-medium": String(fc.fontWeights.medium),
    "fp-semibold": String(fc.fontWeights.semibold),
    "fp-bold": String(fc.fontWeights.bold),
    "fp-extrabold": String(fc.fontWeights.extrabold),
  };

  return {
    fontSize,
    fontWeight,
  };
}
