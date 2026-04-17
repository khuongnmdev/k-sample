# Angular Service Best Practices

Việc phân định rõ trách nhiệm giữa **Component** (Tầng hiển thị) và **Service** (Tầng logic) là chìa khóa để giữ cho dự án dễ bảo trì và mở rộng.

---

### ✅ 1. Service NÊN chứa những gì?

| Hạng mục                | Chi tiết                                                                                       |
| :---------------------- | :--------------------------------------------------------------------------------------------- |
| **Logic nghiệp vụ**     | Các phép tính toán, lọc dữ liệu, hoặc biến đổi dữ liệu phức tạp.                               |
| **Gọi API (HTTP)**      | Tất cả các tương tác với backend thông qua `HttpClient`.                                       |
| **Quản lý trạng thái**  | Sử dụng `Signal`, `BehaviorSubject` để lưu trữ dữ liệu dùng chung (User profile, giỏ hàng...). |
| **Giao tiếp Component** | Đóng vai trò trung gian truyền tin giữa các Component không có quan hệ trực tiếp.              |
| **Hàm tiện ích**        | Format ngày tháng, xử lý chuỗi đặc thù của dự án.                                              |
| **Mapper**              | Biến đổi dữ liệu từ API (DTO) sang Model dùng cho UI.                                          |
| **Wrapper Browser API** | Bọc các API như `localStorage`, `window` để dễ dàng Mock Test hoặc chạy trên SSR.              |

---

### ❌ 2. Service KHÔNG NÊN chứa những gì?

| Hạng mục                | Lý do                                                                                                         |
| :---------------------- | :------------------------------------------------------------------------------------------------------------ |
| **Thao tác DOM**        | Tuyệt đối không dùng `document.getElementById` hay sửa CSS. Đây là việc của Component/Directive.              |
| **Logic hiển thị (UI)** | Ví dụ: Trạng thái đóng/mở dropdown, màu sắc button...                                                         |
| **Dữ liệu cục bộ**      | Nếu dữ liệu chỉ dùng cho đúng một Component duy nhất, đừng đẩy nó ra Service.                                 |
| **Vòng đời Component**  | Hạn chế đưa logic phụ thuộc chặt chẽ vào `OnInit`/`OnDestroy` của Component vào Service (dễ gây Memory Leak). |

---

### 💡 Ví dụ thực tế: Điều khiển Dialog Toàn cục

Một trong những tình huống phổ biến nhất là bạn muốn một hành động ở Component A (ví dụ: nút "Login" trên trang Home) kích hoạt việc mở một Dialog nằm ở Component B (ví dụ: `AppRoot` hoặc `MenuLayout`).

**Giải pháp:** Đưa State (trạng thái đóng/mở) vào Service.

```typescript
// global-dialog.service.ts
@Injectable({ providedIn: 'root' })
export class GlobalDialogService {
  // Quản lý trạng thái nội bộ với Signal
  private _isOpen = signal<boolean>(false);

  // Readonly signal để các component khác lắng nghe (Observe)
  readonly isOpen = this._isOpen.asReadonly();

  open() {
    this._isOpen.set(true);
  }
  close() {
    this._isOpen.set(false);
  }
  toggle() {
    this._isOpen.update((v) => !v);
  }
}
```

**Cách dùng:**

1. **Tại Component Trigger (Nút bấm):** Inject Service và gọi hàm `dialogService.open()`.
2. **Tại Component Hiển thị (Layout):** Inject Service và dùng `service.isOpen()` trong template để ẩn/hiện Dialog.

---

### 💡 Về các hàm Mapper (Ánh xạ dữ liệu)

**Mapper** là các hàm giúp tách biệt cấu trúc dữ liệu của Backend (API) và Frontend (UI).

- **Dự án nhỏ:** Có thể đặt hàm mapper làm `private method` ngay trong Service để tiện sử dụng trong toán tử `.pipe(map(data => this.mapToUI(data)))`.
- **Dự án lớn:** Nên tách ra file riêng (ví dụ: `user.mapper.ts`) để dễ dàng viết **Unit Test** độc lập và giữ cho Service gọn gàng.

---

### 💡 Ai nên là người `subscribe`?

Đây là một trong những câu hỏi quan trọng nhất về kiến trúc: **Hầu hết trường hợp, Service chỉ nên trả về Observable (hoặc Signal), còn Component mới là người `subscribe`.**

- **Service:** Thiết kế "đường ống" dẫn nước (Observable) và các bộ lọc (Operators). Service không biết khi nào giao diện cần dữ liệu, nên nó chỉ cung cấp "khả năng lấy dữ liệu".
- **Component:** Là người "mở vòi" (Subscribe). Component quản lý vòng đời của chính nó, nên nó biết khi nào cần dừng lấy dữ liệu để tránh Memory Leak.

---

### 💡 Quy tắc "Vàng"

> **"Component quyết định CÁI GÌ được hiển thị, còn Service quyết định dữ liệu được lấy và xử lý NHƯ THẾ NÀO."**

Nếu bạn thấy Component của mình đang chứa quá nhiều dòng code xử lý mảng, gọi nhiều API lồng nhau, hay xử lý logic tính toán, hãy mạnh dạn tách chúng ra Service!
