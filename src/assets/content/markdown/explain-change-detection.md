
## 1. Imperative State (Old)

Đây là phương pháp sử dụng các thuộc tính (properties) thông thường của lớp làm nguồn dữ liệu.

| Đặc điểm | Chi tiết |
| :--- | :--- |
| **Source of Truth** | Biến thường (`currentFileName`, `codeMarkdown`). |
| **Data Flow** | `@Input` setter → gọi hàm (`setupCodeMarkdown`) → `HttpClient.get()` → `.subscribe()` → gán giá trị vào biến (`this.codeMarkdown = ...`). |
| **Ưu điểm** | **Dễ hiểu** với người mới lập trình Angular hoặc lập trình hướng đối tượng truyền thống. |
| **Nhược điểm** | **Rủi ro CD cao:** Khi dùng `OnPush`, việc gán giá trị trực tiếp có thể không luôn kích hoạt Change Detection (CD) đúng cách trong mọi tình huống, **dễ dính bẫy CD** (cần `markForCheck` thủ công nếu việc gán xảy ra bên ngoài `NgZone` hoặc trong các logic phức tạp). Khó compose logic. |

---

## 2. Observable State (Reactive Stream)

Sử dụng RxJS để quản lý luồng dữ liệu, đây là phương pháp tiêu chuẩn trong các dự án Angular trong nhiều năm.

| Đặc điểm | Chi tiết |
| :--- | :--- |
| **Source of Truth** | `BehaviorSubject` (cho Input) và Stream kết quả (`codeMarkdown$`). |
| **Data Flow** | `@Input` setter → `fileNameSubject.next(value)` → pipeline xử lý (`.pipe(switchMap(), map(), ...)`) → template dùng `async pipe`. |
| **Ưu điểm** | **Rất "hợp" với OnPush:** `Async Pipe` tự động quản lý việc unsubscribe và gọi `markForCheck()` mỗi khi có dữ liệu mới, loại bỏ nhu cầu can thiệp CD thủ công. Logic xử lý rõ ràng (declarative). |
| **Nhược điểm** | **Boilerplate RxJS:** Cần phải khai báo Subject, quản lý pipe, và đôi khi RxJS có thể phức tạp với người mới. |

---

## 3. Signal State (Signal-First Architecture)

Sử dụng Angular Signals, mô hình khuyến nghị cho Angular hiện đại.

| Đặc điểm | Chi tiết |
| :--- | :--- |
| **Source of Truth** | `signal()` (`currentFileName`), `computed()` (`fileInfo`), và `toSignal()` (kết quả từ HTTP). |
| **Data Flow** | `@Input` setter → `currentFileName.set(value)` → `computed` tự động chạy → `Observable` (tạo từ Signal) chạy → `toSignal` (hoặc `.subscribe()` nếu là stream phức tạp) cập nhật → template dùng `codeMarkdown()` render. |
| **Ưu điểm** | **Hiện đại, Gọn gàng, Rõ ràng:** Cấu trúc data-flow rất rõ ràng. Signal tự động thông báo và chỉ cập nhật những phần bị ảnh hưởng, mang lại hiệu suất cao nhất. Rất hợp với triết lý `OnPush`. |
| **Nhược điểm** | **Phức tạp khi so sánh với Default CD:** Triết lý của Signal là đi kèm với `OnPush` để tối ưu hóa. Nếu muốn demo CD `Default` hoặc các cơ chế CD cũ, mô hình này có thể **làm lệch mục tiêu** vì Signal hoạt động ở cấp độ hạt nhân, khiến việc so sánh trở nên kém trực quan. |

---

## Tóm tắt và Lựa chọn

Mô hình **Signal State** là lựa chọn tối ưu nhất cho Angular hiện đại (từ v16 trở lên) về hiệu suất và khả năng duy trì.  
Mô hình **Imperative (Old)** dễ gây ra lỗi CD và dễ can thiệp CD thủ công, 
