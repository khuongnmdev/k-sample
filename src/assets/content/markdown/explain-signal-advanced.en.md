## Signal Advanced: linkedSignal - Custom Equality - Router Input Binding

Three tools for those already fluent with the `signal` / `computed` / `effect` trio.
What they share: all three solve situations the basic trio handles awkwardly.

---

### 1. linkedSignal - "a WRITABLE computed"

Put them side by side and the gap `linkedSignal` fills is obvious:

| Criteria                          | `signal()` | `computed()` | `linkedSignal()` |
| :-------------------------------- | :--------- | :----------- | :--------------- |
| User can override (`.set()`)      | Yes        | No           | Yes              |
| Recomputes when the source changes | No         | Yes          | Yes              |

The Betslip example in the demo - the `oddsChanged` flag:

- The user must be able to **turn the flag off** (click "Accept new odds") - it must be writable, `computed` can't do that.
- But when `odds` (the source) changes, the flag must **turn itself back on** - a plain `signal` won't do that by itself.
- Using `signal` + `effect` to re-enable it: it works, but that is exactly the "effect sets another signal" anti-pattern warned about on the Core Primitives page.
- UX note: the stake the user is typing is a plain `signal`, untouched when odds change - never destroy data the user is entering.

Two syntax forms:

```ts
// Short form: every signal read inside the callback is a recompute source
readonly selected = linkedSignal(() => this.products()[0]);

// Full form: separate source, with access to the PREVIOUS value
readonly oddsChanged = linkedSignal({
  source: this.odds,
  computation: (odds, previous) => previous !== undefined,
});
```

**Concrete use cases:**

- **Betslip**: odds change -> the "needs re-confirmation" flag turns itself on, the user's stake is kept (a stricter policy: also reset the stake - that's just another linkedSignal).
- **Selection tied to a list**: the list reloads -> the selected item resets to the first element (or is kept if it still exists - use `previous`).
- **Pagination**: changing the filter/keyword resets the page to 1, but the user can still switch pages.
- **Form draft per entity**: opening a different record resets half-typed fields to the new record's values.

> Don't overuse it: if the user does NOT need to override, `computed` is still the right choice - simpler and impossible to set incorrectly.

---

### 2. Custom Equality - teaching a signal what "unchanged" means

The mechanism: on every `.set()` / `.update()`, the signal compares the new value with the old one.
"Unchanged" means **nobody gets notified** - computed doesn't recompute, effect doesn't run, template doesn't render.

The default comparison is `Object.is`:

- Primitives (number, string, boolean): compared by value - works exactly as expected.
- **Object / array: compared by REFERENCE** - this is the source of two opposite traps:

| Trap                   | Situation                                                          | Consequence                                  |
| :--------------------- | :----------------------------------------------------------------- | :------------------------------------------- |
| **Redundant notify**   | Polling/refetch returns a NEW object with IDENTICAL content        | computed/effect/render rerun for nothing     |
| **No update**          | Mutating the object in place then `.set()` with the SAME reference | UI stays frozen even though the data changed |

The right fixes:

- Redundant-notify trap: add an `equal` that compares by content - `signal(value, {equal: (a, b) => ...})`.
- No-update trap: **always update immutably** - `update((u) => ({...u, age: 99}))`, never mutate in place.
- `computed` accepts the exact same `equal`: it stops propagation when the computed result is equivalent.

**Concrete use cases:**

- **Polling** (the Polling Demo page): the server returns the same data every tick - `equal` makes the UI render only when the data has REALLY changed.
- **Coordinate objects / complex filters**: `{x, y}` or `{page, sort, keyword}` are recreated every time but often carry the same content.
- Note: the `equal` function runs on EVERY set - keep it cheap (compare a few fields), avoid `JSON.stringify` for large objects.

---

### 3. withComponentInputBinding - URL params flow straight into input()

Enable it once in `app.config.ts`:

```ts
provideRouter(routes, withComponentInputBinding());
```

From then on, components inside a route are bound automatically: **route data, path params, query params** flow into any `input()` with a matching name (on a name clash the priority is: data > path param > query param).

Compared with the old way:

| Old way (ActivatedRoute)                  | New way (input binding)                      |
| :---------------------------------------- | :------------------------------------------- |
| Inject + subscribe `paramMap`             | Declare a matching-name `input()` - done     |
| Must remember to unsubscribe              | Nothing to unsubscribe                       |
| Convert string -> number manually         | `input({transform: numberAttribute})`        |
| Value lives outside the signal world      | It's a signal - feed it straight into computed/resource |

**Concrete use cases:**

- **Detail page**: `products/:id` - feed `id()` straight into `httpResource(() => '/api/products/' + this.id())`, URL changes -> automatic refetch.
- **Filter / tab / voucher in the URL**: share the link with a colleague and they see the exact same state, and F5 doesn't lose it.
- **Easier testing**: the component depends only on `input()`, no need to mock ActivatedRoute.

---

### Key takeaways

- Need derived state the user can override: `linkedSignal` - don't use an effect to auto-reset.
- Signal holding an object: immutable update is mandatory; consider `equal` when identical data gets set repeatedly.
- Params from the URL: enable `withComponentInputBinding` once, and no component in the app needs to inject ActivatedRoute anymore.
