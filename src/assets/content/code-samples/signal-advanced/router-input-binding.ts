// Bước 1: bật tính năng MỘT lần ở app.config.ts
//   provideRouter(routes, withComponentInputBinding())

import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-voucher-demo',
  template: `
    <button (click)="applyVoucher('SALE50')">?voucher=SALE50</button>
    <button (click)="applyVoucher('FREESHIP')">?voucher=FREESHIP</button>
    <button (click)="applyVoucher(null)">Xóa voucher</button>

    <!-- Xóa param thì input nhận undefined -> cần fallback khi hiển thị -->
    <p>voucher() = {{ voucher() || '(chưa có)' }}</p>
  `,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VoucherDemo {
  private readonly router = inject(Router);

  // Component nằm trong route + input trùng tên query param -> tự bind:
  // URL ?voucher=SALE50 -> voucher() === 'SALE50'
  // Không inject ActivatedRoute, không subscribe params, không unsubscribe.
  readonly voucher = input<string>('(chưa có)');

  // Đổi param = điều hướng: URL là nguồn sự thật duy nhất.
  // Router cập nhật URL -> binding tự đẩy giá trị mới vào voucher()
  applyVoucher(code: string | null) {
    this.router.navigate([], {
      queryParams: { voucher: code }, // null = xóa param khỏi URL
      queryParamsHandling: 'merge', // giữ nguyên các param khác
    });
  }

  // PATH PARAM cũng bind y hệt - route 'products/:id', URL /products/42:
  //   readonly id = input.required<number, string>({ transform: numberAttribute });
  // (param luôn là string -> transform sang number; trùng tên thì ưu tiên:
  //  route data > path param > query param)
  //
  // Vì id() là signal, nối thẳng vào resource - URL đổi là tự fetch lại:
  //   readonly product = httpResource(() => `/api/products/${this.id()}`);
}
