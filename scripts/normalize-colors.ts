import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

// ============================================================
// COLOR NORMALIZATION RULES
// Edit this array to add your own rules
// Format: [inferior, superior]
// The inferior color will be replaced by the superior color
// Duplicates are automatically removed
// ============================================================

const COLOR_RULES: [string, string][] = [
  // Near-black -> Black
  ["#000001", "#000000"],
  ["#FFEC00", "#FFEE00"],
  ["#FCD900", "#FEDF00"],
  ["#843511", "#85340A"],
  ["#F7E214", "#FFE000"],
  ["#007934", "#007A3D"],
  ["#00863D", "#00873F"],
  ["#772600", "#782600"],
  ["#DA0010", "#E10000"],
  ["#FFDF00", "#FEDE00"],
  ["#C7B500", "#C8B100"],
  ["#FFDF00", "#F1BF00"],
  ["#FFDF00", "#EAC102"],
  ["#D90000", "#DA0000"],
  ["#239E3F", "#239F40"],
  ["#FEC74A", "#FFC84B"],
  ["#C40000", "#C60000"],
  ["#C40308", "#C52126"],
  ["#D3AE3B", "#D4AF3A"],
  ["#DE2110", "#FF0000"],
  ["#FF1900", "#FF0000"],
  ["#F31509", "#F41408"],
  ["#202220", "#202020"],
  ["#1E2121", "#202020"],
  ["#6C3F18", "#6C4119"],
  ["#717732", "#78732E"],
  ["#8F4620", "#904720"],
  ["#AB6D29", "#AF7029"],
  ["#B07229", "#AF7029"],
  ["#B27129", "#AF7029"],
  ["#F9C83A", "#FCCA3D"],
  ["#FCCA3E", "#FCCA3D"],
  ["#97C924", "#9ECB34"],
  ["#EF2D29", "#FF0000"],
  ["#FF2A2A", "#FF0000"],
  ["#EF2D28", "#FF0000"],
  ["#C8102E", "#CC142B"],
  ["#EF2D28", "#EF2D29"],
  ["#D80000", "#DB0000"],
  ["#FFDD00", "#FFE100"],
  ["#A8A8A8", "#A9A9A9"],
  ["#DE3108", "#DE3908"],
  ["#FFFDFF", "#FFFFFF"],
  ["#FFCC00", "#FFD200"],

  // ADD MORE RULES BELOW:
  // ["#INFERIOR", "#SUPERIOR"],
];

function main() {
  const flagsPath = join(process.cwd(), "public", "flags.json");
  console.log("Reading flags.json...");
  const flags = JSON.parse(readFileSync(flagsPath, "utf-8"));

  console.log(`Loaded ${COLOR_RULES.length} rules\n`);

  // Build lookup map (uppercase for matching)
  const ruleMap = new Map<string, string>();
  for (const [inferior, superior] of COLOR_RULES) {
    ruleMap.set(inferior.toUpperCase(), superior.toUpperCase());
  }

  let totalReplacements = 0;
  let flagsModified = 0;

  for (const flag of flags) {
    const originalColors = [...flag.colors];
    const newColors: string[] = [];

    for (const color of flag.colors) {
      const upperColor = color.toUpperCase();
      const superior = ruleMap.get(upperColor);

      if (superior) {
        totalReplacements++;
        if (!newColors.includes(superior)) {
          newColors.push(superior);
        }
      } else {
        if (!newColors.includes(upperColor)) {
          newColors.push(upperColor);
        }
      }
    }

    if (JSON.stringify(originalColors.sort()) !== JSON.stringify(newColors.sort())) {
      flagsModified++;
      console.log(`${flag.code}: ${originalColors.join(", ")} -> ${newColors.join(", ")}`);
    }

    flag.colors = newColors;
  }

  console.log("\n" + "=".repeat(50));
  console.log(`Replacements: ${totalReplacements}`);
  console.log(`Flags modified: ${flagsModified}`);
  console.log("=".repeat(50));

  writeFileSync(flagsPath, JSON.stringify(flags, null, 2));
  console.log(`\nSaved to: ${flagsPath}`);
}

main();
