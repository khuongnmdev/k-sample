# Key Takeaways

Tổng kết lại hành trình từ Change Detection tới Best Practices:

### 1. Change Detection: hãy để Angular biết khi nào cần render

- Biến thường (Imperative) không phát tín hiệu gì cho Angular - UI chỉ "sống sót" nhờ zone.js + Default CD quét toàn cây.
- **Signal + OnPush/Zoneless** là mô hình tối ưu của Angular hiện đại: signal đổi giá trị, đúng component đó được refresh.

### 2. Đúng primitive cho đúng việc: signal - computed - effect

- `signal` cho state gốc, `computed` cho state dẫn xuất (lazy + memoized), `effect` **chỉ** cho side effect (log, storage, DOM, chart).
- Đừng dùng `effect` để set signal khác - đó là dấu hiệu bạn đang cần `computed` (hoặc `linkedSignal`).

### 3. Reactive thay vì Imperative

- Khai báo **luồng dữ liệu** ("khi nào thì chạy") thay vì tự tay gán giá trị và tự lo cập nhật UI.
- `Observable` cho stream/sự kiện bất đồng bộ phức tạp, `Signal` cho state hiển thị - và `toSignal`/`toObservable` làm cầu nối hai thế giới.

### 4. switchMap thay cho Subscribe lồng nhau

- Chuỗi xử lý phụ thuộc nhau: dùng `switchMap` để "bẻ lái" luồng - code phẳng, một `subscribe` duy nhất, luồng cũ tự bị hủy khi có giá trị mới.
- Đừng quên `takeUntilDestroyed` để chặn Memory Leak.

### 5. Luôn có chiến thuật catchError

- Bắt lỗi **ở từng Observable con** (trong `switchMap`) để cô lập lỗi, giữ luồng chính sống sót.
- Lỗi không được bắt sẽ "giết chết" cả stream - tính năng phụ thuộc stream đó ngừng cập nhật từ lúc ấy.

### 6. Polling gọn gàng với timer + switchMap

- `timer(0, INTERVAL)` + `switchMap` + điều kiện bật/tắt từ Signal - polling tự dừng, tự chạy lại theo trạng thái, không cần `setInterval`/`clearInterval` thủ công.

### 7. share() khi nhiều nơi cùng lắng nghe

- Observable mặc định là **Unicast** - mỗi subscriber một execution riêng (duplicate HTTP request!).
- `share()` / `shareReplay(1)` biến stream thành **Multicast** - một execution dùng chung, đặt ngay trong Service dùng chung.

### 8. Component hiển thị - Service xử lý

- Service: logic nghiệp vụ, HTTP, state dùng chung, thiết kế "đường ống" Observable.
- Component: quyết định **cái gì** hiển thị và là người `subscribe`.

---

## 🙏 Thank you!

**Questions & Answers** - mời mọi người đặt câu hỏi!
