import { CoastRegion, LandingSite, MarinePark, RegionId } from './models';

/** Default satellite lag — GIBS near-real-time layers are usually 1–2 days behind. */
export function defaultOverlayDate(): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - 2);
  return date.toISOString().slice(0, 10);
}

export const REGIONS: CoastRegion[] = [
  {
    id: 'mombasa',
    label: 'Mombasa',
    swahili: 'Mombasa',
    summary: 'Tudor Creek to Mtwapa, including the marine park reef.',
    center: { lat: -4.05, lon: 39.7 },
    zoom: 11,
    bounds: [
      [-4.18, 39.55],
      [-3.92, 39.82],
    ],
  },
  {
    id: 'north',
    label: 'North coast',
    swahili: 'Pwani kaskazini',
    summary: 'Kilifi, Watamu, Malindi and Lamu.',
    center: { lat: -3.05, lon: 40.35 },
    zoom: 8,
    bounds: [
      [-3.92, 39.7],
      [-1.95, 41.35],
    ],
  },
  {
    id: 'south',
    label: 'South coast',
    swahili: 'Pwani kusini',
    summary: 'Likoni through Diani, Shimoni and Vanga.',
    center: { lat: -4.42, lon: 39.48 },
    zoom: 10,
    bounds: [
      [-4.78, 39.12],
      [-4.08, 39.72],
    ],
  },
  {
    id: 'coast',
    label: 'Kenya coast',
    swahili: 'Pwani yote',
    summary: 'Somali border to the Tanzanian border.',
    center: { lat: -3.4, lon: 40.15 },
    zoom: 7,
    bounds: [
      [-4.85, 39.0],
      [-1.65, 41.9],
    ],
  },
];

export const LANDING_SITES: LandingSite[] = [
  {
    id: 'old-port',
    name: 'Old Port',
    county: 'Mombasa',
    region: 'mombasa',
    lat: -4.0617,
    lon: 39.6794,
    note: 'Tudor Creek. Mixed artisanal landing near the old harbour.',
  },
  {
    id: 'mkomani',
    name: 'Mkomani',
    county: 'Mombasa',
    region: 'mombasa',
    lat: -4.043,
    lon: 39.668,
    note: 'Nyali side of the creek. Busy urban landing.',
  },
  {
    id: 'nyali',
    name: 'Nyali',
    county: 'Mombasa',
    region: 'mombasa',
    lat: -4.049,
    lon: 39.706,
    note: 'Adjacent to the marine reserve reef.',
  },
  {
    id: 'bamburi',
    name: 'Bamburi',
    county: 'Mombasa',
    region: 'mombasa',
    lat: -4.001,
    lon: 39.732,
    note: 'North of the marine park. Reef and nearshore gears.',
  },
  {
    id: 'mtwapa',
    name: 'Mtwapa',
    county: 'Kilifi',
    region: 'mombasa',
    lat: -3.95,
    lon: 39.745,
    note: 'Creek landing just north of Mombasa county.',
  },
  {
    id: 'likoni',
    name: 'Likoni',
    county: 'Mombasa',
    region: 'south',
    lat: -4.09,
    lon: 39.661,
    note: 'South mainland ferry side. Small-boat traffic.',
  },
  {
    id: 'diani',
    name: 'Diani / Ukunda',
    county: 'Kwale',
    region: 'south',
    lat: -4.28,
    lon: 39.587,
    note: 'Open reef coast. Sport and artisanal mix.',
  },
  {
    id: 'gazi',
    name: 'Gazi',
    county: 'Kwale',
    region: 'south',
    lat: -4.424,
    lon: 39.505,
    note: 'Mangrove bay. Important BMU landing.',
  },
  {
    id: 'msambweni',
    name: 'Msambweni',
    county: 'Kwale',
    region: 'south',
    lat: -4.472,
    lon: 39.482,
    note: 'South coast lagoon and reef fishery.',
  },
  {
    id: 'shimoni',
    name: 'Shimoni',
    county: 'Kwale',
    region: 'south',
    lat: -4.647,
    lon: 39.381,
    note: 'Gate to Kisite-Mpunguti. Wasini Channel.',
    watch: 'dolphins',
  },
  {
    id: 'vanga',
    name: 'Vanga',
    county: 'Kwale',
    region: 'south',
    lat: -4.663,
    lon: 39.218,
    note: 'Border landing. Mangrove creeks and open sea.',
  },
  {
    id: 'kilifi',
    name: 'Kilifi',
    county: 'Kilifi',
    region: 'north',
    lat: -3.633,
    lon: 39.85,
    note: 'Creek and offshore. County headquarters landing.',
  },
  {
    id: 'watamu',
    name: 'Watamu',
    county: 'Kilifi',
    region: 'north',
    lat: -3.354,
    lon: 40.021,
    note: 'Next to Watamu Marine Park. Reef restrictions apply.',
    watch: 'dolphins',
  },
  {
    id: 'malindi',
    name: 'Malindi',
    county: 'Kilifi',
    region: 'north',
    lat: -3.219,
    lon: 40.127,
    note: 'Historic landing. Sabaki estuary influence.',
  },
  {
    id: 'ngomeni',
    name: 'Ngomeni',
    county: 'Kilifi',
    region: 'north',
    lat: -3.0,
    lon: 40.2,
    note: 'Open coast north of Malindi.',
  },
  {
    id: 'kipini',
    name: 'Kipini',
    county: 'Tana River',
    region: 'north',
    lat: -2.527,
    lon: 40.526,
    note: 'Tana Delta mouth. Seasonal river plume.',
  },
  {
    id: 'lamu',
    name: 'Lamu',
    county: 'Lamu',
    region: 'north',
    lat: -2.272,
    lon: 40.902,
    note: 'Island town landing. Dhow fishery.',
  },
];

