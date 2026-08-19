import {HttpInterceptorFn} from '@angular/common/http';
import {inject, PLATFORM_ID} from '@angular/core';
import {isPlatformBrowser} from '@angular/common';
import {delay} from 'rxjs';
import {SWAPI_BASE_URL} from './swapi.service';

// swapi thật chỉ mất ~150ms - delay thêm để loading state kịp hiển thị khi present
export const API_DELAY_MS = 1200;

// Chỉ delay API demo (swapi):
// - KHÔNG delay assets (code-presenter cũng load sample/markdown qua HttpClient)
// - KHÔNG delay lúc SSR/prerender (làm chậm build)
export const delayInterceptor: HttpInterceptorFn = (req, next) => {
  const isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  if (!isBrowser || !req.url.startsWith(SWAPI_BASE_URL)) {
    return next(req);
  }
  return next(req).pipe(delay(API_DELAY_MS));
};
