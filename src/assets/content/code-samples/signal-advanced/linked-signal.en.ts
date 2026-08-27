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
      Current odds: {{ odds() }}
      @if (oddsChanged()) {
        <button (click)="acceptOdds()">Accept new odds</button>
      }
    </p>
    <input type="number" [value]="stake() || ''" (input)="setStake($any($event.target).value)" />
    <p>Potential win: {{ potentialWin() }}</p>
    <button [disabled]="oddsChanged() || !stake()">Place bet</button>
  `,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Betslip {
  // Odds pushed in by the parent - the server can change them at any time
  readonly odds = input.required<number>();

  // Stake is a PLAIN signal: the user has full control,
  // odds changes do NOT touch the amount the user is typing
  readonly stake = signal(0);

  // linkedSignal: the "odds changed, needs re-confirmation" flag
  // - odds (source) changes -> the flag TURNS ITSELF back on -> the Place bet button locks
  // - user clicks accept -> .set(false) overrides (something computed cannot do)
  // - previous === undefined means the FIRST computation -> false, nothing to confirm yet
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

  // A STRICTER policy (some bookmakers choose this): odds change -> RESET the stake too.
  // Still just another linkedSignal - changing the policy doesn't change the tool:
  //
  //   readonly stake = linkedSignal({
  //     source: this.odds,
  //     computation: () => 0, // odds change -> stake back to 0, user re-enters
  //   });
  //
  // Or be flexible with previous: keep the stake if odds only moved slightly (< 0.1)
  //
  //   computation: (odds, previous) =>
  //     previous && Math.abs(odds - previous.source) < 0.1 ? previous.value : 0,
}
