### 💡 The bridge between two worlds

| API                | Direction             | Role                                                                                                                                            |
| :----------------- | :-------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------- |
| **`toSignal()`**   | Observable → Signal   | "Lands" the stream back into the template: call the signal directly (e.g. `results()`), no `async` pipe needed, auto-unsubscribes when the injector is destroyed. Options: `initialValue`, `requireSync`. |
| **`toObservable()`** | Signal → Observable | "Launches" the signal into an RxJS pipeline: every signal change is an emission (emitted asynchronously, coalesced per tick) - from there every operator is available. |

---

### Each world's job

- **Signals** win at: **synchronous state + rendering** - the UI's source of truth, `computed` derivations, fine-grained updates with OnPush/Zoneless.
- **RxJS** wins at: **time and async coordination** - `debounceTime`, `distinctUntilChanged`, `switchMap` (auto-cancels the old request), `retry`, `combineLatest`... things the signal system doesn't have.

The "round-trip bridge" pattern gets the best of both:

> **Signal** (UI state) → `toObservable` → **RxJS operators** (debounce, switchMap...) → `toSignal` → **Signal** (template reads)

The search demo above follows exactly this loop: no matter how fast you type, the "API" is only called 300ms after the last keystroke, an unchanged term is not re-queried, and an old in-flight request is cancelled by `switchMap`.

---

### Right inside this app

The `CodePresenter` component rendering the very code block you are looking at uses the same pattern: `input signal (fileName)` → `computed (fileInfo)` → `toObservable` → `switchMap` (HTTP loads the code file) → `toSignal` → template. That's why switching pages auto-loads new code without a single manual subscribe line.
