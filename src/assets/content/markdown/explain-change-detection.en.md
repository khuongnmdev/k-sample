## 1. Imperative State (Old)

This approach uses regular class properties as the data source.

| Aspect              | Details                                                                                                                                                                                                                                                                                      |
| :------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Source of Truth** | Plain variables (`currentFileName`, `codeMarkdown`).                                                                                                                                                                                                                                         |
| **Data Flow**       | `@Input` setter → call a method (`setupCodeMarkdown`) → `HttpClient.get()` → `.subscribe()` → assign the value to a variable (`this.codeMarkdown = ...`).                                                                                                                                    |
| **Pros**            | **Easy to understand** for developers new to Angular or coming from traditional object-oriented programming.                                                                                                                                                                                 |
| **Cons**            | **No change notification mechanism:** Assigning a value to a plain variable emits no signal to Angular. The UI only "happens" to update when zone.js + `Default` CD re-scans the whole tree; with `OnPush` or Zoneless the view stays frozen (you must call `markForCheck()` yourself - regardless of whether the assignment happens inside or outside `NgZone`). Hard to compose logic. |

---

## 2. Observable State (Reactive Stream)

Uses RxJS to manage the data flow; this has been the standard approach in Angular projects for many years.

| Aspect              | Details                                                                                                                                                                                            |
| :------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Source of Truth** | `BehaviorSubject` (for the Input) and the result stream (`codeMarkdown$`).                                                                                                                        |
| **Data Flow**       | `@Input` setter → `currentFileName$.next(value)` → processing pipeline (`.pipe(switchMap(), map(), ...)`) → template uses the `async pipe`.                                                       |
| **Pros**            | **A great fit for OnPush:** the `Async Pipe` automatically handles unsubscribing and calls `markForCheck()` whenever new data arrives, removing the need for manual CD intervention. Processing logic is clear (declarative). |
| **Cons**            | **RxJS boilerplate:** You need to declare Subjects, manage pipes, and RxJS can sometimes be complex for newcomers.                                                                                |

---

## 3. Signal State (Signal-First Architecture)

Uses Angular Signals, the recommended model for modern Angular.

| Aspect              | Details                                                                                                                                                                                                                                         |
| :------------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Source of Truth** | `input()` (Signal Input), `computed()` (`fileInfo`), and `toSignal()` (the HTTP result).                                                                                                                                                        |
| **Data Flow**       | `input()` receives the value automatically → `computed` reacts automatically → the `Observable` (created from the Signal) runs → `toSignal` updates the final value → template renders with `codeMarkdown()`.                                   |
| **Pros**            | **Fine-grained Reactivity:** Extremely clean structure, no setters or manual management needed. Signals tell Angular exactly which parts need to change, delivering the best performance, especially combined with `OnPush` and Zoneless.       |
| **Cons**            | **Learning Curve:** You need to get used to converting between Observables and Signals. Hard to demo the difference from traditional CD because Signals are inherently already so optimized.                                                    |

---

## Summary and How to Choose

- The **Signal State + OnPush** model is the **best choice** for modern Angular (v18 and up) in both performance and Developer Experience.
- The **Observable (RxJS)** model is still very powerful for complex stream-processing logic and works well with `OnPush` via the `async` pipe.
- The **Imperative (Old)** model should be avoided because it has no mechanism to tell Angular that data has changed - the UI can easily "freeze" when switching to `OnPush`/Zoneless (as in the `window.setInterval` experiment above) and it is hard to optimize performance for large apps.
