export const GIBS_URL =
  'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/{layer}/default/{time}/{tileMatrixSet}/{z}/{y}/{x}.png';

export const OSM_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

export const ESRI_IMAGERY_URL =
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

export const GIBS_BOUNDS: [[number, number], [number, number]] = [
  [-85.0511287776, -180],
  [85.0511287776, 180],
];

export const MAP_MAX_BOUNDS: [[number, number], [number, number]] = [
  [-6.2, 37.8],
  [-0.8, 43.2],
];

export interface GibsLayerSpec {
  layer: string;
  attribution: string;
  opacity: number;
}

export const GIBS_LAYERS = {
  sst: {
    layer: 'GHRSST_L4_MUR_Sea_Surface_Temperature',
    attribution: 'NASA GIBS / GHRSST',
    opacity: 0.55,
  },
  chlorophyll: {
    layer: 'MODIS_Aqua_Chlorophyll_A',
    attribution: 'NASA GIBS / MODIS',
    opacity: 0.62,
  },
} as const satisfies Record<string, GibsLayerSpec>;

export function gibsTileOptions(spec: GibsLayerSpec, time: string): Record<string, unknown> {
  return {
    layer: spec.layer,
    tileMatrixSet: 'GoogleMapsCompatible_Level7',
    time,
    opacity: spec.opacity,
    maxNativeZoom: 7,
    maxZoom: 14,
    tileSize: 256,
    noWrap: true,
    bounds: GIBS_BOUNDS,
    attribution: spec.attribution,
  };
}
