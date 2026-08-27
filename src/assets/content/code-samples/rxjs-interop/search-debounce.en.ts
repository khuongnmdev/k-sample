import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {toObservable, toSignal} from '@angular/core/rxjs-interop';
import {debounceTime, distinctUntilChanged, switchMap} from 'rxjs';

@Component({
  selector: 'app-search-demo',
  template: `
    <input [value]="searchTerm()" (input)="onSearch($event)" />
    @for (item of results(); track item) {
      <li>{{ item }}</li>
    }
  `,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchDemoComponent {
  private readonly http = inject(HttpClient);

  // 1. Signal: the root state - the input box writes straight into it
  readonly searchTerm = signal('');

  // 2. toObservable: Signal -> Observable
  //    Enter the "RxJS world" to use the TIME operators Signals don't have:
  //    - debounceTime: fast typing keeps only the last keystroke
  //    - distinctUntilChanged: an unchanged value is skipped
  //    - switchMap: the old in-flight request is CANCELLED when a new term arrives
  private readonly results$ = toObservable(this.searchTerm).pipe(
    debounceTime(300),
    distinctUntilChanged(),
    switchMap((term) => this.searchApi(term)),
  );

  // 3. toSignal: Observable -> Signal
  //    Back to the "Signal world" so the template reads results() directly,
  //    no async pipe needed, auto-unsubscribes when the component is destroyed
  readonly results = toSignal(this.results$, {initialValue: [] as string[]});

  onSearch(event: Event) {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  private searchApi(term: string) {
    return this.http.get<string[]>(`/api/search?q=${term}`);
  }
}
