#### ✔️ Solution: Use `switchMap` (Best Practice)

In RxJS, **`switchMap`** (and its sibling operators like `mergeMap`, `concatMap`, `exhaustMap`) is the perfect tool to fully solve the "Subscribe Hell" problem. It lets us "switch lanes" (Map) from an initial stream to a new Observable stream.

Based on the code above, the data flow is smoothly flattened through each transformation:

1. **Source stream:** Start by listening to `userService.isLoggedIn$`.
2. **`switchMap` Level 1 (switch to the Profile stream):**
   - If not logged in: return `EMPTY`. This transformation cuts off the data flow entirely, meaning nothing reaches the final `subscribe` body. Notably, when the user **logs out** (`isLoggedIn$` emits `false`), `switchMap` also **immediately unsubscribes from the Profile stream it is currently listening to** — something a plain `filter` cannot do.
   - If logged in: take the new Observable `userService.userProfile$` and substitute it for the source stream.
3. **`filter` (data filtering):** A gate that checks whether `profile` actually carries data. Only when `!!profile` is _true_ does the stream continue.
4. **`switchMap` Level 2 (switch to the Product API call stream):** Take the `code` from the profile that Level 1 just passed down and use it to call the `getProductByUserId()` API. Thanks to `switchMap`, this API's result becomes the data flowing on to the final `subscribe`.
5. **`takeUntilDestroyed` (lifecycle management):** When the component is destroyed, the subscription is cancelled automatically — closing out exactly the Memory Leak problem raised in the Subscribe Hell section.

**Results:**

- Goodbye to pyramid-shaped nested code (Pyramid of Doom) — the entire source is flattened into a straight line (Flat code).
- You control the data through a single Pipe.
- At the final `subscribe(...)`, the value received is the list of Products (emitted by Level 2) — just one single `subscribe` block for lifecycle management and shared handling! Everything becomes far clearer and easier to maintain.
