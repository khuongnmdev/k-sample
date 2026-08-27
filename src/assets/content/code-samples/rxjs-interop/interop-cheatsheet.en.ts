import {Component, inject, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {toObservable, toSignal} from '@angular/core/rxjs-interop';
import {debounceTime, switchMap} from 'rxjs';

@Component({selector: 'app-interop-cheatsheet', template: '...', standalone: true})
export class InteropCheatsheet {
  private readonly http = inject(HttpClient);
  private readonly userService = inject(UserService);

  // ===== toSignal: Observable -> Signal =====

  // Basic: until there is a value, the signal returns undefined
  readonly user = toSignal(this.userService.user$);
  // -> Signal<User | undefined>

  // initialValue: there is a value from the start, so the template doesn't have to handle undefined
  readonly products = toSignal(this.http.get<Product[]>('/api/products'), {initialValue: []});
  // -> Signal<Product[]>

  // requireSync: the source emits SYNCHRONOUSLY as soon as you subscribe
  // (BehaviorSubject, stream with startWith...) - no initialValue needed,
  // but it will THROW if the source doesn't emit immediately
  readonly theme = toSignal(this.userService.themeSubject$, {requireSync: true});
  // -> Signal<Theme>

  // ===== toObservable: Signal -> Observable =====

  readonly query = signal('');

  // Put the signal into an RxJS pipeline to use time / coordination operators
  readonly suggestions$ = toObservable(this.query).pipe(
    debounceTime(300),
    switchMap((q) => this.http.get<string[]>(`/api/suggest?q=${q}`)),
  );

  // Note: both toSignal and toObservable need an INJECTION CONTEXT
  // (declared in a field/constructor as above), or pass {injector} when calling elsewhere.

  // The "round-trip bridge" pattern - this app's own CodePresenter uses it:
  // input signal -> computed(fileInfo) -> toObservable -> switchMap(HTTP) -> toSignal
}
