import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
  provideZonelessChangeDetection,
} from '@angular/core';
import {provideRouter} from '@angular/router';
import {routes} from './app.routes';
import {provideClientHydration, withEventReplay} from '@angular/platform-browser';
import {provideMarkdown} from 'ngx-markdown';
import {provideHttpClient, withFetch, withInterceptors} from '@angular/common/http';
import {delayInterceptor} from './common/services/delay.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    // provideZonelessChangeDetection(),
    provideZoneChangeDetection({eventCoalescing: true}), // Demo ngZone affect
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withFetch(), withInterceptors([delayInterceptor])),
    provideMarkdown(),
    provideClientHydration(withEventReplay()),
  ],
};
