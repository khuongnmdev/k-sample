### 💡 Four signal-first APIs for Components

| API                                    | Replaces                          | Highlights                                                                                                                                  |
| :------------------------------------- | :-------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------- |
| **`input()`** / `input.required<T>()`  | `@Input()`                        | **Read-only signal**: parent changes the value → every dependent `computed`/`effect` re-runs, no `ngOnChanges` needed. Has `transform` for coercion. |
| **`output()`**                         | `@Output()` + `EventEmitter`      | Not a signal - a unified event-emitting API: `.emit()`, auto cleanup on destroy, lighter than `EventEmitter` (no RxJS pulled in).       |
| **`model()`**                          | Pair of `@Input()` + `@Output() ...Change` | **Writable signal input**: receives a value from the parent and can `.set()`/`.update()` back. Auto-emits a `<name>Change` event → parent can use `[( )]` directly.        |
| **`viewChild()`** / `contentChild()`   | `@ViewChild` / `@ContentChild`    | **Signal query**: readable inside `computed`/`effect`, auto-updates when the view is created/destroyed (even inside `@if`/`@for`). Has a `.required` variant.        |

_(The full family: `viewChildren()`, `contentChildren()` return a signal holding an array.)_

---

### Why is it worth migrating?

1. **Reactive from the ground up**: inputs are signals so they compose straight into `computed()` - no more copying inputs into fields and syncing them via `ngOnChanges`.
2. **More type-safe**: `input.required` errors **right at compile time** if the parent forgets to pass it; `viewChild.required` queries eliminate `!` and `?.` scattered everywhere.
3. **Two-way binding in one line**: `model()` wraps the whole `<name>Change` convention that used to take two hand-written properties.
4. **No more lifecycle dependence**: queries are safe to read at any time - you get `undefined` before the view exists (instead of having to wait for `AfterViewInit`), and since it is a signal, `computed`/`effect` re-run as soon as the view appears.
5. **Fits OnPush/Zoneless**: every change is an explicit signal - exactly in the spirit of the Change Detection page from the start of the session.
