import { readdirSync, readFileSync, writeFileSync } from "fs";
import { join, basename } from "path";

interface ColorInfo {
  hex: string;
  source: string; // fill, stroke, style
}

interface FlagColors {
  code: string;
  name: string;
  colors: string[];
}

// Common color name to hex mapping
const colorNames: Record<string, string> = {
  red: "#FF0000",
  green: "#008000",
  blue: "#0000FF",
  white: "#FFFFFF",
  black: "#000000",
  yellow: "#FFFF00",
  orange: "#FFA500",
  purple: "#800080",
  pink: "#FFC0CB",
  brown: "#A52A2A",
  gray: "#808080",
  grey: "#808080",
  cyan: "#00FFFF",
  magenta: "#FF00FF",
  lime: "#00FF00",
  olive: "#808000",
  maroon: "#800000",
  navy: "#000080",
  teal: "#008080",
  aqua: "#00FFFF",
  silver: "#C0C0C0",
  gold: "#FFD700",
};

// Convert various color formats to hex
function toHex(color: string): string | null {
  color = color.trim().toLowerCase();

  // Already hex
  if (color.startsWith("#")) {
    // Expand shorthand (#RGB -> #RRGGBB)
    if (color.length === 4) {
      return (
        "#" +
        color[1] +
        color[1] +
        color[2] +
        color[2] +
        color[3] +
        color[3]
      ).toUpperCase();
    }
    if (color.length === 7) {
      return color.toUpperCase();
    }
    return null;
  }

  // rgb() format
  const rgbMatch = color.match(
    /rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/,
  );
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1]);
    const g = parseInt(rgbMatch[2]);
    const b = parseInt(rgbMatch[3]);
    return "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1).toUpperCase();
  }

  // rgba() format
  const rgbaMatch = color.match(
    /rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*[\d.]+\s*\)/,
  );
  if (rgbaMatch) {
    const r = parseInt(rgbaMatch[1]);
    const g = parseInt(rgbaMatch[2]);
    const b = parseInt(rgbaMatch[3]);
    return "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1).toUpperCase();
  }

  // Color name
  if (colorNames[color]) {
    return colorNames[color];
  }

  return null;
}

// Extract colors from SVG content
function extractColorsFromSVG(svgContent: string): Set<string> {
  const colors = new Set<string>();

  // 1. Extract from fill attributes
  const fillRegex = /fill\s*=\s*["']([^"']+)["']/gi;
  let match;
  while ((match = fillRegex.exec(svgContent)) !== null) {
    const color = match[1].trim();
    if (color !== "none" && color !== "transparent") {
      const hex = toHex(color);
      if (hex) colors.add(hex);
    }
  }

  // 2. Extract from stroke attributes
  const strokeRegex = /stroke\s*=\s*["']([^"']+)["']/gi;
  while ((match = strokeRegex.exec(svgContent)) !== null) {
    const color = match[1].trim();
    if (color !== "none" && color !== "transparent") {
      const hex = toHex(color);
      if (hex) colors.add(hex);
    }
  }

  // 3. Extract from inline style attributes
  const styleRegex = /style\s*=\s*["']([^"']+)["']/gi;
  while ((match = styleRegex.exec(svgContent)) !== null) {
    const styleContent = match[1];

    // Extract fill from style
    const fillStyleMatch = styleContent.match(/fill\s*:\s*([^;]+)/i);
    if (fillStyleMatch) {
      const color = fillStyleMatch[1].trim();
      if (color !== "none" && color !== "transparent") {
        const hex = toHex(color);
        if (hex) colors.add(hex);
      }
    }

    // Extract stroke from style
    const strokeStyleMatch = styleContent.match(/stroke\s*:\s*([^;]+)/i);
    if (strokeStyleMatch) {
      const color = strokeStyleMatch[1].trim();
      if (color !== "none" && color !== "transparent") {
        const hex = toHex(color);
        if (hex) colors.add(hex);
      }
    }
  }

  // 4. Extract from CSS within <style> tags
  const styleTagRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  while ((match = styleTagRegex.exec(svgContent)) !== null) {
    const cssContent = match[1];

    // Extract fill colors from CSS
    const cssFillRegex = /fill\s*:\s*([^;{}]+)/gi;
    let fillMatch;
    while ((fillMatch = cssFillRegex.exec(cssContent)) !== null) {
      const color = fillMatch[1].trim();
      if (color !== "none" && color !== "transparent") {
        const hex = toHex(color);
        if (hex) colors.add(hex);
      }
    }

    // Extract stroke colors from CSS
    const cssStrokeRegex = /stroke\s*:\s*([^;{}]+)/gi;
    while ((fillMatch = cssStrokeRegex.exec(cssContent)) !== null) {
      const color = fillMatch[1].trim();
      if (color !== "none" && color !== "transparent") {
        const hex = toHex(color);
        if (hex) colors.add(hex);
      }
    }
  }

  // 5. Extract from stop-color (for gradients)
  const stopColorRegex = /stop-color\s*=\s*["']([^"']+)["']/gi;
  while ((match = stopColorRegex.exec(svgContent)) !== null) {
    const color = match[1].trim();
    if (color !== "none" && color !== "transparent") {
      const hex = toHex(color);
      if (hex) colors.add(hex);
    }
  }

  return colors;
}

