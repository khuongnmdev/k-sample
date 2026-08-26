// Bước 1: bật tính năng ở app.config.ts
//   provideRouter(routes, withComponentInputBinding())

import { ChangeDetectionStrategy, Component, input, numberAttribute } from '@angular/core';

// Route: { path: 'products/:id', component: ProductDetail }
// URL:   /products/42?voucher=SALE50
@Component({
  selector: 'app-product-detail',
  template: `
    <p>Đang xem sản phẩm #{{ id() }}</p>
    <p>Voucher: {{ voucher() }}</p>
  `,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetail {
  // Path param ':id' tự chảy vào input trùng tên.
  // Param luôn là string -> transform numberAttribute đổi sang number.
  readonly id = input.required<number, string>({ transform: numberAttribute });

  // Query param '?voucher=...' cũng tự bind; vắng mặt thì dùng giá trị mặc định
  readonly voucher = input<string>('(chưa có)');

  // TRƯỚC ĐÂY phải viết:
  //   private route = inject(ActivatedRoute);
  //   this.route.paramMap.subscribe(params => this.id = Number(params.get('id')));
  // - phải nhớ unsubscribe, phải tự convert kiểu, không dùng được với computed.
  //
  // GIỜ: id() là signal - đưa thẳng vào computed / resource:
  //   readonly product = httpResource(() => `/api/products/${this.id()}`);

  // Trùng tên thì thứ tự ưu tiên: route data > path param > query param
}
