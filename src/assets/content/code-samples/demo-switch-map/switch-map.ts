import {Component, inject, OnInit} from '@angular/core';
import {UserService} from '@services/user.service';
import {ProductService} from '@services/product.service';
import {filter, switchMap, EMPTY} from 'rxjs';

@Component({
  selector: 'app-example-switch-map',
  template: `<p>Open console to see the log</p>`,
  standalone: true,
})
export class ExampleSwitchMapComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly productService = inject(ProductService);

  ngOnInit() {
    // Chỉ dùng DUY NHẤT 1 hàm subscribe ở cuối cùng
    this.userService.isLoggedIn$
      .pipe(
        filter((isLoggedIn) => !!isLoggedIn), // Filter: Chỉ cho đi tiếp phần bên dưới nếu đã login
        // 2. Khi đã chắc chắn logged in, bẻ lái sang lấy Profile
        switchMap(() => this.userService.userProfile$),
        // 3. Lọc tiếp: Đảm bảo có profile data
        filter((profile) => !!profile),
        // 4. Bẻ lái sang API lấy danh sách sản phẩm
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
