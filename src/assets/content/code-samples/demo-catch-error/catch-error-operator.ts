import { Component, inject, OnInit } from '@angular/core';
import { UserService } from '@services/user.service';
import { ProductService } from '@services/product.service';
import { filter, switchMap, EMPTY, catchError, of } from 'rxjs';

@Component({
  selector: 'app-example-catch-error',
  template: `<p>Mở console để xem log</p>`,
  standalone: true,
})
export class ExampleCatchErrorComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly productService = inject(ProductService);

  ngOnInit() {
    console.log('Bắt đầu quy trình xử lý lỗi với CatchError...');

    this.userService.isLoggedIn$
      .pipe(
        switchMap((isLoggedIn) => {
          if (!isLoggedIn) {
            console.log('1. User chưa đăng nhập.');
            return EMPTY;
          }

          // --- CÁCH THỨ NHẤT: Bắt lỗi ở từng Observable con ---
          // Việc pipe catchError ngay bên trong switchMap giúp cô lập lỗi.
          // Nếu API Profile lỗi, cả luồng chính vẫn không chết.
          return this.userService.userProfile$.pipe(
            catchError((err) => {
              console.error('❌ Lỗi xảy ra khi lấy Profile:', err);
              // Trả về một giá trị fallback (null) để filter phía sau chặn lại an toàn
              return of(null);
            }),
          );
        }),
        filter((profile) => !!profile),
        switchMap((profile) => {
          console.log('2. Đã có Profile, đang gọi API lấy sản phẩm...');

          // Tiếp tục bắt lỗi riêng cho API sản phẩm
          return this.productService.getProductByUserId(profile!.code).pipe(
            catchError((err) => {
              console.error('❌ Lỗi xảy ra khi lấy Sản phẩm:', err);
              // Nếu lỗi, trả về mảng rỗng để UI vẫn hiển thị được (trạng thái no-data)
              return of([]);
            }),
          );
        }),
        catchError((globalErr) => {
          console.error('🚨 Lỗi Global (affect cả luồng):', globalErr);
          return of([]);
        }),
      )
      .subscribe({
        next: (products) => {
          console.log(`3. Kết quả cuối cùng:`, products);
        },
        error: (err) => {
          // Khối này sẽ KHÔNG bao giờ chạy nếu các catchError bên trên đã return "of(...)"
          console.log('Lỗi này lọt xuống tận Subscribe:', err);
        },
      });
  }
}