// Get color name based on hex
function getColorGroup(hex: string): string[] {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  const groups: string[] = [];

  // Black (very dark)
  if (r < 30 && g < 30 && b < 30) {
    groups.push("black");
  }
  // White (very light)
  else if (r > 240 && g > 240 && b > 240) {
    groups.push("white");
  }
  // Colors with high saturation
  else {
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;
    const lightness = (max + min) / 2;

    if (delta > 30) {
      // Determine hue
      let hue = 0;
      if (max === r) {
        hue = ((g - b) / delta) % 6;
      } else if (max === g) {
        hue = (b - r) / delta + 2;
      } else {
        hue = (r - g) / delta + 4;
      }
      hue = Math.round(hue * 60);
      if (hue < 0) hue += 360;

      // Red range (0-15, 345-360)
      if ((hue >= 345 || hue <= 15) && delta > 50) {
        groups.push("red");
      }
      // Orange range (16-40)
      else if (hue >= 16 && hue <= 40 && delta > 50) {
        groups.push("orange");
      }
      // Yellow range (41-65)
      else if (hue >= 41 && hue <= 65 && delta > 50) {
        groups.push("yellow");
      }
      // Green range (66-170)
      else if (hue >= 66 && hue <= 170 && delta > 40) {
        groups.push("green");
      }
      // Blue range (171-260)
      else if (hue >= 171 && hue <= 260 && delta > 40) {
        groups.push("blue");
      }
      // Purple/Magenta range
      else if (hue > 260 && hue < 345 && delta > 40) {
        // Could be purple or magenta - check saturation
        if (lightness < 60) {
          groups.push("blue"); // Dark purples count as blue for flags
        }
      }
    }
    // Grays (low saturation)
    else if (delta < 30 && lightness > 30 && lightness < 220) {
      // Grays don't get a group
    }
  }

  return groups;
}

// Map country code to filename
function getFileName(code: string): string {
  return `${code}.svg`;
}

