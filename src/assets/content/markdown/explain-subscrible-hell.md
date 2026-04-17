#### ❌ Tại sao Subscribe Hell lại tệ? (Bad Practice)

Khi bạn lồng quá nhiều hàm `subscribe()` vào trong nhau (như ví dụ Code bên dưới) sẽ sinh ra một loạt các vấn đề:

- **Code bị lồng sâu (Pyramid of doom):** Cấu trúc code lùi dần vào bên trong hình cái nêm, rất khó đọc và khó theo dõi luồng chạy, gây ác mộng khi bảo trì.
- **Quản lý huỷ (Unsubscribe) phức tạp:** Nếu người dùng chuyển màn hình (Destroy), việc gọi hàm `unsubscribe()` để chặn Memory Leak và chạy ngầm trở nên vô cùng nhọc nhằn vì bạn có quá nhiều Subscription nằm trong các Scope mở rộng lồng nhau.
- **Xử lý Lỗi (Error Handling) rời rạc:** Không thể bắt lỗi chung một chỗ. Ở mỗi tầng `subscribe`, bạn lại phải lặp lại việc viết một khối `error: (err) => ...` giống hệt nhau.
