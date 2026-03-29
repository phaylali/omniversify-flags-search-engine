import { union, featureCollection } from "@turf/turf";
import * as fs from "fs";

const geoUrl =
  "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson";

async function main() {
  console.log("Fetching Natural Earth GeoJSON...");
  const res = await fetch(geoUrl);
  const geoData = await res.json();

  const others: any[] = [];
  let morocco: any = null;
  let westernSahara: any = null;
  let palestine: any = null;
  let israel: any = null;

  for (const f of geoData.features) {
    const name = f.properties.ADMIN;
    if (name === "Morocco") morocco = f;
    else if (name === "Western Sahara") westernSahara = f;
    else if (name === "Palestine") palestine = f;
    else if (name === "Israel") israel = f;
    else others.push(f);
  }

  // Merge Morocco + Western Sahara using turf union
  if (morocco && westernSahara) {
    console.log("Merging Morocco + Western Sahara...");
    try {
      const fc = featureCollection([morocco, westernSahara]);
      const merged = union(fc);
      if (merged) {
        merged.properties = { ADMIN: "Morocco", NAME: "Morocco", ISO_A2: "MA" };
        others.push(merged);
        console.log("  Done!");
      } else {
        console.log("  Union returned null");
        others.push(morocco);
      }
    } catch (e: any) {
      console.log("  Union error:", e.message);
      others.push(morocco);
    }
  }

  // Merge Palestine + Israel using turf union
  if (palestine && israel) {
    console.log("Merging Palestine + Israel...");
    try {
      const fc = featureCollection([palestine, israel]);
      const merged = union(fc);
      if (merged) {
        merged.properties = { ADMIN: "Palestine", NAME: "Palestine", ISO_A2: "PS" };
        others.push(merged);
        console.log("  Done!");
      } else {
        console.log("  Union returned null");
        others.push(palestine);
      }
    } catch (e: any) {
      console.log("  Union error:", e.message);
      others.push(palestine);
    }
  }

  const output = {
    type: "FeatureCollection",
    features: others,
  };

  fs.writeFileSync("public/world.geojson", JSON.stringify(output));
  console.log(`Saved to public/world.geojson with ${output.features.length} countries`);
}

main().catch(console.error);
