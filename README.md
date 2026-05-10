# The Satellite Project

Investor-grade agricultural intelligence dashboard demo using local GeDaBa-derived static data, a local Austria GeoJSON file, and public OpenStreetMap tiles.

## What Is Static

- App code: `index.html`, `src/app.jsx`, `src/styles.css`
- Data: `data/dashboard-data.json`
- Boundaries: `data/austria-bundeslander.geojson`
- No API keys, tokens, `.env` files, or private account credentials are required.
- Leaflet uses public OpenStreetMap tiles. NDVI, drought, satellite, and climate overlays are simulated in the browser.

## Local Preview

```bash
node server.mjs
```

Then open:

```text
http://localhost:4173
```

You can also run the static check:

```bash
node scripts/verify-static.mjs
```

## Deploy To Vercel

1. Create a new Vercel project from this folder or upload/import the repository.
2. Use the default static settings.
3. Build command:

```bash
node scripts/verify-static.mjs
```

4. Output directory:

```text
.
```

5. Do not add environment variables. The demo is designed to run without secrets.

The app uses relative paths such as `./data/dashboard-data.json` and `./data/austria-bundeslander.geojson`, so it works from a hosted Vercel URL as well as from local preview.

## Regenerating Data Locally

The deployment already includes static dashboard data. To regenerate it from local Excel exports, provide your own local source folder:

```powershell
$env:SATELLITE_PROJECT_DATA_ROOT="path-to-your-local-data-folder"
powershell -ExecutionPolicy Bypass -File ./scripts/prepare-data.ps1
```

Do not commit private source folders, `.env` files, API keys, or credentials.
