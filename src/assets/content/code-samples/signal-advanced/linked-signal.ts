import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  linkedSignal,
  signal,
} from '@angular/core';

@Component({
  selector: 'app-betslip',
  template: `
    <p>
      Odds hiện tại: {{ odds() }}
      @if (oddsChanged()) {
        <button (click)="acceptOdds()">Chấp nhận odds mới</button>
      }
    </p>
    <input type="number" [value]="stake() || ''" (input)="setStake($any($event.target).value)" />
    <p>Thắng dự kiến: {{ potentialWin() }}</p>
    <button [disabled]="oddsChanged() || !stake()">Đặt cược</button>
  `,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Betslip {
  // Odds do parent đẩy vào - server có thể đổi bất cứ lúc nào
  readonly odds = input.required<number>();

  // Stake là signal THƯỜNG: user toàn quyền,
  // odds đổi KHÔNG đụng vào số tiền user đang nhập
  readonly stake = signal(0);

  // linkedSignal: cờ "odds đã đổi, cần xác nhận lại"
  // - odds (source) đổi -> cờ TỰ BẬT lại true -> nút Đặt cược bị khóa
  // - user bấm chấp nhận -> .set(false) ghi đè (điều computed không làm được)
  // - previous === undefined nghĩa là lần tính ĐẦU TIÊN -> false, chưa có gì phải xác nhận
  readonly oddsChanged = linkedSignal({
    source: this.odds,
    computation: (_odds, previous) => previous !== undefined,
  });

  readonly potentialWin = computed(() => Math.round(this.stake() * this.odds() * 100) / 100);

  acceptOdds() {
    this.oddsChanged.set(false);
  }

  setStake(value: string) {
    this.stake.set(Number(value) || 0);
  }

  // Chính sách CHẶT hơn (một số nhà cái chọn cách này): odds đổi là RESET luôn stake.
  // Cũng chỉ là một linkedSignal khác - đổi chính sách không đổi công cụ:
  //
  //   readonly stake = linkedSignal({
  //     source: this.odds,
  //     computation: () => 0, // odds đổi -> stake về 0, user nhập lại
  //   });
  //
  // Hoặc mềm dẻo với previous: giữ stake nếu odds chỉ nhích nhẹ (< 0.1)
  //
  //   computation: (odds, previous) =>
  //     previous && Math.abs(odds - previous.source) < 0.1 ? previous.value : 0,
}
