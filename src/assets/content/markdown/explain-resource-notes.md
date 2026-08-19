#### ⚠️ Những điều cần lưu ý khi dùng Resource

1. **Vẫn là API experimental** (tính đến Angular 21: `resource` từ v19.0, `httpResource` từ v19.2). API có thể còn thay đổi giữa các major - đọc changelog trước khi nâng cấp, cân nhắc khi đưa vào production lâu dài.

2. **Chỉ dành cho READ, không dùng cho mutation (POST/PUT/DELETE)**

- Resource sẽ **hủy loader đang chạy** khi params đổi hoặc component destroy - một mutation bị hủy giữa chừng có thể để lại dữ liệu nửa vời phía server.
- Mutation nên là hành động tường minh: gọi service trong event handler như bình thường.

3. **`value()` sẽ THROW khi status là `'error'`**

- Đọc an toàn bằng `hasValue()` (type guard) hoặc rẽ nhánh theo `error()` / `isLoading()` như demo phía trên.
- `defaultValue` chỉ giúp tránh `undefined` khi **chưa load xong** - không "đỡ" được trạng thái error.

4. **Nhớ dùng `abortSignal` trong loader tự viết**

- Với `httpResource`/`rxResource` việc hủy đã được lo sẵn; với `resource()` + `fetch`, phải truyền `{signal: abortSignal}` thì request cũ mới bị hủy thật ở tầng network - không truyền thì chỉ là "bỏ qua kết quả".

5. **`set()`/`update()` là ghi đè cục bộ (status `'local'`)**

- Hợp cho optimistic UI, nhưng giá trị local sẽ bị **thay thế** ngay khi loader chạy lại (đổi params / reload).

6. **SSR**: loader cũng chạy trên server khi component được render - loader chậm sẽ kéo dài thời gian prerender/SSR (demo trang này guard `isPlatformBrowser` để server trả ngay).