export const MARINE_PARKS: MarinePark[] = [
  {
    id: 'mombasa-mnp',
    name: 'Mombasa Marine National Park & Reserve',
    kind: 'park',
    polygon: [
      [-4.072, 39.688],
      [-4.078, 39.768],
      [-3.992, 39.778],
      [-3.985, 39.708],
    ],
  },
  {
    id: 'watamu-mnp',
    name: 'Watamu Marine National Park',
    kind: 'park',
    polygon: [
      [-3.392, 39.98],
      [-3.392, 40.06],
      [-3.325, 40.06],
      [-3.325, 39.99],
    ],
  },
  {
    id: 'malindi-mnp',
    name: 'Malindi Marine National Park',
    kind: 'park',
    polygon: [
      [-3.28, 40.1],
      [-3.28, 40.18],
      [-3.22, 40.18],
      [-3.22, 40.11],
    ],
  },
  {
    id: 'kisite',
    name: 'Kisite-Mpunguti Marine Park',
    kind: 'park',
    polygon: [
      [-4.74, 39.34],
      [-4.74, 39.425],
      [-4.68, 39.425],
      [-4.68, 39.34],
    ],
  },
];

export const MOMBASA_POINT = LANDING_SITES[0];

export function regionById(id: RegionId): CoastRegion {
  return REGIONS.find((region) => region.id === id) ?? REGIONS[0];
}

export function siteById(id: string): LandingSite | undefined {
  return LANDING_SITES.find((site) => site.id === id);
}

export function sitesForRegion(id: RegionId): LandingSite[] {
  if (id === 'coast') {
    return LANDING_SITES;
  }
  if (id === 'mombasa') {
    return LANDING_SITES.filter((site) => site.region === 'mombasa');
  }
  return LANDING_SITES.filter((site) => site.region === id);
}

export function nearestSite(lat: number, lon: number): LandingSite {
  return LANDING_SITES.reduce((best, site) => {
    const bestDist = haversineKm(lat, lon, best.lat, best.lon);
    const nextDist = haversineKm(lat, lon, site.lat, site.lon);
    return nextDist < bestDist ? site : best;
  });
}

export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function compassFromDeg(deg: number | null): string {
  if (deg === null || Number.isNaN(deg)) {
    return '—';
  }
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(((deg % 360) + 360) % 360 / 45) % 8];
}

export function formatCoord(lat: number, lon: number): string {
  const ns = lat <= 0 ? 'S' : 'N';
  const ew = lon >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(3)}°${ns}  ${Math.abs(lon).toFixed(3)}°${ew}`;
}
