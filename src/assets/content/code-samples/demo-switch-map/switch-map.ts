import { Component, inject, OnInit } from '@angular/core';
import { UserService } from '@services/user.service';
import { ProductService } from '@services/product.service';
import { filter, switchMap, EMPTY } from 'rxjs';

@Component({
  selector: 'app-example-switch-map',
  template: `<p>Open console to see the log</p>`,
  standalone: true,
})
export class ExampleSwitchMapComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly productService = inject(ProductService);

  ngOnInit() {
    console.log('Bắt đầu quy trình với Toán tử SwitchMap...');

    // Chỉ dùng DUY NHẤT 1 hàm subscribe ở cuối cùng
    this.userService.isLoggedIn$
      .pipe(
        switchMap((isLoggedIn) => {
          if (!isLoggedIn) {
            console.log('1. User chưa đăng nhập.');
            return EMPTY; // Trả về Observable rỗng để ngắt luồng tiếp theo
          }
          // Nếu đã đăng nhập, bẻ lái luồng gọi sang Observable lấy Profile
          return this.userService.userProfile$;
        }),
        filter((profile) => !!profile), // Trích lọc: Chỉ cho đi tiếp phần bên dưới nếu profile có data thật
        switchMap((profile) => {
          console.log('2. Đã có Profile, Mã code:', profile.code);
          // Tiếp tục bẻ lái luồng gọi sang API lấy danh sách Sản phẩm dựa vào code
          return this.productService.getProductByUserId(profile.code);
        }),
      )
      .subscribe((products) => {
        // Kết quả trả về cuối cùng là từ hàm getProductByUserId
        console.log(`3. Lấy thành công ${products.length} sản phẩm của user.`);
      });
  }
}
