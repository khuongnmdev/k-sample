import {Component, inject, resource, signal} from '@angular/core';
import {rxResource} from '@angular/core/rxjs-interop';
import {httpResource} from '@angular/common/http';

@Component({selector: 'app-resource-cheatsheet', template: '...', standalone: true})
export class ResourceCheatsheet {
  private readonly productService = inject(ProductService);

  readonly userId = signal(1);

  // ===== 1. resource(): loader trả về PROMISE =====
  // Hợp với fetch API hoặc bất kỳ hàm async nào
  readonly user = resource({
    params: () => this.userId(),
    loader: ({params: id, abortSignal}) =>
      fetch(`/api/users/${id}`, {signal: abortSignal}).then((r) => r.json()),
    defaultValue: null, // giá trị dùng tạm khi chưa load xong -> value() không bao giờ undefined
  });

  // ===== 2. rxResource(): stream trả về OBSERVABLE =====
  // (import từ @angular/core/rxjs-interop) - hợp khi service đã trả Observable
  readonly products = rxResource({
    params: () => this.userId(),
    stream: ({params: id}) => this.productService.getProductByUserId(String(id)),
    defaultValue: [] as Product[],
  });

  // ===== 3. httpResource(): gói sẵn HttpClient - chỉ cần URL phản ứng =====
  // (import từ @angular/common/http) - URL đọc signal nào thì tự reload theo signal đó
  readonly profile = httpResource<UserProfile>(() => `/api/users/${this.userId()}/profile`);
  // - Vẫn đi qua interceptor, test bằng HttpTestingController như HttpClient thường
  // - Có thêm signal riêng: profile.headers(), profile.statusCode(), profile.progress()
}
