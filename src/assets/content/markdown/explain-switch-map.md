#### ✔️ Giải pháp: Sử dụng `switchMap` (Best Practice)

Trong RxJS, **`switchMap`** (và các toán tử họ hàng như `mergeMap`, `concatMap`, `exhaustMap`) là công cụ hoàn hảo để giải quyết triệt để vấn đề "Subscribe Hell". Nó giúp chúng ta "bẻ lái" (Map) từ một luồng ban đầu sang một luồng Observable mới.

Dựa trên đoạn code phía trên, dòng chảy của dữ liệu được duỗi thẳng (Flatten) qua các phép biến đổi một cách mượt mà:

1. **Khởi đầu Luồng (Source):** Bắt đầu bằng việc lắng nghe `userService.isLoggedIn$`.
2. **`switchMap` Tầng 1 (Chuyển sang luồng Profile):**
   - Nếu chưa đăng nhập: trả về `EMPTY`. Phép biến đổi này ngắt luôn quá trình truyền dữ liệu xuống dưới, đồng nghĩa với việc không có gì chạy vào thân hàm `subscribe` cuối cùng. Đặc biệt, khi user **logout** (`isLoggedIn$` phát ra `false`), `switchMap` còn **unsubscribe ngay luồng Profile đang lắng nghe** — điều mà `filter` đơn thuần không làm được.
   - Nếu đã đăng nhập: lấy Observable mới là `userService.userProfile$` và đưa nó vào thay thế luồng gốc.
3. **`filter` (Trích lọc dữ liệu):** Cổng chắn kiểm tra `profile` có thực sự mang dữ liệu hay không. Chỉ khi `!!profile` là _true_ thì luồng mới được chảy tiếp.
4. **`switchMap` Tầng 2 (Chuyển sang luồng Gọi API Sản phẩm):** Lấy mã `code` từ profile mà Tầng 1 vừa truyền xuống để gọi API `getProductByUserId()`. Nhờ `switchMap`, kết quả của API này lại trở thành dữ liệu chảy tiếp xuống `subscribe` cuối cùng.
5. **`takeUntilDestroyed` (Quản lý vòng đời):** Khi component bị destroy, subscription tự động được hủy — khép lại đúng vấn đề Memory Leak đã nêu ở phần Subscribe Hell.

**Kết quả mang lại:**

- Tạm biệt kiểu code lồng nhau hình kim tự tháp (Pyramid of Doom), toàn bộ mã nguồn được duỗi thẳng hàng (Flat code).
- Bạn có quyền điều khiển dữ liệu đi qua 1 đường ống (Pipe) duy nhất.
- Tại điểm tiếp nhận `subscribe(...)` cuối cùng, đối tượng nhận được chính là danh sách các Sản phẩm (từ Tầng 2 phát ra), chỉ một khối `subscribe` duy nhất để quản lý vòng đời và xử lý chung! Mọi thứ trở nên sáng sủa và dễ bảo trì hơn hẳn.
