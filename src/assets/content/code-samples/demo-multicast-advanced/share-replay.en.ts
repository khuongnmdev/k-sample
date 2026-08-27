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

  // shareReplay(1) = refCount: false (default) - fits SELF-COMPLETING sources like HTTP
  // (once the response is emitted the stream completes itself, nothing keeps running).
  // Pick this when data RARELY changes within the app session (brand config, feature flags):
  // called exactly once, the buffer serves as a cache for the rest of the session.
  // Header, Sidebar, Footer all subscribe -> exactly 1 request.
  // A component that mounts LATE still gets the cached result instantly, no new request fired.
  // The request completes immediately, so nothing runs in the background to leak.
  readonly config$: Observable<AppConfig> = this.http
    .get<AppConfig>('/api/config')
    .pipe(shareReplay(1));
}

@Injectable({ providedIn: 'root' })
export class PriceFeedService {
  // refCount: true - MANDATORY for INFINITE sources like a websocket
  // (never completes on its own - only stops when unsubscribed).
  // 5 price widgets share 1 connection; when the last widget closes
  // -> refCount hits 0 -> the real connection is torn down, nothing runs in the background.
  // If you used the default shareReplay(1) here: the connection lives forever = LEAK.
  readonly price$ = webSocket<number>('wss://example.com/prices').pipe(
    shareReplay({ bufferSize: 1, refCount: true }),
  );
}
