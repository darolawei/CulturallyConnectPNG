// One-off script: converts geoBoundaries PNG ADM1 GeoJSON into a compact
// JSON file of SVG paths suitable for embedding in the React map component.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { geoMercator, geoPath } from "d3-geo";
import { simplify, rewind } from "@turf/turf";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const inputPath = path.join(__dirname, "png_provinces.geojson");
const outputPath = path.join(
  __dirname,
  "../artifacts/culturally-connect-png/src/data/png-map.json",
);

// Map geoBoundaries shapeName → DB province id used in our app
const NAME_TO_ID = {
  "Central Province": "central",
  "Chimbu (Simbu) Province": "chimbu",
  "Eastern Highlands Province": "eastern-highlands",
  "East New Britain Province": "east-new-britain",
  "East Sepik Province": "east-sepik",
  "Enga Province": "enga",
  "Gulf Province": "gulf",
  "Hela Province": "hela",
  "Madang Province": "madang",
  "Manus Province": "manus",
  "Milne Bay Province": "milne-bay",
  "Morobe Province": "morobe",
  "National Capital District": "national-capital",
  "New Ireland Province": "new-ireland",
  "Northern (Oro) Province": "oro",
  "Autonomous Region of Bougainville": "north-solomons",
  "Southern Highlands Province": "southern-highlands",
  "West New Britain Province": "west-new-britain",
  "West Sepik (Sandaun) Province": "sandaun",
  "Western Province": "western",
  "Western Highlands Province": "western-highlands",
  "Jiwaka Province": "jiwaka",
};

const raw = JSON.parse(fs.readFileSync(inputPath, "utf8"));

// Rewind ring winding order so d3-geo's spherical interpretation is correct
// (geoBoundaries data has clockwise outer rings; d3-geo expects counter-clockwise).
console.log("Rewinding rings…");
const rewound = rewind(raw, { reverse: true });

// Simplify polygons after rewinding
console.log("Simplifying GeoJSON…");
const simplified = rewind(
  simplify(rewound, { tolerance: 0.01, highQuality: false }),
  { reverse: true },
);

// Set up Mercator projection fitted to our viewBox
const VIEW_W = 1000;
const VIEW_H = 720;
const projection = geoMercator().fitSize([VIEW_W, VIEW_H], simplified);
// Use a custom context to round coordinates to 1 decimal place
function makePathGen() {
  return geoPath(projection).pointRadius(0).digits(1);
}
const pathGen = makePathGen();

const provinces = simplified.features
  .map((feature) => {
    const name = feature.properties.shapeName;
    const id = NAME_TO_ID[name];
    if (!id) {
      console.warn(`[skip] No ID mapping for "${name}"`);
      return null;
    }
    const d = pathGen(feature);
    if (!d) {
      console.warn(`[skip] No path for "${name}"`);
      return null;
    }
    // Compute centroid (label position)
    const [cx, cy] = pathGen.centroid(feature);
    return {
      id,
      name: name.replace(/ Province$/, ""),
      d,
      cx: Math.round(cx),
      cy: Math.round(cy),
    };
  })
  .filter(Boolean);

const output = { width: VIEW_W, height: VIEW_H, provinces };
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(output));

const sizeKb = (fs.statSync(outputPath).size / 1024).toFixed(1);
console.log(`Wrote ${provinces.length} provinces → ${outputPath} (${sizeKb} KB)`);
