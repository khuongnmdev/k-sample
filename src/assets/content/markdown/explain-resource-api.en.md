### 💡 The three "flavors" of Resource

| API                | Loader returns   | Import from                     | Use when                                                                 |
| :----------------- | :--------------- | :------------------------------ | :------------------------------------------------------------------------ |
| **`resource()`**   | `Promise`        | `@angular/core`                 | Any async function: `fetch`, third-party SDK, IndexedDB...               |
| **`rxResource()`** | `Observable`     | `@angular/core/rxjs-interop`    | An existing service that already returns an Observable (HttpClient, store...). |
| **`httpResource()`** | (built-in HTTP) | `@angular/common/http`          | Signal-driven HTTP GET: just provide a **reactive URL**, no loader needed. |

All three return a **ResourceRef** with one unified set of signals: `value()`, `status()`, `error()`, `isLoading()` + `reload()` and `hasValue()`. The only difference: **how much of the pipeline you still have to write yourself**.

---

### ❌ Before: hand-wiring the whole pipeline

To "fetch a user by `userId`" with proper loading/error state, we had to write this entire scaffolding ourselves:

```typescript
readonly userId = signal(1);

// Hand-wired: switchMap + error handling + loading state
private readonly userState$ = toObservable(this.userId).pipe(
  switchMap((id) =>
    this.http.get<User>(`/api/users/${id}`).pipe(
      map((data) => ({loading: false, data, error: null})),           // wrap the data
      startWith({loading: true, data: null, error: null}),            // hand-made loading state
      catchError((error) => of({loading: false, data: null, error})), // hand-made error state
    ),
  ),
);

// ...only then do we get back to the Signal world
readonly userState = toSignal(this.userState$, {
  initialValue: {loading: true, data: null, error: null},
});
```

Four operators, one self-defined state shape `{loading, data, error}` - and **every component** doing data fetching repeats this exact same scaffolding.

---

### ✅ Now: pick one of three, depending on what you already have

```typescript
// 1. resource() - you have any ASYNC function (fetch, SDK, IndexedDB...)
readonly user = resource({
  params: () => this.userId(),
  loader: ({params: id, abortSignal}) =>
    fetch(`/api/users/${id}`, {signal: abortSignal}).then((r) => r.json()),
});

// 2. rxResource() - your service ALREADY returns an Observable: keep the service,
//    just throw away the hand-made map/startWith/catchError/toSignal
readonly user = rxResource({
  params: () => this.userId(),
  stream: ({params: id}) => this.http.get<User>(`/api/users/${id}`),
});

// 3. httpResource() - just an HTTP GET? All you need is the URL
readonly user = httpResource<User>(() => `/api/users/${this.userId()}`);
```

One-to-one mapping when used in the template:

| Hand-made (`userState()`)  | Resource (`user`)                                   |
| :------------------------- | :--------------------------------------------------- |
| `userState().loading`      | `user.isLoading()`                                  |
| `userState().data`         | `user.value()`                                      |
| `userState().error`        | `user.error()`                                      |
| _(you'd have to write it yourself)_ | `user.status()`, `user.reload()`, `user.hasValue()` |

---

### Quick way to remember

> `computed` is a **synchronous** derivation, while `resource` is an **asynchronous** derivation - same philosophy of "declare the formula, Angular handles the rest". The three flavors only differ in what you hand it: a `Promise`, an `Observable`, or just a **URL**.
