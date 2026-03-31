// ============================================================
// COLOR SHADES DEFINITION
// Uses HSL (Hue-Saturation-Lightness) for accurate color classification
//
// HUE ANGLES (human perception):
// Red:    0-15° and 345-360°
// Orange: 15-45°
// Yellow: 45-65°
// Green:  65-175°
// Cyan:   175-200°
// Blue:   200-260°
// Purple: 260-290°
// Magenta:290-345°
//
// To add a new color mapping:
// 1. Run the classification to see current colors
// 2. Add your hex to the appropriate shade in COLOR_NORMALIZATION_MAP
// 3. Run: bun run classify-colors (to preview)
// 4. Run: bun run normalize-colors (to apply)
// ============================================================

// ============================================================
// HSL-BASED COLOR CLASSIFICATION
// ============================================================

export function hexToRgb(hex: string): [number, number, number] {
  hex = hex.replace("#", "");
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  return [
    parseInt(hex.slice(0, 2), 16),
    parseInt(hex.slice(2, 4), 16),
    parseInt(hex.slice(4, 6), 16),
  ];
}

export function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

export function hexToHsl(hex: string): [number, number, number] {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHsl(r, g, b);
}

// ============================================================
// COLOR FAMILY CATEGORIES (based on hue angle)
// ============================================================
export type ColorFamily =
  | "black"
  | "white"
  | "gray"
  | "red"
  | "orange"
  | "yellow"
  | "green"
  | "blue"
  | "purple"
  | "pink";

export interface ColorInfo {
  hex: string;
  family: ColorFamily;
  hue: number;
  saturation: number;
  lightness: number;
  shade: string;
}

// Classify a color into its family and shade
export function classifyColor(hex: string): ColorInfo {
  const [hue, sat, light] = hexToHsl(hex);

  let family: ColorFamily;
  let shade: string;

  // First check achromatic colors (black/white/gray)
  if (sat < 10) {
    if (light < 15) {
      family = "black";
      shade = "Black";
    } else if (light > 85) {
      family = "white";
      shade = "White";
    } else {
      family = "gray";
      shade = "Gray";
    }
  }
  // Now classify by hue for chromatic colors
  else if (hue < 15 || hue >= 345) {
    family = "red";
    if (light < 25) shade = "Deep Red";
    else if (light < 40) shade = "Dark Red";
    else if (light < 60) shade = "Red";
    else if (light < 75) shade = "Light Red";
    else shade = "Bright Red";
  } else if (hue < 45) {
    family = "orange";
    if (light < 25) shade = "Deep Orange";
    else if (light < 40) shade = "Dark Orange";
    else if (light < 60) shade = "Orange";
    else if (light < 75) shade = "Light Orange";
    else shade = "Bright Orange";
  } else if (hue < 70) {
    family = "yellow";
    if (light < 25) shade = "Deep Yellow";
    else if (light < 40) shade = "Dark Yellow";
    else if (light < 60) shade = "Yellow";
    else if (light < 75) shade = "Light Yellow";
    else shade = "Bright Yellow";
  } else if (hue < 170) {
    family = "green";
    if (light < 25) shade = "Deep Green";
    else if (light < 40) shade = "Dark Green";
    else if (light < 60) shade = "Green";
    else if (light < 75) shade = "Light Green";
    else shade = "Bright Green";
  } else if (hue < 260) {
    family = "blue";
    if (light < 25) shade = "Deep Blue";
    else if (light < 40) shade = "Dark Blue";
    else if (light < 60) shade = "Blue";
    else if (light < 75) shade = "Light Blue";
    else shade = "Bright Blue";
  } else if (hue < 300) {
    family = "purple";
    if (light < 25) shade = "Deep Purple";
    else if (light < 40) shade = "Dark Purple";
    else if (light < 60) shade = "Purple";
    else if (light < 75) shade = "Light Purple";
    else shade = "Bright Purple";
  } else {
    family = "pink";
    if (light < 25) shade = "Deep Pink";
    else if (light < 40) shade = "Dark Pink";
    else if (light < 60) shade = "Pink";
    else if (light < 75) shade = "Light Pink";
    else shade = "Bright Pink";
  }

  return { hex, family, hue, saturation: sat, lightness: light, shade };
}

