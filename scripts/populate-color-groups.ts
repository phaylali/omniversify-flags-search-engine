import { readFileSync, writeFileSync } from "fs";

// Standard color groups with their hex values
const colorGroups: Record<string, string> = {
  red: "#CE1126",
  blue: "#003DA5",
  green: "#009E49",
  yellow: "#FCD116",
  orange: "#FF8C00",
  white: "#FFFFFF",
  black: "#000000",
};

// Parse hex color to RGB
function hexToRgb(hex: string): [number, number, number] {
  const cleanHex = hex.replace("#", "");
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return [r, g, b];
}

// Calculate color distance (Euclidean in RGB space)
function colorDistance(hex1: string, hex2: string): number {
  const [r1, g1, b1] = hexToRgb(hex1);
  const [r2, g2, b2] = hexToRgb(hex2);
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
}

// Check if a color matches a group (within threshold)
function colorMatchesGroup(flagColor: string, groupColor: string, threshold: number = 70): boolean {
  return colorDistance(flagColor, groupColor) < threshold;
}

// Find which color groups a flag belongs to
function getColorGroups(flagColors: string[]): Record<string, boolean> {
  const groups: Record<string, boolean> = {
    red: false,
    blue: false,
    green: false,
    yellow: false,
    orange: false,
    white: false,
    black: false,
  };

  for (const flagColor of flagColors) {
    for (const [groupName, groupColor] of Object.entries(colorGroups)) {
      if (colorMatchesGroup(flagColor, groupColor)) {
        groups[groupName] = true;
      }
    }
  }

  return groups;
}

// Main function
function main() {
  console.log("Reading flags.json...");
  const flagsData = JSON.parse(readFileSync("public/flags.json", "utf-8"));

  console.log(`Processing ${flagsData.length} flags...`);

  let updatedCount = 0;
  for (const flag of flagsData) {
    const oldGroups = { ...flag.colorGroups };
    flag.colorGroups = getColorGroups(flag.colors);

    // Check if any groups changed
    const changed = Object.keys(flag.colorGroups).some(
      (key) => flag.colorGroups[key] !== oldGroups[key]
    );
    if (changed) updatedCount++;
  }

  console.log(`Updated ${updatedCount} flags with color groups`);

  // Write back
  writeFileSync("public/flags.json", JSON.stringify(flagsData, null, 2));
  console.log("Done! flags.json updated.");

  // Print summary
  const summary: Record<string, number> = {};
  for (const group of Object.keys(colorGroups)) {
    summary[group] = flagsData.filter((f: any) => f.colorGroups[group]).length;
  }
  console.log("\nColor group distribution:");
  for (const [group, count] of Object.entries(summary)) {
    console.log(`  ${group}: ${count} flags`);
  }
}

main();
