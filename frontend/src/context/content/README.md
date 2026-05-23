# Site copy (English)

JSON bundles for UI text under `en/`. The app imports these through `@/lib/content-registry.ts`.

To prepare another language:

1. Copy `en/` to e.g. `de/`.
2. Translate strings (keep keys identical).
3. Extend `content-registry.ts` to export `locales.de` and select the active locale (middleware, cookie, or user preference) when you are ready.

No runtime i18n is wired yet; `content` points at English only.

Files:

| File            | Purpose                                      |
|-----------------|----------------------------------------------|
| `profile.json`  | Persona, bio, SEO, expertise trees           |
| `site.json`     | Header, footer, navigation labels           |
| `landing.json`  | Home sections, hero, CTAs, empty states     |
| `booking.json`  | Consultation page and form copy             |
| `ai-widget.json`| Assistant launcher, panel, prompts        |