// ============================================================
// SHADE DEFINITIONS
// Each color family has 5 shades
// ============================================================
export const SHADES = {
  // BLACK
  DEEP_BLACK: "#000000",
  DARK_BLACK: "#1A1A1A",
  BLACK: "#333333",
  LIGHT_BLACK: "#404040",
  BRIGHT_BLACK: "#555555",

  // WHITE
  DEEP_WHITE: "#C0C0C0",
  DARK_WHITE: "#E0E0E0",
  WHITE: "#FFFFFF",
  LIGHT_WHITE: "#FFFEFE",
  BRIGHT_WHITE: "#FAFAFA",

  // RED (hue: 0-15, 345-360)
  DEEP_RED: "#5C0000",
  DARK_RED: "#8B0000",
  RED: "#CE1126",
  LIGHT_RED: "#FF6B6B",
  BRIGHT_RED: "#FF4444",

  // ORANGE (hue: 15-45)
  DEEP_ORANGE: "#CC5500",
  DARK_ORANGE: "#E65100",
  ORANGE: "#FF8C00",
  LIGHT_ORANGE: "#FFA500",
  BRIGHT_ORANGE: "#FF9933",

  // YELLOW (hue: 45-70)
  DEEP_YELLOW: "#B8860B",
  DARK_YELLOW: "#DAA520",
  YELLOW: "#FCD116",
  LIGHT_YELLOW: "#FFF44F",
  BRIGHT_YELLOW: "#FFFF00",

  // GREEN (hue: 70-170)
  DEEP_GREEN: "#006400",
  DARK_GREEN: "#007A3D",
  GREEN: "#009E49",
  LIGHT_GREEN: "#32CD32",
  BRIGHT_GREEN: "#00FF00",

  // BLUE (hue: 170-260)
  DEEP_BLUE: "#000080",
  DARK_BLUE: "#003DA5",
  BLUE: "#0066CC",
  LIGHT_BLUE: "#4169E1",
  BRIGHT_BLUE: "#007FFF",

  // PURPLE (hue: 260-300)
  DEEP_PURPLE: "#4B0082",
  DARK_PURPLE: "#6A0DAD",
  PURPLE: "#800080",
  LIGHT_PURPLE: "#9370DB",
  BRIGHT_PURPLE: "#BA55D3",

  // PINK (hue: 300-345)
  DEEP_PINK: "#C71585",
  DARK_PINK: "#DB7093",
  PINK: "#FF69B4",
  LIGHT_PINK: "#FFB6C1",
  BRIGHT_PINK: "#FF1493",
} as const;

