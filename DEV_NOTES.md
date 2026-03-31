# Developer Notes - Flag Color Explorer

Technical deep-dive for developers working on this project.

## Architecture Overview

### Single Page Application in Astro

This app is built as a single-page Astro application that ships minimal JavaScript. The core logic runs client-side in a single `<script>` block that handles:

- Color selection state management  
- Flag filtering with AND logic (or "Any" for all flags)
- SVG map rendering and interaction
- Map highlighting based on filter results

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

Local SVG flag files (196 files). Downloaded from flag-icons GitHub repo and filtered to official countries only.

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

### CSS Architecture

- Scoped styles in `<style>` block (Astro standard)
- Dark theme with `#0f0f1a` background
- Card-based UI with `#1a1a2e` panels
- Accent color `#667eea` for highlights

### Color Chips

Each flag displays its colors as chips with hex codes:
- Background color matches the hex value
- Text color adjusts for readability (light text on dark backgrounds)

## Countries Excluded

- **Israel (il)** - Permanently excluded from all scripts and data

## Countries Included

- **196 total**: 193 UN members + Vatican City + Palestine + Taiwan
- Note: Count varies by source (197 usually includes Israel)

## Performance

1. **Flags JSON**: ~30KB, loaded once at startup
2. **GeoJSON**: ~800KB, loaded once and rendered to SVG
3. **Flag SVGs**: Loaded on-demand via `<img>` tags
4. **No re-renders**: Map paths created once, only `fill` attribute changes

## Known Limitations

1. **Flag colors are approximations** - Extracted from SVGs, may include anti-aliasing artifacts
2. **Simple projection** - High latitudes are distorted (standard Mercator)
3. **Manual color normalization** - Requires reviewing and adding rules
4. **Single page only** - No routing or multiple views

## Potential Improvements

- [ ] Add search/filter for countries by name
- [ ] Add color picker to find similar colors
- [ ] Implement touch gestures for mobile map
- [ ] Add flag comparison feature
- [ ] Export filtered results as image/PDF
- [ ] Implement URL state for shareable filters
- [ ] Auto-detect and merge near-duplicate colors
