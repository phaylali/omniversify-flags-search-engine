# Developer Notes - Flag Color Explorer

Technical deep-dive for developers working on this project.

## Architecture Overview

### Single Page Application in Astro

This app is built as a single-page Astro application that ships minimal JavaScript. The core logic runs client-side in a single `<script>` block that handles:

- Color selection state management  
- Flag filtering with AND logic (or "Any" for all flags)
- SVG map rendering and interaction
- Map highlighting based on filter results
- Flag preview modal

### Data Flow

```
flags.json ─────────────┐
                        ├──▶ Client JS ──▶ Filtered Flags ──▶ DOM Update
world.geojson ──────────┘                                     │
                                                              ▼
                                              SVG Map Highlight
```

## Data Files

### `public/flags.json`

Array of country objects (196 countries, Israel excluded):

```typescript
interface Flag {
  name: string;      // "France"
  code: string;      // "fr" (ISO 3166-1 alpha-2)
  tabler: string;    // "france"
  colors: string[];  // ["#002395", "#FFFFFF", "#ED2939"]
  svgUrl: string;    // "/flags-svgs/fr.svg"
  colorGroups: {     // Auto-populated color group membership
    red: boolean;
    blue: boolean;
    green: boolean;
    yellow: boolean;
    orange: boolean;
    white: boolean;
    black: boolean;
  }
}
```

### `public/flags-svgs/`

Local SVG flag files (196 files). Downloaded from flag-icons GitHub repo and filtered to official countries only. Israel is permanently excluded.

### `public/world.geojson`

Custom GeoJSON created by `scripts/merge-geojson.ts`:
- Morocco includes Western Sahara (merged geometry)
- Palestine and Israel are merged
- Israel is excluded from the map

## Map Implementation

### Pure SVG Rendering

The map uses custom SVG rendering instead of Leaflet for:

1. **Smaller bundle size** - No tile server or heavy library needed
2. **Full control** - Direct DOM manipulation for styling
3. **No external dependencies** - Only needs the GeoJSON file

### Projection

Simple Mercator projection:

```typescript
const projection = (lon: number, lat: number) => {
  const x = (lon + 180) * (width / 360);
  const latRad = (lat * Math.PI) / 180;
  const mercN = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
  const y = height / 2 - (width * mercN) / (2 * Math.PI);
  return [x, y];
};
```

SVG viewBox is `0 0 900 450` (2:1 aspect ratio).

### Zoom & Pan

- **Zoom**: `wheel` event with scale clamping (0.5x to 10x)
- **Pan**: `mousedown`/`mousemove`/`mouseup` for drag
- Transform applied to `<g>` element containing all paths

## Filtering Logic

### Color Selection

When colors are selected, AND logic is used - only flags containing ALL selected colors are shown.

When "Any" button is selected, all 196 flags are displayed regardless of color selection.

### Implementation

```typescript
function getMatchingFlags() {
  // If "any" is selected, show all flags
  if (activeGroups.has("any")) {
    return flagsData;
  }

  // AND logic across groups using colorGroups property
  if (activeGroups.size === 0) return [];

  return flagsData.filter((flag) => {
    const cg = flag.colorGroups || {};
    for (const groupName of activeGroups) {
      if (!cg[groupName]) return false;
    }
    return true;
  });
}
```

## Flag Preview Modal

Click any flag card to open a full-screen preview:

- Large flag image
- Country name
- Color chips showing all flag colors
- Close via X button, backdrop click, or Escape key

```typescript
function openPreview(flag) {
  previewFlag.src = `/flags-svgs/${flag.code}.svg`;
  previewName.textContent = flag.name;
  previewColors.innerHTML = flag.colors
    .map((c) => `<div class="color-chip" style="background:${c}">...</div>`)
    .join("");
  preview.style.display = 'flex';
}
```

## REST API

The application exposes a REST API via Astro's native API routes at `src/pages/api/[country]/`.

### Endpoints

| Endpoint | Description |
| --- | --- |
| `GET /api/:country` | Returns full country JSON object |
| `GET /api/:country/colors` | Returns colors array |
| `GET /api/:country/svgUrl` | Returns `{ svgUrl: "/flags-svgs/{code}.svg" }` |

### Country Lookup

The API accepts country identifiers in multiple formats:
- ISO country code: `ar`, `us`, `fr`
- Full name (kebab-case): `argentina`, `united-states`, `france`
- Name without spaces: `argentina`, `unitedstates`, `france`

