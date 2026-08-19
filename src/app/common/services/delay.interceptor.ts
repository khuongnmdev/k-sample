import {HttpInterceptorFn} from '@angular/common/http';
import {inject, PLATFORM_ID} from '@angular/core';
import {isPlatformBrowser} from '@angular/common';
import {concatMap, timer} from 'rxjs';
import {SWAPI_BASE_URL} from './swapi.service';

// swapi thật chỉ mất ~150ms - giữ thêm 1.2s để loading state kịp hiển thị khi present
export const API_DELAY_MS = 1200;

// Giữ request 1.2s TRƯỚC KHI bắn (không phải delay response) vì:
// - Hủy (switchMap / httpResource đổi params) trong lúc chờ -> request KHÔNG lên mạng
//   => Network tab chỉ thấy request của lần bấm cuối cùng
// - Lỗi 404 cũng bị giữ 1.2s y như response thành công (delay() thường cho error đi qua ngay)
// Chỉ áp dụng cho API demo (swapi):
// - KHÔNG delay assets (code-presenter cũng load sample/markdown qua HttpClient)
// - KHÔNG delay lúc SSR/prerender (làm chậm build)
export const delayInterceptor: HttpInterceptorFn = (req, next) => {
  const isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  if (!isBrowser || !req.url.startsWith(SWAPI_BASE_URL)) {
    return next(req);
  }
  return timer(API_DELAY_MS).pipe(concatMap(() => next(req)));
};
