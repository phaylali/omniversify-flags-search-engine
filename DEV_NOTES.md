# Developer Notes - Flag Color Explorer

Technical deep-dive for developers working on this project.

## Architecture Overview

### Single Page Application in Astro

This app is built as a single-page Astro application that ships minimal JavaScript. The core logic runs client-side in a single `<script>` block that handles:

- Color selection state management
- Flag filtering with AND logic
- SVG map rendering and interaction
- Map highlighting based on filter results

### Data Flow

```
flags.json ──────────┐
                     ├──▶ Client JS ──▶ Filtered Flags ──▶ DOM Update
colorGroups.json ────┤                                     │
                     │                                     ▼
world.geojson ───────┴──────────────────────────────▶ SVG Map Highlight
```

## Data Files

### `public/flags.json`

Array of country objects:

```typescript
interface Flag {
  name: string;      // "France"
  code: string;      // "fr" (ISO 3166-1 alpha-2)
  tabler: string;    // "france" (for tabler flags, unused now)
  colors: string[];  // ["#002395", "#FFFFFF", "#ED2939"]
}
```

Colors are extracted from actual flag designs. Some flags share similar colors (many reds exist with different shades).

### `public/colorGroups.json`

Defines color groups for Simplified mode:

```typescript
interface ColorGroups {
  groups: {
    [key: string]: {
      label: string;    // "Red"
      colors: string[]; // ["#CE1126", "#FF0000", ...]
    }
  }
}
```

Groups: red, blue, green, yellow, orange, white, black, brown, purple, gray, pink

Empty groups (brown, purple, gray, pink) exist for potential future use.

### `public/world.geojson`

Custom GeoJSON created by `scripts/merge-geojson.ts`:
- Morocco includes Western Sahara (merged geometry)
- Palestine includes Israel (merged geometry)
- Israel and Western Sahara removed as separate entities

## Map Implementation

### Pure SVG Rendering

The map uses custom SVG rendering instead of Leaflet for:

1. **Smaller bundle size** - No tile server or heavy library needed
2. **Full control** - Direct DOM manipulation for styling
3. **No external dependencies** - Only needs the GeoJSON file

### Projection

Simple Mercator projection implemented in JavaScript:

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

Implemented with native DOM events:

- **Zoom**: `wheel` event with scale clamping (0.5x to 10x)
- **Pan**: `mousedown`/`mousemove`/`mouseup` for drag
- Transform applied to `<g>` element containing all paths

### Country Name Matching

The `nameMap` object maps Natural Earth's `ADMIN` property values to ISO country codes:

```typescript
const nameMap: Record<string, string> = {
  "France": "fr",
  "United States of America": "us", // Natural Earth uses full name
  // ...
};
```

## Filtering Logic

### Simplified Mode (Groups)

AND logic across selected groups. A flag must contain at least one color from EACH selected group:

```
Selected: Red + Blue
Result: Flags that have (any red) AND (any blue)
```

### Advanced Mode (Specific Colors)

AND logic across selected hex colors. A flag must contain EACH exact color:

```
Selected: #CE1126 + #FFFFFF
Result: Only flags containing both specific colors
```

### Implementation

```typescript
function getMatchingFlags() {
  // Advanced mode: exact hex matching
  if (isAdvanced) {
    return flagsData.filter(flag =>
      flag.colors.some(c => activeColors.has(c.toUpperCase()))
    );
  }

  // Simplified mode: group-based matching
  const groupNames = getActiveGroupNames();
  return flagsData.filter(flag => {
    const flagColors = flag.colors.map(c => c.toUpperCase());
    for (const groupName of groupNames) {
      const groupColorList = groupColors[groupName] || [];
      if (!groupColorList.some(gc => flagColors.includes(gc.toUpperCase()))) {
        return false;
      }
    }
    return true;
  });
}
```

## GeoJSON Merging

### `scripts/merge-geojson.ts`

Uses Turf.js to merge territories:

```typescript
import { union, featureCollection } from "@turf/turf";

// Merge Morocco + Western Sahara
const fc = featureCollection([morocco, westernSahara]);
const merged = union(fc);
merged.properties = { ADMIN: "Morocco", NAME: "Morocco" };
```

Run with: `bun run scripts/merge-geojson.ts`

### Why Merge?

The merged polygons have no internal border line, creating a visually unified territory when rendered.

## Styling

### CSS Architecture

- Scoped styles in `<style>` block (Astro standard)
- Dark theme with `#0f0f1a` background
- Card-based UI with `#1a1a2e` panels
- Accent color `#667eea` for highlights

### Map Styling

```css
#mapSvg path {
  stroke: #1a1a2e;      /* Border color (same as background for gaps) */
  stroke-width: 2;      /* Border width */
  fill: #333;           /* Default fill */
  fill-opacity: 0.3;    /* Transparency */
}
```

When countries are highlighted, fill changes to `#FFD700` (gold) with `fill-opacity: 0.7`.

## Performance Considerations

1. **Flags JSON**: ~15KB, loaded once at startup
2. **GeoJSON**: ~800KB, loaded once and rendered to SVG
3. **No re-renders**: Map paths are created once, only `fill` attribute changes on filter
4. **Debounced updates**: Not needed - changes are instant with current data size

## Potential Improvements

- [ ] Add search/filter for countries
- [ ] Add color picker to find similar colors
- [ ] Implement touch gestures for mobile map
- [ ] Add flag comparison feature
- [ ] Export filtered results as image/PDF
- [ ] Add historical flags data
- [ ] Implement URL state for shareable filters

## Known Limitations

1. **Flag colors are approximations** - Not all colors are pixel-perfect extractions
2. **No flag images locally** - Depends on flagicons.lipis.dev CDN
3. **Simple projection** - High latitudes are distorted (standard Mercator)
4. **No GeoJSON simplification** - Map is detailed but large (~800KB)
5. **Single page only** - No routing or multiple views
