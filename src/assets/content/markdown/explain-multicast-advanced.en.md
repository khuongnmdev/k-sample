## Advanced multicast: shareReplay() vs ReplaySubject

A quick refresher on 2 concepts used throughout this page:

- **Execution**: one actual run of the source Observable - the timer starts counting, the request is sent.
- **Late subscriber**: someone who subscribes AFTER the source has already emitted some values.

`share()` (see the Unicast vs Multicast page) lets every subscriber share 1 execution.
But late subscribers **miss** the values already emitted - arrive late and you only hear what's left.

`shareReplay(n)` and `ReplaySubject(n)` solve exactly this:
keep the **n most recent values** in a buffer, so late subscribers get them replayed immediately.

---

### 1. shareReplay(n) - share the execution + replay the n most recent values

Used just like `share()`: attach it after an existing source (HTTP, interval, websocket...).

- Every subscriber shares 1 execution - the side-effect runs only once for the whole group.
- A late subscriber IMMEDIATELY receives the n most recent values from the buffer, then keeps listening like everyone else.

The most important question when using it: **when the last subscriber leaves, what happens to the source?**
The `refCount` parameter is the answer:

| Situation              | `refCount: true`             | `refCount: false` (default)                        |
| :--------------------- | :--------------------------- | :------------------------------------------------- |
| When subscribers hit 0 | Tear down source + clear buffer | Nothing is torn down: an unfinished source keeps running in the background |
| Subscribing again later | Source runs FRESH from scratch | Gets the old buffer + joins the running execution |
| Suited to sources that | Are INFINITE (websocket, interval) | SELF-COMPLETE (HTTP request)                 |

> Full syntax: `shareReplay({bufferSize: n, refCount: true})`.
> The short form `shareReplay(n)` is always `refCount: false`.

**What are INFINITE vs SELF-COMPLETING sources?**

An Observable can emit a **complete** signal - meaning "done, no more values".

- **SELF-COMPLETING source**: emits its data then completes on its own. The classic case is an HTTP request - once the server returns the response, the stream closes immediately. Self-complete = self-cleanup, nothing keeps running behind the scenes.
- **INFINITE source**: NEVER completes on its own - keeps emitting until someone unsubscribes. Classic cases: `interval` (this very demo), a price websocket, `fromEvent` (click, scroll).
- What does this have to do with refCount? An infinite source only stops when unsubscribed, and `refCount: false` never unsubscribes for you - so an infinite source keeps running in the background forever = leak. A self-completing source is done once it completes, so no refCount setting can leak.

**Use cases for each mode:**

- **`refCount: true` - use for INFINITE sources:**
  - Coin/stock prices over websocket: 5 widgets share 1 connection. When the last widget closes, the real connection is torn down too.
  - GPS position, sensor data, a realtime clock shared by many components.
  - Why it's mandatory: an infinite source never ends on its own. If nobody tears it down, it runs in the background forever = **memory leak**.
- **`refCount: false` (default) - a "call once" cache for RARELY changing data:**
  - Selection criteria: a SELF-COMPLETING source (HTTP) and data that rarely changes within an app session.
  - Examples: brand config, feature flags, Category list, province/city list - the whole app makes exactly 1 request, the buffer serves as a cache for the rest of the session.
  - Components that mount late (Footer rendered after Header) get the result instantly from the buffer, no new request fired.
  - Why it's safe: the request completes right after returning its result - nothing keeps running in the background to leak.
  - The flip side: for frequently changing data (odds, wallet balance) do NOT cache like this - the buffer never refreshes itself. Use a live stream (websocket + `refCount: true`) or `resource` + `reload()`.

**Extra notes for completeness:**

- `windowTime` - limits the "age" of values in the buffer: `shareReplay({bufferSize: 1, windowTime: 5000})` only replays values no older than 5 seconds. Good for a cache with an expiry.
- Errors are NOT cached: if the source errors (HTTP fail), the buffer is cleared, and the next subscriber triggers a fresh run of the source. No fear of "caching an error forever".

---

### 2. ReplaySubject(n) - a Subject with memory

First, **what is a Subject?**
A special Observable where YOU actively emit values via `.next(value)` - no source needed behind it.
Emitted values are delivered to ALL listening subscribers (a Subject is inherently always multicast).

**ReplaySubject(n) = Subject + memory:**

