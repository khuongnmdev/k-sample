### 💡 Cây cầu nối hai thế giới

| API                | Chiều                 | Vai trò                                                                                                                                         |
| :----------------- | :-------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------- |
| **`toSignal()`**   | Observable → Signal   | "Hạ cánh" stream về cho template: đọc trực tiếp `value()`, không cần `async` pipe, tự unsubscribe khi injector destroy. Options: `initialValue`, `requireSync`. |
| **`toObservable()`** | Signal → Observable | "Cất cánh" signal vào pipeline RxJS: mỗi lần signal đổi giá trị là một emission (phát bất đồng bộ, gộp theo nhịp) - từ đó dùng được mọi operator. |

---

### Phân vai hai thế giới

- **Signals** thắng ở: **state đồng bộ + render** - nguồn sự thật của UI, `computed` dẫn xuất, fine-grained update với OnPush/Zoneless.
- **RxJS** thắng ở: **thời gian và điều phối bất đồng bộ** - `debounceTime`, `distinctUntilChanged`, `switchMap` (tự hủy request cũ), `retry`, `combineLatest`... những thứ hệ thống signal không có.

Pattern "cây cầu khứ hồi" tận dụng cả hai:

> **Signal** (state UI) → `toObservable` → **RxJS operators** (debounce, switchMap...) → `toSignal` → **Signal** (template đọc)

Demo search phía trên đi đúng vòng này: gõ nhanh bao nhiêu thì "API" cũng chỉ được gọi sau nhịp gõ cuối 300ms, term không đổi thì không gọi lại, và request cũ đang bay bị `switchMap` hủy.

---

### Ngay trong app này

Component `CodePresenter` đang render chính khối code bạn nhìn thấy cũng dùng đúng pattern đó: `input signal (fileName)` → `computed (fileInfo)` → `toObservable` → `switchMap` (HTTP tải file code) → `toSignal` → template. Đó là lý do đổi trang là code mới tự tải về mà không có dòng subscribe thủ công nào.
