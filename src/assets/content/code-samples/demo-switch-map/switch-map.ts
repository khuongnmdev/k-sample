import {Component, DestroyRef, inject, OnInit} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
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
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit() {
    // Chỉ dùng DUY NHẤT 1 hàm subscribe ở cuối cùng
    this.userService.isLoggedIn$
      .pipe(
        // 1. Bẻ lái tầng 1: đã login thì chuyển sang luồng Profile,
        //    chưa login thì trả về EMPTY - ngắt luồng, không gì chạy xuống dưới
        switchMap((isLoggedIn) => (isLoggedIn ? this.userService.userProfile$ : EMPTY)),
        // 2. Cổng chắn: chỉ cho đi tiếp khi đã thực sự có dữ liệu profile
        filter((profile) => !!profile),
        // 3. Bẻ lái tầng 2: dùng mã code của Profile gọi API lấy danh sách Sản phẩm
        switchMap((profile) => {
          console.log('2. Đã có Profile, Mã code:', profile.code);
          return this.productService.getProductByUserId(profile.code);
        }),
        // 4. Tự hủy subscription khi component destroy - chặn Memory Leak
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((products) => {
        // Kết quả trả về cuối cùng là từ hàm getProductByUserId
        console.log(`3. Lấy thành công ${products.length} sản phẩm của user.`);
      });
  }
}