### Error Handling

Returns 404 with `{"error":"Country not found"}` for unknown countries.

### Implementation

Each endpoint is a separate `.ts` file in `src/pages/api/[country]/` with `export const prerender = false` to enable server-side rendering.

## Scripts

### Download & Filter Pipeline

```bash
# 1. Download all flag SVGs from GitHub
bun run download-flags

# 2. Filter to 196 official countries (removes Israel, territories)
bun run filter-svgs

# 3. Extract colors from SVGs
bun run extract-colors

# 4. Filter to official countries only
bun run filter-countries
```

### Color Normalization

Colors extracted from SVGs may include near-duplicates due to anti-aliasing. Use `normalize-colors` to consolidate:

Edit `scripts/normalize-colors.ts`:
```typescript
const COLOR_RULES: [string, string][] = [
  ["#000001", "#000000"],  // near-black -> black
  // Add more rules as needed
];
```

Then run:
```bash
bun run normalize-colors
```

### Manual Color Editing

For specific flags (like El Salvador with many anti-aliased colors), manually edit `public/flags.json`:
```bash
nano public/flags.json
```

## Styling

### Tailwind CSS v4.2

The entire application uses Tailwind CSS v4.2 for all styling. There are no custom CSS classes or scoped `<style>` blocks.

- **Entry point**: `src/styles/global.css` with `@import "tailwindcss"`
- **PostCSS**: Configured via `postcss.config.js` with `@tailwindcss/postcss`
- **Arbitrary values**: Used throughout for custom colors (e.g., `bg-[#0f0f1a]`, `text-[#e0e0e0]`)
- **Custom animations**: `previewIn` keyframe defined in `global.css`
- **Hover/Active states**: Tailwind utilities like `hover:bg-[#2e2e50]`, `[&.active]:border-white`

### Color Theme

| Element | Color |
| --- | --- |
| Background | `#0f0f1a` |
| Panels | `#1a1a2e` |
| Cards | `#252540` |
| Card hover | `#2e2e50` |
| Active buttons | `#3a3a5e` |
| Accent | `#667eea` → `#764ba2` gradient |
| Map highlight | `#FFD700` (gold) |

### Color Chips

Stadium-shaped chips with hex codes using Tailwind:
- `rounded-full` for pill shape
- `inline-flex items-center justify-center` for centering
- Text color determined by `isLightColor()` function based on luminance
- Light colors get `text-[#333]!` override, dark colors use white text with text-shadow

## Cloudflare Pages Deployment

The project is configured for Cloudflare Pages static deployment:

- `wrangler.jsonc`: Configured for Pages with `pages_build_output_dir`
- `package.json`: Deploy script uses `wrangler pages deploy`
- `@astrojs/cloudflare`: Adapter for Cloudflare Workers compatibility

Deploy command:
```bash
bun run deploy
```

## Countries Excluded

- **Israel (il)** - Permanently excluded from all scripts and data

## Countries Included

- **196 total**: 193 UN members + Vatican City + Palestine + Taiwan
- Note: Count varies by source (197 usually includes Israel)

## Performance

1. **Flags JSON**: ~65KB, loaded once at startup
2. **GeoJSON**: ~800KB, loaded once and rendered to SVG
3. **Flag SVGs**: Loaded on-demand via `<img>` tags with `loading="lazy"`
4. **No re-renders**: Map paths created once, only `fill` attribute changes
5. **Tailwind CSS**: ~23KB of generated CSS (tree-shaken to only used utilities)

## Known Limitations

1. **Flag colors are approximations** - Extracted from SVGs, may include anti-aliasing artifacts
2. **Simple projection** - High latitudes are distorted (standard Mercator)
3. **Manual color normalization** - Requires reviewing and adding rules
4. **Single page only** - No routing or multiple views
5. **Preview modal positioning** - May need refinement for edge cases

## Potential Improvements

- [ ] Fix preview modal centering for all screen sizes
- [ ] Add search/filter for countries by name
- [ ] Add color picker to find similar colors
- [ ] Implement touch gestures for mobile map
- [ ] Add flag comparison feature
- [ ] Export filtered results as image/PDF
- [ ] Implement URL state for shareable filters
- [ ] Auto-detect and merge near-duplicate colors
