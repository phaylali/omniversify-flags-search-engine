import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { classifyColor, SHADES } from "./color-palette";

// ============================================================
// AUTO-GENERATE COLOR MAPPINGS
// This script reads all flags and generates proper HSL-based mappings
// Run: bun run generate-color-map
// ============================================================

function main() {
  const flagsPath = join(process.cwd(), "public", "flags.json");
  const palettePath = join(process.cwd(), "scripts", "color-palette.ts");

  console.log("Reading flags.json...");
  const flags = JSON.parse(readFileSync(flagsPath, "utf-8"));

  // Collect all unique colors
  const colorSet = new Set<string>();
  for (const flag of flags) {
    for (const color of flag.colors) {
      colorSet.add(color.toUpperCase());
    }
  }

  console.log(`Found ${colorSet.size} unique colors\n`);

  // Sort colors by family
  const byFamily = new Map<string, string[]>();
  for (const hex of colorSet) {
    const info = classifyColor(hex);
    if (!byFamily.has(info.family)) {
      byFamily.set(info.family, []);
    }
    byFamily.get(info.family)!.push(hex);
  }

  // Generate the mapping
  const mappings: string[] = [];
  
  // Sort families
  const familyOrder = ["black", "white", "gray", "red", "orange", "yellow", "green", "blue", "purple", "pink"];
  
  for (const family of familyOrder) {
    const colors = byFamily.get(family) || [];
    if (colors.length === 0) continue;

    // Sort by hue, then lightness
    colors.sort((a, b) => {
      const infoA = classifyColor(a);
      const infoB = classifyColor(b);
      return infoA.lightness - infoB.lightness;
    });

    mappings.push(`  // ${family.toUpperCase()} shades (${colors.length} colors)`);
    
    for (const hex of colors) {
      const info = classifyColor(hex);
      let shadeHex: string;

      // Map to the appropriate shade based on family and lightness
      switch (family) {
        case "black":
          if (info.lightness < 5) shadeHex = SHADES.DEEP_BLACK;
          else if (info.lightness < 10) shadeHex = SHADES.DARK_BLACK;
          else if (info.lightness < 18) shadeHex = SHADES.BLACK;
          else if (info.lightness < 25) shadeHex = SHADES.LIGHT_BLACK;
          else shadeHex = SHADES.BRIGHT_BLACK;
          break;
        case "white":
          if (info.lightness > 95) shadeHex = SHADES.BRIGHT_WHITE;
          else if (info.lightness > 90) shadeHex = SHADES.LIGHT_WHITE;
          else if (info.lightness > 85) shadeHex = SHADES.WHITE;
          else if (info.lightness > 80) shadeHex = SHADES.DARK_WHITE;
          else shadeHex = SHADES.DEEP_WHITE;
          break;
        case "gray":
          shadeHex = SHADES.DARK_WHITE;
          break;
        case "red":
          if (info.lightness < 25) shadeHex = SHADES.DEEP_RED;
          else if (info.lightness < 35) shadeHex = SHADES.DARK_RED;
          else if (info.lightness < 55) shadeHex = SHADES.RED;
          else if (info.lightness < 70) shadeHex = SHADES.LIGHT_RED;
          else shadeHex = SHADES.BRIGHT_RED;
          break;
        case "orange":
          if (info.lightness < 25) shadeHex = SHADES.DEEP_ORANGE;
          else if (info.lightness < 35) shadeHex = SHADES.DARK_ORANGE;
          else if (info.lightness < 55) shadeHex = SHADES.ORANGE;
          else if (info.lightness < 70) shadeHex = SHADES.LIGHT_ORANGE;
          else shadeHex = SHADES.BRIGHT_ORANGE;
          break;
        case "yellow":
          if (info.saturation < 50) shadeHex = SHADES.DEEP_YELLOW;
          else if (info.lightness < 45) shadeHex = SHADES.DARK_YELLOW;
          else if (info.lightness < 60) shadeHex = SHADES.YELLOW;
          else if (info.lightness < 75) shadeHex = SHADES.LIGHT_YELLOW;
          else shadeHex = SHADES.BRIGHT_YELLOW;
          break;
        case "green":
          if (info.lightness < 20) shadeHex = SHADES.DEEP_GREEN;
          else if (info.lightness < 32) shadeHex = SHADES.DARK_GREEN;
          else if (info.lightness < 50) shadeHex = SHADES.GREEN;
          else if (info.lightness < 65) shadeHex = SHADES.LIGHT_GREEN;
          else shadeHex = SHADES.BRIGHT_GREEN;
          break;
        case "blue":
          if (info.lightness < 25) shadeHex = SHADES.DEEP_BLUE;
          else if (info.lightness < 35) shadeHex = SHADES.DARK_BLUE;
          else if (info.lightness < 55) shadeHex = SHADES.BLUE;
          else if (info.lightness < 70) shadeHex = SHADES.LIGHT_BLUE;
          else shadeHex = SHADES.BRIGHT_BLUE;
          break;
        case "purple":
          if (info.lightness < 25) shadeHex = SHADES.DEEP_PURPLE;
          else if (info.lightness < 35) shadeHex = SHADES.DARK_PURPLE;
          else if (info.lightness < 55) shadeHex = SHADES.PURPLE;
          else if (info.lightness < 70) shadeHex = SHADES.LIGHT_PURPLE;
          else shadeHex = SHADES.BRIGHT_PURPLE;
          break;
        case "pink":
          if (info.lightness < 25) shadeHex = SHADES.DEEP_PINK;
          else if (info.lightness < 35) shadeHex = SHADES.DARK_PINK;
          else if (info.lightness < 55) shadeHex = SHADES.PINK;
          else if (info.lightness < 70) shadeHex = SHADES.LIGHT_PINK;
          else shadeHex = SHADES.BRIGHT_PINK;
          break;
        default:
          shadeHex = hex; // Keep original if unknown
      }

      mappings.push(`  "${hex}": "${shadeHex}",  // H:${info.hue} S:${info.saturation}% L:${info.lightness}% -> ${info.shade}`);
    }
    mappings.push("");
  }

  // Read current palette file
  const currentPalette = readFileSync(palettePath, "utf-8");
  
  // Find the position to insert new mappings
  const insertMarker = "export const COLOR_NORMALIZATION_MAP: Record<string, string> = {";
  const insertPos = currentPalette.indexOf(insertMarker);
  
  if (insertPos === -1) {
    console.error("Could not find COLOR_NORMALIZATION_MAP in color-palette.ts");
    process.exit(1);
  }

  // Find the closing brace
  let braceCount = 0;
  let startPos = currentPalette.indexOf("{", insertPos);
  let endPos = startPos;
  
  for (let i = startPos; i < currentPalette.length; i++) {
    if (currentPalette[i] === "{") braceCount++;
    if (currentPalette[i] === "}") braceCount--;
    if (braceCount === 0) {
      endPos = i;
      break;
    }
  }

  // Build new content
  const newMapContent = `export const COLOR_NORMALIZATION_MAP: Record<string, string> = {\n${mappings.join("\n")}};`;
  const newContent = currentPalette.slice(0, insertPos) + newMapContent + currentPalette.slice(endPos + 1);

  writeFileSync(palettePath, newContent);
  console.log(`Generated ${mappings.length} mappings`);
  console.log(`Updated ${palettePath}`);
}

main();
