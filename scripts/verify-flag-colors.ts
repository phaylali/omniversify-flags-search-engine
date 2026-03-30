import { readFileSync, writeFileSync } from "fs";

interface FlagData {
  name: string;
  code: string;
  colors: string[];
  tabler: string;
  colorGroups: Record<string, boolean>;
}

interface OfficialColor {
  name: string;
  hex: string;
}

interface VerificationResult {
  name: string;
  code: string;
  ourColors: string[];
  officialColors: OfficialColor[];
  matches: boolean;
  differences: string[];
}

// Map some country codes to flagcolorcodes.com URL format
const urlMap: Record<string, string> = {
  us: "usa",
  gb: "united-kingdom",
  ae: "united-arab-emirates",
  am: "armenia",
  az: "azerbaijan",
  ba: "bosnia-and-herzegovina",
  bn: "brunei",
  cd: "democratic-republic-of-the-congo",
  cf: "central-african-republic",
  cg: "republic-of-the-congo",
  ci: "ivory-coast",
  cv: "cape-verde",
  cz: "czech-republic",
  do: "dominican-republic",
  et: "ethiopia",
  ga: "gabon",
  gb: "united-kingdom",
  ir: "iran",
  ki: "kiribati",
  kp: "north-korea",
  kr: "south-korea",
  la: "laos",
  lc: "saint-lucia",
  mk: "north-macedonia",
  mm: "myanmar",
  ps: "palestine",
  ru: "russia",
  ss: "south-sudan",
  sv: "el-salvador",
  sy: "syria",
  td: "chad",
  tl: "timor-leste",
  tw: "taiwan",
  tz: "tanzania",
  um: "united-states-minor-outlying-islands",
  vn: "vietnam",
  vu: "vanuatu",
  ws: "samoa",
  xk: "kosovo",
  ye: "yemen",
  za: "south-africa",
  "st": "sao-tome-and-principe",
};

function getCodeForUrl(code: string): string {
  return urlMap[code] || code;
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchFlagColors(countryCode: string): Promise<OfficialColor[] | null> {
  const urlCode = getCodeForUrl(countryCode);
  const url = `https://www.flagcolorcodes.com/${urlCode}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`  HTTP error for ${countryCode}: ${response.status}`);
      return null;
    }

    const html = await response.text();

    // Extract colors from the page
    const colors: OfficialColor[] = [];

    // Look for color patterns like "Hex\n\nB31942" or color name followed by hex
    const colorPattern = /###\s*(?:.*?)\s*Color Codes[\s\S]*?Hex\s*\n\s*\n?\s*([A-Fa-f0-9]{6})/g;
    let match;
    while ((match = colorPattern.exec(html)) !== null) {
      const hex = "#" + match[1].toUpperCase();
      colors.push({ name: "", hex });
    }

    // Alternative pattern - look for color swatches with hex values
    const swatchPattern = /style="background-color:\s*#([A-Fa-f0-9]{6})/g;
    while ((match = swatchPattern.exec(html)) !== null) {
      const hex = "#" + match[1].toUpperCase();
      // Avoid duplicates
      if (!colors.some((c) => c.hex === hex)) {
        colors.push({ name: "", hex });
      }
    }

    // Look for the color list at the top of the page
    const listPattern = /- ([A-Za-z\s]+):\s*#([A-Fa-f0-9]{6})/g;
    while ((match = listPattern.exec(html)) !== null) {
      const name = match[1].trim();
      const hex = "#" + match[2].toUpperCase();
      if (!colors.some((c) => c.hex === hex)) {
        colors.push({ name, hex });
      }
    }

    return colors.length > 0 ? colors : null;
  } catch (error) {
    console.error(`  Error fetching ${countryCode}:`, error);
    return null;
  }
}

function normalizeHex(hex: string): string {
  return hex.toUpperCase().replace(/[^A-F0-9]/g, "");
}

function compareColors(ourColors: string[], officialColors: OfficialColor[]): { matches: boolean; differences: string[] } {
  const differences: string[] = [];
  const officialHexes = officialColors.map((c) => normalizeHex(c.hex));
  const ourHexes = ourColors.map((c) => normalizeHex(c));

  // Check if we have colors that official doesn't have
  for (const ourHex of ourHexes) {
    if (!officialHexes.includes(ourHex)) {
      // Check if it's close (within 20 in each RGB channel)
      const [r1, g1, b1] = [parseInt(ourHex.substr(0, 2), 16), parseInt(ourHex.substr(2, 2), 16), parseInt(ourHex.substr(4, 2), 16)];
      let isClose = false;

      for (const officialHex of officialHexes) {
        const [r2, g2, b2] = [parseInt(officialHex.substr(0, 2), 16), parseInt(officialHex.substr(2, 2), 16), parseInt(officialHex.substr(4, 2), 16)];
        if (Math.abs(r1 - r2) <= 20 && Math.abs(g1 - g2) <= 20 && Math.abs(b1 - b2) <= 20) {
          isClose = true;
          break;
        }
      }

      if (!isClose) {
        differences.push(`We have ${ourHex} but official doesn't`);
      }
    }
  }

  // Check if official has colors that we don't have
  for (const officialColor of officialColors) {
    const officialHex = normalizeHex(officialColor.hex);
    if (!ourHexes.includes(officialHex)) {
      const [r1, g1, b1] = [parseInt(officialHex.substr(0, 2), 16), parseInt(officialHex.substr(2, 2), 16), parseInt(officialHex.substr(4, 2), 16)];
      let isClose = false;

      for (const ourHex of ourHexes) {
        const [r2, g2, b2] = [parseInt(ourHex.substr(0, 2), 16), parseInt(ourHex.substr(2, 2), 16), parseInt(ourHex.substr(4, 2), 16)];
        if (Math.abs(r1 - r2) <= 20 && Math.abs(g1 - g2) <= 20 && Math.abs(b1 - b2) <= 20) {
          isClose = true;
          break;
        }
      }

      if (!isClose) {
        differences.push(`Official has ${officialColor.hex} (${officialColor.name}) but we don't`);
      }
    }
  }

  return {
    matches: differences.length === 0,
    differences,
  };
}

