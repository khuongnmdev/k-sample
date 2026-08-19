import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, EMPTY, of, Subject, switchMap } from 'rxjs';
import { CodePresenter } from '@components/code-presenter/code-presenter';
import { SwapiPerson, SwapiService } from '@services/swapi.service';

@Component({
  selector: 'app-demo-catch-error',
  imports: [CodePresenter],
  templateUrl: './demo-catch-error.html',
  styleUrl: './demo-catch-error.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DemoCatchError {
  private readonly destroyRef = inject(DestroyRef);
  private readonly swapi = inject(SwapiService);

  protected showExplainCatchError = signal<boolean>(false);

  // --- LIVE DEMO: catchError với lỗi 404 THẬT (swapi.info) ---
  protected readonly result = signal<string>('');
  protected readonly log = signal<string[]>([]);

  private readonly requestedId$ = new Subject<number>();

  private readonly sub = this.requestedId$
    .pipe(
      // id = 0: sentinel từ resetDemo() - chuyển sang EMPTY để hủy request đang bay
      switchMap((id) => {
        if (!id) return EMPTY;
        // catchError đặt Ở TRONG switchMap: lỗi chỉ kết thúc luồng con,
        // luồng chính vẫn sống - bấm tiếp vẫn chạy bình thường
        return this.swapi.getPerson(id).pipe(
          catchError((err: HttpErrorResponse) => {
            this.log.update((l) => [...l, `✖ HTTP ${err.status} thật từ server - trả fallback`]);
            return of({name: `(fallback) person ${id} không tồn tại`} as SwapiPerson);
          }),
        );
      }),
      takeUntilDestroyed(this.destroyRef),
    )
    .subscribe((p) => {
      this.result.set(p.name);
      this.log.update((l) => [...l, `✔ nhận "${p.name}" - luồng chính vẫn sống`]);
    });

  protected load(id: number) {
    this.result.set('đang tải...');
    this.log.update((l) => [...l, `→ request /people/${id}`]);
    this.requestedId$.next(id);
  }

  protected resetDemo() {
    this.requestedId$.next(0); // hủy request đang bay trước khi xóa log
    this.result.set('');
    this.log.set([]);
  }

  protected triggerExplainCatchError() {
    this.showExplainCatchError.set(true);
  }
}
