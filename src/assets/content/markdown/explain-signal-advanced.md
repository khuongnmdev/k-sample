## Signal Advanced: linkedSignal - Custom Equality - Router Input Binding

Ba công cụ dành cho người đã vững bộ ba `signal` / `computed` / `effect`.
Điểm chung: cả ba đều giải quyết những tình huống mà bộ ba cơ bản xử lý gượng ép.

---

### 1. linkedSignal - "computed GHI ĐÈ ĐƯỢC"

Đặt cạnh nhau sẽ thấy ngay chỗ trống mà `linkedSignal` lấp:

| Tiêu chí                        | `signal()` | `computed()` | `linkedSignal()` |
| :------------------------------ | :--------- | :----------- | :--------------- |
| User ghi đè được (`.set()`)     | Có         | Không        | Có               |
| Tự tính lại khi nguồn đổi       | Không      | Có           | Có               |

Ví dụ Betslip trong demo - cờ `oddsChanged`:

- User phải **tắt được cờ** (bấm "Chấp nhận odds mới") - phải ghi được, `computed` không làm nổi.
- Nhưng khi `odds` (nguồn) thay đổi, cờ phải **tự bật lại** - `signal` thường không tự làm.
- Nếu dùng `signal` + `effect` để tự bật: chạy được, nhưng đó chính là anti-pattern "effect set signal khác" đã cảnh báo ở trang Core Primitives.
- Lưu ý UX: stake user đang nhập là `signal` thường, odds đổi không đụng tới - đừng phá dữ liệu user đang gõ.

Hai dạng cú pháp:

```ts
// Dạng gọn: mọi signal đọc trong callback đều là nguồn tính lại
readonly selected = linkedSignal(() => this.products()[0]);

// Dạng đầy đủ: tách source riêng, đọc được giá trị TRƯỚC ĐÓ (previous)
readonly oddsChanged = linkedSignal({
  source: this.odds,
  computation: (odds, previous) => previous !== undefined,
});
```

**Use case cụ thể:**

- **Betslip**: odds đổi thì cờ "cần xác nhận lại" tự bật, stake user giữ nguyên (chính sách chặt hơn: reset luôn stake - cũng chỉ là một linkedSignal khác).
- **Selection theo list**: list load lại thì item đang chọn tự về phần tử đầu (hoặc giữ nếu còn tồn tại - dùng `previous`).
- **Phân trang**: đổi filter/keyword thì trang tự về 1, nhưng user vẫn bấm chuyển trang được.
- **Form draft theo entity**: mở record khác thì các field nhập dở tự reset về giá trị record mới.

> Đừng lạm dụng: nếu user KHÔNG cần ghi đè, `computed` vẫn là lựa chọn đúng - đơn giản hơn và không thể bị set sai.

---

### 2. Custom Equality - dạy signal biết thế nào là "không đổi"

Cơ chế: mỗi lần `.set()` / `.update()`, signal so sánh giá trị mới với giá trị cũ.
"Không đổi" thì **không notify ai cả** - computed không tính lại, effect không chạy, template không render.

Mặc định so sánh bằng `Object.is`:

- Primitive (number, string, boolean): so sánh giá trị - hoạt động đúng như kỳ vọng.
- **Object / array: so sánh REFERENCE** - đây là nơi sinh ra 2 cái bẫy ngược chiều nhau:

| Bẫy                  | Tình huống                                                        | Hậu quả                                    |
| :------------------- | :---------------------------------------------------------------- | :----------------------------------------- |
| **Notify thừa**      | Polling/refetch trả object MỚI nhưng nội dung Y HỆT               | computed/effect/render chạy lại vô ích     |
| **Không update**     | Mutate object tại chỗ rồi `.set()` lại CÙNG reference             | UI đứng im dù dữ liệu đã đổi               |

Cách xử lý đúng:

- Bẫy notify thừa: thêm `equal` so sánh theo nội dung - `signal(value, {equal: (a, b) => ...})`.
- Bẫy không update: **luôn immutable update** - `update((u) => ({...u, age: 99}))`, không bao giờ mutate tại chỗ.
- `computed` cũng nhận `equal` y hệt: chặn lan truyền khi kết quả tính ra tương đương.

**Use case cụ thể:**

- **Polling** (trang Demo Polling): server trả cùng dữ liệu mỗi nhịp - `equal` giúp UI chỉ render khi dữ liệu THẬT SỰ đổi.
- **Object tọa độ / filter phức tạp**: `{x, y}` hay `{page, sort, keyword}` tạo mới mỗi lần nhưng thường trùng nội dung.
- Lưu ý: hàm `equal` chạy MỖI lần set - giữ nó rẻ (so sánh vài field), tránh `JSON.stringify` cho object lớn.

---

### 3. withComponentInputBinding - URL param chảy thẳng vào input()

Bật một lần ở `app.config.ts`:

```ts
provideRouter(routes, withComponentInputBinding());
```

Từ đó, component nằm trong route được bind tự động: **route data, path param, query param** cứ trùng tên `input()` là chảy vào (trùng nhau thì ưu tiên: data > path param > query param).

So với cách cũ:

| Cách cũ (ActivatedRoute)                  | Cách mới (input binding)                     |
| :---------------------------------------- | :------------------------------------------- |
| Inject + subscribe `paramMap`             | Khai báo `input()` trùng tên - hết           |
| Phải nhớ unsubscribe                      | Không có gì để unsubscribe                   |
| Tự convert string -> number               | `input({transform: numberAttribute})`        |
| Giá trị nằm ngoài hệ signal               | Là signal - đưa thẳng vào computed/resource  |

**Use case cụ thể:**

- **Trang detail**: `products/:id` - `id()` đưa thẳng vào `httpResource(() => '/api/products/' + this.id())`, URL đổi là tự fetch lại.
- **Filter / tab / voucher trên URL**: share link cho đồng nghiệp là ra đúng trạng thái đang xem, F5 không mất state.
- **Test dễ hơn**: component chỉ phụ thuộc `input()`, không cần mock ActivatedRoute.

---

### Key takeaways

- Cần state dẫn xuất mà user ghi đè được: `linkedSignal` - đừng dùng effect để tự reset.
- Signal chứa object: immutable update là bắt buộc; cân nhắc `equal` khi dữ liệu hay được set lại y hệt.
- Param từ URL: bật `withComponentInputBinding` một lần, cả app khỏi inject ActivatedRoute.
