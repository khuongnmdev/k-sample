import {ChangeDetectionStrategy, Component, computed, effect, signal} from '@angular/core';

@Component({
  selector: 'app-example-core-primitives',
  template: `
    <p>Quantity: {{ quantity() }} × Price: {{ price() }} = Total: {{ total() }}</p>
    <button (click)="addQuantity()">Quantity +1</button>
    <button (click)="addPrice()">Price +10.000</button>
    <button (click)="reset()">Reset</button>
  `,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExampleCorePrimitivesComponent {
  // 1. signal - STATE GỐC (writable): nguồn dữ liệu để UI/logic đọc,
  //    chỉ thay đổi qua .set() / .update()
  protected readonly quantity = signal(1);
  protected readonly price = signal(50_000);

  // 2. computed - STATE DẪN XUẤT (read-only): tự tính lại khi dependency đổi,
  //    lazy (chỉ tính khi có người đọc) + memoized (không đổi thì không tính lại)
  protected readonly total = computed(() => this.quantity() * this.price());

  constructor() {
    // 3. effect - SIDE EFFECT: tự chạy lại khi signal đọc bên trong thay đổi.
    //    Dùng để "tác động ra ngoài": log, localStorage, vẽ chart, sync DOM...
    //    KHÔNG dùng để tạo ra state mới (việc đó là của computed!)
    effect(() => {
      console.log(`[effect] total = ${this.total()}`);
    });
  }

  addQuantity() {
    // .update(): tính giá trị MỚI dựa trên giá trị CŨ
    this.quantity.update((q) => q + 1);
  }

  addPrice() {
    this.price.update((p) => p + 10_000);
  }

  reset() {
    // .set(): gán thẳng giá trị mới
    this.quantity.set(1);
    this.price.set(50_000);
  }
}
