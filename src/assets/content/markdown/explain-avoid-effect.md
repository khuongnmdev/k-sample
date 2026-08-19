#### ❌→✅ Ví dụ 1: effect "đồng bộ hộ" state dẫn xuất (CartBad vs CartGood)

- **`CartBad`**: `total` là state **dẫn xuất** (luôn tính được từ `quantity × price`) nhưng lại khai báo bằng `signal` thường rồi nhờ `effect` "đồng bộ hộ". Hệ quả:
  - `total` trễ một nhịp render so với `quantity`/`price` (effect chạy sau khi Angular render).
  - Ai cũng có thể `total.set(999)` phá vỡ bất biến của dữ liệu.
  - Thêm một effect là thêm một đường data flow ngầm phải dò khi debug.
- **`CartGood`**: chuyển `total` thành `computed` - công thức nằm ngay tại nơi khai báo, giá trị **đồng bộ ngay trong cùng một nhịp**, read-only, lazy và memoized. Không còn effect nào để bảo trì.

#### ❌→✅ Ví dụ 2: effect tự kích hoạt lại chính nó - vòng lặp vô hạn (AuditLogBad vs AuditLogGood)

- **Cơ chế sinh vòng lặp**: effect phụ thuộc vào **mọi signal nó ĐỌC**. `AuditLogBad` đọc `logCount()` rồi lại `logCount.update(...)` ngay trong cùng effect → logCount đổi → effect chạy lại → đọc + ghi tiếp → **lặp vô hạn** (treo app, ngốn CPU).
- **`untracked(() => ...)`** là lối thoát: mọi signal đọc bên trong `untracked` **không** trở thành dependency. `AuditLogGood` chỉ giữ `user()` làm tín hiệu theo dõi, còn phần đọc/ghi `logCount` bọc trong `untracked` → effect chỉ chạy khi `user` đổi.
- Các tình huống cần `untracked` thường gặp:
  - Effect cần **đếm/ghi lại** trạng thái của chính nó (như ví dụ trên).
  - Gọi một hàm/service **có đọc signal bên trong** nhưng bạn không muốn phụ thuộc theo (ví dụ `untracked(() => this.logger.log(...))`).
  - Đọc "giá trị hiện tại" của một signal phụ mà không muốn effect chạy lại theo nó (chỉ theo dõi tín hiệu chính).

#### Checklist trước khi viết `effect()`

1. Giá trị này **tính được từ state khác**? → dùng `computed()`, dừng lại ở đây.
2. Cần state dẫn xuất nhưng user **ghi đè được** (ví dụ: chọn sẵn item đầu tiên khi list đổi)? → `linkedSignal()`.
3. Cần **gọi API** khi signal đổi? → `resource()` / `rxResource()`, hoặc gọi hàm trực tiếp trong event handler.
4. Chỉ còn lại: log/analytics, `localStorage`, thao tác DOM/canvas/chart, tích hợp thư viện ngoài Angular → đây mới là đất của `effect()`.

> **Quy tắc vàng:** trong `effect` lý tưởng **không có dòng `.set()` nào** - effect nhìn vào trong (đọc signal) và tác động ra ngoài, không quay lại ghi vào hệ thống signal.
