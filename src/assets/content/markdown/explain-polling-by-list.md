#### ✔️ Cơ chế Polling dựa trên Danh sách (List ID)

Ví dụ thực tế: danh sách tham số đầu vào cho Polling có thể thay đổi liên tục (thêm / xóa ID).

Cấu trúc luồng xử lý:

1. **Lắng nghe danh sách (`toObservable`):**
   `listItem` là Signal chứa mảng ID.
   Biến nó thành Observable để mỗi lần mảng thay đổi, toàn bộ luồng phía sau được kích hoạt lại.

2. **Dừng hoặc chạy (`map` + `switchMap`):**
   - Mảng rỗng: trả về `of([])` - dừng polling và phát ra mảng rỗng để UI xóa kết quả cũ.
   - Mảng có phần tử: chuyển sang luồng `timer(0, 1000)` - poll ngay lập tức, sau đó lặp lại mỗi 1 giây.

3. **Luồng lồng nhau (Nested `switchMap`):**
   - Bên trong `timer`, dùng thêm một `switchMap` nữa để gọi `fetchDataByListItem`.
   - Vì sao? Nếu request trước chưa xong mà nhịp poll tiếp theo đã tới, hoặc danh sách vừa thay đổi, request cũ sẽ bị hủy ngay lập tức - tránh race condition và dữ liệu chồng chéo.

4. **Trả về `of([])` hay `EMPTY`?**
   - Xét về việc dừng polling: hai cách **như nhau** - luồng `timer` cũ bị `switchMap` hủy ngay khi giá trị mới tới, và luồng chính vẫn sống để chạy lại khi có ID mới.
   - Khác biệt nằm ở UI: `of([])` phát thêm đúng một giá trị (mảng rỗng) rồi complete, nên `result` được reset và màn hình xóa sạch kết quả.
   - `EMPTY` complete ngay mà **không phát gì** - `result` giữ nguyên giá trị cuối cùng, UI vẫn hiển thị dữ liệu cũ dù danh sách đã trống.

**Lợi ích:**

- **UI luôn đồng bộ:** kết quả hiển thị luôn khớp với danh sách ID hiện tại.
- **Tối ưu tài nguyên:** chỉ polling khi thật sự có dữ liệu cần theo dõi.