async function main() {
  console.log("Reading flags.json...");
  const flagsData: FlagData[] = JSON.parse(readFileSync("public/flags.json", "utf-8"));

  console.log(`Found ${flagsData.length} flags to verify\n`);

  const results: VerificationResult[] = [];
  let processed = 0;
  let errors = 0;

  for (const flag of flagsData) {
    processed++;
    console.log(`[${processed}/${flagsData.length}] Checking ${flag.name} (${flag.code})...`);

    const officialColors = await fetchFlagColors(flag.code);

    if (officialColors === null) {
      console.log(`  Could not fetch colors for ${flag.name}`);
      errors++;
      results.push({
        name: flag.name,
        code: flag.code,
        ourColors: flag.colors,
        officialColors: [],
        matches: false,
        differences: ["Could not fetch official colors"],
      });
    } else {
      const { matches, differences } = compareColors(flag.colors, officialColors);
      results.push({
        name: flag.name,
        code: flag.code,
        ourColors: flag.colors,
        officialColors,
        matches,
        differences,
      });

      if (matches) {
        console.log(`  ✓ Colors match`);
      } else {
        console.log(`  ✗ Differences found:`);
        for (const diff of differences) {
          console.log(`    - ${diff}`);
        }
      }
    }

    // Rate limiting - wait between requests
    await sleep(500);
  }

  // Generate report
  const matchingFlags = results.filter((r) => r.matches);
  const differingFlags = results.filter((r) => !r.matches);

  console.log("\n" + "=".repeat(60));
  console.log("VERIFICATION REPORT");
  console.log("=".repeat(60));
  console.log(`Total flags checked: ${results.length}`);
  console.log(`Matching: ${matchingFlags.length}`);
  console.log(`Differing: ${differingFlags.length}`);
  console.log(`Errors: ${errors}`);
  console.log("=".repeat(60));

  // Save detailed report
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: results.length,
      matching: matchingFlags.length,
      differing: differingFlags.length,
      errors,
    },
    matchingFlags: matchingFlags.map((r) => ({ name: r.name, code: r.code })),
    differingFlags: differingFlags.map((r) => ({
      name: r.name,
      code: r.code,
      ourColors: r.ourColors,
      officialColors: r.officialColors.map((c) => c.hex),
      differences: r.differences,
    })),
  };

  writeFileSync("scripts/flag-colors-verification-report.json", JSON.stringify(report, null, 2));
  console.log("\nDetailed report saved to scripts/flag-colors-verification-report.json");
}

main().catch(console.error);
