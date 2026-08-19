import {ChangeDetectionStrategy, Component, input, model, output} from '@angular/core';

@Component({
  selector: 'app-quantity-stepper',
  standalone: true,
  template: `
    <b>{{ label() }}</b>
    <button (click)="decrease()">-</button>
    <span>{{ quantity() }}</span>
    <button (click)="increase()">+</button>
    <small>(max {{ max() }})</small>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuantityStepper {
  // 1. input(): dữ liệu cha -> con, là READ-ONLY signal.
  //    .required = bắt buộc truyền, được check ngay lúc COMPILE
  readonly label = input.required<string>();
  readonly max = input(5); // input có giá trị mặc định

  // 2. model(): WRITABLE signal input - vừa nhận giá trị từ cha,
  //    vừa .set()/.update() ngược lại được. Tự phát event "quantityChange"
  //    -> cha bind hai chiều bằng [(quantity)]
  readonly quantity = model(1);

  // 3. output(): sự kiện con -> cha. Không cần EventEmitter,
  //    tự cleanup khi component destroy
  readonly reachedMax = output<number>();

  increase() {
    if (this.quantity() >= this.max()) {
      this.reachedMax.emit(this.quantity());
      return;
    }
    // Ghi vào model -> giá trị chảy ngược lên signal của CHA
    this.quantity.update((q) => q + 1);
  }

  decrease() {
    this.quantity.update((q) => Math.max(1, q - 1));
  }
}
