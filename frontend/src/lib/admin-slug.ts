/**
 * Admin slugs: lowercase snake_case segments using only ASCII letters and digits.
 * Runs of separators become a single underscore; leading/trailing underscores trimmed.
 *
 * Heading / title derive the default slug until the slug field is edited manually.
 */
export function slugifyFromHeading(raw: string): string {
  return sanitizeAdminSlug(raw);
}

/** Normalize user-typed slug the same way (no spaces; only a–z, 0–9, underscores). */
export function sanitizeAdminSlug(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}
