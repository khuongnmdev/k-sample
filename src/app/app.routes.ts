import {Routes} from '@angular/router';
import {HomePage} from '@pages/home-page/home-page.component';
import {NotFoundPage} from '@pages/not-found-page/not-found-page';
import {DemoChangeDetection} from '@pages/demo-change-detection/demo-change-detection';
import {DemoPolling} from '@pages/demo-polling/demo-polling';
import {DemoPollingByList} from '@pages/demo-polling-by-list/demo-polling-by-list';
import {DemoSwitchMap} from '@pages/demo-switch-map/demo-switch-map';
import {DemoCatchError} from '@pages/catch-error-operator/demo-catch-error';
import {BestPracticeService} from '@pages/best-practice-service/best-practice-service';
import {ExplainReactiveImperative} from '@pages/explain-reactive-imperative/explain-reactive-imperative';
import {DemoMulticast} from '@pages/demo-multicast/demo-multicast';
import {Summary} from '@pages/summary/summary';
import {CorePrimitives} from '@pages/core-primitives/core-primitives';
import {SignalComponents} from '@pages/signal-components/signal-components';
import {RxjsInterop} from '@pages/rxjs-interop/rxjs-interop';
import {ResourceApi} from '@pages/resource-api/resource-api';

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
    path: 'explain-reactive-vs-imperative',
    component: ExplainReactiveImperative,
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
    path: 'core-primitives',
    component: CorePrimitives,
  },
  {
    path: 'signal-components',
    component: SignalComponents,
  },
  {
    path: 'rxjs-interop',
    component: RxjsInterop,
  },
  {
    path: 'resource-api',
    component: ResourceApi,
  },
  {
    path: 'best-practice-service',
    component: BestPracticeService,
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
    path: 'demo-multicast',
    component: DemoMulticast,
  },
  {
    path: 'summary',
    component: Summary,
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
