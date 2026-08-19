import {ChangeDetectionStrategy, Component, computed, signal, viewChild} from '@angular/core';
import {CodePresenter} from '@components/code-presenter/code-presenter';
import {QuantityStepper} from './quantity-stepper';

@Component({
  selector: 'app-signal-components',
  imports: [CodePresenter, QuantityStepper],
  templateUrl: './signal-components.html',
  styleUrl: './signal-components.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignalComponents {
  protected showExplainSignalApis = signal<boolean>(false);
  protected showOldVsNew = signal<boolean>(false);

  // WritableSignal phía cha - bind hai chiều [(quantity)] với model() của con
  protected readonly ticketQuantity = signal(1);

  // viewChild(): query component con dưới dạng Signal (thay cho @ViewChild)
  private readonly stepper = viewChild(QuantityStepper);

  // computed đọc XUYÊN QUA viewChild -> tự tính lại khi state của con thay đổi
  protected readonly stepperInfo = computed(() => {
    const child = this.stepper();
    return child
      ? `viewChild() đang thấy quantity trong con = ${child.quantity()}`
      : 'View chưa khởi tạo';
  });

  protected readonly maxMessage = signal('');

  protected onReachedMax(value: number) {
    this.maxMessage.set(`output (reachedMax): con báo đã chạm giới hạn ở ${value}!`);
  }

  protected resetFromParent() {
    // Cha set signal -> chảy xuống model() của con (chiều cha -> con của two-way)
    this.ticketQuantity.set(1);
    this.maxMessage.set('');
  }

  protected triggerExplainSignalApis() {
    this.showExplainSignalApis.set(true);
  }

  protected triggerOldVsNew() {
    this.showOldVsNew.set(true);
  }
}
