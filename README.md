# 4K Vault

4K Vault is a GitHub Pages compatible, local-first web app for managing a personal collection of **physical 4K Ultra HD Blu-ray releases**. It does not treat streaming titles, digital purchases, DVD-only releases, standard Blu-ray-only releases, or generic movie metadata as collection items.

## MVP Features

- React + Vite + TypeScript static app.
- IndexedDB collection storage through Dexie.
- PWA support for offline use after initial load.
- Physical release provider interfaces for Disq Product API, UPCMDB, UPCitemdb, Go-UPC, Barcode Lookup, and UPCDatabase.org.
- TMDb metadata enrichment for posters, synopsis, credits, runtime, genres, and recommendations.
- Validation that separates physical-release proof from movie metadata.
- Manual Blu-ray.com and 4KFilmDb reference search links. The app does not scrape either site.
- Collection, watched/unwatched, personal ratings, wishlist, recommendations, stats, settings, JSON export/import, and CSV export/import.

## Setup

```bash
npm install
npm run dev
```

The app runs locally at the Vite URL shown in the terminal.

## Build

```bash
npm run build
npm run preview
```

The production build is emitted to `dist/`. `vite.config.ts` sets `base: "/physical-is-undying/"` so the build works under GitHub Pages for `RSancDev/physical-is-undying`.

## GitHub Pages Deployment

Use a standard Pages workflow that installs dependencies and runs `npm run build`, then publishes `dist/`.

The repository can also use GitHub's built-in Pages configuration:

1. Open repository settings.
2. Go to Pages.
3. Choose GitHub Actions as the source.
4. Add a workflow that publishes the Vite `dist` folder.

## API Configuration

On first open, 4K Vault asks how provider access should work:

- **Protected proxy**: recommended for Disq, paid barcode APIs, shared keys, and any key that must not be exposed. Deploy a Cloudflare Worker, Netlify Function, or Vercel Function, store provider keys as server-side environment secrets, then paste the proxy URLs into the setup dialog.
- **Direct browser access**: useful for public endpoints and personal TMDb/provider keys. Keys are stored only in that browser's localStorage and are never committed to GitHub, but they are still visible to that browser user and in that browser's network requests.
- **Manual/offline only**: disables provider network calls. Manual release entry, Blu-ray.com search links, IndexedDB storage, PWA offline use, and import/export still work.

Provider settings can be changed later under **Settings**. No private API keys are committed to this repository.

`.env.example` documents optional public endpoint defaults only. Do not put secret keys in `VITE_*` variables for a GitHub Pages build because Vite compiles them into public frontend assets.

### Cloudflare Worker proxy

`workers/cloudflare-provider-proxy.js` is a minimal proxy example. Deploy it with secrets such as:

```bash
wrangler secret put DISQ_API_KEY
wrangler secret put TMDB_BEARER_TOKEN
```

Then use these setup values in 4K Vault:

- Physical provider proxy URL: `https://your-worker.example.workers.dev/providers`
- TMDb proxy URL: `https://your-worker.example.workers.dev/tmdb`

## Provider Model

Physical release providers are the database spine. Disq Product API is primary for UPC/EAN/GTIN/ASIN lookup and uses `https://product.disqapis.com/graphql`. Disq's public docs do not expose title search; use barcode/ASIN lookup for Disq-backed release matching. UPCMDB is secondary. UPCitemdb, Go-UPC, Barcode Lookup, and UPCDatabase.org are fallback sources and are treated as unverified unless their records clearly confirm physical 4K UHD Blu-ray format.

TMDb is metadata only. It may enrich posters, backdrops, synopsis, cast, crew, runtime, similar movies, and recommendations, but TMDb must never prove a physical 4K disc exists.

Blu-ray.com is a manual reference companion. 4K Vault generates search URLs, opens them in a new tab, and stores user-pasted release/review URLs and manually entered specs. It does not scrape Blu-ray.com pages.

4KFilmDb is also a reference companion only. Its UHD Reference page visibly loads a published Google Sheets CSV in the browser, filters and sorts entries client-side, and describes a hand-verified consensus workflow based on multiple technical review sources. Its terms state that custom scoring systems are proprietary, so 4K Vault does not ingest, bundle, cache, or copy 4KFilmDb data unless explicit permission is provided. The app only builds a manual search URL such as `https://4kfilmdb.com/uhd-reference/?q=The%20Thing%201982`.

Title search combines these rules:

- Physical release providers remain the only automatic proof source.
- TMDb title matches are metadata only and require manual confirmation.
- Blu-ray.com and 4KFilmDb links help the user research the disc manually.
- If no provider can validate the title, the app can still add an owned or wishlist item only as a manually confirmed 4K UHD Blu-ray release.

## Validation

`validatePhysical4KRelease(candidate)` returns:

- `isPhysical4K`
- `confidence`
- `reasons`
- `warnings`
- `provider`
- `status`

Statuses are `confirmed`, `likely`, `manual`, `unverified`, and `rejected`. Unverified releases require manual confirmation; rejected releases require an explicit manual override.

## Import and Export

JSON exports use schema version `1` and include the full collection item model. CSV exports are intended for spreadsheet-friendly transfer of core collector fields.

Samples:

- `public/sample-collection.json`
- `public/sample-import.csv`
- `docs/json-schema.md`
- `docs/provider-interfaces.md`

## Scripts

```bash
npm run dev
npm run build
npm run test
npm run preview
```
