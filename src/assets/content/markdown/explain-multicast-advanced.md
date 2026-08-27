## Multicast nâng cao: shareReplay() vs ReplaySubject

Ôn nhanh 2 khái niệm sẽ dùng xuyên suốt trang này:

- **Execution (phiên thực thi)**: một lần nguồn Observable thực sự chạy - bộ đếm bắt đầu đếm, request được gửi đi.
- **Subscriber muộn**: người subscribe SAU khi nguồn đã phát được vài giá trị.

`share()` (trang Unicast vs Multicast) cho mọi subscriber dùng chung 1 execution.
Nhưng subscriber muộn bị **miss** các giá trị đã phát - đến muộn thì chỉ nghe được phần còn lại.

`shareReplay(n)` và `ReplaySubject(n)` giải quyết đúng chỗ này:
giữ lại **n giá trị gần nhất** trong một bộ đệm (buffer), subscriber muộn vào là được phát lại ngay.

---

### 1. shareReplay(n) - chia sẻ execution + phát lại n giá trị gần nhất

Cách dùng giống `share()`: gắn vào sau một nguồn có sẵn (HTTP, interval, websocket...).

- Mọi subscriber dùng chung 1 execution - side-effect chỉ chạy 1 lần cho cả nhóm.
- Subscriber muộn nhận NGAY n giá trị gần nhất từ buffer, rồi nghe tiếp như mọi người.

Câu hỏi quan trọng nhất khi dùng: **subscriber cuối cùng rời đi, nguồn sẽ ra sao?**
Tham số `refCount` chính là câu trả lời:

| Tình huống             | `refCount: true`             | `refCount: false` (mặc định)                       |
| :--------------------- | :--------------------------- | :------------------------------------------------- |
| Khi hết subscriber     | Hủy nguồn + xóa buffer       | Không hủy gì: nguồn chưa xong tiếp tục chạy ngầm   |
| Subscribe lại sau đó   | Nguồn chạy MỚI từ đầu        | Nhận buffer cũ + nối vào execution đang chạy       |
| Hợp với nguồn kiểu     | VÔ HẠN (websocket, interval) | TỰ KẾT THÚC (HTTP request)                         |

> Cú pháp đầy đủ: `shareReplay({bufferSize: n, refCount: true})`.
> Dạng gọn `shareReplay(n)` luôn là `refCount: false`.

**Nguồn VÔ HẠN vs nguồn TỰ KẾT THÚC là gì?**

Một Observable có thể phát tín hiệu **complete** - nghĩa là "hết, không còn giá trị nào nữa".

- **Nguồn TỰ KẾT THÚC**: phát xong dữ liệu rồi tự complete. Điển hình là HTTP request - server trả response xong là luồng đóng ngay. Tự complete = tự dọn dẹp, không còn gì chạy phía sau.
- **Nguồn VÔ HẠN**: KHÔNG bao giờ tự complete - cứ phát mãi cho tới khi có người unsubscribe. Điển hình: `interval` (chính demo này), websocket giá, `fromEvent` (click, scroll).
- Liên quan gì tới refCount? Nguồn vô hạn chỉ dừng khi được unsubscribe, mà `refCount: false` thì không bao giờ unsubscribe hộ bạn - nên nguồn vô hạn sẽ chạy ngầm mãi = leak. Nguồn tự kết thúc thì complete xong là xong, refCount nào cũng không leak.

**Use case cho từng chế độ:**

- **`refCount: true` - dùng cho nguồn VÔ HẠN:**
  - Giá coin/chứng khoán qua websocket: 5 widget cùng xem chung 1 kết nối. Widget cuối cùng đóng thì kết nối thật cũng được ngắt.
  - Vị trí GPS, dữ liệu sensor, đồng hồ realtime dùng chung cho nhiều component.
  - Vì sao bắt buộc: nguồn vô hạn không bao giờ tự kết thúc. Nếu không ai hủy giúp, nó chạy ngầm mãi = **memory leak**.
- **`refCount: false` (mặc định) - cache "gọi 1 lần" cho data ÍT thay đổi:**
  - Điều kiện chọn: nguồn TỰ KẾT THÚC (HTTP) và data hiếm khi đổi trong một phiên app.
  - Ví dụ: brand config, feature flags, danh sách Category, danh sách tỉnh/thành - cả app gọi đúng 1 request, buffer làm cache tới hết phiên.
  - Component mount muộn (Footer render sau Header) nhận ngay kết quả từ buffer, không bắn request mới.
  - Vì sao an toàn: request complete ngay sau khi trả kết quả - không còn gì chạy ngầm để leak.
  - Vế ngược: data đổi thường xuyên (odds, số dư ví) thì ĐỪNG cache kiểu này - buffer không bao giờ tự làm mới. Dùng stream sống (websocket + `refCount: true`) hoặc `resource` + `reload()`.

**Ghi chú thêm cho đủ bộ:**

- `windowTime` - giới hạn "tuổi" của giá trị trong buffer: `shareReplay({bufferSize: 1, windowTime: 5000})` chỉ phát lại giá trị chưa quá 5 giây. Hợp làm cache có hạn dùng.
- Lỗi KHÔNG bị cache: nguồn lỗi (HTTP fail) thì buffer bị xóa, subscriber tiếp theo kích hoạt gọi nguồn lại từ đầu. Không lo "cache một cái lỗi vĩnh viễn".

---

### 2. ReplaySubject(n) - Subject có trí nhớ

Trước hết, **Subject là gì?**
Là một Observable đặc biệt mà BẠN chủ động phát giá trị bằng `.next(value)` - không cần nguồn nào phía sau.
Giá trị phát ra được gửi tới TẤT CẢ subscriber đang nghe (Subject bản chất luôn là multicast).

