### 💡 4 Trường hợp Kích hoạt Change Detection (CD) với `OnPush`

Sử dụng chiến lược `ChangeDetectionStrategy.OnPush` giúp Angular tối ưu hiệu suất bằng cách giới hạn số lần kiểm tra thay đổi. CD chỉ được kích hoạt khi:

1. **Thay đổi Tham chiếu của `@Input()`**

* Component cha truyền vào một đối tượng hoặc mảng **mới** (thay đổi tham chiếu bộ nhớ).
* **Lưu ý:** Nếu bạn thay đổi thuộc tính bên trong đối tượng (mutating) mà không tạo tham chiếu mới, CD sẽ không chạy.

2. **Kích hoạt Sự kiện (Event)**

* Một sự kiện DOM (như `click`, `submit`, `keydown`) được kích hoạt **từ bên trong** template của chính component đó (hoặc component con đang sử dụng `Default` CD).

3. **Sử dụng `AsyncPipe`**

* Một `Observable` được liên kết với template thông qua **`AsyncPipe`** phát ra một giá trị mới.
* `AsyncPipe` tự động gọi `markForCheck()` mỗi khi nó nhận dữ liệu mới.

4. **Kích hoạt Thủ công**

* Sử dụng `ChangeDetectorRef` để gọi một trong hai phương thức:
  * `this.cd.detectChanges()`: Buộc kiểm tra thay đổi ngay lập tức (và kiểm tra các component con).
  * `this.cd.markForCheck()`: Đánh dấu component là "cần kiểm tra" trong lần kiểm tra CD toàn bộ tiếp theo (được khuyến nghị hơn).
