#### ⚠️ Bốn cái bẫy khi qua cầu

1. **`toObservable` phát bất đồng bộ và gộp giá trị (coalesce)**

- Cơ chế bên dưới là `effect`: nhiều lần `.set()` liên tiếp trong cùng một nhịp chỉ tạo **một** emission mang giá trị cuối cùng.
- Đừng kỳ vọng hành vi của `BehaviorSubject.next()` (phát đồng bộ từng giá trị). Cần phát từng sự kiện rời rạc? Hãy dùng `Subject` thật.

2. **`toSignal` subscribe ngay lập tức (eager)**

- Khác `async` pipe (lazy - chờ template render), `toSignal` subscribe **ngay tại dòng khai báo** và giữ subscription tới khi injector destroy.
- Đặt `toSignal(http.get(...))` ở field nghĩa là request bắn ngay khi component khởi tạo - kể cả khi template chưa hề đọc giá trị.

3. **Stream lỗi → đọc signal là throw**

- Nếu Observable nguồn error, lỗi được "ném lại" tại chỗ **đọc** signal (thường là trong template!).
- Quy tắc: luôn `catchError` **trước** khi đưa vào `toSignal`.

4. **Stream complete → signal "đóng băng"**

- Nguồn complete thì signal giữ nguyên giá trị cuối mãi mãi. Muốn dữ liệu tiếp tục "sống", nguồn phải là stream còn mở.

> Cả `toSignal` và `toObservable` đều cần **injection context** (field initializer / constructor), hoặc truyền `{injector}` khi gọi ở nơi khác.
