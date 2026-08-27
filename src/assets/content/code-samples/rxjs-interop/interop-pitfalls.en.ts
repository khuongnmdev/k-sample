import {Component, inject, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {toObservable, toSignal} from '@angular/core/rxjs-interop';
import {catchError, of} from 'rxjs';

@Component({selector: 'app-interop-pitfalls', template: '...', standalone: true})
export class InteropPitfalls {
  private readonly http = inject(HttpClient);

  // ===== Trap 1: toObservable emits ASYNCHRONOUSLY and coalesces values =====
  readonly counter = signal(0);

  constructor() {
    // (called in the constructor = we are in a valid injection context)
    toObservable(this.counter).subscribe((value) => console.log(value));

    this.counter.set(1);
    this.counter.set(2);
    this.counter.set(3);
    // Output: logs "3" only ONCE - not 0, 1, 2, 3!
    // toObservable runs through an effect: each "tick" only takes the LATEST value.
    // Completely unlike BehaviorSubject.next(), which emits every value synchronously.
  }

  // ===== Trap 2: toSignal subscribes IMMEDIATELY (eager) =====
  // Not "lazy" like the async pipe (which waits for template render to subscribe):
  readonly data = toSignal(this.http.get('/api/heavy'));
  // -> the request fires right at the declaration line, even if the template never uses data().
  // The subscription lives until the injector is destroyed (component destroy).

  // ===== Trap 3: Observable errors -> READING the signal throws =====
  readonly risky = toSignal(this.http.get<Item[]>('/api/may-fail'));
  // risky() -> THROWS right at the read site (in the template!)
  // => always catchError BEFORE passing into toSignal:
  readonly safe = toSignal(
    this.http.get<Item[]>('/api/may-fail').pipe(catchError(() => of([] as Item[]))),
    {initialValue: [] as Item[]},
  );

  // ===== Trap 4: Observable completes -> the signal "freezes" =====
  // After the source completes, the signal keeps the last value forever -
  // if you want "live" data, the source must be a still-open stream (Subject, interval...).
}
