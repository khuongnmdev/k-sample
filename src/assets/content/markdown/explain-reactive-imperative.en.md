## Comparing Imperative vs Reactive Programming (Signals)

To clearly understand the difference between the two mental models, let's analyze how each side handles the same problem: showing the Delete button based on the login state (`isLoggedIn`) and the user role (`userRole`).

Both components handle the exact SAME `login()` event - the only difference lies in how state is updated and kept in sync after that event.

---

### 1. Imperative State (Imperative Programming)

In the traditional approach, you describe every execution step by hand and control the timing of state updates yourself.

| Aspect                | Details                                                                                                                                                                                                                  |
| :-------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Core mindset**      | "How do we update the UI?" (**How** to do)                                                                                                                                                                               |
| **Data model**        | **Pull** - the result variable `showDeleteButton` has no idea when its sources change. You must actively "pull" the new value by calling the recompute function at exactly the right moment.                              |
| **Execution flow**    | In `login()`, you assign `isLoggedIn`, then `userRole`, then you **must remember to manually call** `updateDeleteButton()` to update the result variable.                                                                 |
| **Drawback**          | **Very high risk of forgetting an update call**: if any place changes `isLoggedIn` or `userRole` and forgets to call `updateDeleteButton()`, the UI immediately drifts out of sync with the actual data.                  |

---

### 2. Signal State (Reactive Programming - Angular Signals)

The recommended approach for modern Angular (v16+): combining the intuitiveness of Imperative with the automatic synchronization of Reactive.

| Aspect                | Details                                                                                                                                                                                                                  |
| :-------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Core mindset**      | "What should the UI show?" (**What** to show) - you only declare the relationships between states, without directing each step.                                                                                           |
| **Data model**        | **Push** - when `isLoggedIn` or `userRole` changes, a notification is **automatically pushed** to every dependent: the `computed` is marked for recomputation and the UI is updated, with no manual call needed.          |
| **Execution flow**    | In `login()`, you only need to `.set()` the source values. `computed()` automatically records its dependencies (`isLoggedIn`, `userRole`) on the first read and recomputes `showDeleteButton` every time a source changes.              |
| **Advantage**         | **Lean and safe**: the dependency relationship is declared exactly once, updates can never be forgotten, and there is no need to subscribe/unsubscribe as with RxJS.                                                                 |

> Technical note: Signals are actually a **push-pull** model - the change notification is _pushed_ immediately, but the new value is only _recomputed_ when someone reads it (pull, lazy evaluation). This avoids wasted computations when nobody uses the result.

---

### Overall comparison table

| Comparison criteria      | Imperative                                    | Angular Signals                                  |
| :----------------------- | :-------------------------------------------- | :----------------------------------------------- |
| **Data model**           | **Pull** - manually pull / recompute          | **Push** - changes are pushed to dependents      |
| **Update mechanism**     | Manual (call `updateDeleteButton()`)          | Automatic via dependency tracking                |
| **Reliability**          | Low (easy to forget a call, UI drifts)        | High (updates cannot be forgotten)               |
| **Syntax**               | Simple but bloats as logic grows              | Concise, declared once                           |
| **Subscription management** | None                                       | Not needed (no memory-leak worries like RxJS)    |
| **Performance**          | Depends on global CD, updates easily missed with OnPush | Fine-grained, ready for Zoneless / OnPush        |

---

### Recommended conclusion

- Switch to **Declarative** thinking: define the _relationships_ between states (What) instead of instructing the computer _step by step_ how to update (How), and let the system **push** changes to wherever they are needed.
- Use **Angular Signals** (`signal` + `computed`) for synchronous logic and local derived state in components - concise, correct, and performance-optimized.
