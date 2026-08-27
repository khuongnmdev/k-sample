### 💡 5 Cases That Trigger Change Detection (CD) with `OnPush`

Using the `ChangeDetectionStrategy.OnPush` strategy helps Angular optimize performance by limiting how often it checks for changes. CD is only triggered when:

1. **An `@Input()` binding value changes**

* Angular compares binding values with `Object.is`. For primitives (string, number...), only the **value** needs to change. For objects/arrays, it must be a **new reference**.
* **Note:** If you mutate a property inside the object without creating a new reference, CD will not run.

2. **An Event fires**

* A DOM event (like `click`, `submit`, `keydown`) bound in the template of the component itself **or of any descendant component** (regardless of the child's CD strategy).
* When the event handler runs, Angular calls `markViewDirty` - marking that component **and all of its ancestors** as "needs checking".

3. **Manual Triggering**

* Use `ChangeDetectorRef` to call one of these two methods:
  * `this.cd.detectChanges()`: Forces a change check immediately (and checks child components).
  * `this.cd.markForCheck()`: Marks the component as "needs checking" during the next full CD pass (the recommended option).

4. **Using `AsyncPipe`**

* An `Observable` bound to the template via **`AsyncPipe`** emits a new value.
* `AsyncPipe` automatically calls `markForCheck()` every time it receives new data.

5. **A `Signal` read in the template changes its value**

* When the template reads a signal (e.g. `{{ codeMarkdown() }}`), Angular tracks that signal automatically. The signal's value changes → the component is marked for refresh, **no need** for `AsyncPipe` or `markForCheck()`.
* This is exactly the mechanism that lets the Signal components in this app (running Zoneless + OnPush) still update the UI smoothly.
