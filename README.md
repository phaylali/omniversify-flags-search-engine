# Flag Color Explorer

An interactive web application that lets you explore country flags by their colors. Select colors to instantly find matching flags and see countries highlighted on a world map.

## Features

- **Color-based flag search** - Click colors to find flags containing them
- **"Any" button** - Show all 196 flags at once
- **AND logic filtering** - Find flags containing ALL selected colors
- **Color chips** - Each flag displays its colors with hex codes below
- **Interactive SVG map** - Countries highlight when their flags match your selection
- **Zoom & Pan** - Mouse wheel to zoom, drag to pan, reset button included
- **Local flag SVGs** - 196 country flags stored locally (no CDN dependency)
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

## Project Structure

```
├── public/
│   ├── flags.json          # 196 countries with extracted colors
│   └── flags-svgs/         # Local SVG flags (196 files)
│       ├── us.svg
│       ├── fr.svg
│       └── ...
├── scripts/
│   ├── download-flags.sh   # Download flags from GitHub
│   ├── filter-svgs.sh      # Filter to 196 countries (excludes Israel)
│   ├── extract-svg-colors.ts  # Extract colors from SVGs
│   ├── filter-countries.ts    # Filter to official countries
│   ├── normalize-colors.ts    # Normalize similar colors
│   └── merge-geojson.ts       # Generate custom world map
└── src/
    └── pages/
        └── index.astro     # Main application
```

## Scripts

| Command                    | Description                    |
| -------------------------- | ------------------------------ |
| `bun run dev`              | Start development server       |
| `bun run build`            | Build for production           |
| `bun run download-flags`   | Download flag SVGs from GitHub |
| `bun run filter-svgs`      | Keep only 196 country SVGs     |
| `bun run extract-colors`   | Extract colors from SVGs       |
| `bun run filter-countries` | Filter JSON to countries only  |
| `bun run normalize-colors` | Normalize similar colors       |

## Color Normalization

Edit `scripts/normalize-colors.ts` to add color normalization rules:

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

## Tech Stack

- [Astro](https://astro.build/) - Static site generator
- [Bun](https://bun.sh/) - JavaScript runtime
- [Turf.js](https://turfjs.org/) - Geospatial operations (build scripts)
- Custom SVG rendering - Lightweight map without heavy dependencies

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
