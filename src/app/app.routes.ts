import {Routes} from '@angular/router';
import {HomePage} from '@pages/home-page/home-page.component';
import {NotFoundPage} from '@pages/not-found-page/not-found-page';

export const routes: Routes = [
  {
    path: 'home',
    component: HomePage,
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
