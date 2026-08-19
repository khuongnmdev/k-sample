import {ChangeDetectionStrategy, Component, resource, signal} from '@angular/core';

interface DemoUser {
  name: string;
  code: string;
}

const FAKE_DB: Record<number, DemoUser> = {
  1: {name: 'Tèo', code: 'A'},
  2: {name: 'Tý', code: 'B'},
  3: {name: 'Na', code: 'C'},
};

@Component({
  selector: 'app-resource-user',
  template: `
    <button (click)="userId.set(1)">User 1</button>
    <button (click)="userId.set(2)">User 2</button>
    <button (click)="userId.set(3)">User 3</button>
    <button (click)="userId.set(404)">User 404 (lỗi)</button>
    <button (click)="user.reload()">reload()</button>

    <p>status(): {{ user.status() }} - isLoading(): {{ user.isLoading() }}</p>

    @if (user.isLoading()) {
      <p>Đang tải user {{ userId() }}...</p>
    } @else if (user.error()) {
      <p>error(): {{ user.error()?.message }}</p>
    } @else if (user.hasValue()) {
      <p>value(): user {{ user.value().name }} - mã code {{ user.value().code }}</p>
    }
  `,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResourceUserComponent {
  // params: signal đầu vào - đổi giá trị là loader TỰ chạy lại
  readonly userId = signal(1);

  // resource: "async data dưới dạng signal"
  readonly user = resource({
    // 1. params: hàm reactive - resource theo dõi mọi signal đọc bên trong
    params: () => this.userId(),

    // 2. loader: nhận {params, abortSignal}, trả về Promise
    loader: ({params: id, abortSignal}) => this.fetchUser(id, abortSignal),
  });

  // Giả lập API ~800ms; id không tồn tại -> reject để demo trạng thái error
  private fetchUser(id: number, abortSignal: AbortSignal): Promise<DemoUser> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        const found = FAKE_DB[id];
        if (found) {
          resolve(found);
        } else {
          reject(new Error(`Không tìm thấy user có id = ${id}`));
        }
      }, 800);

      // Đổi params / destroy -> Angular abort request cũ qua abortSignal
      abortSignal.addEventListener('abort', () => clearTimeout(timer));
    });
  }

  // Những gì resource cung cấp - TẤT CẢ đều là signal:
  // user.value()     - dữ liệu (THROW nếu đang ở trạng thái error)
  // user.status()    - 'idle' | 'loading' | 'reloading' | 'resolved' | 'error' | 'local'
  // user.error()     - Error | undefined
  // user.isLoading() - true khi đang loading/reloading
  // user.hasValue()  - type guard đọc value an toàn
  // user.reload()    - chạy lại loader với params hiện tại
}
