#### ✔️ Polling mechanism driven by a List (List ID)

Real-world example: the input parameter list for Polling can change constantly (add / remove IDs).

How the processing flow is structured:

1. **Listen to the list (`toObservable`):**
   `listItem` is a Signal holding an array of IDs.
   Turn it into an Observable so that every time the array changes, the whole downstream flow is re-triggered.

2. **Stop or run (`map` + `switchMap`):**
   - Empty array: return `of([])` - stop polling and emit an empty array so the UI clears the old results.
   - Array has items: switch to a `timer(0, 1000)` stream - poll immediately, then repeat every 1 second.

3. **Nested streams (Nested `switchMap`):**
   - Inside the `timer`, use another `switchMap` to call `fetchDataByListItem`.
   - Why? If the previous request hasn't finished when the next poll tick arrives, or the list has just changed, the old request is cancelled immediately - avoiding race conditions and overlapping data.

4. **Return `of([])` or `EMPTY`?**
   - As far as stopping polling goes: the two are **the same** - the old `timer` stream is cancelled by `switchMap` as soon as a new value arrives, and the main stream stays alive to run again when new IDs come in.
   - The difference is in the UI: `of([])` emits exactly one value (the empty array) then completes, so `result` is reset and the screen is cleared.
   - `EMPTY` completes immediately **without emitting anything** - `result` keeps its last value, and the UI still shows old data even though the list is empty.

**Benefits:**

- **UI always in sync:** the displayed results always match the current list of IDs.
- **Resource-efficient:** only poll when there is actually data to watch.
