import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, of, Subject, switchMap } from 'rxjs';
import { SwapiPerson, SwapiService } from '@services/swapi.service';

@Component({
  selector: 'app-catch-error-live',
  template: `
    <button (click)="load(1)">Person 1 (OK)</button>
    <button (click)="load(9999)">Person 9999 (404)</button>
    <p>{{ result() }}</p>
  `,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatchErrorLive {
  private readonly destroyRef = inject(DestroyRef);
  private readonly swapi = inject(SwapiService);

  readonly result = signal<string>('');

  private readonly requestedId$ = new Subject<number>();

  private readonly sub = this.requestedId$
    .pipe(
      switchMap((id) =>
        // catchError Ở TRONG switchMap: lỗi chỉ kết thúc luồng con.
        // Nếu đặt catchError Ở NGOÀI (sau switchMap), một lần lỗi
        // sẽ complete luôn luồng chính - các click sau không chạy nữa!
        this.swapi.getPerson(id).pipe(
          catchError((err: HttpErrorResponse) => {
            console.log('HTTP status thật từ server:', err.status);
            return of({name: `(fallback) person ${id} không tồn tại`} as SwapiPerson);
          }),
        ),
      ),
      takeUntilDestroyed(this.destroyRef),
    )
    .subscribe((person) => this.result.set(person.name));

  load(id: number) {
    this.requestedId$.next(id);
  }
}
