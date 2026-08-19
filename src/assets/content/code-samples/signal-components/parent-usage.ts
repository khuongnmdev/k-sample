import {ChangeDetectionStrategy, Component, computed, signal, viewChild} from '@angular/core';
import {QuantityStepper} from './quantity-stepper';

@Component({
  selector: 'app-parent-demo',
  imports: [QuantityStepper],
  template: `
    <!-- [(quantity)]: two-way binding thẳng vào model() của con -->
    <app-quantity-stepper
      label="Vé xem phim"
      [max]="5"
      [(quantity)]="ticketQuantity"
      (reachedMax)="onReachedMax($event)"
    />

    <p>Signal phía cha: {{ ticketQuantity() }}</p>
    <p>{{ stepperInfo() }}</p>
    <button (click)="reset()">Reset từ phía cha</button>
  `,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ParentDemoComponent {
  // WritableSignal phía cha, bind hai chiều với model(quantity) của con:
  // - Cha .set() -> con thấy giá trị mới ngay
  // - Con .update() -> signal này của cha đổi theo
  readonly ticketQuantity = signal(1);

  // 4. viewChild(): query component con dưới dạng SIGNAL (thay cho @ViewChild).
  //    Đọc an toàn ở mọi thời điểm (chưa có view thì trả undefined thay vì
  //    phải canh AfterViewInit), và vì là signal nên computed/effect
  //    tự chạy lại khi view được tạo/hủy (kể cả trong @if/@for)
  private readonly stepper = viewChild(QuantityStepper);

  // computed đọc xuyên qua viewChild -> TỰ tính lại khi state của con đổi
  readonly stepperInfo = computed(() => {
    const child = this.stepper();
    return child ? `viewChild() thấy quantity = ${child.quantity()}` : 'View chưa khởi tạo';
  });

  onReachedMax(value: number) {
    console.log(`output reachedMax: con báo đã chạm giới hạn ${value}`);
  }

  reset() {
    this.ticketQuantity.set(1);
  }
}
