import {ChangeDetectionStrategy, Component, DestroyRef, inject, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {defer, interval, Subscription} from 'rxjs';
import {share, tap} from 'rxjs/operators';
import {CodePresenter} from '@components/code-presenter/code-presenter';
import {SwapiService} from '@services/swapi.service';

@Component({
  selector: 'app-demo-multicast',
  imports: [CodePresenter],
  templateUrl: './demo-multicast.html',
  styleUrl: './demo-multicast.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DemoMulticast {
  private readonly destroyRef = inject(DestroyRef);
  protected showExplainMulticast = signal<boolean>(false);

  constructor() {
    this.destroyRef.onDestroy(() => this.httpSubs.unsubscribe());
  }

  protected triggerExplainMulticast() {
    this.showExplainMulticast.update((v) => !v);
  }

  // --- UNICAST SIMULATION STATE ---
  protected readonly unicastSideEffects = signal<number>(0);
  protected readonly isUnicastSubscribedA = signal<boolean>(false);
  protected readonly isUnicastSubscribedB = signal<boolean>(false);
  protected readonly unicastValuesA = signal<number[]>([]);
  protected readonly unicastValuesB = signal<number[]>([]);

  private unicastSubA: Subscription | null = null;
  private unicastSubB: Subscription | null = null;

  // Unicast Source Factory (tạo stream mới cho mỗi lượt subscribe)
  private getUnicastSource() {
    return interval(2000).pipe(
      tap(() => {
        this.unicastSideEffects.update((c) => c + 1);
      }),
    );
  }

  protected toggleUnicastA() {
    if (this.isUnicastSubscribedA()) {
      this.unicastSubA?.unsubscribe();
      this.unicastSubA = null;
      this.isUnicastSubscribedA.set(false);
    } else {
      this.isUnicastSubscribedA.set(true);
      this.unicastSubA = this.getUnicastSource()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((val) => {
          this.unicastValuesA.update((arr) => [...arr, val]);
        });
    }
  }

  protected toggleUnicastB() {
    if (this.isUnicastSubscribedB()) {
      this.unicastSubB?.unsubscribe();
      this.unicastSubB = null;
      this.isUnicastSubscribedB.set(false);
    } else {
      this.isUnicastSubscribedB.set(true);
      // Giả lập sub muộn hoặc lệch pha
      this.unicastSubB = this.getUnicastSource()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((val) => {
          this.unicastValuesB.update((arr) => [...arr, val]);
        });
    }
  }

  protected resetUnicast() {
    this.unicastSubA?.unsubscribe();
    this.unicastSubB?.unsubscribe();
    this.unicastSubA = null;
    this.unicastSubB = null;
    this.isUnicastSubscribedA.set(false);
    this.isUnicastSubscribedB.set(false);
    this.unicastValuesA.set([]);
    this.unicastValuesB.set([]);
    this.unicastSideEffects.set(0);
  }

  // --- MULTICAST SIMULATION STATE ---
  protected readonly multicastSideEffects = signal<number>(0);
  protected readonly isMulticastSubscribedA = signal<boolean>(false);
  protected readonly isMulticastSubscribedB = signal<boolean>(false);
  protected readonly multicastValuesA = signal<number[]>([]);
  protected readonly multicastValuesB = signal<number[]>([]);

  private multicastSubA: Subscription | null = null;
  private multicastSubB: Subscription | null = null;

  // Multicast Source (khởi tạo duy nhất một luồng hot dùng chung bằng share)
  private readonly multicastSource$ = interval(2000).pipe(
    tap(() => {
      this.multicastSideEffects.update((c) => c + 1);
    }),
    share(),
  );

  protected toggleMulticastA() {
    if (this.isMulticastSubscribedA()) {
      this.multicastSubA?.unsubscribe();
      this.multicastSubA = null;
      this.isMulticastSubscribedA.set(false);
    } else {
      this.isMulticastSubscribedA.set(true);
      this.multicastSubA = this.multicastSource$
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((val) => {
          this.multicastValuesA.update((arr) => [...arr, val]);
        });
    }
  }

  protected toggleMulticastB() {
    if (this.isMulticastSubscribedB()) {
      this.multicastSubB?.unsubscribe();
      this.multicastSubB = null;
      this.isMulticastSubscribedB.set(false);
    } else {
      this.isMulticastSubscribedB.set(true);
      this.multicastSubB = this.multicastSource$
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((val) => {
          this.multicastValuesB.update((arr) => [...arr, val]);
        });
    }
  }

  protected resetMulticast() {
    this.multicastSubA?.unsubscribe();
    this.multicastSubB?.unsubscribe();
    this.multicastSubA = null;
    this.multicastSubB = null;
    this.isMulticastSubscribedA.set(false);
    this.isMulticastSubscribedB.set(false);
    this.multicastValuesA.set([]);
    this.multicastValuesB.set([]);
    this.multicastSideEffects.set(0);
  }

  // --- HTTP THẬT (swapi.info): request trùng lặp vs share() ---
  private readonly swapi = inject(SwapiService);

  protected readonly httpResultA = signal<string>('');
  protected readonly httpResultB = signal<string>('');
  protected readonly httpRequestLog = signal<string[]>([]);

  private nextPersonId = 1;
  private httpSubs = new Subscription();

  // defer: log đúng tại thời điểm request thật được tạo (cold: mỗi subscribe một lần)
  private trackedPerson$(id: number) {
    return defer(() => {
      this.httpRequestLog.update((log) => [...log, `→ HTTP request /people/${id}`]);
      return this.swapi.getPerson(id);
    });
  }

  protected loadWithoutShare() {
    // Cold, không share: 2 lượt subscribe = 2 request giống hệt nhau
    this.cancelHttpRun(); // hủy lượt trước còn đang bay (nếu có)
    const source$ = this.trackedPerson$(this.rotatePersonId());
    this.httpResultA.set('đang tải...');
    this.httpResultB.set('đang tải...');
    this.httpSubs.add(source$.subscribe((p) => this.httpResultA.set(p.name)));
    this.httpSubs.add(source$.subscribe((p) => this.httpResultB.set(p.name)));
  }

  protected loadWithShare() {
    // share(): B bám vào request đang bay của A - chỉ 1 request duy nhất
    this.cancelHttpRun();
    const source$ = this.trackedPerson$(this.rotatePersonId()).pipe(share());
    this.httpResultA.set('đang tải...');
    this.httpResultB.set('đang tải...');
    this.httpSubs.add(source$.subscribe((p) => this.httpResultA.set(p.name)));
    this.httpSubs.add(source$.subscribe((p) => this.httpResultB.set(p.name)));
  }

  protected resetHttp() {
    this.cancelHttpRun();
    this.httpResultA.set('');
    this.httpResultB.set('');
    this.httpRequestLog.set([]);
  }

  // Gom subscription mỗi lượt bấm để Reset / bấm lại hủy được request đang bay;
  // component destroy cũng hủy nốt (đăng ký trong constructor)
  private cancelHttpRun() {
    this.httpSubs.unsubscribe();
    this.httpSubs = new Subscription();
  }

  // Đổi id mỗi lần bấm để browser HTTP cache không làm sai lệch số request
  private rotatePersonId() {
    const id = this.nextPersonId;
    this.nextPersonId = (this.nextPersonId % 3) + 1;
    return id;
  }
}
