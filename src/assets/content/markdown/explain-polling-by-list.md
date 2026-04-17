#### ✔️ Cơ chế Polling dựa trên Danh sách (List ID)

Đây là một ví dụ thực tế về việc quản lý trạng thái phức tạp hơn khi danh sách tham số đầu vào cho Polling có thể thay đổi liên tục.

Cấu trúc luồng xử lý:

1. **Lắng nghe Danh sách (toObservable):**
   Biến `listItem` là một Signal chứa mảng các ID. Chúng ta biến nó thành Observable để mỗi khi mảng này thay đổi (thêm/xóa phần tử), toàn bộ logic phía sau sẽ được kích hoạt lại.

2. **Dừng hoặc Chạy (map + switchMap):**
   - Chúng ta kiểm tra độ dài của mảng. Nếu mảng rỗng (`!list.length`), `switchMap` sẽ trả về `of([])`. Điều này không chỉ dừng việc gọi API mà còn xóa sạch dữ liệu cũ trên giao diện.
   - Nếu mảng có dữ liệu, `switchMap` chuyển hướng sang một luồng `interval`.

3. **Luồng lồng nhau (Nested SwitchMap):**
   - Bên trong luồng `interval`, chúng ta sử dụng thêm một `switchMap` nữa để gọi hàm `fetchDataByListItem`.
   - **Tại sao lại dùng `switchMap` ở đây?** Để đảm bảo rằng nếu một request API trước đó chưa xong mà nhịp `interval` tiếp theo đã tới, hoặc danh sách `listItem` bị thay đổi, thì request cũ sẽ bị hủy bỏ ngay lập tức, tránh xung đột dữ liệu.

4. **Sự khác biệt giữa `EMPTY` và `of([])`:**
   - Trong ví dụ này, khi dừng polling (danh sách rỗng), ta trả về `of([])`. Việc này giúp phát ra một giá trị cuối cùng là mảng rỗng, khiến giao diện người dùng (UI) được cập nhật trạng thái "trống". Nếu dùng `EMPTY`, luồng sẽ kết thúc âm thầm và giữ nguyên dữ liệu cũ trên màn hình.

**Lợi ích:**
- **Đồng bộ hóa tuyệt đối:** UI luôn hiển thị dữ liệu khớp với danh sách ID hiện tại.
- **Tối ưu băng thông:** Chỉ thực hiện polling khi thực sự có dữ liệu cần theo dõi.
