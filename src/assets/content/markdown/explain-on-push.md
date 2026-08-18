### 💡 5 Trường hợp Kích hoạt Change Detection (CD) với `OnPush`

Sử dụng chiến lược `ChangeDetectionStrategy.OnPush` giúp Angular tối ưu hiệu suất bằng cách giới hạn số lần kiểm tra thay đổi. CD chỉ được kích hoạt khi:

1. **Giá trị binding của `@Input()` thay đổi**

* Angular so sánh giá trị binding bằng `Object.is`. Với kiểu nguyên thủy (string, number...), chỉ cần **giá trị** thay đổi. Với object/mảng, phải là một **tham chiếu mới**.
* **Lưu ý:** Nếu bạn thay đổi thuộc tính bên trong đối tượng (mutating) mà không tạo tham chiếu mới, CD sẽ không chạy.

2. **Kích hoạt Sự kiện (Event)**

* Một sự kiện DOM (như `click`, `submit`, `keydown`) được bind trong template của chính component đó **hoặc của bất kỳ component con cháu nào** (bất kể con dùng chiến lược CD gì).
* Khi event handler chạy, Angular gọi `markViewDirty` - đánh dấu component đó **và toàn bộ tổ tiên** là "cần kiểm tra".

3. **Kích hoạt Thủ công**

* Sử dụng `ChangeDetectorRef` để gọi một trong hai phương thức:
  * `this.cd.detectChanges()`: Buộc kiểm tra thay đổi ngay lập tức (và kiểm tra các component con).
  * `this.cd.markForCheck()`: Đánh dấu component là "cần kiểm tra" trong lần kiểm tra CD toàn bộ tiếp theo (được khuyến nghị hơn).

4. **Sử dụng `AsyncPipe`**

* Một `Observable` được liên kết với template thông qua **`AsyncPipe`** phát ra một giá trị mới.
* `AsyncPipe` tự động gọi `markForCheck()` mỗi khi nó nhận dữ liệu mới.

5. **Một `Signal` được đọc trong template thay đổi giá trị**

* Khi template đọc một signal (ví dụ `{{ codeMarkdown() }}`), Angular tự theo dõi signal đó. Signal đổi giá trị → component được đánh dấu cần refresh, **không cần** `AsyncPipe` hay `markForCheck()`.
* Đây chính là cơ chế giúp các component Signal trong app này (chạy Zoneless + OnPush) vẫn cập nhật UI mượt mà.
