import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const inputPath = path.join(__dirname, "fiji_provinces.geojson");
const outputPath = path.join(
  __dirname,
  "../artifacts/culturally-connect-png/src/data/fiji-map.json",
);

const NAME_TO_ID = {
  Ba: "fji-ba",
  Bua: "fji-bua",
  Cakaudrove: "fji-cakaudrove",
  Kadavu: "fji-kadavu",
  Lau: "fji-lau",
  Lomaiviti: "fji-lomaiviti",
  Macuata: "fji-macuata",
  Nadroga_Navosa: "fji-nadroga-navosa",
  Naitasiri: "fji-naitasiri",
  Namosi: "fji-namosi",
  Ra: "fji-ra",
  Rewa: "fji-rewa",
  Serua: "fji-serua",
  Tailevu: "fji-tailevu",
};

const VIEW_W = 1000;
const VIEW_H = 720;
const PAD = 40;

const raw = JSON.parse(fs.readFileSync(inputPath, "utf8"));
const features = raw.features.filter(
  (feature) => feature.properties.shapeName !== "Rotuma" && NAME_TO_ID[feature.properties.shapeName],
);

function normalizeRing(ring) {
  return ring.map(([lon, lat]) => [lon < 0 ? lon + 360 : lon, lat]);
}

function getRings(geometry) {
  if (geometry.type === "Polygon") return geometry.coordinates;
  if (geometry.type === "MultiPolygon") return geometry.coordinates.flat();
  return [];
}

let minLon = Infinity;
let maxLon = -Infinity;
let minLat = Infinity;
let maxLat = -Infinity;

const normalizedFeatures = features.map((feature) => {
  const rings = getRings(feature.geometry).map(normalizeRing);
  for (const ring of rings) {
    for (const [lon, lat] of ring) {
      if (lon < minLon) minLon = lon;
      if (lon > maxLon) maxLon = lon;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
    }
  }
  return {
    id: NAME_TO_ID[feature.properties.shapeName],
    name: feature.properties.shapeName.replaceAll("_", "-"),
    rings,
  };
});

const scale = Math.min(
  (VIEW_W - PAD * 2) / (maxLon - minLon),
  (VIEW_H - PAD * 2) / (maxLat - minLat),
);
const usedW = (maxLon - minLon) * scale;
const usedH = (maxLat - minLat) * scale;
const offsetX = (VIEW_W - usedW) / 2;
const offsetY = (VIEW_H - usedH) / 2;

function project([lon, lat]) {
  const x = offsetX + (lon - minLon) * scale;
  const y = offsetY + (maxLat - lat) * scale;
  return [Number(x.toFixed(1)), Number(y.toFixed(1))];
}

function ringToPath(ring) {
  if (!ring.length) return "";
  const [sx, sy] = project(ring[0]);
  let d = `M${sx},${sy}`;
  for (let i = 1; i < ring.length; i += 1) {
    const [x, y] = project(ring[i]);
    d += `L${x},${y}`;
  }
  d += "Z";
  return d;
}

const provinces = normalizedFeatures.map((feature) => {
  const d = feature.rings.map(ringToPath).join("");
  let cx = 0;
  let cy = 0;
  let count = 0;
  for (const ring of feature.rings) {
    for (const point of ring) {
      const [x, y] = project(point);
      cx += x;
      cy += y;
      count += 1;
    }
  }
  return {
    id: feature.id,
    name: feature.name,
    d,
    cx: Math.round(cx / Math.max(count, 1)),
    cy: Math.round(cy / Math.max(count, 1)),
  };
});

const output = { width: VIEW_W, height: VIEW_H, provinces };
fs.writeFileSync(outputPath, JSON.stringify(output));
console.log(`Wrote ${provinces.length} Fiji regions -> ${outputPath}`);