// Get country name from code
function getCountryName(code: string): string {
  const names: Record<string, string> = {
    af: "Afghanistan",
    al: "Albania",
    dz: "Algeria",
    ad: "Andorra",
    ao: "Angola",
    ag: "Antigua and Barbuda",
    ar: "Argentina",
    am: "Armenia",
    au: "Australia",
    at: "Austria",
    az: "Azerbaijan",
    bs: "Bahamas",
    bh: "Bahrain",
    bd: "Bangladesh",
    bb: "Barbados",
    by: "Belarus",
    be: "Belgium",
    bz: "Belize",
    bj: "Benin",
    bt: "Bhutan",
    bo: "Bolivia",
    ba: "Bosnia and Herzegovina",
    bw: "Botswana",
    br: "Brazil",
    bn: "Brunei",
    bg: "Bulgaria",
    bf: "Burkina Faso",
    bi: "Burundi",
    kh: "Cambodia",
    cm: "Cameroon",
    ca: "Canada",
    cv: "Cape Verde",
    cf: "Central African Republic",
    td: "Chad",
    cl: "Chile",
    cn: "China",
    co: "Colombia",
    km: "Comoros",
    cg: "Congo",
    cr: "Costa Rica",
    hr: "Croatia",
    cu: "Cuba",
    cy: "Cyprus",
    cz: "Czechia",
    cd: "Democratic Republic of the Congo",
    dk: "Denmark",
    dj: "Djibouti",
    dm: "Dominica",
    do: "Dominican Republic",
    ec: "Ecuador",
    eg: "Egypt",
    sv: "El Salvador",
    gq: "Equatorial Guinea",
    er: "Eritrea",
    ee: "Estonia",
    sz: "Eswatini",
    et: "Ethiopia",
    fj: "Fiji",
    fi: "Finland",
    fr: "France",
    ga: "Gabon",
    gm: "Gambia",
    ge: "Georgia",
    de: "Germany",
    gh: "Ghana",
    gr: "Greece",
    gd: "Grenada",
    gt: "Guatemala",
    gn: "Guinea",
    gw: "Guinea-Bissau",
    gy: "Guyana",
    ht: "Haiti",
    hn: "Honduras",
    hu: "Hungary",
    is: "Iceland",
    in: "India",
    id: "Indonesia",
    ir: "Iran",
    iq: "Iraq",
    ie: "Ireland",
    il: "Israel",
    it: "Italy",
    jm: "Jamaica",
    jp: "Japan",
    jo: "Jordan",
    kz: "Kazakhstan",
    ke: "Kenya",
    ki: "Kiribati",
    xk: "Kosovo",
    kw: "Kuwait",
    kg: "Kyrgyzstan",
    la: "Laos",
    lv: "Latvia",
    lb: "Lebanon",
    ls: "Lesotho",
    lr: "Liberia",
    ly: "Libya",
    li: "Liechtenstein",
    lt: "Lithuania",
    lu: "Luxembourg",
    mg: "Madagascar",
    mw: "Malawi",
    my: "Malaysia",
    mv: "Maldives",
    ml: "Mali",
    mt: "Malta",
    mh: "Marshall Islands",
    mr: "Mauritania",
    mu: "Mauritius",
    mx: "Mexico",
    fm: "Micronesia",
    md: "Moldova",
    mc: "Monaco",
    mn: "Mongolia",
    me: "Montenegro",
    ma: "Morocco",
    mz: "Mozambique",
    mm: "Myanmar",
    na: "Namibia",
    nr: "Nauru",
    np: "Nepal",
    nl: "Netherlands",
    nz: "New Zealand",
    ni: "Nicaragua",
    ne: "Niger",
    ng: "Nigeria",
    kp: "North Korea",
    mk: "North Macedonia",
    no: "Norway",
    om: "Oman",
    pk: "Pakistan",
    pw: "Palau",
    ps: "Palestine",
    pa: "Panama",
    pg: "Papua New Guinea",
    py: "Paraguay",
    pe: "Peru",
    ph: "Philippines",
    pl: "Poland",
    pt: "Portugal",
    qa: "Qatar",
    ro: "Romania",
    ru: "Russia",
    rw: "Rwanda",
    kn: "Saint Kitts and Nevis",
    lc: "Saint Lucia",
    vc: "Saint Vincent and the Grenadines",
    ws: "Samoa",
    sm: "San Marino",
    st: "Sao Tome and Principe",
    sa: "Saudi Arabia",
    sn: "Senegal",
    rs: "Serbia",
    sc: "Seychelles",
    sl: "Sierra Leone",
    sg: "Singapore",
    sk: "Slovakia",
    si: "Slovenia",
    sb: "Solomon Islands",
    so: "Somalia",
    za: "South Africa",
    kr: "South Korea",
    ss: "South Sudan",
    es: "Spain",
    lk: "Sri Lanka",
    sd: "Sudan",
    sr: "Suriname",
    se: "Sweden",
    ch: "Switzerland",
    sy: "Syria",
    tw: "Taiwan",
    tj: "Tajikistan",
    tz: "Tanzania",
    th: "Thailand",
    tl: "Timor-Leste",
    tg: "Togo",
    tt: "Trinidad and Tobago",
    tn: "Tunisia",
    tr: "Turkey",
    tm: "Turkmenistan",
    tv: "Tuvalu",
    ug: "Uganda",
    ua: "Ukraine",
    ae: "United Arab Emirates",
    gb: "United Kingdom",
    us: "United States",
    uy: "Uruguay",
    uz: "Uzbekistan",
    vu: "Vanuatu",
    va: "Vatican City",
    ve: "Venezuela",
    vn: "Vietnam",
    ye: "Yemen",
    zm: "Zambia",
    zw: "Zimbabwe",
  };
  return names[code] || code.toUpperCase();
}

