## So sánh RxJS Unicast vs Multicast (share)

Trong RxJS, hiểu rõ cách dữ liệu được phân phối tới các Observer (người lắng nghe) là điều rất quan trọng để tránh lãng phí tài nguyên và lặp lại các tác vụ phụ (side-effects) không cần thiết.

---

### 1. Unicast Observable (Mặc định)

Mặc định, hầu hết Observable trong RxJS là **Unicast** (còn gọi là **Cold Observable**).

- **Cách hoạt động**: Mỗi lần `.subscribe()` được gọi, Observable nguồn sẽ **thiết lập và chạy một phiên thực thi (execution) hoàn toàn mới**.
- **Đặc điểm**:
  - Mỗi Subscriber nhận một chuỗi giá trị riêng, độc lập và lệch pha với các Subscriber khác.
  - Side-effects (gọi API HTTP, khởi chạy bộ đếm `interval`...) bị **chạy lặp lại** tương ứng với số lượng Subscriber.
  - Gọi 3 lượt `.subscribe()` vào cùng một luồng HttpClient → Angular gửi **3 HTTP request riêng biệt** tới server.

---

### 2. Multicast Observable (`share()`)

**Multicast** phân phối dữ liệu từ một phiên thực thi (execution) duy nhất tới nhiều Subscriber cùng lúc.

- **Cách hoạt động**: Khi Subscriber đầu tiên đăng ký, Observable nguồn bắt đầu chạy. Các Subscriber đăng ký sau sẽ **cùng lắng nghe và chia sẻ chung phiên thực thi đang chạy đó**.
- **Đặc điểm**:
  - Các Subscriber nhận được giá trị giống hệt nhau tại cùng thời điểm.
  - Side-effects chỉ **chạy duy nhất 1 lần**, bất kể có bao nhiêu Subscriber.
  - Subscriber đăng ký muộn sẽ **không nhận lại** các giá trị đã phát ra trước đó, chỉ nhận từ thời điểm subscribe trở đi (muốn phát lại giá trị gần nhất cho người đến muộn, dùng `shareReplay()`).
  - Kích hoạt đơn giản bằng cách gắn toán tử `.pipe(share())`.
  - Vì vẫn "chờ" Subscriber đầu tiên rồi mới chạy và tự reset khi hết Subscriber (cơ chế refCount), stream tạo bởi `share()` thường được gọi là **"warm"** - nằm giữa Cold và Hot thuần túy.

---

### 3. Nhận biết Cold / Hot Observable trong thực tế

> Lưu ý phân biệt **hai trục khái niệm khác nhau**: _Unicast/Multicast_ nói về việc **bao nhiêu Subscriber chia sẻ một execution**, còn _Cold/Hot_ nói về việc **producer nằm trong hay ngoài Observable**. Hai trục này thường đi đôi với nhau (Cold ↔ Unicast, Hot ↔ Multicast) nhưng không phải là một.

**Cold (Unicast)** - dữ liệu được "sản xuất" bên trong Observable, chỉ bắt đầu chạy khi có người subscribe:

- `HttpClient.get()` / `post()`... - mỗi lượt subscribe là một HTTP request mới
- `of(...)`, `from(...)` - phát lại chuỗi giá trị từ đầu cho từng Subscriber
- `interval(...)`, `timer(...)` - mỗi Subscriber sở hữu một bộ đếm riêng
- `ajax(...)`, `fromFetch(...)`

**Hot (Multicast)** - dữ liệu được "sản xuất" từ nguồn bên ngoài, phát ra bất kể có ai lắng nghe hay không:

- `fromEvent(...)` - sự kiện DOM (click, scroll, keyup...)
- `Subject`, `BehaviorSubject`, `ReplaySubject` (lưu ý: khác với `share()`, hai loại `BehaviorSubject`/`ReplaySubject` **có** phát lại giá trị đã lưu cho Subscriber đến muộn)
- `FormControl.valueChanges`, `Router.events` trong Angular
- `webSocket(...)` - luồng real-time từ server, multicast qua Subject nội bộ (kết nối chỉ được mở khi có Subscriber đầu tiên)

> Lưu ý: một Cold Observable có thể được chuyển thành Multicast ("warm" - xem ghi chú ở mục 2) bằng cách gắn `share()` / `shareReplay()`.

---

### Bảng so sánh tổng quan Unicast vs Multicast

| Tiêu chí                           | Unicast (Mặc định)                    | Multicast (`share()`)                        |
| :--------------------------------- | :------------------------------------ | :------------------------------------------- |
| **Số phiên thực thi (Executions)** | 1 execution cho mỗi Subscriber        | 1 execution dùng chung cho tất cả            |
| **Bộ đếm thời gian / Tần số**      | Chạy lệch pha tùy thời điểm subscribe | Chạy cùng pha, đồng bộ                       |
| **HTTP Request**                   | Bị trùng lặp (duplicate API calls)    | Chỉ gửi đúng 1 API call và chia sẻ kết quả   |
| **Tối ưu tài nguyên**              | Kém (khi có nhiều listener)           | Tốt                                          |
| **Toán tử kích hoạt**              | Mặc định, không cần toán tử           | `.pipe(share())` hoặc `.pipe(shareReplay())` |

---

### Ví dụ thực tế tiêu biểu nhất

Khi bạn có một dữ liệu cấu hình hệ thống (ví dụ: danh sách Category) cần hiển thị ở cả **Header Component**, **Sidebar Component** và **Footer Component**:

- **Unicast**: cả 3 component cùng subscribe vào luồng HTTP gốc → **3 requests gửi lên server**.
- **Multicast**: sử dụng `shareReplay(1)` → chỉ **1 request duy nhất** gửi lên server, 3 component cùng chia sẻ kết quả tức thì.

> 👉 Đây cũng là cầu nối sang trang **Service Best Practices**: khi một Service cung cấp stream dùng chung cho nhiều component, hãy gắn `share()` / `shareReplay(1)` ngay trong Service để cả app chỉ trả chi phí side-effect đúng một lần.
