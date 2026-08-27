## Comparing RxJS Unicast vs Multicast (share)

In RxJS, understanding how data is delivered to Observers (listeners) is essential to avoid wasting resources and repeating unnecessary side-effects.

---

### 1. Unicast Observable (Default)

By default, most Observables in RxJS are **Unicast** (also called **Cold Observables**).

- **How it works**: Every time `.subscribe()` is called, the source Observable **sets up and runs a completely new execution**.
- **Characteristics**:
  - Each Subscriber receives its own independent stream of values, out of phase with other Subscribers.
  - Side-effects (HTTP API calls, starting an `interval` timer...) are **run repeatedly**, once per Subscriber.
  - Calling `.subscribe()` 3 times on the same HttpClient stream → Angular sends **3 separate HTTP requests** to the server.

---

### 2. Multicast Observable (`share()`)

**Multicast** delivers data from a single execution to many Subscribers at once.

- **How it works**: When the first Subscriber subscribes, the source Observable starts running. Subscribers that come later **listen in on and share that same running execution**.
- **Characteristics**:
  - All Subscribers receive identical values at the same moment.
  - Side-effects run **exactly once**, no matter how many Subscribers there are.
  - A late Subscriber will **not receive** values emitted before it subscribed, only values from the moment of subscription onward (to replay the latest value for latecomers, use `shareReplay()`).
  - Enabled simply by attaching the `.pipe(share())` operator.
  - Because it still "waits" for the first Subscriber before running, and resets itself when there are no Subscribers left (the refCount mechanism), a stream created by `share()` is often called **"warm"** - sitting between purely Cold and Hot.

---

### 3. Recognizing Cold / Hot Observables in practice

> Note the distinction between **two different conceptual axes**: _Unicast/Multicast_ is about **how many Subscribers share one execution**, while _Cold/Hot_ is about **whether the producer lives inside or outside the Observable**. The two axes usually go together (Cold ↔ Unicast, Hot ↔ Multicast) but they are not the same thing.

**Cold (Unicast)** - data is "produced" inside the Observable, and only starts running when someone subscribes:

- `HttpClient.get()` / `post()`... - each subscribe is a new HTTP request
- `of(...)`, `from(...)` - replay the value sequence from the start for each Subscriber
- `interval(...)`, `timer(...)` - each Subscriber owns its own timer
- `ajax(...)`, `fromFetch(...)`

**Hot (Multicast)** - data is "produced" by an external source, emitted whether anyone is listening or not:

- `fromEvent(...)` - DOM events (click, scroll, keyup...)
- `Subject`, `BehaviorSubject`, `ReplaySubject` (note: unlike `share()`, both `BehaviorSubject` and `ReplaySubject` **do** replay stored values to late Subscribers)
- `FormControl.valueChanges`, `Router.events` in Angular
- `webSocket(...)` - a real-time stream from the server, multicast through an internal Subject (the connection only opens when the first Subscriber arrives)

> Note: a Cold Observable can be turned into Multicast ("warm" - see the note in section 2) by attaching `share()` / `shareReplay()`.

---

### Unicast vs Multicast overview table

| Criteria                        | Unicast (Default)                        | Multicast (`share()`)                        |
| :------------------------------ | :--------------------------------------- | :------------------------------------------- |
| **Number of executions**        | 1 execution per Subscriber               | 1 execution shared by all                    |
| **Timers / Frequency**          | Run out of phase, depending on subscribe time | Run in phase, synchronized              |
| **HTTP Requests**               | Duplicated (duplicate API calls)         | Exactly 1 API call sent, result shared       |
| **Resource efficiency**         | Poor (with many listeners)               | Good                                         |
| **Enabling operator**           | Default, no operator needed              | `.pipe(share())` or `.pipe(shareReplay())`   |

---

### The most representative real-world example

When you have some system configuration data (e.g. a Category list) that must be displayed in the **Header Component**, **Sidebar Component**, and **Footer Component**:

- **Unicast**: all 3 components subscribe to the raw HTTP stream → **3 requests sent to the server**.
- **Multicast**: use `shareReplay(1)` → **exactly 1 request** is sent to the server, and all 3 components share the result instantly.

> 👉 This is also the bridge to the **Service Best Practices** page: when a Service exposes a stream shared by many components, attach `share()` / `shareReplay(1)` right inside the Service so the whole app pays the side-effect cost exactly once.
