### 💡 Bốn API signal-first cho Component

| API                                    | Thay cho                          | Đặc điểm                                                                                                                                  |
| :------------------------------------- | :-------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------- |
| **`input()`** / `input.required<T>()`  | `@Input()`                        | **Read-only signal**: cha đổi giá trị → mọi `computed`/`effect` phụ thuộc tự chạy lại, không cần `ngOnChanges`. Có `transform` để ép kiểu. |
| **`output()`**                         | `@Output()` + `EventEmitter`      | Không phải signal - là API phát sự kiện thống nhất: `.emit()`, tự cleanup khi destroy, nhẹ hơn `EventEmitter` (không kéo RxJS vào).       |
| **`model()`**                          | Cặp `@Input()` + `@Output() ...Change` | **Writable signal input**: nhận từ cha và `.set()`/`.update()` ngược lại. Tự phát event `<tên>Change` → cha dùng thẳng `[( )]`.        |
| **`viewChild()`** / `contentChild()`   | `@ViewChild` / `@ContentChild`    | **Signal query**: đọc được trong `computed`/`effect`, tự cập nhật khi view tạo/hủy (kể cả trong `@if`/`@for`). Có bản `.required`.        |

_(Họ hàng đầy đủ: `viewChildren()`, `contentChildren()` trả về signal chứa mảng.)_

---

### Vì sao đáng chuyển?

1. **Reactive từ gốc**: input là signal nên compose thẳng vào `computed()` - hết cảnh copy input ra biến rồi đồng bộ bằng `ngOnChanges`.
2. **Type-safe hơn**: `input.required` báo lỗi **ngay lúc compile** nếu cha quên truyền; query `viewChild.required` hết cảnh `!` hay `?.` rải khắp nơi.
3. **Two-way binding một dòng**: `model()` gói trọn convention `<name>Change` mà trước đây phải viết tay hai property.
4. **Hết phụ thuộc lifecycle**: đọc query an toàn ở mọi thời điểm - chưa có view thì nhận `undefined` (thay vì phải canh đúng `AfterViewInit`), và vì là signal nên `computed`/`effect` tự chạy lại ngay khi view xuất hiện.
5. **Hòa vào OnPush/Zoneless**: mọi thay đổi đều là tín hiệu rõ ràng - đúng tinh thần trang Change Detection đầu buổi.
