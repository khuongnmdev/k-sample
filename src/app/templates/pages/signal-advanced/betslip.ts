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
    <div class="betslip">
      <div class="odds-row">
        Odds hiện tại:
        <span class="odds-value" [class.changed]="oddsChanged()">{{ odds() }}</span>
        @if (oddsChanged()) {
          <button class="accept-btn" (click)="acceptOdds()">Chấp nhận odds mới</button>
        }
      </div>
      <label>
        Stake (tiền cược):
        <input
          type="number"
          min="0"
          [value]="stake() || ''"
          (input)="setStake($any($event.target).value)"
          placeholder="Nhập tiền cược..."
        />
      </label>
      <div class="win-row">
        Thắng dự kiến: <b>{{ potentialWin() }}</b>
      </div>
      <button class="bet-btn" [disabled]="oddsChanged() || !stake()">
        @if (oddsChanged()) {
          Odds đã đổi - xác nhận trước
        } @else {
          Đặt cược
        }
      </button>
    </div>
  `,
  styles: `
    .betslip {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      border: 1px dashed var(--border-color);
      border-radius: 8px;
      padding: 0.75rem 1rem;
    }
    .odds-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    .odds-value {
      font-size: 1.2rem;
      font-weight: 700;
      color: #007bff;

      &.changed {
        color: #f0ad4e;
        animation: blink 0.8s ease-in-out infinite alternate;
      }
    }
    .accept-btn {
      padding: 0.25rem 0.6rem;
      font-size: 0.8rem;
      border: 1px solid #f0ad4e;
      border-radius: 6px;
      background: transparent;
      color: #f0ad4e;
      cursor: pointer;
      font-weight: 600;
    }
    label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
    }
    input {
      width: 110px;
      padding: 0.3rem 0.5rem;
      border: 1px solid var(--border-color);
      border-radius: 6px;
      background: var(--bg-color);
      color: var(--text-color);
    }
    .bet-btn {
      align-self: flex-start;
      padding: 0.4rem 1rem;
      border: none;
      border-radius: 6px;
      background: #5cb85c;
      color: white;
      font-weight: 700;
      cursor: pointer;

      &:disabled {
        background: var(--border-color);
        color: var(--text-color);
        opacity: 0.6;
        cursor: not-allowed;
      }
    }
    @keyframes blink {
      from { opacity: 1; }
      to { opacity: 0.45; }
    }
  `,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Betslip {
  // Odds pushed in by the parent - the server may change them at any time
  readonly odds = input.required<number>();

  // Stake is a PLAIN signal: fully user-owned - odds changes never touch what the user is typing
  readonly stake = signal(0);

  // linkedSignal: the "odds changed, needs re-confirmation" flag
  // - odds (source) changes -> the flag AUTO-RESETS to true, the Bet button locks
  // - user clicks "Accept new odds" -> set(false) overrides it
  // - first odds value (previous === undefined) -> false, nothing to confirm yet
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
}
