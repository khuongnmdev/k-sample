#### ✔️ Giải pháp: Sử dụng `switchMap` (Best Practice)

Trong RxJS, **`switchMap`** (và các toán tử họ hàng như `mergeMap`, `concatMap`, `exhaustMap`) là công cụ hoàn hảo để giải quyết triệt để vấn đề "Subscribe Hell". Nó giúp chúng ta "bẻ lái" (Map) từ một luồng ban đầu sang một luồng Observable mới.

Dựa trên đoạn code vừa cập nhật, dòng chảy của dữ liệu được duỗi thẳng (Flatten) qua các phép biến đổi một cách mượt mà:

1. **Khởi đầu Luồng (Source):** Bắt đầu bằng việc lắng nghe `userService.isLoggedIn$`.
2. **`switchMap` Tầng 1 (Chuyển sang luồng Profile):**
   - Nếu `!isLoggedIn`: Lập tức `return EMPTY`. Phép biến đổi này ngắt luôn quá trình truyền dữ liệu xuống dưới cùng, đồng nghĩa với việc không có gì chạy vào thân hàm `subscribe` cuối cùng.
   - Nếu đã đăng nhập: Hàm lấy Observable mới là `userService.userProfile$` và đưa nó vào thay thế luồng gốc.
3. **`filter` (Trích lọc dữ liệu):** Cổng chắn kiểm tra `profile` có thực sự mang dữ liệu hay không. Chỉ khi `!!profile` là _true_ thì luồng mới được chảy tiếp.
4. **`switchMap` Tầng 2 (Chuyển sang luồng Gọi API Sản phẩm):** Lấy giá trị mã `code` từ luồng của Tầng 1 vừa truyền xuống, sau đó khởi tạo lời gọi API `getProductByUserId()`. Nhờ `switchMap`, chúng ta lại gỡ Observable từ API trả về này tiếp tục đẩy kết quả xuống.

**Kết quả mang lại:**

- Tạm biệt hình tháp đục khoét (Pyramid of doom), toàn bộ cấu trúc mã nguồn được đẩy ra ngoài cùng thẳng hàng (Flat code).
- Bạn có quyền điều khiển dữ liệu đi qua 1 đường ống (Pipe) duy nhất.
- Tại điểm tiếp nhận `subscribe(...)` cuối cùng, đối tượng nhận được chính là danh sách các Sản phẩm (từ Tầng 2 phát ra), chỉ một khối `subscribe` duy nhất để quản lý vòng đời và xử lý chung! Mọi thứ trở nên trong sáng và dễ dàng bảo trì gấp cực nhiều lần.
