import { Component, inject, OnInit } from '@angular/core';
import { UserService } from '@services/user.service';
import { ProductService } from '@services/product.service';

@Component({
  selector: 'app-example-subscribe-hell',
  template: `<p>Open console to see the log</p>`,
  standalone: true,
})
export class ExampleSubscribeHellComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly productService = inject(ProductService);

  ngOnInit() {
    console.log('Bắt đầu check luồng dữ liệu Subscribe Hell...');

    // Tầng 1: Subscribe lắng nghe trạng thái đăng nhập
    this.userService.isLoggedIn$.subscribe((isLoggedIn) => {
      if (isLoggedIn) {
        // Tầng 2: Subscribe lấy thông tin Profile (nếu đã login)
        this.userService.userProfile$.subscribe((profile) => {
          if (profile) {
            console.log('2. Đã có Profile, Mã code:', profile.code);

            // Tầng 3: Subscribe dùng mã code của Profile để gọi API lấy danh sách sản phẩm
            this.productService.getProductByUserId(profile.code).subscribe((products) => {
              console.log(`3. Lấy thành công ${products.length} sản phẩm của user.`);
            });
          }
        });
      } else {
        console.log('1. User chưa đăng nhập.');
      }
    });
  }
}
