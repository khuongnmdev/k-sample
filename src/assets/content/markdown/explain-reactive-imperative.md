## So sánh Lập trình Imperative (Mệnh lệnh) vs Reactive (Phản ứng - Signals)

Để hiểu rõ sự khác biệt giữa hai mô hình tư duy, hãy phân tích cách mỗi bên xử lý cùng một bài toán: hiển thị nút Xóa dựa trên trạng thái đăng nhập (`isLoggedIn`) và vai trò người dùng (`userRole`).

Cả hai component cùng bắt chung MỘT sự kiện `login()` giống hệt nhau - khác biệt duy nhất nằm ở cách cập nhật và đồng bộ trạng thái sau sự kiện đó.

---

### 1. Imperative State (Lập trình Mệnh lệnh)

Ở phương pháp truyền thống, bạn tự tay mô tả từng bước thực thi và tự kiểm soát thời điểm cập nhật trạng thái.

| Đặc điểm              | Chi tiết                                                                                                                                                                                                                 |
| :-------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Tư duy cốt lõi**    | "Làm thế nào để cập nhật giao diện?" (**How** to do)                                                                                                                                                                     |
| **Mô hình dữ liệu**   | **Pull (kéo)** - biến kết quả `showDeleteButton` không hề biết khi nào nguồn thay đổi. Bạn phải chủ động "kéo" giá trị mới về bằng cách gọi hàm tính lại vào đúng thời điểm.                                              |
| **Luồng thực thi**    | Trong `login()`, bạn lần lượt gán `isLoggedIn`, `userRole`, rồi **bắt buộc phải nhớ gọi thủ công** hàm `updateDeleteButton()` để cập nhật biến kết quả.                                                                  |
| **Nhược điểm**        | **Rủi ro quên gọi cập nhật rất cao**: chỉ cần một nơi nào đó thay đổi `isLoggedIn` hoặc `userRole` mà quên gọi `updateDeleteButton()`, giao diện lập tức sai lệch so với dữ liệu thực tế.                                 |

---

### 2. Signal State (Lập trình Phản ứng - Angular Signals)

Cách tiếp cận được khuyến nghị cho Angular hiện đại (v16+): kết hợp sự trực quan của Imperative với khả năng tự động đồng bộ của Reactive.

| Đặc điểm              | Chi tiết                                                                                                                                                                                                                 |
| :-------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Tư duy cốt lõi**    | "Giao diện cần hiển thị cái gì?" (**What** to show) - chỉ khai báo mối quan hệ giữa các trạng thái, không chỉ đạo từng bước.                                                                                             |
| **Mô hình dữ liệu**   | **Push (đẩy)** - khi `isLoggedIn` hoặc `userRole` thay đổi, thông báo được **tự động đẩy** tới mọi nơi phụ thuộc: `computed` bị đánh dấu cần tính lại và giao diện được cập nhật, không cần ai gọi thủ công.              |
| **Luồng thực thi**    | Trong `login()`, bạn chỉ cần `.set()` giá trị nguồn. `computed()` tự ghi nhận phụ thuộc (`isLoggedIn`, `userRole`) trong lần đọc đầu tiên và tự tính lại `showDeleteButton` mỗi khi nguồn đổi.                            |
| **Ưu điểm**           | **Tinh gọn và an toàn**: quan hệ phụ thuộc khai báo đúng một lần, không thể quên cập nhật, không cần subscribe/unsubscribe như RxJS.                                                                                      |

> Ghi chú kỹ thuật: Signals thực chất là mô hình **push-pull** - thông báo thay đổi được _đẩy_ (push) đi ngay lập tức, nhưng giá trị mới chỉ được _tính lại_ khi có nơi đọc tới (pull, lazy evaluation). Nhờ vậy tránh được các phép tính thừa khi không ai dùng kết quả.

---

### Bảng so sánh tổng quan

| Tiêu chí so sánh         | Imperative                                    | Angular Signals                                  |
| :----------------------- | :-------------------------------------------- | :----------------------------------------------- |
| **Mô hình dữ liệu**      | **Pull** - tự kéo / tính lại thủ công         | **Push** - thay đổi tự đẩy tới nơi phụ thuộc     |
| **Cơ chế cập nhật**      | Thủ công (gọi hàm `updateDeleteButton()`)     | Tự động qua dependency tracking                  |
| **Độ tin cậy**           | Thấp (dễ quên gọi, gây sai lệch UI)           | Cao (không thể quên cập nhật)                    |
| **Cú pháp**              | Đơn giản nhưng dễ phình to khi logic tăng     | Ngắn gọn, khai báo một lần                       |
| **Quản lý subscription** | Không có                                      | Không cần (không lo rò rỉ bộ nhớ như RxJS)       |
| **Hiệu suất**            | Phụ thuộc CD toàn cục, dễ bỏ sót với OnPush   | Fine-grained, sẵn sàng cho Zoneless / OnPush     |

---

### Kết luận đề xuất

- Hãy chuyển sang tư duy **Khai báo (Declarative)**: định nghĩa _mối quan hệ_ giữa các trạng thái (What) thay vì chỉ dẫn máy tính _từng bước_ cập nhật (How), và để hệ thống tự **đẩy (push)** thay đổi tới nơi cần.
- Sử dụng **Angular Signals** (`signal` + `computed`) cho các logic đồng bộ và biến phái sinh cục bộ của component - ngắn gọn, chính xác và tối ưu hiệu năng.
