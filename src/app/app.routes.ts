import { Routes } from '@angular/router';
import { LandingsPage } from './pages/landings-page/landings-page';
import { MapPage } from './pages/map-page/map-page';
import { SourcesPage } from './pages/sources-page/sources-page';
import { TodayPage } from './pages/today-page/today-page';

export const routes: Routes = [
  { path: '', component: TodayPage, title: 'Bahari Leo — Today' },
  { path: 'map', component: MapPage, title: 'Bahari Leo — Map' },
  { path: 'landings', component: LandingsPage, title: 'Bahari Leo — Places' },
  { path: 'sources', component: SourcesPage, title: 'Bahari Leo — About' },
  { path: '**', redirectTo: '' },
];
