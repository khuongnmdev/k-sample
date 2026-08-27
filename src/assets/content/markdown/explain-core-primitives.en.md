### 💡 The three core primitives of Signals

| Primitive      | Role                        | Characteristics                                                                                                            | Use when                                                                     |
| :------------- | :----------------------------- | :------------------------------------------------------------------------------------------------------------------ | :--------------------------------------------------------------------------- |
| **`signal()`** | **Root state** (writable)       | Read with `()`, write with `.set()` / `.update()`. The "source of truth" everything else reacts to.                   | User input, data from an API, UI state (open/closed, loading). |
| **`computed()`** | **Derived state** (read-only) | Tracks dependencies automatically, **lazy** (only computes when someone reads it) and **memoized** (unchanged dependencies return the cached value). | Any value computable from other state: total price, filtered list, validity flag. |
| **`effect()`** | **Side effect**                | Re-runs when a signal read inside it changes; runs at least once; auto-disposed with its injection context; has `onCleanup`.        | Reaching **outside** the signal system: logging, `localStorage`, DOM/chart, analytics. |

---

### Quick decision rule

> Ask yourself: _"Am I producing **new DATA**, or **affecting the outside world**?"_
>
> - Deriving data from other state → **`computed()`** (the vast majority of cases).
> - Reaching outside (log, storage, DOM, third-party libraries) → **`effect()`**.
> - Need derived state that is **still overridable** → newer Angular has `linkedSignal()`; need to **fetch data based on a signal** → `resource()` / `rxResource()` — even fewer reasons to overuse `effect`.

---

### Why be wary of `effect`?

1. **Runs after render** - effects are flushed while Angular synchronizes CD, so state an effect "syncs for you" is always **one tick behind** the UI.
2. **Easy to create loops** - an effect sets signal A, signal A triggers another effect that sets signal B... an update chain that is hard to trace; if an effect sets the very signal it reads, you get an infinite loop.
3. **Hides data flow** - reading a `computed` shows the formula immediately; logic inside an effect forces you to hunt for "who is setting this value?".
4. Need to read a signal **without** making the effect depend on it? Wrap it in `untracked(() => ...)`.
