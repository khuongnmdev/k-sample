#### ✔️ Polling mechanism with `switchMap` + `timer` and `Signals`

In modern Angular, combining **Signals** and **RxJS** gives very flexible control over data flow.

How the example works:

1. **Convert the Signal into an Observable:**
   `toObservable(this.isLoggedIn)` turns the state Signal (Login/Logout) into an RxJS stream.
   This lets us apply RxJS operators to the user's behavior.

2. **Use `switchMap` to steer the stream:**
   - When `isLoggedIn` emits `true`: `switchMap` cancels the previous inner stream (if any) and starts `timer(0, 1000)`. The first poll runs **immediately**, then repeats every 1 second.
   - When `isLoggedIn` emits `false`: `switchMap` cancels the running `timer` stream and returns `EMPTY`. Polling stops right away, no manual `unsubscribe` needed.

3. **Automatic cleanup:**
   `takeUntilDestroyed(this.destroyRef)` releases the entire Subscription when the Component is destroyed (user leaves the page), avoiding Memory Leaks.

---

> **Why use `timer(0, 1000)` instead of `interval(1000)`?**
>
> `interval(1000)` must wait a full cycle before emitting its first value - after Login the user has to wait 1 second to see the first poll.
>
> `timer(0, 1000)` emits immediately at time 0, then repeats on the interval - exactly the desired polling behavior: data arrives as soon as polling is turned on.

---

**Benefits:**

- **Declarative code:** you only define "when to run" instead of hand-writing messy `setInterval` / `clearInterval` logic.
- **Safe:** `switchMap`'s self-cancelling mechanism prevents multiple counters running in parallel when the user clicks Login/Logout repeatedly.
