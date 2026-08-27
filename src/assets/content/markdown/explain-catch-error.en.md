#### ✔️ Solution: Use `catchError` to handle exceptions

In RxJS, the **`catchError`** operator is used to catch errors raised inside an Observable. When an error occurs, it lets us handle that error (e.g. log it) and return a new Observable to "rescue" the data stream or end the stream gracefully.

The code illustrates two main strategies:

1. **Inner catchError (local handling):**
   - Place `catchError` right inside `switchMap` (right after the inner Observable).
   - **Advantage:** If the inner API fails, we can return a default value (like `of(null)` or `of([])`). As a result, the outer source Observable **stays alive** and keeps listening for subsequent events.
   - This is the best way to make sure the UI does not "freeze up" when a single request runs into trouble.

2. **Outer catchError (global handling):**
   - Place `catchError` at the end of the main stream's `pipe` chain.
   - **Behavior:** If an error makes it all the way down here, the entire Observable stream **is cancelled (unsubscribed)**.
   - Typically used to catch serious errors that we cannot recover from at the levels above.

**Important note:** To keep an error from "crashing" the main stream, always prefer **Inner catchError** for API calls inside `switchMap`.
