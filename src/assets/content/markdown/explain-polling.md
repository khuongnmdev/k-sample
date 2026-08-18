#### ✔️ Cơ chế Polling với `switchMap` + `timer` và `Signals`

Trong Angular hiện đại, kết hợp **Signals** và **RxJS** giúp kiểm soát luồng dữ liệu rất linh hoạt.

Quy trình hoạt động trong ví dụ:

1. **Chuyển đổi Signal thành Observable:**
   `toObservable(this.isLoggedIn)` biến Signal trạng thái (Login/Logout) thành một dòng dữ liệu RxJS.
   Nhờ vậy có thể áp dụng các toán tử RxJS lên hành vi của người dùng.

2. **Dùng `switchMap` để điều hướng luồng:**
   - Khi `isLoggedIn` phát ra `true`: `switchMap` hủy luồng con trước đó (nếu có) và khởi tạo `timer(0, 1000)`. Poll đầu tiên chạy **ngay lập tức**, sau đó lặp lại mỗi 1 giây.
   - Khi `isLoggedIn` phát ra `false`: `switchMap` hủy luồng `timer` đang chạy và trả về `EMPTY`. Polling dừng ngay, không cần `unsubscribe` thủ công.

3. **Tự động dọn dẹp:**
   `takeUntilDestroyed(this.destroyRef)` giải phóng toàn bộ Subscription khi Component bị hủy (user rời trang), tránh Memory Leak.

---

> **Vì sao dùng `timer(0, 1000)` thay cho `interval(1000)`?**
>
> `interval(1000)` phải chờ đủ 1 chu kỳ mới phát giá trị đầu tiên - user Login xong phải đợi 1 giây mới thấy poll đầu.
>
> `timer(0, 1000)` phát ngay tại thời điểm 0, sau đó mới lặp theo chu kỳ - đúng hành vi polling mong muốn: có dữ liệu ngay khi bật.

---

**Lợi ích:**

- **Code Declarative:** chỉ định nghĩa "khi nào thì chạy" thay vì tự viết `setInterval` / `clearInterval` rối rắm.
- **An toàn:** cơ chế tự hủy của `switchMap` tránh nhiều bộ đếm chạy song song khi user bấm Login/Logout liên tục.
