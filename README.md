# Flag Color Explorer

An interactive web application that lets you explore country flags by their colors. Select colors to instantly find matching flags and see countries highlighted on a world map.

![Flag Color Explorer Screenshot](https://img.shields.io/badge/Astro-3.5-blue) ![License](https://img.shields.io/badge/License-MIT-green)

## Features

- **Color-based flag search** - Click colors to find flags containing them
- **Simplified & Advanced modes** - Filter by color groups (Red, Blue, Green...) or specific hex codes
- **AND logic filtering** - Find flags containing ALL selected colors
- **Interactive SVG map** - Countries highlight when their flags match your selection
- **Zoom & Pan** - Mouse wheel to zoom, drag to pan, reset button included
- **197 countries** - Comprehensive coverage of world flags
- **Dark theme** - Easy on the eyes
- **Responsive design** - Works on various screen sizes

## Demo

Open the application and:
1. Click on "Red" in Simplified mode to see all flags with red
2. Add "Blue" to find flags with both red AND blue
3. Switch to Advanced mode to select exact hex colors like `#003DA5`
4. Watch the map highlight matching countries

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (recommended) or Node.js 22+

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
│   ├── flags.json          # Country data with ISO codes and colors
│   ├── colorGroups.json    # Color group definitions
│   └── world.geojson       # Custom world map (Morocco+WS, Palestine merged)
├── scripts/
│   └── merge-geojson.ts    # Script to generate custom GeoJSON
└── src/
    └── pages/
        └── index.astro     # Main application
```

## Customization

### Adding/Modifying Colors

Edit `public/colorGroups.json` to organize colors into groups:

```json
{
  "groups": {
    "red": {
      "label": "Red",
      "colors": ["#CE1126", "#FF0000", ...]
    }
  }
}
```

### Adding Countries

Edit `public/flags.json`:

```json
{
  "name": "Country Name",
  "code": "xx",
  "tabler": "country-name",
  "colors": ["#HEX1", "#HEX2"]
}
```

### Regenerating the Map

After modifying territory claims:

```bash
bun run scripts/merge-geojson.ts
```

## Tech Stack

- [Astro](https://astro.build/) - Static site generator
- [Bun](https://bun.sh/) - JavaScript runtime
- [Turf.js](https://turfjs.org/) - Geospatial operations (used in build scripts)
- [flag-icons](https://github.com/lipis/flag-icons) - SVG country flags
- [Tabler Icons](https://tabler-icons.io/) - UI icons
- Custom SVG rendering - Lightweight map without heavy dependencies

## Data Sources

- **Flags**: [flag-icons](https://github.com/lipis/flag-icons) by Lipis (MIT License)
- **Map**: Based on [Natural Earth](https://www.naturalearthdata.com/) vector data
- **Colors**: Manually curated flag color data

## License

MIT License - See LICENSE file for details
