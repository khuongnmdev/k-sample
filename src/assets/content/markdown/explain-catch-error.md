#### ✔️ Giải pháp: Sử dụng `catchError` để xử lý ngoại lệ

Trong RxJS, toán tử **`catchError`** được dùng để bắt các lỗi phát sinh trong một Observable. Khi có lỗi xảy ra, nó cho phép chúng ta xử lý lỗi đó (ví dụ: log lỗi) và trả về một Observable mới để "cứu vãn" luồng dữ liệu hoặc kết thúc luồng một cách êm đẹp.

Có hai chiến thuật chính được minh họa trong code:

1. **Inner catchError (Xử lý cục bộ):**
   - Đặt `catchError` ngay bên trong `switchMap` (ngay sau Observable con).
   - **Ưu điểm:** Nếu API con bị lỗi, chúng ta có thể trả về một giá trị mặc định (như `of(null)` hoặc `of([])`). Nhờ đó, luồng Observable gốc bên ngoài **vẫn sống** và tiếp tục lắng nghe các sự kiện tiếp theo.
   - Đây là cách tốt nhất để đảm bảo UI không bị "chết đứng" khi một request đơn lẻ gặp sự cố.

2. **Outer catchError (Xử lý toàn cục):**
   - Đặt `catchError` ở cuối chuỗi `pipe` của luồng chính.
   - **Đặc điểm:** Nếu lỗi lọt xuống tận đây, toàn bộ luồng Observable sẽ **bị hủy (unsubscribed)**.
   - Thường dùng để bắt các lỗi nghiêm trọng mà chúng ta không thể hồi phục được ở các tầng trên.

**Lưu ý quan trọng:** Để ngăn chặn lỗi làm "sập" luồng chính, hãy luôn ưu tiên sử dụng **Inner catchError** cho các lời gọi API bên trong `switchMap`.
