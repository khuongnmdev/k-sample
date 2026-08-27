#### 🔄 Quick comparison: old decorators vs signal-first

| Scenario                       | Old way (decorator)                                              | New way (signal)                                    |
| :----------------------------- | :---------------------------------------------------------------- | :-------------------------------------------------- |
| Receive data from the parent   | `@Input() max = 5;`                                              | `readonly max = input(5);`                         |
| Required input                 | `@Input({required: true}) label!: string;` (still needs `!`)     | `readonly label = input.required<string>();`       |
| React when an input changes    | `ngOnChanges(changes)` + checking the keys yourself                 | `computed(() => ... this.max() ...)` tracks automatically   |
| Emit an event                  | `@Output() done = new EventEmitter<number>();`                   | `readonly done = output<number>();`                |
| Two-way binding `[( )]`        | Pair of `@Input() quantity` + `@Output() quantityChange` + manual `.emit()` | `readonly quantity = model(1);` - one line       |
| View query                     | `@ViewChild(...)` - `undefined` until `AfterViewInit`            | `viewChild(...)` - a signal, safe to read anywhere  |

#### Notes for migrating a real project

- The two worlds **can coexist in the same component** - migrate gradually, no "big bang" needed.
- Angular ships automatic migration schematics:
  - `ng generate @angular/core:signal-input-migration`
  - `ng generate @angular/core:output-migration`
  - `ng generate @angular/core:signal-queries-migration`
- Once inputs/queries are signals, the component is very close to **OnPush/Zoneless-ready** - the performance reward comes almost for free.
