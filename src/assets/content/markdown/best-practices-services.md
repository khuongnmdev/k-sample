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

**Mapper** tách biệt hình dạng dữ liệu của Backend (**DTO**) khỏi **Model** mà UI sử dụng.
Backend đổi tên field, đổi format ngày? Chỉ phải sửa đúng MỘT chỗ: mapper.

Một mapper đầy đủ có 2 chiều:

- **`fromDTO`**: DTO → Model. Gọi ngay khi dữ liệu VỪA VÀO app (trong `pipe(map(...))` của Service).
- **`toDTO`**: Model → DTO. Gọi ngay trước khi dữ liệu RỜI app (body của POST/PUT).

```typescript
// user.mapper.ts

// DTO: hình dạng dữ liệu của BACKEND (snake_case, ngày dạng string...)
export interface UserDTO {
  user_id: number;
  full_name: string;
  birth_date: string; // '1995-08-26'
  vip_level: number;
}

// Model: hình dạng UI muốn dùng (camelCase, kiểu đúng, có field dẫn xuất)
export interface User {
  id: number;
  fullName: string;
  birthDate: Date;
  vipLevel: number;
  isVip: boolean; // field dẫn xuất cho UI - backend KHÔNG có field này
}

// DTO -> Model: đổi tên field, parse kiểu, tính sẵn field dẫn xuất
export function fromDTO(dto: UserDTO): User {
  return {
    id: dto.user_id,
    fullName: dto.full_name,
    birthDate: new Date(dto.birth_date),
    vipLevel: dto.vip_level,
    isVip: dto.vip_level >= 3,
  };
}

// Model -> DTO: trả về đúng format backend cần,
// field dẫn xuất (isVip) bị BỎ - không gửi ngược lên server
export function toDTO(user: User): UserDTO {
  return {
    user_id: user.id,
    full_name: user.fullName,
    birth_date: user.birthDate.toISOString().slice(0, 10),
    vip_level: user.vipLevel,
  };
}
```

Dùng trong Service - component không bao giờ nhìn thấy DTO:

```typescript
// user.service.ts
getUser(id: number): Observable<User> {
  return this.http.get<UserDTO>(`/api/users/${id}`).pipe(map(fromDTO));
}

updateUser(user: User): Observable<void> {
  return this.http.put<void>(`/api/users/${user.id}`, toDTO(user));
}
```

Quy tắc đi kèm:

- Mapper là **pure function**: nhận vào - trả ra, không side effect. Unit test cực dễ.
- Map ngay tại **biên** của app (trong Service). DTO không được lọt sâu vào component/template.
- Field dẫn xuất: giữ field gốc (`vipLevel`) để round-trip được, field dẫn xuất (`isVip`) chỉ thêm cho UI.
- Dự án nhỏ: mapper có thể là hàm trong Service. Dự án lớn: tách file riêng `*.mapper.ts`.

---

### 💡 Ai nên là người `subscribe`?

Đây là một trong những câu hỏi quan trọng nhất về kiến trúc: **Hầu hết trường hợp, Service chỉ nên trả về Observable (hoặc Signal), còn Component mới là người `subscribe`.**

- **Service:** Thiết kế "đường ống" dẫn nước (Observable) và các bộ lọc (Operators). Service không biết khi nào giao diện cần dữ liệu, nên nó chỉ cung cấp "khả năng lấy dữ liệu".
- **Component:** Là người "mở vòi" (Subscribe). Component quản lý vòng đời của chính nó, nên nó biết khi nào cần dừng lấy dữ liệu để tránh Memory Leak.
- **Mẹo từ bài Multicast:** Nếu stream trong Service được nhiều component cùng subscribe (config, danh mục, user profile...), hãy gắn `share()` / `shareReplay(1)` ngay trong Service — mỗi component cứ "mở vòi" bình thường nhưng server chỉ nhận đúng **1** request.

---

### 💡 Quy tắc "Vàng"

> **"Component quyết định CÁI GÌ được hiển thị, còn Service quyết định dữ liệu được lấy và xử lý NHƯ THẾ NÀO."**

Nếu bạn thấy Component của mình đang chứa quá nhiều dòng code xử lý mảng, gọi nhiều API lồng nhau, hay xử lý logic tính toán, hãy mạnh dạn tách chúng ra Service!
