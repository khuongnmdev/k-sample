# Key Takeaways

Recapping the journey from Change Detection to Best Practices:

### 1. Change Detection: let Angular know when to render

- Plain variables (Imperative) emit no signal to Angular - the UI only "survives" thanks to zone.js + Default CD scanning the whole tree.
- **Signal + OnPush/Zoneless** is modern Angular's optimal model: a signal changes value, exactly that component gets refreshed.

### 2. The right primitive for the right job: signal - computed - effect

- `signal` for source state, `computed` for derived state (lazy + memoized), `effect` **only** for side effects (log, storage, DOM, chart).
- Don't use `effect` to set another signal - that's a sign you need `computed` (or `linkedSignal`).
- Component communication is signal-first too: `input()`, `output()`, `model()`, `viewChild()` replace the old `@Input`/`@Output`/`@ViewChild` decorator set.

### 3. Reactive instead of Imperative

- Declare the **data flow** ("when it should run") instead of manually assigning values and updating the UI yourself.
- `Observable` for complex async streams/events, `Signal` for display state - and `toSignal`/`toObservable` bridge the two worlds.
- The "round-trip bridge" pattern: Signal → `toObservable` → operators (debounce, switchMap...) → `toSignal` → template.
- For pure data fetching, `resource()` / `httpResource()` (experimental) packages that whole pattern with `status`/`isLoading`/`reload` and auto-cancels stale requests.

### 4. switchMap instead of nested Subscribes

- Dependent processing chains: use `switchMap` to "steer" the stream - flat code, a single `subscribe`, the old stream is auto-cancelled when a new value arrives.
- Don't forget `takeUntilDestroyed` to prevent Memory Leaks.

### 5. Always have a catchError strategy

- Catch errors **in each inner Observable** (inside `switchMap`) to isolate failures and keep the main stream alive.
- An uncaught error "kills" the whole stream - every feature depending on that stream stops updating from that moment on.

### 6. Clean polling with timer + switchMap

- `timer(0, INTERVAL)` + `switchMap` + an on/off condition from a Signal - polling stops and restarts by itself based on state, no manual `setInterval`/`clearInterval`.

### 7. share() when many places listen together

- Observables are **Unicast** by default - each subscriber gets its own execution (duplicate HTTP requests!).
- `share()` / `shareReplay(1)` turns the stream into **Multicast** - one shared execution, placed right inside the shared Service.

### 8. Component displays - Service processes

- Service: business logic, HTTP, shared state, designing the Observable "pipes".
- Component: decides **what** is displayed and is the one who `subscribe`s.

---

## 🙏 Thank you!

**Questions & Answers** - please ask your questions!