**ReplaySubject(n) = Subject + trí nhớ:**

- Giữ buffer n giá trị gần nhất.
- Subscriber muộn vào là được phát lại toàn bộ buffer NGAY, rồi nghe tiếp bình thường.
- Không tự complete: bạn quản lý vòng đời - gọi `.complete()` khi xong. Service `providedIn: 'root'` sống theo app thì thường không cần.

**Chi tiết đáng biết:**

- `new ReplaySubject()` KHÔNG truyền n = buffer **không giới hạn** - giữ tất cả giá trị từ đầu, dễ tốn bộ nhớ. Luôn truyền n rõ ràng.
- Tham số thứ 2 là `windowTime`: `new ReplaySubject(100, 5000)` chỉ replay các giá trị chưa quá 5 giây.
- Quan hệ họ hàng: bên trong `shareReplay(n)` chính là một `ReplaySubject(n)` - vì vậy hành vi replay giống hệt nhau.

**Chọn đúng người trong gia đình Subject:**

| Tiêu chí               | `Subject`                    | `BehaviorSubject(init)`  | `ReplaySubject(n)`            |
| :--------------------- | :--------------------------- | :----------------------- | :---------------------------- |
| Subscriber muộn nhận   | Không gì cả                  | 1 giá trị mới nhất       | n giá trị gần nhất            |
| Cần giá trị khởi tạo   | Không                        | Có                       | Không                         |
| Đọc đồng bộ `.value`   | Không                        | Có                       | Không                         |
| Use case tiêu biểu     | Bắn sự kiện, không cần lịch sử | State luôn-có-giá-trị  | Lịch sử n sự kiện gần nhất    |

**Use case cụ thể:**

- **Event bus có lịch sử:** NotificationService - toast component mount sau vẫn hiển thị được 3 thông báo gần nhất.
- **Wizard nhiều bước:** bước 3 mount muộn vẫn nhận lại các lựa chọn user đã phát ra ở bước 1, 2.
- **Debug / audit tail:** giữ n hành động gần nhất của user cho panel debug mở muộn.
- **`ReplaySubject(1)` thay `BehaviorSubject`:** khi chưa có giá trị khởi tạo hợp lệ. "Chưa có gì để phát" khác với "phát một giá trị mặc định giả" - subscriber sẽ không bị nhận nhầm dữ liệu giả.

---

### Bản chất phía sau: tất cả đều là Subject

`share()` và `shareReplay()` không có phép màu riêng.
Bên trong, chúng đặt một **Subject trung gian** giữa nguồn và các subscriber.
Nguồn chỉ có đúng 1 subscriber thật là Subject đó; mọi subscriber của bạn nghe qua Subject - vì thế mà thành multicast.

| API bạn dùng           | Subject đứng sau       | Hệ quả hành vi                                                                  |
| :--------------------- | :--------------------- | :------------------------------------------------------------------------------ |
| `share()`              | `Subject`              | Không trí nhớ - subscriber muộn miss giá trị cũ                                 |
| `shareReplay(n)`       | `ReplaySubject(n)`     | Buffer n giá trị - subscriber muộn được replay                                  |
| Kiểu BehaviorSubject?  | Không có toán tử sẵn   | `share({connector: () => new BehaviorSubject(x)})` - cần giá trị khởi tạo       |

- Điểm hay nhầm: sau `shareReplay` là **ReplaySubject**, KHÔNG phải BehaviorSubject. Nhưng `shareReplay(1)` cho hành vi GẦN giống BehaviorSubject (subscriber muộn nhận 1 giá trị gần nhất) mà không cần giá trị khởi tạo.
- Tổng quát: `shareReplay(n)` thực chất chỉ là `share()` được cấu hình sẵn:

```typescript
shareReplay(n);
// tương đương với:
share({
  connector: () => new ReplaySubject(n), // đặt Subject NÀO vào giữa
  resetOnComplete: false, // nguồn complete xong vẫn giữ buffer làm cache
  resetOnRefCountZero: false, // = refCount: false - hết subscriber không reset
});
```

- Hiểu tầng này rồi, cả họ nhà share chỉ còn là một câu hỏi: **"đặt Subject NÀO vào giữa, và khi nào reset nó?"**

---

### Bảng so sánh tổng quan

| Tiêu chí             | shareReplay `refCount: true`       | shareReplay mặc định           | `ReplaySubject(n)`             |
| :------------------- | :--------------------------------- | :----------------------------- | :----------------------------- |
| Bản chất             | Operator gắn sau nguồn             | Operator gắn sau nguồn         | Subject - bạn tự phát          |
| Ai phát giá trị      | Nguồn phía sau (cold)              | Nguồn phía sau (cold)          | Bạn gọi `.next()`              |
| Subscriber muộn      | Nhận lại n giá trị gần nhất        | Nhận lại n giá trị gần nhất    | Nhận lại n giá trị gần nhất    |
| Khi hết subscriber   | Hủy nguồn + xóa buffer             | Nguồn chạy ngầm + giữ buffer   | Sống tới khi bạn `.complete()` |
| Use case tiêu biểu   | Websocket / sensor / stream vô hạn | Cache 1 lần data ít đổi (brand config) | Event bus, n sự kiện gần nhất  |

---

### Chọn cái nào?

- Cache HTTP cho data ít thay đổi trong phiên (brand config, danh mục): `shareReplay(1)` mặc định là đủ.
- Chia sẻ stream vô hạn (websocket, interval): `shareReplay({bufferSize: n, refCount: true})` - bắt buộc nghĩ tới refCount.
- Tự phát giá trị + cần replay cho subscriber muộn: `ReplaySubject(n)`.
- Chia sẻ stream live, không cần lịch sử: quay về `share()` là đủ.
