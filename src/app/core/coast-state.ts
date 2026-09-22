import { computed, Injectable, signal } from '@angular/core';
import { defaultOverlayDate, MOMBASA_POINT, regionById, siteById, sitesForRegion } from './kenya-coast';
import { BaseMapId, InspectTarget, LayerState, OverlayKey, RegionId } from './models';

const INITIAL_LAYERS: LayerState = {
  baseMap: 'chart',
  chlorophyll: false,
  sst: false,
  model: true,
  landings: true,
  parks: true,
};

@Injectable({ providedIn: 'root' })
export class CoastState {
  private readonly regionId = signal<RegionId>('coast');
  private readonly overlayDateValue = signal(defaultOverlayDate());
  private readonly selectedValue = signal<InspectTarget>({
    lat: MOMBASA_POINT.lat,
    lon: MOMBASA_POINT.lon,
    label: MOMBASA_POINT.name,
    siteId: MOMBASA_POINT.id,
  });
  private readonly layerState = signal<LayerState>(INITIAL_LAYERS);
  readonly panelOpen = signal(false);

  readonly region = computed(() => regionById(this.regionId()));
  readonly overlayDate = this.overlayDateValue.asReadonly();
  readonly selected = this.selectedValue.asReadonly();
  readonly layers = this.layerState.asReadonly();
  readonly chlorophyll = computed(() => this.layerState().chlorophyll);
  readonly sst = computed(() => this.layerState().sst);
  readonly model = computed(() => this.layerState().model);
  readonly landings = computed(() => this.layerState().landings);
  readonly parks = computed(() => this.layerState().parks);
  readonly baseMap = computed(() => this.layerState().baseMap);
  readonly sites = computed(() => sitesForRegion(this.regionId()));

  setRegion(id: RegionId): void {
    this.regionId.set(id);
    const sites = sitesForRegion(id);
    const current = this.selectedValue();
    if (!sites.some((site) => site.id === current.siteId) && sites[0]) {
      this.selectSite(sites[0].id);
    }
  }

  setOverlayDate(value: string): void {
    if (value) {
      this.overlayDateValue.set(value);
    }
  }

  setBaseMap(id: BaseMapId): void {
    this.layerState.update((layers) => ({ ...layers, baseMap: id }));
  }

  toggleOverlay(key: OverlayKey): void {
    this.layerState.update((layers) => ({ ...layers, [key]: !layers[key] }));
  }

  selectSite(id: string): void {
    const site = siteById(id);
    if (!site) {
      return;
    }
    this.selectedValue.set({
      lat: site.lat,
      lon: site.lon,
      label: site.name,
      siteId: site.id,
    });
    this.panelOpen.set(true);
  }

  selectPoint(lat: number, lon: number, label = 'Selected point'): void {
    this.selectedValue.set({ lat, lon, label });
    this.panelOpen.set(true);
  }

  closePanel(): void {
    this.panelOpen.set(false);
  }
}
