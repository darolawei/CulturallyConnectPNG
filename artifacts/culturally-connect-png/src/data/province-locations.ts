export interface ProvincePlace {
  name: string;
  district: string;
  lat: number;
  lng: number;
  type: "district" | "village" | "town" | "island";
}

export interface ProvinceMapLocation {
  center: { lat: number; lng: number };
  zoom: number;
  places: ProvincePlace[];
}

export const PROVINCE_MAP_LOCATIONS: Record<string, ProvinceMapLocation> = {
  central: {
    center: { lat: -9.38, lng: 147.58 },
    zoom: 8,
    places: [
      { name: "Sogeri", district: "Hiri-Koiari", lat: -9.43, lng: 147.42, type: "town" },
      { name: "Kwikila", district: "Rigo", lat: -9.82, lng: 147.66, type: "town" },
      { name: "Bereina", district: "Kairuku", lat: -8.64, lng: 146.51, type: "town" },
      { name: "Tapini", district: "Goilala", lat: -8.36, lng: 146.99, type: "town" },
      { name: "Kupiano", district: "Abau", lat: -10.08, lng: 148.22, type: "town" },
    ],
  },
  chimbu: {
    center: { lat: -6.12, lng: 145.05 },
    zoom: 9,
    places: [
      { name: "Kundiawa", district: "Kundiawa-Gembogl", lat: -6.02, lng: 144.97, type: "town" },
      { name: "Gembogl", district: "Kundiawa-Gembogl", lat: -5.83, lng: 145.06, type: "town" },
      { name: "Kerowagi", district: "Kerowagi", lat: -5.98, lng: 144.79, type: "town" },
      { name: "Chuave", district: "Chuave", lat: -6.13, lng: 145.10, type: "town" },
    ],
  },
  "eastern-highlands": {
    center: { lat: -6.28, lng: 145.78 },
    zoom: 8,
    places: [
      { name: "Goroka", district: "Goroka", lat: -6.08, lng: 145.39, type: "town" },
      { name: "Kainantu", district: "Kainantu", lat: -6.29, lng: 145.87, type: "town" },
      { name: "Lufa", district: "Lufa", lat: -6.45, lng: 145.28, type: "town" },
      { name: "Okapa", district: "Okapa", lat: -6.52, lng: 145.62, type: "town" },
    ],
  },
  "east-new-britain": {
    center: { lat: -4.45, lng: 152.10 },
    zoom: 8,
    places: [
      { name: "Kokopo", district: "Kokopo", lat: -4.35, lng: 152.26, type: "town" },
      { name: "Rabaul", district: "Rabaul", lat: -4.20, lng: 152.17, type: "town" },
      { name: "Kerevat", district: "Gazelle", lat: -4.34, lng: 152.02, type: "town" },
      { name: "Palmalmal", district: "Pomio", lat: -5.62, lng: 151.49, type: "town" },
    ],
  },
  "east-sepik": {
    center: { lat: -4.20, lng: 143.80 },
    zoom: 7,
    places: [
      { name: "Wewak", district: "Wewak", lat: -3.55, lng: 143.63, type: "town" },
      { name: "Maprik", district: "Maprik", lat: -3.64, lng: 143.06, type: "town" },
      { name: "Angoram", district: "Angoram", lat: -4.06, lng: 144.07, type: "town" },
      { name: "Ambunti", district: "Ambunti-Dreikikir", lat: -4.23, lng: 142.82, type: "town" },
    ],
  },
  enga: {
    center: { lat: -5.55, lng: 143.55 },
    zoom: 8,
    places: [
      { name: "Wabag", district: "Wabag", lat: -5.49, lng: 143.72, type: "town" },
      { name: "Wapenamanda", district: "Wapenamanda", lat: -5.65, lng: 143.89, type: "town" },
      { name: "Laiagam", district: "Lagaip", lat: -5.33, lng: 143.38, type: "town" },
      { name: "Porgera", district: "Porgera-Paiela", lat: -5.46, lng: 143.15, type: "town" },
    ],
  },
  gulf: {
    center: { lat: -7.78, lng: 145.70 },
    zoom: 7,
    places: [
      { name: "Kerema", district: "Kerema", lat: -7.96, lng: 145.78, type: "town" },
      { name: "Kikori", district: "Kikori", lat: -7.42, lng: 144.25, type: "town" },
      { name: "Baimuru", district: "Kikori", lat: -7.54, lng: 144.82, type: "town" },
      { name: "Ihu", district: "Kikori", lat: -7.90, lng: 145.39, type: "town" },
    ],
  },
  hela: {
    center: { lat: -5.92, lng: 142.95 },
    zoom: 8,
    places: [
      { name: "Tari", district: "Tari-Pori", lat: -5.85, lng: 142.95, type: "town" },
      { name: "Komo", district: "Komo-Hulia", lat: -6.06, lng: 142.86, type: "town" },
      { name: "Koroba", district: "Koroba-Lake Kopiago", lat: -5.70, lng: 142.74, type: "town" },
      { name: "Magarima", district: "Komo-Magarima", lat: -6.15, lng: 143.01, type: "town" },
    ],
  },
  jiwaka: {
    center: { lat: -5.78, lng: 144.62 },
    zoom: 9,
    places: [
      { name: "Banz", district: "North Waghi", lat: -5.78, lng: 144.62, type: "town" },
      { name: "Minj", district: "South Waghi", lat: -5.91, lng: 144.68, type: "town" },
      { name: "Kudjip", district: "Anglimp-South Waghi", lat: -5.85, lng: 144.70, type: "town" },
      { name: "Nondugl", district: "Jimi", lat: -5.68, lng: 144.55, type: "town" },
    ],
  },
  madang: {
    center: { lat: -5.10, lng: 145.70 },
    zoom: 7,
    places: [
      { name: "Madang", district: "Madang", lat: -5.22, lng: 145.79, type: "town" },
      { name: "Bogia", district: "Bogia", lat: -4.33, lng: 144.96, type: "town" },
      { name: "Ramu", district: "Middle Ramu", lat: -5.86, lng: 144.73, type: "town" },
      { name: "Rai Coast", district: "Rai Coast", lat: -5.75, lng: 146.46, type: "town" },
    ],
  },
  manus: {
    center: { lat: -2.05, lng: 147.05 },
    zoom: 9,
    places: [
      { name: "Lorengau", district: "Manus", lat: -2.03, lng: 147.27, type: "town" },
      { name: "Lombrum", district: "Manus", lat: -2.04, lng: 147.37, type: "town" },
      { name: "Baluan Island", district: "Manus", lat: -2.56, lng: 147.29, type: "island" },
      { name: "Mokoreng", district: "Manus", lat: -1.98, lng: 146.92, type: "village" },
    ],
  },
  "milne-bay": {
    center: { lat: -10.35, lng: 150.45 },
    zoom: 7,
    places: [
      { name: "Alotau", district: "Alotau", lat: -10.31, lng: 150.46, type: "town" },
      { name: "Samarai", district: "Samarai-Murua", lat: -10.61, lng: 150.66, type: "island" },
      { name: "Esa'ala", district: "Esa'ala", lat: -9.73, lng: 150.80, type: "town" },
      { name: "Losuia", district: "Kiriwina-Goodenough", lat: -8.52, lng: 151.08, type: "town" },
    ],
  },
  morobe: {
    center: { lat: -6.55, lng: 146.95 },
    zoom: 7,
    places: [
      { name: "Lae", district: "Lae", lat: -6.72, lng: 146.99, type: "town" },
      { name: "Finschhafen", district: "Finschhafen", lat: -6.60, lng: 147.85, type: "town" },
      { name: "Bulolo", district: "Bulolo", lat: -7.20, lng: 146.65, type: "town" },
      { name: "Wau", district: "Wau-Waria", lat: -7.34, lng: 146.72, type: "town" },
      { name: "Kabwum", district: "Kabwum", lat: -6.09, lng: 147.00, type: "town" },
    ],
  },
  "national-capital": {
    center: { lat: -9.44, lng: 147.18 },
    zoom: 11,
    places: [
      { name: "Port Moresby", district: "National Capital District", lat: -9.44, lng: 147.18, type: "town" },
      { name: "Hohola", district: "Moresby North-West", lat: -9.43, lng: 147.16, type: "town" },
      { name: "Boroko", district: "Moresby South", lat: -9.47, lng: 147.20, type: "town" },
      { name: "Gerehu", district: "Moresby North-East", lat: -9.39, lng: 147.16, type: "town" },
    ],
  },
  "new-ireland": {
    center: { lat: -3.35, lng: 151.55 },
    zoom: 7,
    places: [
      { name: "Kavieng", district: "Kavieng", lat: -2.57, lng: 150.80, type: "town" },
      { name: "Namatanai", district: "Namatanai", lat: -3.67, lng: 152.43, type: "town" },
      { name: "Konos", district: "Namatanai", lat: -3.04, lng: 151.73, type: "town" },
      { name: "Mussau Island", district: "Kavieng", lat: -1.45, lng: 149.62, type: "island" },
    ],
  },
  "north-solomons": {
    center: { lat: -6.15, lng: 155.35 },
    zoom: 7,
    places: [
      { name: "Buka", district: "North Bougainville", lat: -5.43, lng: 154.67, type: "town" },
      { name: "Arawa", district: "Central Bougainville", lat: -6.23, lng: 155.57, type: "town" },
      { name: "Buin", district: "South Bougainville", lat: -6.75, lng: 155.69, type: "town" },
      { name: "Panguna", district: "Central Bougainville", lat: -6.32, lng: 155.49, type: "town" },
    ],
  },
  oro: {
    center: { lat: -8.75, lng: 148.25 },
    zoom: 8,
    places: [
      { name: "Popondetta", district: "Ijivitari", lat: -8.77, lng: 148.24, type: "town" },
      { name: "Kokoda", district: "Sohe", lat: -8.88, lng: 147.74, type: "town" },
      { name: "Tufi", district: "Ijivitari", lat: -9.08, lng: 149.32, type: "town" },
      { name: "Afore", district: "Sohe", lat: -9.05, lng: 148.39, type: "town" },
    ],
  },
  sandaun: {
    center: { lat: -3.65, lng: 141.65 },
    zoom: 7,
    places: [
      { name: "Vanimo", district: "Vanimo-Green River", lat: -2.68, lng: 141.30, type: "town" },
      { name: "Aitape", district: "Aitape-Lumi", lat: -3.14, lng: 142.35, type: "town" },
      { name: "Nuku", district: "Nuku", lat: -3.66, lng: 142.47, type: "town" },
      { name: "Telefomin", district: "Telefomin", lat: -5.13, lng: 141.62, type: "town" },
    ],
  },
  "southern-highlands": {
    center: { lat: -6.18, lng: 143.55 },
    zoom: 8,
    places: [
      { name: "Mendi", district: "Mendi-Munihu", lat: -6.15, lng: 143.66, type: "town" },
      { name: "Ialibu", district: "Ialibu-Pangia", lat: -6.28, lng: 143.99, type: "town" },
      { name: "Nipa", district: "Nipa-Kutubu", lat: -6.14, lng: 143.45, type: "town" },
      { name: "Kagua", district: "Kagua-Erave", lat: -6.27, lng: 143.85, type: "town" },
    ],
  },
  "west-new-britain": {
    center: { lat: -5.85, lng: 150.25 },
    zoom: 8,
    places: [
      { name: "Kimbe", district: "Talasea", lat: -5.55, lng: 150.14, type: "town" },
      { name: "Bialla", district: "Talasea", lat: -5.32, lng: 151.00, type: "town" },
      { name: "Kandrian", district: "Kandrian-Gloucester", lat: -6.21, lng: 149.55, type: "town" },
      { name: "Gloucester", district: "Kandrian-Gloucester", lat: -5.46, lng: 148.42, type: "town" },
    ],
  },
  western: {
    center: { lat: -7.30, lng: 141.55 },
    zoom: 6,
    places: [
      { name: "Daru", district: "South Fly", lat: -9.08, lng: 143.21, type: "town" },
      { name: "Kiunga", district: "North Fly", lat: -6.12, lng: 141.30, type: "town" },
      { name: "Tabubil", district: "North Fly", lat: -5.28, lng: 141.23, type: "town" },
      { name: "Balimo", district: "Middle Fly", lat: -8.05, lng: 142.93, type: "town" },
    ],
  },
  "western-highlands": {
    center: { lat: -5.88, lng: 144.30 },
    zoom: 9,
    places: [
      { name: "Mount Hagen", district: "Hagen", lat: -5.86, lng: 144.23, type: "town" },
      { name: "Tambul", district: "Tambul-Nebilyer", lat: -5.97, lng: 144.14, type: "town" },
      { name: "Baiyer", district: "Baiyer-Mul", lat: -5.53, lng: 144.15, type: "town" },
      { name: "Kagamuga", district: "Hagen", lat: -5.82, lng: 144.30, type: "town" },
    ],
  },
};

export function getProvinceMapLocation(provinceId: string): ProvinceMapLocation | undefined {
  return PROVINCE_MAP_LOCATIONS[provinceId];
}
