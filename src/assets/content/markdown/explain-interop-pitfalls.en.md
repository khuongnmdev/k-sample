#### ⚠️ Four traps when crossing the bridge

1. **`toObservable` emits asynchronously and coalesces values**

- The underlying mechanism is an `effect`: multiple consecutive `.set()` calls in the same tick produce only **one** emission carrying the final value.
- Don't expect `BehaviorSubject.next()` behavior (synchronous emission of every value). Need to emit each discrete event? Use a real `Subject`.

2. **`toSignal` subscribes immediately (eager)**

- Unlike the `async` pipe (lazy - waits for template render), `toSignal` subscribes **right at the declaration line** and keeps the subscription until the injector is destroyed.
- Putting `toSignal(http.get(...))` in a field means the request fires as soon as the component initializes - even if the template never reads the value.

3. **Stream errors → reading the signal throws**

- If the source Observable errors, the error is "re-thrown" at the place the signal is **read** (usually in the template!).
- Rule: always `catchError` **before** passing into `toSignal`.

4. **Stream completes → the signal "freezes"**

- Once the source completes, the signal keeps the last value forever. If you want the data to stay "alive", the source must be a still-open stream.

> Both `toSignal` and `toObservable` need an **injection context** (field initializer / constructor), or pass `{injector}` when calling elsewhere.
