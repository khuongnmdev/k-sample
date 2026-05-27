## So sánh Lập trình Imperative (Mệnh lệnh) vs Reactive (Phản ứng)

Để hiểu rõ sự khác biệt giữa hai mô hình tư duy lập trình phổ biến, hãy phân tích cách tiếp cận của từng bên qua ví dụ quản lý trạng thái hiển thị nút Xóa dựa trên trạng thái đăng nhập (`isLoggedIn`) và vai trò của người dùng (`userRole`).

---

### 1. Imperative State (Lập trình Mệnh lệnh)

Ở phương pháp truyền thống này, bạn phải tự tay mô tả từng bước thực thi và tự kiểm soát thời điểm cập nhật trạng thái.

| Đặc điểm | Chi tiết |
| :--- | :--- |
| **Tư duy cốt lõi** | "Làm thế nào để cập nhật giao diện?" (How to do). |
| **Luồng dữ liệu** | Trạng thái nút Xóa được lưu trữ trong biến tĩnh `showDeleteButton`. Khi người dùng đăng nhập (`login()`), bạn thay đổi trạng thái đăng nhập, và **bắt buộc phải nhớ gọi thủ công** hàm `updateUI()` để cập nhật lại biến kết quả. |
| **Nhược điểm** | **Rủi ro quên gọi cập nhật cực kỳ cao:** Chỉ cần một nơi nào đó trong mã nguồn thay đổi `isLoggedIn` hoặc `userRole` mà quên gọi `updateUI()`, giao diện sẽ lập tức bị sai lệch so với trạng thái dữ liệu thực tế. |

---

### 2. Reactive State với RxJS (Phản ứng dòng chảy)

Chuyển đổi hoàn toàn sang mô hình khai báo luồng dữ liệu (Declarative). Dữ liệu đầu vào được coi như các dòng chảy (streams) liên tục phát sinh giá trị theo thời gian.

| Đặc điểm | Chi tiết |
| :--- | :--- |
| **Tư duy cốt lõi** | "Mối quan hệ giữa các dữ liệu là gì?" (What is it). |
| **Luồng dữ liệu** | Đầu vào là các luồng `BehaviorSubject` (`isLoggedIn$`, `userRole$`). Dòng trạng thái nút Xóa (`showDeleteButton$`) được liên kết vĩnh viễn với các dòng đầu vào bằng toán tử phối hợp `combineLatest`. |
| **Ưu điểm** | **Tự động hóa hoàn toàn:** Khi gọi `isLoggedIn$.next(true)`, giá trị mới tự động chảy qua đường ống và cập nhật giá trị mới nhất của `showDeleteButton$`, hiển thị ra giao diện nhờ `AsyncPipe`. Bạn không bao giờ sợ quên cập nhật trạng thái nữa. |

---

### 3. Modern Reactive State với Angular Signals

Mô hình phản ứng tối ưu nhất, được khuyến nghị cho Angular hiện đại (v16+). Nó kết hợp sự đơn giản, trực quan của Imperative với sức mạnh tự động của Reactive.

| Đặc điểm | Chi tiết |
| :--- | :--- |
| **Tư duy cốt lõi** | "Đăng ký tự động và phản ứng chính xác" (Fine-grained Reactivity). |
| **Luồng dữ liệu** | Đầu vào là các Writable Signals (`isLoggedIn`, `userRole`). Biến kết quả là một Read-only `computed()` Signal. `computed` tự động ghi nhận các tín hiệu phụ thuộc được đọc bên trong nó. |
| **Ưu điểm** | **Cực kỳ tinh gọn và trực quan:** Chỉ cần định nghĩa mối quan hệ phụ thuộc một lần duy nhất qua `computed`. Khi gọi `isLoggedIn.set(true)`, Angular Signals tự động tính toán lại `showDeleteButton` và cập nhật chính xác điểm cần thay đổi trên giao diện mà không cần quản lý luồng phức tạp hay `unsubscribe` thủ công. |

---

### Bảng so sánh tổng quan

| Tiêu chí so sánh | Imperative | Reactive (RxJS) | Angular Signals |
| :--- | :--- | :--- | :--- |
| **Cơ chế cập nhật** | Thủ công (gọi hàm `updateUI()`) | Tự động qua stream pipeline | Tự động qua dependency tracking |
| **Độ tin cậy** | Thấp (Dễ quên, gây sai lệch UI) | Tuyệt đối (Luồng dữ liệu đồng bộ) | Tuyệt đối (Tự động cập nhật hạt mịn) |
| **Cú pháp sử dụng** | Rất đơn giản | Phức tạp (cần học toán tử RxJS) | Vô cùng đơn giản, ngắn gọn |
| **Quản lý bộ nhớ** | Không cần | Phải quản lý (AsyncPipe / Unsubscribe) | Tự động hoàn toàn |

---

### Kết luận đề xuất

* Hãy chuyển sang tư duy **Khai báo (Declarative)**: thay vì chỉ dẫn máy tính *làm thế nào* để cập nhật, hãy định nghĩa *mối quan hệ* giữa các trạng thái và để hệ thống tự động xử lý.
* Sử dụng **Angular Signals** (`signal` + `computed`) để tối ưu hóa sự ngắn gọn và chính xác cho các logic đồng bộ và biến phái sinh cục bộ của component.