// ============================================================
// NORMALIZATION MAP
// Maps each hex to its closest defined shade
// ============================================================
export const COLOR_NORMALIZATION_MAP: Record<string, string> = {
  // BLACK shades (2 colors)
  "#000000": "#000000",  // H:0 S:0% L:0% -> Black
  "#21231E": "#333333",  // H:84 S:8% L:13% -> Black

  // WHITE shades (1 colors)
  "#FFFFFF": "#FAFAFA",  // H:0 S:0% L:100% -> White

  // GRAY shades (4 colors)
  "#383739": "#E0E0E0",  // H:270 S:2% L:22% -> Gray
  "#808080": "#E0E0E0",  // H:0 S:0% L:50% -> Gray
  "#9CA69C": "#E0E0E0",  // H:120 S:5% L:63% -> Gray
  "#CCCCCC": "#E0E0E0",  // H:0 S:0% L:80% -> Gray

  // RED shades (65 colors)
  "#351710": "#5C0000",  // H:11 S:54% L:14% -> Deep Red
  "#A70000": "#8B0000",  // H:0 S:100% L:33% -> Dark Red
  "#8D2029": "#8B0000",  // H:355 S:63% L:34% -> Dark Red
  "#981E32": "#CE1126",  // H:350 S:67% L:36% -> Dark Red
  "#BE0027": "#CE1126",  // H:348 S:100% L:37% -> Dark Red
  "#AA151B": "#CE1126",  // H:358 S:78% L:37% -> Dark Red
  "#BC0000": "#CE1126",  // H:0 S:100% L:37% -> Dark Red
  "#B40A2D": "#CE1126",  // H:348 S:89% L:37% -> Dark Red
  "#B10C0C": "#CE1126",  // H:0 S:87% L:37% -> Dark Red
  "#A51931": "#CE1126",  // H:350 S:74% L:37% -> Dark Red
  "#C40000": "#CE1126",  // H:0 S:100% L:38% -> Dark Red
  "#C10000": "#CE1126",  // H:0 S:100% L:38% -> Dark Red
  "#C60000": "#CE1126",  // H:0 S:100% L:39% -> Dark Red
  "#C40308": "#CE1126",  // H:358 S:97% L:39% -> Dark Red
  "#AE1C28": "#CE1126",  // H:355 S:72% L:40% -> Red
  "#CE0000": "#CE1126",  // H:0 S:100% L:40% -> Red
  "#CB000F": "#CE1126",  // H:356 S:100% L:40% -> Red
  "#D20000": "#CE1126",  // H:0 S:100% L:41% -> Red
  "#CF0921": "#CE1126",  // H:353 S:92% L:42% -> Red
  "#D50000": "#CE1126",  // H:0 S:100% L:42% -> Red
  "#D90012": "#CE1126",  // H:355 S:100% L:43% -> Red
  "#D90000": "#CE1126",  // H:0 S:100% L:43% -> Red
  "#DA0000": "#CE1126",  // H:0 S:100% L:43% -> Red
  "#DB0000": "#CE1126",  // H:0 S:100% L:43% -> Red
  "#D0103A": "#CE1126",  // H:347 S:86% L:44% -> Red
  "#CE1126": "#CE1126",  // H:353 S:85% L:44% -> Red
  "#DE0000": "#CE1126",  // H:0 S:100% L:44% -> Red
  "#CF1126": "#CE1126",  // H:353 S:85% L:44% -> Red
  "#E00025": "#CE1126",  // H:350 S:100% L:44% -> Red
  "#CC142B": "#CE1126",  // H:353 S:82% L:44% -> Red
  "#DF0000": "#CE1126",  // H:0 S:100% L:44% -> Red
  "#D62612": "#CE1126",  // H:6 S:84% L:45% -> Red
  "#CE1720": "#CE1126",  // H:357 S:80% L:45% -> Red
  "#E70011": "#CE1126",  // H:356 S:100% L:45% -> Red
  "#E70013": "#CE1126",  // H:355 S:100% L:45% -> Red
  "#C52126": "#CE1126",  // H:358 S:71% L:45% -> Red
  "#CF142B": "#CE1126",  // H:353 S:82% L:45% -> Red
  "#DE3108": "#CE1126",  // H:11 S:93% L:45% -> Red
  "#DE3908": "#CE1126",  // H:14 S:93% L:45% -> Red
  "#D43516": "#CE1126",  // H:10 S:81% L:46% -> Red
  "#DA121A": "#CE1126",  // H:358 S:85% L:46% -> Red
  "#EF0000": "#CE1126",  // H:0 S:100% L:47% -> Red
  "#DC143C": "#CE1126",  // H:348 S:83% L:47% -> Red
  "#F10600": "#CE1126",  // H:1 S:100% L:47% -> Red
  "#DE2010": "#CE1126",  // H:5 S:87% L:47% -> Red
  "#DA251D": "#CE1126",  // H:3 S:77% L:48% -> Red
  "#CE2B37": "#CE1126",  // H:356 S:65% L:49% -> Red
  "#DA2032": "#CE1126",  // H:354 S:74% L:49% -> Red
  "#C6363C": "#CE1126",  // H:357 S:57% L:49% -> Red
  "#D92223": "#CE1126",  // H:360 S:73% L:49% -> Red
  "#D22630": "#CE1126",  // H:357 S:69% L:49% -> Red
  "#BD3D44": "#CE1126",  // H:357 S:51% L:49% -> Red
  "#FA0204": "#CE1126",  // H:360 S:98% L:49% -> Red
  "#D72828": "#CE1126",  // H:0 S:69% L:50% -> Red
  "#EE161F": "#CE1126",  // H:357 S:86% L:51% -> Red
  "#EE1C25": "#CE1126",  // H:357 S:86% L:52% -> Red
  "#DE3929": "#CE1126",  // H:5 S:73% L:52% -> Red
  "#EF2118": "#CE1126",  // H:3 S:87% L:52% -> Red
  "#E1392D": "#CE1126",  // H:4 S:75% L:53% -> Red
  "#E73E2D": "#CE1126",  // H:5 S:79% L:54% -> Red
  "#EF2D28": "#FF6B6B",  // H:2 S:86% L:55% -> Red
  "#EF2D29": "#FF6B6B",  // H:1 S:86% L:55% -> Red
  "#ED2E38": "#FF6B6B",  // H:357 S:84% L:55% -> Red
  "#E84444": "#FF6B6B",  // H:0 S:78% L:59% -> Red
  "#FC3D32": "#FF6B6B",  // H:3 S:97% L:59% -> Red

  // ORANGE shades (28 colors)
  "#85340A": "#E65100",  // H:20 S:86% L:28% -> Dark Orange
  "#843511": "#E65100",  // H:19 S:77% L:29% -> Dark Orange
  "#703D29": "#E65100",  // H:17 S:46% L:30% -> Dark Orange
  "#73452B": "#E65100",  // H:22 S:46% L:31% -> Dark Orange
  "#BD6B00": "#FF8C00",  // H:34 S:100% L:37% -> Dark Orange
  "#CC5500": "#FF8C00",  // H:25 S:100% L:40% -> Orange
  "#D47600": "#FF8C00",  // H:33 S:100% L:42% -> Orange
  "#A77B3B": "#FF8C00",  // H:36 S:48% L:44% -> Orange
  "#B96B29": "#FF8C00",  // H:27 S:64% L:44% -> Orange
  "#E05206": "#FF8C00",  // H:21 S:95% L:45% -> Orange
  "#F2A800": "#FF8C00",  // H:42 S:100% L:47% -> Orange
  "#EF7D00": "#FF8C00",  // H:31 S:100% L:47% -> Orange
  "#DAA520": "#FF8C00",  // H:43 S:74% L:49% -> Orange
  "#FF9A00": "#FF8C00",  // H:36 S:100% L:50% -> Orange
  "#FF7900": "#FF8C00",  // H:28 S:100% L:50% -> Orange
  "#FF8C00": "#FF8C00",  // H:33 S:100% L:50% -> Orange
  "#FF5B00": "#FF8C00",  // H:21 S:100% L:50% -> Orange
  "#FFB700": "#FF8C00",  // H:43 S:100% L:50% -> Orange
  "#F6B40E": "#FF8C00",  // H:43 S:93% L:51% -> Orange
  "#FDB913": "#FF8C00",  // H:43 S:98% L:53% -> Orange
  "#FFB20D": "#FF8C00",  // H:41 S:100% L:53% -> Orange
  "#FF4E12": "#FF8C00",  // H:15 S:100% L:54% -> Orange
  "#D8AA3F": "#FFA500",  // H:42 S:66% L:55% -> Orange
  "#D9A43E": "#FFA500",  // H:39 S:67% L:55% -> Orange
  "#EDB92E": "#FFA500",  // H:44 S:84% L:55% -> Orange
  "#FF9933": "#FFA500",  // H:30 S:100% L:60% -> Light Orange
  "#E2AE57": "#FFA500",  // H:38 S:71% L:61% -> Light Orange
  "#FEC74A": "#FFA500",  // H:42 S:99% L:64% -> Light Orange

  // YELLOW shades (30 colors)
  "#C09300": "#DAA520",  // H:46 S:100% L:38% -> Dark Yellow
  "#E5BE01": "#FCD116",  // H:50 S:99% L:45% -> Yellow
  "#F4F100": "#FCD116",  // H:59 S:100% L:48% -> Yellow
  "#FAD201": "#FCD116",  // H:50 S:99% L:49% -> Yellow
  "#FFEC00": "#FCD116",  // H:56 S:100% L:50% -> Yellow
  "#FFEE00": "#FCD116",  // H:56 S:100% L:50% -> Yellow
  "#FFF300": "#FCD116",  // H:57 S:100% L:50% -> Yellow
  "#F8E509": "#FCD116",  // H:55 S:94% L:50% -> Yellow
  "#FFE800": "#FCD116",  // H:55 S:100% L:50% -> Yellow
  "#FFE600": "#FCD116",  // H:54 S:100% L:50% -> Yellow
  "#FFD900": "#FCD116",  // H:51 S:100% L:50% -> Yellow
  "#FFCA00": "#FCD116",  // H:48 S:100% L:50% -> Yellow
  "#FFDF00": "#FCD116",  // H:52 S:100% L:50% -> Yellow
  "#F8C00C": "#FCD116",  // H:46 S:94% L:51% -> Yellow
  "#FFCE08": "#FCD116",  // H:48 S:100% L:52% -> Yellow
  "#FFDE08": "#FCD116",  // H:52 S:100% L:52% -> Yellow
  "#ECC81D": "#FCD116",  // H:50 S:84% L:52% -> Yellow
  "#F7E017": "#FCD116",  // H:54 S:93% L:53% -> Yellow
  "#F7D618": "#FCD116",  // H:51 S:93% L:53% -> Yellow
  "#F7DB17": "#FCD116",  // H:52 S:93% L:53% -> Yellow
  "#D3AE3B": "#FCD116",  // H:45 S:63% L:53% -> Yellow
  "#FDCE12": "#FCD116",  // H:48 S:98% L:53% -> Yellow
  "#FCD116": "#FCD116",  // H:49 S:97% L:54% -> Yellow
  "#FFD520": "#FCD116",  // H:49 S:100% L:56% -> Yellow
  "#FFC621": "#FCD116",  // H:45 S:100% L:56% -> Yellow
  "#FFEC2D": "#FCD116",  // H:55 S:100% L:59% -> Yellow
  "#FFD83D": "#FFF44F",  // H:48 S:100% L:62% -> Light Yellow
  "#FFF44F": "#FFF44F",  // H:56 S:100% L:65% -> Light Yellow
  "#FCD955": "#FFF44F",  // H:47 S:97% L:66% -> Light Yellow
  "#F3E295": "#FFFF00",  // H:49 S:80% L:77% -> Bright Yellow

  // GREEN shades (50 colors)
  "#004100": "#006400",  // H:120 S:100% L:13% -> Deep Green
  "#24420E": "#006400",  // H:95 S:65% L:16% -> Deep Green
  "#006400": "#007A3D",  // H:120 S:100% L:20% -> Deep Green
  "#006847": "#007A3D",  // H:161 S:100% L:20% -> Deep Green
  "#0C590B": "#007A3D",  // H:119 S:78% L:20% -> Deep Green
  "#006800": "#007A3D",  // H:120 S:100% L:20% -> Deep Green
  "#006A44": "#007A3D",  // H:158 S:100% L:21% -> Deep Green
  "#016848": "#007A3D",  // H:161 S:98% L:21% -> Deep Green
  "#435125": "#007A3D",  // H:79 S:37% L:23% -> Deep Green
  "#34541F": "#007A3D",  // H:96 S:46% L:23% -> Deep Green
  "#165D31": "#007A3D",  // H:143 S:62% L:23% -> Deep Green
  "#007A3D": "#007A3D",  // H:150 S:100% L:24% -> Deep Green
  "#007934": "#007A3D",  // H:146 S:100% L:24% -> Deep Green
  "#007C30": "#007A3D",  // H:143 S:100% L:24% -> Deep Green
  "#007A39": "#007A3D",  // H:148 S:100% L:24% -> Deep Green
  "#20603D": "#007A3D",  // H:147 S:50% L:25% -> Dark Green
  "#00863D": "#007A3D",  // H:147 S:100% L:26% -> Dark Green
  "#008500": "#007A3D",  // H:120 S:100% L:26% -> Dark Green
  "#008753": "#007A3D",  // H:157 S:100% L:26% -> Dark Green
  "#118600": "#007A3D",  // H:112 S:100% L:26% -> Dark Green
  "#108C00": "#007A3D",  // H:113 S:100% L:27% -> Dark Green
  "#406325": "#007A3D",  // H:94 S:46% L:27% -> Dark Green
  "#388D00": "#007A3D",  // H:96 S:100% L:28% -> Dark Green
  "#128807": "#007A3D",  // H:115 S:90% L:28% -> Dark Green
  "#008F00": "#007A3D",  // H:120 S:100% L:28% -> Dark Green
  "#009025": "#007A3D",  // H:135 S:100% L:28% -> Dark Green
  "#00966E": "#007A3D",  // H:164 S:100% L:29% -> Dark Green
  "#009200": "#007A3D",  // H:120 S:100% L:29% -> Dark Green
  "#058E6E": "#007A3D",  // H:166 S:93% L:29% -> Dark Green
  "#298C08": "#007A3D",  // H:105 S:89% L:29% -> Dark Green
  "#009A00": "#007A3D",  // H:120 S:100% L:30% -> Dark Green
  "#009A3B": "#007A3D",  // H:143 S:100% L:30% -> Dark Green
  "#3E9A00": "#007A3D",  // H:96 S:100% L:30% -> Dark Green
  "#009A49": "#007A3D",  // H:148 S:100% L:30% -> Dark Green
  "#199A00": "#007A3D",  // H:110 S:100% L:30% -> Dark Green
  "#009E49": "#007A3D",  // H:148 S:100% L:31% -> Dark Green
  "#399408": "#007A3D",  // H:99 S:90% L:31% -> Dark Green
  "#38A100": "#009E49",  // H:99 S:100% L:32% -> Dark Green
  "#00A400": "#009E49",  // H:120 S:100% L:32% -> Dark Green
  "#00A850": "#009E49",  // H:149 S:100% L:33% -> Dark Green
  "#377E3F": "#009E49",  // H:127 S:39% L:35% -> Dark Green
  "#0DB02B": "#009E49",  // H:131 S:86% L:37% -> Dark Green
  "#229E45": "#009E49",  // H:137 S:65% L:38% -> Dark Green
  "#239E3F": "#009E49",  // H:134 S:64% L:38% -> Dark Green
  "#239F40": "#009E49",  // H:134 S:64% L:38% -> Dark Green
  "#309E3A": "#009E49",  // H:125 S:53% L:40% -> Green
  "#00CA00": "#009E49",  // H:120 S:100% L:40% -> Green
  "#00CC00": "#009E49",  // H:120 S:100% L:40% -> Green
  "#6D8C3E": "#009E49",  // H:84 S:39% L:40% -> Green
  "#32CD32": "#32CD32",  // H:120 S:61% L:50% -> Green

  // BLUE shades (62 colors)
  "#011322": "#000080",  // H:207 S:94% L:7% -> Deep Blue
  "#04534E": "#000080",  // H:176 S:91% L:17% -> Deep Blue
  "#002255": "#000080",  // H:216 S:100% L:17% -> Deep Blue
  "#002170": "#000080",  // H:222 S:100% L:22% -> Deep Blue
  "#2D2A4A": "#000080",  // H:246 S:28% L:23% -> Deep Blue
  "#081873": "#000080",  // H:231 S:87% L:24% -> Deep Blue
  "#00267F": "#003DA5",  // H:222 S:100% L:25% -> Dark Blue
  "#151F6D": "#003DA5",  // H:233 S:68% L:25% -> Dark Blue
  "#000080": "#003DA5",  // H:240 S:100% L:25% -> Dark Blue
  "#0C4076": "#003DA5",  // H:211 S:82% L:25% -> Dark Blue
  "#000088": "#003DA5",  // H:240 S:100% L:27% -> Dark Blue
  "#005989": "#003DA5",  // H:201 S:100% L:27% -> Dark Blue
  "#003D88": "#003DA5",  // H:213 S:100% L:27% -> Dark Blue
  "#00148E": "#003DA5",  // H:232 S:100% L:28% -> Dark Blue
  "#0A328C": "#003DA5",  // H:222 S:87% L:29% -> Dark Blue
  "#0C8489": "#003DA5",  // H:182 S:84% L:29% -> Dark Blue
  "#007E93": "#003DA5",  // H:189 S:100% L:29% -> Dark Blue
  "#000099": "#003DA5",  // H:240 S:100% L:30% -> Dark Blue
  "#003897": "#003DA5",  // H:218 S:100% L:30% -> Dark Blue
  "#003DA5": "#003DA5",  // H:218 S:100% L:32% -> Dark Blue
  "#032EA1": "#003DA5",  // H:224 S:96% L:32% -> Dark Blue
  "#0018A8": "#003DA5",  // H:231 S:100% L:33% -> Dark Blue
  "#0038A8": "#003DA5",  // H:220 S:100% L:33% -> Dark Blue
  "#0058AA": "#003DA5",  // H:209 S:100% L:33% -> Dark Blue
  "#171796": "#003DA5",  // H:240 S:73% L:34% -> Dark Blue
  "#1D5E91": "#003DA5",  // H:206 S:67% L:34% -> Dark Blue
  "#0872A7": "#003DA5",  // H:200 S:91% L:34% -> Dark Blue
  "#21468B": "#003DA5",  // H:219 S:62% L:34% -> Dark Blue
  "#0000AB": "#003DA5",  // H:240 S:100% L:34% -> Dark Blue
  "#0B4EA2": "#003DA5",  // H:213 S:87% L:34% -> Dark Blue
  "#0000B4": "#0066CC",  // H:240 S:100% L:35% -> Dark Blue
  "#0066B3": "#0066CC",  // H:206 S:100% L:35% -> Dark Blue
  "#005BBF": "#0066CC",  // H:211 S:100% L:37% -> Dark Blue
  "#0D5EAF": "#0066CC",  // H:210 S:86% L:37% -> Dark Blue
  "#0000BF": "#0066CC",  // H:240 S:100% L:37% -> Dark Blue
  "#0000C4": "#0066CC",  // H:240 S:100% L:38% -> Dark Blue
  "#00ABC2": "#0066CC",  // H:187 S:100% L:38% -> Dark Blue
  "#006BC6": "#0066CC",  // H:208 S:100% L:39% -> Dark Blue
  "#0067C6": "#0066CC",  // H:209 S:100% L:39% -> Dark Blue
  "#2B49A3": "#0066CC",  // H:225 S:58% L:40% -> Blue
  "#0073CE": "#0066CC",  // H:207 S:100% L:40% -> Blue
  "#3E5698": "#0066CC",  // H:224 S:42% L:42% -> Blue
  "#3662A2": "#0066CC",  // H:216 S:50% L:42% -> Blue
  "#0000D6": "#0066CC",  // H:240 S:100% L:42% -> Blue
  "#00A6DE": "#0066CC",  // H:195 S:100% L:44% -> Blue
  "#08CED6": "#0066CC",  // H:182 S:93% L:44% -> Blue
  "#0039F0": "#0066CC",  // H:226 S:100% L:47% -> Blue
  "#18C3DF": "#0066CC",  // H:188 S:81% L:48% -> Blue
  "#3E5EB9": "#0066CC",  // H:224 S:50% L:48% -> Blue
  "#007FFF": "#0066CC",  // H:210 S:100% L:50% -> Blue
  "#00CCFF": "#0066CC",  // H:192 S:100% L:50% -> Blue
  "#19B6EF": "#0066CC",  // H:196 S:87% L:52% -> Blue
  "#4169E1": "#4169E1",  // H:225 S:73% L:57% -> Blue
  "#38A9F9": "#4169E1",  // H:205 S:94% L:60% -> Light Blue
  "#6797D6": "#4169E1",  // H:214 S:58% L:62% -> Light Blue
  "#40A6FF": "#4169E1",  // H:208 S:100% L:63% -> Light Blue
  "#564DFF": "#4169E1",  // H:243 S:100% L:65% -> Light Blue
  "#74ACDF": "#4169E1",  // H:209 S:63% L:66% -> Light Blue
  "#65CFFF": "#007FFF",  // H:199 S:100% L:70% -> Light Blue
  "#B4D7F4": "#007FFF",  // H:207 S:74% L:83% -> Bright Blue
  "#F4F5F8": "#007FFF",  // H:225 S:22% L:96% -> Bright Blue
  "#F7FFFF": "#007FFF",  // H:180 S:100% L:98% -> Bright Blue

  // PINK shades (1 colors)
  "#8D1B3D": "#DB7093",  // H:342 S:68% L:33% -> Dark Pink
};;

// Helper function to get the normalized color
export function getNormalizedColor(hex: string): string {
  const normalized = hex.toUpperCase().replace(/[^A-F0-9]/g, "");
  const withHash = "#" + (normalized.length === 3 ? normalized[0]+normalized[0]+normalized[1]+normalized[1]+normalized[2]+normalized[2] : normalized);
  return COLOR_NORMALIZATION_MAP[withHash.toUpperCase()] || withHash.toUpperCase();
}

// Get shade info for a hex
export function getShadeInfo(hex: string): ColorInfo | null {
  const normalized = hex.toUpperCase();
  const mapped = COLOR_NORMALIZATION_MAP[normalized];
  if (!mapped) return classifyColor(hex);
  return classifyColor(mapped);
}