- Keeps a buffer of the n most recent values.
- A late subscriber gets the entire buffer replayed IMMEDIATELY, then keeps listening as normal.
- Does not complete on its own: you manage its lifecycle - call `.complete()` when done. A `providedIn: 'root'` service that lives as long as the app usually doesn't need to.

**Details worth knowing:**

- `new ReplaySubject()` with NO n = an **unbounded** buffer - keeps every value from the start, easily eating memory. Always pass n explicitly.
- The 2nd parameter is `windowTime`: `new ReplaySubject(100, 5000)` only replays values no older than 5 seconds.
- Family relation: inside `shareReplay(n)` there is literally a `ReplaySubject(n)` - which is why the replay behavior is identical.

**Choosing the right member of the Subject family:**

| Criteria               | `Subject`                    | `BehaviorSubject(init)`  | `ReplaySubject(n)`            |
| :--------------------- | :--------------------------- | :----------------------- | :---------------------------- |
| Late subscriber gets   | Nothing at all               | 1 latest value           | n most recent values          |
| Needs an initial value | No                           | Yes                      | No                            |
| Synchronous `.value` read | No                        | Yes                      | No                            |
| Typical use case       | Firing events, no history needed | Always-has-a-value state | History of the n most recent events |

**Concrete use cases:**

- **Event bus with history:** NotificationService - a toast component that mounts later can still show the 3 most recent notifications.
- **Multi-step wizard:** step 3 mounting late still receives the choices the user emitted in steps 1 and 2.
- **Debug / audit tail:** keep the user's n most recent actions for a debug panel opened late.
- **`ReplaySubject(1)` instead of `BehaviorSubject`:** when no valid initial value exists yet. "Nothing to emit yet" is different from "emitting a fake default value" - subscribers won't mistakenly receive fake data.

---

### The essence underneath: everything is a Subject

`share()` and `shareReplay()` have no special magic of their own.
Internally, they place an **intermediate Subject** between the source and the subscribers.
The source has exactly 1 real subscriber, that Subject; all your subscribers listen through the Subject - and that's what makes it multicast.

| API you use            | Subject behind it      | Behavioral consequence                                                           |
| :--------------------- | :--------------------- | :------------------------------------------------------------------------------ |
| `share()`              | `Subject`              | No memory - late subscribers miss old values                                     |
| `shareReplay(n)`       | `ReplaySubject(n)`     | Buffers n values - late subscribers get a replay                                 |
| BehaviorSubject-style? | No ready-made operator | `share({connector: () => new BehaviorSubject(x)})` - needs an initial value      |

- A common mix-up: behind `shareReplay` is a **ReplaySubject**, NOT a BehaviorSubject. But `shareReplay(1)` gives behavior VERY close to a BehaviorSubject (late subscribers get the 1 most recent value) without requiring an initial value.
- In general: `shareReplay(n)` is really just `share()` pre-configured:

```typescript
shareReplay(n);
// equivalent to:
share({
  connector: () => new ReplaySubject(n), // WHICH Subject to put in the middle
  resetOnComplete: false, // keep the buffer as a cache after the source completes
  resetOnRefCountZero: false, // = refCount: false - no reset when subscribers hit 0
});
```

- Once you understand this layer, the whole share family boils down to one question: **"WHICH Subject goes in the middle, and when do we reset it?"**

---

### Overview comparison table

| Criteria             | shareReplay `refCount: true`       | shareReplay default            | `ReplaySubject(n)`             |
| :------------------- | :--------------------------------- | :----------------------------- | :----------------------------- |
| Nature               | Operator attached after a source   | Operator attached after a source | Subject - you emit yourself  |
| Who emits values     | The source behind it (cold)        | The source behind it (cold)    | You call `.next()`             |
| Late subscribers     | Get the n most recent values       | Get the n most recent values   | Get the n most recent values   |
| When subscribers hit 0 | Tear down source + clear buffer  | Source runs in background + buffer kept | Lives until you `.complete()` |
| Typical use case     | Websocket / sensor / infinite stream | One-shot cache for rarely changing data (brand config) | Event bus, n most recent events |

---

### Which one to pick?

- HTTP cache for data that rarely changes within a session (brand config, categories): default `shareReplay(1)` is enough.
- Sharing an infinite stream (websocket, interval): `shareReplay({bufferSize: n, refCount: true})` - you must think about refCount.
- Emitting values yourself + need replay for late subscribers: `ReplaySubject(n)`.
- Sharing a live stream with no history needed: plain `share()` is enough.
