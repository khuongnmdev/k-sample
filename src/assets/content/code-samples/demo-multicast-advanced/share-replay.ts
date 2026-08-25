import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { webSocket } from 'rxjs/webSocket';

interface AppConfig {
  language: string;
  featureFlags: string[];
}

@Injectable({ providedIn: 'root' })
export class ConfigService {
  private readonly http = inject(HttpClient);

  // shareReplay(1) = refCount: false (mặc định) - hợp với nguồn TỰ KẾT THÚC như HTTP.
  // Header, Sidebar, Footer cùng subscribe -> chỉ 1 request duy nhất.
  // Component mount MUỘN vẫn nhận ngay kết quả cache, không bắn request mới.
  // Request complete ngay nên không có gì chạy ngầm để leak.
  readonly config$: Observable<AppConfig> = this.http
    .get<AppConfig>('/api/config')
    .pipe(shareReplay(1));
}

@Injectable({ providedIn: 'root' })
export class PriceFeedService {
  // refCount: true - BẮT BUỘC với nguồn VÔ HẠN như websocket (không bao giờ tự kết thúc).
  // 5 widget giá cùng dùng chung 1 kết nối; widget cuối cùng đóng
  // -> refCount về 0 -> ngắt kết nối thật, không chạy ngầm.
  // Nếu dùng shareReplay(1) mặc định ở đây: kết nối sống mãi = LEAK.
  readonly price$ = webSocket<number>('wss://example.com/prices').pipe(
    shareReplay({ bufferSize: 1, refCount: true }),
  );
}