function main() {
  const flagsDir = join(process.cwd(), "public", "flags-svgs");

  console.log("Reading SVG files from:", flagsDir);

  let files: string[];
  try {
    files = readdirSync(flagsDir).filter((f) => f.endsWith(".svg"));
  } catch (e) {
    console.error("Error reading public/flags-svgs directory:", e);
    console.log("\nMake sure you have a 'public/flags-svgs' folder with SVG files.");
    console.log("\nDownload flags using:");
    console.log("  bun run download-flags");
    process.exit(0);
  }

  // Countries to always exclude
  const EXCLUDED = ["il"];

  const results: FlagColors[] = [];
  let processed = 0;

  for (const file of files) {
    const code = basename(file, ".svg").toLowerCase();

    // Skip excluded countries
    if (EXCLUDED.includes(code)) {
      console.log(`⊘ ${code}: Skipped (excluded)`);
      continue;
    }

    const filePath = join(flagsDir, file);
    const svgContent = readFileSync(filePath, "utf-8");
    const colors = extractColorsFromSVG(svgContent);

    if (colors.size > 0) {
      // Sort colors: white first, then black, then by hue
      const sortedColors = Array.from(colors).sort((a, b) => {
        // White first
        if (a === "#FFFFFF") return -1;
        if (b === "#FFFFFF") return 1;
        // Black second
        if (a === "#000000") return -1;
        if (b === "#000000") return 1;
        // Then by hue
        return a.localeCompare(b);
      });

      results.push({
        code,
        name: getCountryName(code),
        colors: sortedColors,
      });
      processed++;
      console.log(`✓ ${code}: ${sortedColors.join(", ")}`);
    } else {
      console.log(`⚠ ${code}: No colors found`);
    }
  }

  console.log(`\n${"=".repeat(50)}`);
  console.log(`Processed ${processed} flags with colors`);
  console.log(`${"=".repeat(50)}\n`);

  // Save results
  const outputPath = join(process.cwd(), "scripts", "extracted-flag-colors.json");
  writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`Colors saved to: ${outputPath}`);

  // Also generate updated flags.json structure
  const existingFlagsPath = join(process.cwd(), "public", "flags.json");
  let existingFlags: any[] = [];
  try {
    existingFlags = JSON.parse(readFileSync(existingFlagsPath, "utf-8"));
  } catch {
    console.log("\nNo existing flags.json found, creating new one");
  }

  // Create a map of existing flags
  const existingMap = new Map(existingFlags.map((f: any) => [f.code, f]));

  // Merge extracted colors with existing data
  const updatedFlags = results.map((flag) => {
    const existing = existingMap.get(flag.code);
    return {
      name: flag.name,
      code: flag.code,
      colors: flag.colors,
      tabler: existing?.tabler || flag.code,
      colorGroups: existing?.colorGroups || {
        red: false,
        blue: false,
        green: false,
        yellow: false,
        orange: false,
        white: false,
        black: false,
      },
    };
  });

  const updatedPath = join(process.cwd(), "scripts", "updated-flags.json");
  writeFileSync(updatedPath, JSON.stringify(updatedFlags, null, 2));
  console.log(`Updated flags.json saved to: ${updatedPath}`);
  console.log(`\nTo apply changes, copy the file:`);
  console.log(`  cp scripts/updated-flags.json public/flags.json`);
}

main();
