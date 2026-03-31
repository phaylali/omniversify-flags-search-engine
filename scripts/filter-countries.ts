import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

// Official 197 UN member states + observers (195 UN members + Vatican City + Palestine)
const COUNTRY_CODES: Record<string, string> = {
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
  cv: "Cabo Verde",
  kh: "Cambodia",
  cm: "Cameroon",
  ca: "Canada",
  cf: "Central African Republic",
  td: "Chad",
  cl: "Chile",
  cn: "China",
  co: "Colombia",
  km: "Comoros",
  cg: "Congo",
  cd: "Democratic Republic of the Congo",
  cr: "Costa Rica",
  ci: "Ivory Coast",
  hr: "Croatia",
  cu: "Cuba",
  cy: "Cyprus",
  cz: "Czechia",
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
  it: "Italy",
  jm: "Jamaica",
  jp: "Japan",
  jo: "Jordan",
  kz: "Kazakhstan",
  ke: "Kenya",
  ki: "Kiribati",
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
  to: "Tonga",
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
  // Palestine is an observer state
  ps: "Palestine",
};

function main() {
  const extractedPath = join(process.cwd(), "scripts", "extracted-flag-colors.json");
  
  console.log("Reading extracted colors...");
  const allFlags = JSON.parse(readFileSync(extractedPath, "utf-8"));
  
  console.log(`Total flags in extraction: ${allFlags.length}`);
  console.log(`Official countries: ${Object.keys(COUNTRY_CODES).length}`);
  
  // Filter to only include official countries
  const countryFlags = allFlags.filter((flag: any) => COUNTRY_CODES[flag.code]);
  
  // Update names with official names
  const updatedFlags = countryFlags.map((flag: any) => ({
    ...flag,
    name: COUNTRY_CODES[flag.code] || flag.name,
  }));
  
  // Find missing countries
  const foundCodes = new Set(countryFlags.map((f: any) => f.code));
  const missingCodes = Object.keys(COUNTRY_CODES).filter(code => !foundCodes.has(code));
  
  console.log(`\nCountry flags found: ${updatedFlags.length}`);
  console.log(`Missing countries: ${missingCodes.length}`);
  
  if (missingCodes.length > 0) {
    console.log("\nMissing country codes:");
    missingCodes.forEach(code => {
      console.log(`  - ${code}: ${COUNTRY_CODES[code]}`);
    });
  }
  
  // Save filtered results
  const countriesPath = join(process.cwd(), "scripts", "country-flag-colors.json");
  writeFileSync(countriesPath, JSON.stringify(updatedFlags, null, 2));
  console.log(`\nCountry flags saved to: ${countriesPath}`);
  
  // Generate updated flags.json with extracted colors
  const existingPath = join(process.cwd(), "public", "flags.json");
  let existingFlags: any[] = [];
  try {
    existingFlags = JSON.parse(readFileSync(existingPath, "utf-8"));
  } catch {
    console.log("\nNo existing flags.json found");
  }
  
  const existingMap = new Map(existingFlags.map((f: any) => [f.code, f]));
  
  const finalFlags = updatedFlags.map((flag: any) => {
    const existing = existingMap.get(flag.code);
    return {
      name: flag.name,
      code: flag.code,
      colors: flag.colors.slice(0, 6), // Limit to 6 main colors
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
  
  const finalPath = join(process.cwd(), "scripts", "final-flags.json");
  writeFileSync(finalPath, JSON.stringify(finalFlags, null, 2));
  console.log(`Final flags.json saved to: ${finalPath}`);
  
  console.log(`\nTo apply: cp scripts/final-flags.json public/flags.json`);
}

main();
