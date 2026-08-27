#### ❌→✅ Example 1: an effect "syncing" derived state for you (CartBad vs CartGood)

- **`CartBad`**: `total` is **derived** state (always computable from `quantity × price`) but is declared as a plain `signal` and kept in sync by an `effect`. Consequences:
  - `total` is one render tick behind `quantity`/`price` (the effect runs after Angular renders).
  - Anyone can call `total.set(999)` and break the data invariant.
  - Every extra effect is another hidden data-flow path to trace when debugging.
- **`CartGood`**: turn `total` into a `computed` - the formula lives right at the declaration, the value is **synchronous within the same tick**, read-only, lazy and memoized. No effect left to maintain.

#### ❌→✅ Example 2: an effect re-triggering itself - infinite loop (AuditLogBad vs AuditLogGood)

- **How the loop happens**: an effect depends on **every signal it READS**. `AuditLogBad` reads `logCount()` and then calls `logCount.update(...)` in the same effect → logCount changes → the effect re-runs → reads + writes again → **infinite loop** (frozen app, CPU burn).
- **`untracked(() => ...)`** is the escape hatch: any signal read inside `untracked` does **not** become a dependency. `AuditLogGood` keeps only `user()` as the tracked signal, and wraps the `logCount` read/write in `untracked` → the effect runs only when `user` changes.
- Common situations that call for `untracked`:
  - The effect needs to **count/record** its own state (as in the example above).
  - Calling a function/service **that reads signals internally** without wanting to depend on them (e.g. `untracked(() => this.logger.log(...))`).
  - Reading the "current value" of a secondary signal without re-running the effect when it changes (track only the main signal).

#### Checklist before writing `effect()`

1. Can this value be **computed from other state**? → use `computed()`, stop here.
2. Need derived state the user can **override** (e.g. pre-select the first item when the list changes)? → `linkedSignal()`.
3. Need to **call an API** when a signal changes? → `resource()` / `rxResource()`, or call the function directly in the event handler.
4. What remains: log/analytics, `localStorage`, DOM/canvas/chart work, integrating libraries outside Angular → this is where `effect()` belongs.

> **Golden rule:** the ideal `effect` contains **no `.set()` line at all** - an effect looks inward (reads signals) and acts outward, never writing back into the signal system.
