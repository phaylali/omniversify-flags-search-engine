import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { COLOR_NORMALIZATION_MAP, classifyColor, hexToHsl } from "./color-palette";

// ============================================================
// CLASSIFY COLORS SCRIPT
// Run this to see how colors are currently classified
// Run: bun run classify-colors
// ============================================================

function main() {
  const flagsPath = join(process.cwd(), "public", "flags.json");
  console.log("Reading flags.json...\n");
  const flags = JSON.parse(readFileSync(flagsPath, "utf-8"));

  // Collect all unique colors
  const colorMap = new Map<string, string[]>();
  for (const flag of flags) {
    for (const color of flag.colors) {
      const normalized = color.toUpperCase();
      if (!colorMap.has(normalized)) {
        colorMap.set(normalized, []);
      }
      colorMap.get(normalized)!.push(flag.code);
    }
  }

  console.log(`Found ${colorMap.size} unique colors\n`);
  console.log("=".repeat(80));
  console.log("COLOR CLASSIFICATION (HSL-based)");
  console.log("=".repeat(80));

  // Group by family
  const byFamily = new Map<string, Array<{ hex: string; flags: string[] }>>();

  for (const [hex, flagCodes] of colorMap) {
    const info = classifyColor(hex);
    const [h, s, l] = hexToHsl(hex);
    const mapped = COLOR_NORMALIZATION_MAP[hex];

    if (!byFamily.has(info.family)) {
      byFamily.set(info.family, []);
    }
    byFamily.get(info.family)!.push({ hex, flags: flagCodes });
  }

  // Print by family
  for (const [family, colors] of byFamily) {
    console.log(`\n${"─".repeat(40)}`);
    console.log(`${family.toUpperCase()} (${colors.length} colors)`);
    console.log("─".repeat(40));

    for (const { hex, flags } of colors) {
      const info = classifyColor(hex);
      const mapped = COLOR_NORMALIZATION_MAP[hex];
      const status = mapped ? `-> ${mapped}` : "NOT MAPPED";
      console.log(`  ${hex} H:${info.hue} S:${info.saturation}% L:${info.lightness}% | ${info.shade} | ${status} | ${flags.length} flags`);
    }
  }
}

main();
