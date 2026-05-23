import { content } from "./content-registry";

/**
 * Persona, expertise, and SEO strings (from `context/content/en/profile.json`).
 * Keep `portfolio` as the stable import for pages and admin style consumers.
 */
export const portfolio = content.profile;

export const metaDescription = content.profile.seo.metaDescription;
