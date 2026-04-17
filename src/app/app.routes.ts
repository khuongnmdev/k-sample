import { Routes } from '@angular/router';
import { HomePage } from '@pages/home-page/home-page.component';
import { NotFoundPage } from '@pages/not-found-page/not-found-page';
import { DemoChangeDetection } from '@pages/demo-change-detection/demo-change-detection';
import { DemoPolling } from '@pages/demo-polling/demo-polling';
import { DemoPollingByList } from '@pages/demo-polling-by-list/demo-polling-by-list';
import { DemoSwitchMap } from '@pages/demo-switch-map/demo-switch-map';
import { DemoCatchError } from '@pages/catch-error-operator/demo-catch-error';

export const routes: Routes = [
  {
    path: 'home',
    component: HomePage,
  },
  {
    path: 'demo-change-detection',
    component: DemoChangeDetection,
  },
  {
    path: 'demo-switch-map',
    component: DemoSwitchMap,
  },
  {
    path: 'demo-catch-error',
    component: DemoCatchError,
  },
  {
    path: 'demo-polling',
    component: DemoPolling,
  },
  {
    path: 'demo-polling-by-list',
    component: DemoPollingByList,
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: '**',
    component: NotFoundPage,
  },
];
