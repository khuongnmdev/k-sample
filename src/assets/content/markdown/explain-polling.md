#### ✔️ Cơ chế Polling với `switchMap` và `Signals`

Trong Angular hiện đại, việc kết hợp giữa **Signals** và **RxJS** mang lại khả năng kiểm soát luồng dữ liệu cực kỳ mạnh mẽ.

Trong ví dụ này, quy trình hoạt động như sau:

1. **Chuyển đổi Signal thành Observable:**
   Chúng ta sử dụng `toObservable(this.isLoggedIn)` để biến một Signal trạng thái (Login/Logout) thành một dòng dữ liệu RxJS. Việc này cho phép chúng ta sử dụng các toán tử mạnh mẽ của RxJS trên hành vi của người dùng.

2. **Sử dụng `switchMap` để điều hướng:**
   - Khi `isLoggedIn` phát ra giá trị `true`: `switchMap` sẽ hủy bỏ bất kỳ luồng con nào trước đó và khởi tạo một `interval(1000)`. Bộ đếm này bắt đầu chạy và phát ra sự kiện mỗi 1 giây.
   - Khi `isLoggedIn` phát ra giá trị `false`: `switchMap` sẽ lập tức hủy bỏ luồng `interval` hiện tại và trả về `EMPTY`. Điều này làm luồng polling dừng lại ngay lập tức mà không cần chúng ta phải `unsubscribe` thủ công.

3. **Tự động dọn dẹp:**
   Sử dụng `takeUntilDestroyed(this.destroyRef)` để đảm bảo rằng khi Component bị hủy (User điều hướng đi trang khác), toàn bộ Subscription này sẽ được giải phóng hoàn toàn, tránh gây tràn bộ nhớ (Memory Leak).

**Lợi ích:**

- **Code Declarative:** Bạn chỉ cần định nghĩa "khi nào thì chạy" thay vì phải viết các hàm `setInterval` và `clearInterval` rối rắm.
- **An toàn hơn:** Cơ chế tự động hủy của `switchMap` giúp tránh việc nhiều bộ đếm chạy song song nếu người dùng bấm Login/Logout liên tục.
