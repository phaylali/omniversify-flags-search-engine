# Flag Color Explorer

An interactive web application that lets you explore country flags by their colors. Select colors to instantly find matching flags and see countries highlighted on a world map.

## Features

- **Color-based flag search** - Click colors to find flags containing them
- **"Any" button** - Show all 196 flags at once
- **AND logic filtering** - Find flags containing ALL selected colors
- **Color chips** - Each flag displays its colors as stadium-shaped chips with hex codes
- **Flag preview modal** - Click any flag to see it full-screen with colors
- **Interactive SVG map** - Countries highlight in gold when their flags match your selection
- **Zoom & Pan** - Mouse wheel to zoom, drag to pan, reset button included
- **Local flag SVGs** - 196 country flags stored locally (no CDN dependency)
- **REST API** - Access country data programmatically via JSON endpoints
- **Tailwind CSS v4.2** - Modern utility-first styling throughout the app
- **Dark theme** - Easy on the eyes

## Countries Included

- **196 countries** - All UN member states + Vatican City, Palestine, Taiwan
- **Israel excluded** - Permanently removed from data and scripts

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (required)

---

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd FlagsSearchEngine

# Install dependencies
bun install

# Start development server
bun run dev
```

The app will be available at `http://localhost:4321`

### Build for Production

```bash
bun run build
bun run preview
```

### Deploy to Cloudflare Pages

```bash
bun run deploy
```

## Project Structure

```
├── public/
│   ├── flags.json          # 196 countries with extracted colors + svgUrl
│   ├── flags-svgs/         # Local SVG flags (196 files)
│   │   ├── us.svg
│   │   ├── fr.svg
│   │   └── ...
│   └── world.geojson       # World map GeoJSON data
├── scripts/
│   ├── download-flags.sh   # Download flags from GitHub
│   ├── filter-svgs.sh      # Filter to 196 countries (excludes Israel)
│   ├── extract-svg-colors.ts  # Extract colors from SVGs
│   ├── filter-countries.ts    # Filter to official countries
│   ├── normalize-colors.ts    # Normalize similar colors (manual rules)
│   └── merge-geojson.ts       # Generate custom world map
└── src/
    ├── layouts/
    │   └── Layout.astro    # Base HTML layout with Tailwind
    ├── pages/
    │   ├── index.astro     # Main application (UI + API routes)
    │   └── api/
    │       └── [country]/
    │           ├── index.ts    # GET /api/:country
    │           ├── colors.ts   # GET /api/:country/colors
    │           └── svgUrl.ts   # GET /api/:country/svgUrl
    └── styles/
        └── global.css      # Tailwind v4.2 entry point
```

## Scripts

| Command                    | Description                    |
| -------------------------- | ------------------------------ |
| `bun run dev`              | Start development server       |
| `bun run build`            | Build for production           |
| `bun run preview`          | Preview production build       |
| `bun run deploy`           | Deploy to Cloudflare Pages     |
| `bun run download-flags`   | Download flag SVGs from GitHub |
| `bun run filter-svgs`      | Keep only 196 country SVGs     |
| `bun run extract-colors`   | Extract colors from SVGs       |
| `bun run filter-countries` | Filter JSON to countries only  |
| `bun run normalize-colors` | Normalize similar colors       |

## API Endpoints

The application provides a REST API built with Astro's native API routes to access country data:

| Endpoint | Description |
| --- | --- |
| `GET /api/:country` | Returns full country data (name, code, colors, tabler, colorGroups, svgUrl) |
| `GET /api/:country/colors` | Returns just the colors array |
| `GET /api/:country/svgUrl` | Returns just the SVG URL for the flag |

### Examples

```
# Get full data for Argentina
GET https://your-site.com/api/argentina
Response: {"name":"Argentina","code":"ar","colors":["#74ACDF","#FFFFFF","#F6B40E"],"tabler":"argentina","colorGroups":{"red":false,"blue":true,...},"svgUrl":"/flags-svgs/ar.svg"}

# Get just colors for Argentina
GET https://your-site.com/api/argentina/colors
Response: ["#74ACDF","#FFFFFF","#F6B40E"]

# Get just the SVG URL for Argentina
GET https://your-site.com/api/argentina/svgUrl
Response: {"svgUrl":"/flags-svgs/ar.svg"}
```

Country names can be provided in various formats:
- ISO country code: `ar`, `us`, `fr`
- Full name: `argentina`, `united-states`, `france`
- Name without spaces: `argentina`, `unitedstates`, `france`

If a country is not found, the API returns a 404 error with `{"error":"Country not found"}`.

## Color Normalization

Colors extracted from SVGs may include similar shades (due to anti-aliasing). Edit `scripts/normalize-colors.ts` to add manual rules:

```typescript
const COLOR_RULES: [string, string][] = [
  ["#000001", "#000000"], // near-black -> black
  // Add your rules here:
  // ["#INFERIOR", "#SUPERIOR"],
];
```

Then run:

```bash
bun run normalize-colors
```

You can also manually edit `public/flags.json` to fix specific flags.

## Flag Preview

Click any flag card to open a full-screen preview modal:
- Large flag image
- Country name
- Color chips showing all flag colors with hex codes
- Close via X button, backdrop click, or Escape key

## Tech Stack

- [Astro](https://astro.build/) - Static site generator with API routes
- [Bun](https://bun.sh/) - JavaScript runtime
- [Tailwind CSS v4.2](https://tailwindcss.com/) - Utility-first CSS framework for all styling
- [Turf.js](https://turfjs.org/) - Geospatial operations (build scripts only, not runtime)
- Custom SVG rendering - Lightweight map without heavy dependencies
- [Cloudflare Pages](https://pages.cloudflare.com/) - Deployment

## Data Sources

- **Flags**: [flag-icons](https://github.com/lipis/flag-icons) by Lipis
- **Map**: Based on Natural Earth vector data, merged with Turf.js
- **Colors**: Extracted directly from SVG files

## License

MIT License - See LICENSE file for details

---

&copy; 2026 [Omniversify](https://omniversify.com). All rights reserved.

_Made by Moroccans, for the Omniverse_

[![ReadMeSupportPalestine](https://raw.githubusercontent.com/Safouene1/support-palestine-banner/master/banner-project.svg)](https://donate.unrwa.org/-landing-page/en_EN)
