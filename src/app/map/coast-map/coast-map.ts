import {
  afterNextRender,
  Component,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import * as L from 'leaflet';
import { CoastBoard } from '../../core/coast-board';
import { CoastState } from '../../core/coast-state';
import { MARINE_PARKS } from '../../core/kenya-coast';
import {
  ESRI_IMAGERY_URL,
  GIBS_LAYERS,
  GIBS_URL,
  gibsTileOptions,
  MAP_MAX_BOUNDS,
  OSM_URL,
} from '../../core/map-layers';
import { AdvisoryTone } from '../../core/models';

@Component({
  imports: [],
  selector: 'bahari-coast-map',
  styleUrl: './coast-map.css',
  templateUrl: './coast-map.html',
})
export class CoastMap {
  private readonly host = viewChild.required<ElementRef<HTMLDivElement>>('mapHost');
  private readonly state = inject(CoastState);
  private readonly board = inject(CoastBoard);
  private readonly destroyRef = inject(DestroyRef);
  private map?: L.Map;
  private readonly mapReady = signal(false);
  private baseLayer?: L.LayerGroup;
  private chlorophyllLayer?: L.TileLayer;
  private sstLayer?: L.TileLayer;
  private parksLayer?: L.LayerGroup;
  private sitesLayer?: L.LayerGroup;
  private selectedMarker?: L.CircleMarker;
  private createdAt = 0;

  constructor() {
    afterNextRender(() => this.createMap());

    effect(() => {
      this.state.region();
      if (this.mapReady()) {
        this.fitToRegion();
      }
    });

    effect(() => {
      this.state.baseMap();
      if (this.mapReady()) {
        this.syncBase();
      }
    });

    effect(() => {
      this.state.chlorophyll();
      this.state.sst();
      this.state.overlayDate();
      if (this.mapReady()) {
        this.syncOverlays();
      }
    });

    effect(() => {
      this.state.parks();
      if (this.mapReady()) {
        this.syncParks();
      }
    });

    effect(() => {
      this.board.rows();
      this.state.landings();
      this.state.model();
      if (this.mapReady()) {
        this.syncSites();
      }
    });

    effect(() => {
      this.state.selected();
      if (this.mapReady()) {
        this.syncSelected();
      }
    });
  }

  private createMap(): void {
    this.map = L.map(this.host().nativeElement, {
      zoomControl: false,
      attributionControl: true,
      minZoom: 6,
      maxZoom: 14,
      maxBounds: MAP_MAX_BOUNDS,
    });
    L.control.zoom({ position: 'bottomright' }).addTo(this.map);
    this.map.on('click', (event: L.LeafletMouseEvent) => {
      this.state.selectPoint(event.latlng.lat, event.latlng.lng, 'This spot');
    });
    this.mapReady.set(true);
    this.createdAt = Date.now();
    setTimeout(() => this.fitToRegion(), 80);
    this.destroyRef.onDestroy(() => {
      this.map?.remove();
      this.map = undefined;
      this.mapReady.set(false);
    });
  }

  private fitToRegion(): void {
    const region = this.state.region();
    this.map?.invalidateSize();
    this.map?.fitBounds(region.bounds, { padding: [24, 24], maxZoom: region.zoom });
  }

  private syncBase(): void {
    if (!this.map) {
      return;
    }
    this.baseLayer?.remove();
    const url = this.state.baseMap() === 'satellite' ? ESRI_IMAGERY_URL : OSM_URL;
    const attribution = this.state.baseMap() === 'satellite' ? 'Esri' : '&copy; OpenStreetMap';
    this.baseLayer = L.layerGroup([L.tileLayer(url, { attribution, maxZoom: 19 })]);
    this.baseLayer.addTo(this.map);
    this.sstLayer?.bringToFront();
    this.chlorophyllLayer?.bringToFront();
    this.selectedMarker?.bringToFront();
  }

  private syncOverlays(): void {
    if (!this.map) {
      return;
    }
    this.chlorophyllLayer?.remove();
    this.sstLayer?.remove();
    const time = this.state.overlayDate();
    if (this.state.sst()) {
      this.sstLayer = this.addGibsLayer(GIBS_LAYERS.sst, time);
    }
    if (this.state.chlorophyll()) {
      this.chlorophyllLayer = this.addGibsLayer(GIBS_LAYERS.chlorophyll, time);
    }
  }

  private addGibsLayer(spec: (typeof GIBS_LAYERS)[keyof typeof GIBS_LAYERS], time: string): L.TileLayer | undefined {
    if (!this.map) {
      return undefined;
    }
    const layer = L.tileLayer(GIBS_URL, gibsTileOptions(spec, time) as L.TileLayerOptions);
    layer.addTo(this.map);
    return layer;
  }

  private syncParks(): void {
    if (!this.map) {
      return;
    }
    this.parksLayer?.remove();
    if (!this.state.parks()) {
      this.parksLayer = undefined;
      return;
    }
    this.parksLayer = L.layerGroup();
    for (const park of MARINE_PARKS) {
      const polygon = L.polygon(
        park.polygon.map(([lat, lon]) => [lat, lon] as L.LatLngExpression),
        {
          color: '#9a4b2f',
          weight: 1.5,
          dashArray: '4 3',
          fillColor: '#c56a45',
          fillOpacity: 0.12,
        },
      );
      polygon.bindTooltip(park.name + ' — protected reef', { sticky: true });
      polygon.addTo(this.parksLayer);
    }
    this.parksLayer.addTo(this.map);
  }

  private syncSites(): void {
    if (!this.map) {
      return;
    }
    this.sitesLayer?.remove();
    if (!this.state.landings()) {
      this.sitesLayer = undefined;
      return;
    }
    this.sitesLayer = L.layerGroup();
    const showModel = this.state.model();
    for (const row of this.board.rows()) {
      const tone = showModel && row.advisory ? row.advisory.tone : 'mixed';
      const marker = L.marker([row.site.lat, row.site.lon], {
        icon: this.pin(row.site.name, tone),
        keyboard: true,
        title: row.story ? `${row.site.name} — ${row.story.headline}` : row.site.name,
      });
      marker.on('click', (event: L.LeafletMouseEvent) => {
        L.DomEvent.stopPropagation(event);
        this.state.selectSite(row.site.id);
      });
      marker.addTo(this.sitesLayer);
    }
    this.sitesLayer.addTo(this.map);
  }

  private syncSelected(): void {
    if (!this.map) {
      return;
    }
    this.selectedMarker?.remove();
    const selected = this.state.selected();
    this.selectedMarker = L.circleMarker([selected.lat, selected.lon], {
      radius: 9,
      color: '#14343a',
      weight: 2,
      fillColor: '#f3eee4',
      fillOpacity: 0.9,
    }).addTo(this.map);
    if (this.state.panelOpen() && Date.now() - this.createdAt > 400) {
      const zoom = Math.min(12, Math.max(this.map.getZoom(), 11));
      this.map.flyTo([selected.lat, selected.lon], zoom, { duration: 0.85 });
    }
  }

  private pin(name: string, tone: AdvisoryTone): L.DivIcon {
    const initial = name
      .split(/[\s/]+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join('');
    return L.divIcon({
      className: 'bahari-pin',
      html: `<span class="bahari-pin__dot bahari-pin__dot--${tone}">${initial}</span>`,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
    });
  }
}
