## 1. Imperative State (Old)

Đây là phương pháp sử dụng các thuộc tính (properties) thông thường của lớp làm nguồn dữ liệu.

| Đặc điểm            | Chi tiết                                                                                                                                                                                                                                                                                     |
| :------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Source of Truth** | Biến thường (`currentFileName`, `codeMarkdown`).                                                                                                                                                                                                                                             |
| **Data Flow**       | `@Input` setter → gọi hàm (`setupCodeMarkdown`) → `HttpClient.get()` → `.subscribe()` → gán giá trị vào biến (`this.codeMarkdown = ...`).                                                                                                                                                    |
| **Ưu điểm**         | **Dễ hiểu** với người mới lập trình Angular hoặc lập trình hướng đối tượng truyền thống.                                                                                                                                                                                                     |
| **Nhược điểm**      | **Không có cơ chế báo thay đổi:** Gán giá trị vào biến thường không phát ra tín hiệu nào cho Angular. UI chỉ "tình cờ" được cập nhật khi zone.js + `Default` CD quét lại toàn bộ cây; với `OnPush` hoặc Zoneless thì view sẽ đứng im (phải tự gọi `markForCheck()` - bất kể việc gán xảy ra trong hay ngoài `NgZone`). Khó compose logic. |

---

## 2. Observable State (Reactive Stream)

Sử dụng RxJS để quản lý luồng dữ liệu, đây là phương pháp tiêu chuẩn trong các dự án Angular trong nhiều năm.

| Đặc điểm            | Chi tiết                                                                                                                                                                                          |
| :------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Source of Truth** | `BehaviorSubject` (cho Input) và Stream kết quả (`codeMarkdown$`).                                                                                                                                |
| **Data Flow**       | `@Input` setter → `currentFileName$.next(value)` → pipeline xử lý (`.pipe(switchMap(), map(), ...)`) → template dùng `async pipe`.                                                                |
| **Ưu điểm**         | **Rất "hợp" với OnPush:** `Async Pipe` tự động quản lý việc unsubscribe và gọi `markForCheck()` mỗi khi có dữ liệu mới, loại bỏ nhu cầu can thiệp CD thủ công. Logic xử lý rõ ràng (declarative). |
| **Nhược điểm**      | **Boilerplate RxJS:** Cần phải khai báo Subject, quản lý pipe, và đôi khi RxJS có thể phức tạp với người mới.                                                                                     |

---

## 3. Signal State (Signal-First Architecture)

Sử dụng Angular Signals, mô hình khuyến nghị cho Angular hiện đại.

| Đặc điểm            | Chi tiết                                                                                                                                                                                                                                        |
| :------------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Source of Truth** | `input()` (Signal Input), `computed()` (`fileInfo`), và `toSignal()` (kết quả từ HTTP).                                                                                                                                                         |
| **Data Flow**       | `input()` tự động nhận giá trị → `computed` tự động phản ứng → `Observable` (tạo từ Signal) chạy → `toSignal` cập nhật giá trị cuối cùng → template dùng `codeMarkdown()` render.                                                               |
| **Ưu điểm**         | **Fine-grained Reactivity:** Cấu trúc cực kỳ gọn gàng, không cần setter hay quản lý thủ công. Signal thông báo chính xác cho Angular biết phần nào cần thay đổi, mang lại hiệu suất tối ưu nhất, đặc biệt khi kết hợp với `OnPush` và Zoneless. |
| **Nhược điểm**      | **Learning Curve:** Cần làm quen với tư duy chuyển đổi từ Observable sang Signal và ngược lại. Khó demo sự khác biệt với CD truyền thống vì Signal vốn dĩ đã quá tối ưu.                                                                        |

---

## Tóm tắt và Lựa chọn

- Mô hình **Signal State + OnPush** là lựa chọn **tối ưu nhất** cho Angular hiện đại (từ v18 trở lên) về cả hiệu suất lẫn trải nghiệm lập trình (Developer Experience).
- Mô hình **Observable (RxJS)** vẫn rất mạnh mẽ cho các logic xử lý stream phức tạp và phối hợp tốt với `OnPush` qua `async` pipe.
- Mô hình **Imperative (Cũ)** nên hạn chế sử dụng vì không có cơ chế báo cho Angular biết dữ liệu đã thay đổi - UI dễ "đứng hình" khi chuyển sang `OnPush`/Zoneless (như thí nghiệm `window.setInterval` ở trên) và khó tối ưu hiệu suất cho ứng dụng lớn.
