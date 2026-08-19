import {ChangeDetectionStrategy, Component, input, model, output} from '@angular/core';

@Component({
  selector: 'app-quantity-stepper',
  standalone: true,
  template: `
    <div class="stepper">
      <b>{{ label() }}</b>
      <button class="btn" (click)="decrease()">-</button>
      <span class="value">{{ quantity() }}</span>
      <button class="btn" (click)="increase()">+</button>
      <small>(max {{ max() }})</small>
    </div>
  `,
  styles: `
    .stepper {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin: 0.5rem 0;
    }
    .value {
      min-width: 2rem;
      text-align: center;
      font-weight: bold;
      color: red;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuantityStepper {
  // input(): dữ liệu cha truyền xuống, read-only signal
  readonly label = input.required<string>();
  readonly max = input(5);

  // model(): writable signal input - nhận từ cha VÀ set ngược lại được (two-way)
  readonly quantity = model(1);

  // output(): sự kiện con báo lên cha
  readonly reachedMax = output<number>();

  increase() {
    if (this.quantity() >= this.max()) {
      this.reachedMax.emit(this.quantity());
      return;
    }
    this.quantity.update((q) => q + 1);
  }

  decrease() {
    this.quantity.update((q) => Math.max(1, q - 1));
  }
}
