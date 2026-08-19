import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, Subject, Subscription, switchMap, tap } from 'rxjs';
import { CodePresenter } from '@components/code-presenter/code-presenter';
import { SwapiService } from '@services/swapi.service';

@Component({
  selector: 'app-demo-switch-map',
  imports: [CodePresenter],
  templateUrl: './demo-switch-map.html',
  styleUrl: './demo-switch-map.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DemoSwitchMap {
  private readonly destroyRef = inject(DestroyRef);
  private readonly swapi = inject(SwapiService);

  protected showExplainSubscribeHell = signal<boolean>(false);
  protected showSwitchMapSolution = signal<boolean>(false);

  // --- LIVE DEMO: switchMap tự hủy request cũ (swapi.info) ---
  protected readonly naiveResult = signal<string>('');
  protected readonly switchResult = signal<string>('');
  protected readonly naiveLog = signal<string[]>([]);
  protected readonly switchLog = signal<string[]>([]);

  private readonly pickedId$ = new Subject<number>();
  private naiveSubs = new Subscription();

  private readonly switchSub = this.pickedId$
    .pipe(
      // id = 0: sentinel từ resetRace() - chuyển sang EMPTY để hủy request đang bay
      switchMap((id) => {
        if (!id) return EMPTY;
        return this.swapi.getPerson(id).pipe(
          // unsubscribe: chỉ chạy khi request bị switchMap hủy giữa chừng
          tap({
            unsubscribe: () =>
              this.switchLog.update((l) => [...l, `✖ hủy /people/${id} (bị switch)`]),
          }),
        );
      }),
      takeUntilDestroyed(this.destroyRef),
    )
    .subscribe((p) => {
      this.switchResult.set(p.name);
      this.switchLog.update((l) => [...l, `✔ nhận "${p.name}"`]);
    });

  protected pick(id: number) {
    // Cách naive: mỗi click một subscribe độc lập - không gì bị hủy,
    // mọi response đều đổ về và lần lượt đè kết quả
    this.naiveLog.update((l) => [...l, `→ request /people/${id}`]);
    this.naiveSubs.add(
      this.swapi.getPerson(id).subscribe((p) => {
        this.naiveResult.set(p.name);
        this.naiveLog.update((l) => [...l, `✔ nhận "${p.name}" (đè kết quả trước)`]);
      }),
    );

    // switchMap: mọi click đi qua MỘT stream duy nhất
    this.switchLog.update((l) => [...l, `→ request /people/${id}`]);
    this.pickedId$.next(id);
  }

  protected resetRace() {
    // Hủy hết request đang bay của cả 2 bên trước khi xóa log
    this.pickedId$.next(0);
    this.naiveSubs.unsubscribe();
    this.naiveSubs = new Subscription();
    this.naiveResult.set('');
    this.switchResult.set('');
    this.naiveLog.set([]);
    this.switchLog.set([]);
  }

  constructor() {
    this.destroyRef.onDestroy(() => this.naiveSubs.unsubscribe());
  }

  protected triggerExplainSubscribeHell() {
    this.showExplainSubscribeHell.set(true);
  }

  protected triggerSwitchMapSolution() {
    this.showSwitchMapSolution.set(true);
  }
}
