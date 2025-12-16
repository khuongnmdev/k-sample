import {Routes} from '@angular/router';
import {HomePage} from '@pages/home-page/home-page.component';
import {NotFoundPage} from '@pages/not-found-page/not-found-page';
import {DemoChangeDetection} from '@pages/demo-change-detection/demo-change-detection';

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
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },

  {
    path: '**',
    component: NotFoundPage
  }
];
