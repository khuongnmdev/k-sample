import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, switchMap } from 'rxjs';
import { SwapiService } from '@services/swapi.service';

@Component({
  selector: 'app-switch-map-cancel',
  template: `
    <button (click)="pick(1)">Person 1</button>
    <button (click)="pick(2)">Person 2</button>
  `,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SwitchMapCancel {
  private readonly destroyRef = inject(DestroyRef);
  private readonly swapi = inject(SwapiService);

  // MỘT stream duy nhất cho mọi click
  private readonly pickedId$ = new Subject<number>();

  private readonly sub = this.pickedId$
    .pipe(
      // Click mới tới khi request cũ chưa xong -> switchMap HỦY request cũ ngay
      // Kết quả trên UI luôn khớp với lần click cuối cùng, không bao giờ bị race
      switchMap((id) => this.swapi.getPerson(id)),
      takeUntilDestroyed(this.destroyRef),
    )
    .subscribe((person) => console.log('Chỉ nhận response của click cuối:', person.name));

  pick(id: number) {
    this.pickedId$.next(id);
  }
}
