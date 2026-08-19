### 💡 Ba primitive cốt lõi của Signals

| Primitive      | Vai trò                        | Đặc điểm                                                                                                            | Dùng khi                                                                     |
| :------------- | :----------------------------- | :------------------------------------------------------------------------------------------------------------------ | :--------------------------------------------------------------------------- |
| **`signal()`** | **State gốc** (writable)       | Đọc bằng `()`, ghi bằng `.set()` / `.update()`. Là "nguồn sự thật" mà mọi thứ khác phản ứng theo.                   | Dữ liệu người dùng nhập, dữ liệu từ API, trạng thái UI (đóng/mở, đang load). |
| **`computed()`** | **State dẫn xuất** (read-only) | Tự theo dõi dependency, **lazy** (chỉ tính khi có người đọc) và **memoized** (dependency không đổi thì trả cache). | Mọi giá trị tính được từ state khác: tổng tiền, danh sách đã lọc, cờ hợp lệ. |
| **`effect()`** | **Side effect**                | Tự chạy lại khi signal đọc bên trong đổi; chạy ít nhất 1 lần; tự hủy theo injection context; có `onCleanup`.        | Tác động ra **ngoài** hệ thống signal: log, `localStorage`, DOM/chart, analytics. |

---

### Quy tắc chọn nhanh

> Tự hỏi: _"Mình đang tạo ra **DỮ LIỆU mới** hay đang **tác động ra thế giới bên ngoài**?"_
>
> - Tạo dữ liệu từ state khác → **`computed()`** (tuyệt đại đa số trường hợp).
> - Tác động ra ngoài (log, storage, DOM, thư viện thứ ba) → **`effect()`**.
> - Cần state dẫn xuất nhưng **vẫn ghi đè được** → Angular mới có `linkedSignal()`; cần **fetch dữ liệu theo signal** → `resource()` / `rxResource()` — càng ít lý do để lạm dụng `effect`.

---

### Vì sao phải dè chừng `effect`?

1. **Chạy sau khi render** - effect được flush trong lúc Angular đồng bộ hóa CD, nên state mà effect "đồng bộ hộ" luôn **trễ một nhịp** so với UI.
2. **Dễ tạo vòng lặp** - effect set signal A, signal A kích effect khác set signal B... chuỗi cập nhật khó lần vết; nếu set chính signal mà nó đọc thì thành vòng lặp vô hạn.
3. **Ẩn data flow** - đọc `computed` là thấy ngay công thức; còn logic nằm trong effect thì phải dò "ai đang set giá trị này?".
4. Cần đọc một signal mà **không muốn** effect phụ thuộc vào nó? Bọc trong `untracked(() => ...)`.
