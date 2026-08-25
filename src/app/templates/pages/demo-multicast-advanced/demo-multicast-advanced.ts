import {ChangeDetectionStrategy, Component, DestroyRef, inject, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {defer, interval, Observable, ReplaySubject, shareReplay, Subscription, tap} from 'rxjs';
import {CodePresenter} from '@components/code-presenter/code-presenter';

const INTERVAL_TIME = 2000;
const REPLAY_BUFFER = 2;

@Component({
  selector: 'app-demo-multicast-advanced',
  imports: [CodePresenter],
  templateUrl: './demo-multicast-advanced.html',
  styleUrl: './demo-multicast-advanced.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DemoMulticastAdvanced {
  private readonly destroyRef = inject(DestroyRef);
  protected showExplainAdvanced = signal<boolean>(false);

  protected triggerExplainAdvanced() {
    this.showExplainAdvanced.update((v) => !v);
  }

  // ===== 1. shareReplay + refCount: true - hết subscriber là nguồn DỪNG =====
  protected readonly refCountOnSideEffects = signal<number>(0);

  private readonly refCountOn$ = interval(INTERVAL_TIME).pipe(
    tap(() => this.refCountOnSideEffects.update((c) => c + 1)),
    takeUntilDestroyed(this.destroyRef),
    // refCount: true - subscriber cuối rời đi là nguồn bị hủy + buffer bị xóa,
    // subscribe lại sẽ chạy một execution MỚI từ đầu
    shareReplay({bufferSize: REPLAY_BUFFER, refCount: true}),
  );

  protected readonly refCountOnA = this.createObserverSlot(this.refCountOn$);
  protected readonly refCountOnB = this.createObserverSlot(this.refCountOn$);

  protected resetRefCountOn() {
    this.refCountOnA.reset();
    this.refCountOnB.reset();
    this.refCountOnSideEffects.set(0);
  }

  // ===== 2. shareReplay(2) mặc định (refCount: false) - nguồn chạy NGẦM =====
  protected readonly refCountOffSideEffects = signal<number>(0);

  private readonly refCountOff$ = interval(INTERVAL_TIME).pipe(
    tap(() => this.refCountOffSideEffects.update((c) => c + 1)),
    takeUntilDestroyed(this.destroyRef),
    // Dạng gọn shareReplay(n) luôn là refCount: false - hết subscriber
    // nguồn VẪN chạy ngầm và buffer được giữ nguyên (xem side-effect)
    shareReplay(REPLAY_BUFFER),
  );

  protected readonly refCountOffA = this.createObserverSlot(this.refCountOff$);
  protected readonly refCountOffB = this.createObserverSlot(this.refCountOff$);

  protected resetRefCountOff() {
    this.refCountOffA.reset();
    this.refCountOffB.reset();
    this.refCountOffSideEffects.set(0);
  }

  // ===== 3. ReplaySubject(2) - TỰ phát giá trị bằng .next() =====
  protected readonly emittedCount = signal<number>(0);

  private replaySubject = new ReplaySubject<number>(REPLAY_BUFFER);
  // defer: subscribe tại thời điểm bấm nút -> sau Reset sẽ bám vào subject MỚI
  private readonly replaySubject$ = defer(() => this.replaySubject);

  protected readonly replayA = this.createObserverSlot(this.replaySubject$);
  protected readonly replayB = this.createObserverSlot(this.replaySubject$);

  protected emitValue() {
    this.emittedCount.update((c) => c + 1);
    this.replaySubject.next(this.emittedCount());
  }

  protected resetReplaySubject() {
    this.replayA.reset();
    this.replayB.reset();
    this.emittedCount.set(0);
    this.replaySubject = new ReplaySubject<number>(REPLAY_BUFFER);
  }

  // Một "Observer slot": trạng thái subscribe + values nhận được + toggle
  private createObserverSlot(source$: Observable<number>) {
    const values = signal<number[]>([]);
    const isSubscribed = signal<boolean>(false);
    let sub: Subscription | null = null;

    this.destroyRef.onDestroy(() => sub?.unsubscribe());

    return {
      values: values.asReadonly(),
      isSubscribed: isSubscribed.asReadonly(),
      toggle: () => {
        if (isSubscribed()) {
          sub?.unsubscribe();
          sub = null;
          isSubscribed.set(false);
          return;
        }
        isSubscribed.set(true);
        sub = source$.subscribe((v) => values.update((arr) => [...arr, v]));
      },
      reset: () => {
        sub?.unsubscribe();
        sub = null;
        isSubscribed.set(false);
        values.set([]);
      },
    };
  }
}
