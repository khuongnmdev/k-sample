#### 🔄 Đối chiếu nhanh: decorator cũ vs signal-first

| Tình huống                     | Cách cũ (decorator)                                              | Cách mới (signal)                                  |
| :----------------------------- | :---------------------------------------------------------------- | :-------------------------------------------------- |
| Nhận dữ liệu từ cha            | `@Input() max = 5;`                                              | `readonly max = input(5);`                         |
| Input bắt buộc                 | `@Input({required: true}) label!: string;` (vẫn cần `!`)         | `readonly label = input.required<string>();`       |
| Phản ứng khi input đổi         | `ngOnChanges(changes)` + tự dò key                               | `computed(() => ... this.max() ...)` tự theo dõi   |
| Phát sự kiện                   | `@Output() done = new EventEmitter<number>();`                   | `readonly done = output<number>();`                |
| Two-way binding `[( )]`        | Cặp `@Input() quantity` + `@Output() quantityChange` + tự `.emit()` | `readonly quantity = model(1);` - một dòng       |
| Query view                     | `@ViewChild(...)` - `undefined` tới `AfterViewInit`              | `viewChild(...)` - signal, đọc ở đâu cũng an toàn  |

#### Ghi chú khi migrate dự án thật

- Hai thế giới **chạy chung được trong cùng một component** - migrate dần từng phần, không cần "big bang".
- Angular có sẵn schematics migrate tự động:
  - `ng generate @angular/core:signal-input-migration`
  - `ng generate @angular/core:output-migration`
  - `ng generate @angular/core:signal-queries-migration`
- Sau khi input/query đã là signal, component rất gần với **OnPush/Zoneless-ready** - phần thưởng hiệu năng đến gần như miễn phí.
