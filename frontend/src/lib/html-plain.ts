/** Max plain-text length passed into `SlugHoverGridCard` from feeds and landing (via `excerptPlain`). */
export const SLUG_HOVER_GRID_DESCRIPTION_MAX = 512;

/**
 * Strip tags for list previews and excerpts (admin content may be HTML).
 */
export function stripHtmlToPlainText(html: string | null | undefined): string {
  if (html == null || html === "") return "";
  const raw = String(html);
  if (!raw.includes("<")) return raw.replace(/\s+/g, " ").trim();
  return raw
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/(p|div|h[1-6]|li|tr|blockquote)>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

/** Short plain-text preview for cards and indexes. */
export function excerptPlain(text: string | null | undefined, max = 180): string {
  const t = stripHtmlToPlainText(text);
  if (!t) return "";
  return t.length > max ? `${t.slice(0, max)}…` : t;
}
