import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import {isPlatformBrowser} from '@angular/common';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {Router} from '@angular/router';
import {interval} from 'rxjs';
import {CodePresenter} from '@components/code-presenter/code-presenter';
import {Betslip} from './betslip';

interface DemoUser {
  name: string;
  age: number;
}

const ODDS_INTERVAL_TIME = 5000;

@Component({
  selector: 'app-signal-advanced',
  imports: [CodePresenter, Betslip],
  templateUrl: './signal-advanced.html',
  styleUrl: './signal-advanced.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignalAdvanced {
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  protected showExplainSignalAdvanced = signal<boolean>(false);

  protected triggerExplainSignalAdvanced() {
    this.showExplainSignalAdvanced.set(true);
  }

  // ===== 1. linkedSignal - Betslip demo =====
  // Simulate the server pushing new odds every 5 seconds (random 1.1 - 2.0),
  // passed down to <app-betslip> via input()
  protected readonly liveOdds = signal(1.5);

  // ===== 2. Custom equality - object-holding signals and the `equal` option =====
  // Default: compared with Object.is - a NEW object with identical content still counts as "changed"
  protected readonly defaultUser = signal<DemoUser>({name: 'Tèo', age: 20});

  // Custom equal: compares by CONTENT - same content means silence, nobody gets notified
  protected readonly smartUser = signal<DemoUser>(
    {name: 'Tèo', age: 20},
    {equal: (a, b) => a.name === b.name && a.age === b.age},
  );

  // Count how many times each signal NOTIFIES its consumers (effect reruns)
  protected readonly defaultNotifyCount = signal(0);
  protected readonly smartNotifyCount = signal(0);

  constructor() {
    // Only run the odds changer in the browser (SSR/prerender does not need the interval)
    if (this.isBrowser) {
      interval(ODDS_INTERVAL_TIME)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.liveOdds.set(this.randomOdds()));
    }

    effect(() => {
      this.defaultUser();
      this.defaultNotifyCount.update((c) => c + 1);
    });
    effect(() => {
      this.smartUser();
      this.smartNotifyCount.update((c) => c + 1);
    });
  }

  // Random odds between 1.10 - 2.00, rounded to 2 decimals
  private randomOdds(): number {
    return Math.round((1.1 + Math.random() * 0.9) * 100) / 100;
  }

  // Simulate the server returning IDENTICAL data (but as a new object, new reference)
  protected refreshSameContent() {
    this.defaultUser.set({...this.defaultUser()});
    this.smartUser.set({...this.smartUser()});
  }

  // Content actually changes - both signals must notify
  protected increaseAge() {
    this.defaultUser.update((u) => ({...u, age: u.age + 1}));
    this.smartUser.update((u) => ({...u, age: u.age + 1}));
  }

  // ===== 3. withComponentInputBinding - query params flow into input() =====
  // URL ?voucher=SALE50 -> voucher() === 'SALE50'
  // No ActivatedRoute injection, no params subscription needed
  readonly voucher = input<string>('(chưa có)');

  protected applyVoucher(code: string | null) {
    this.router.navigate([], {
      queryParams: {voucher: code},
      queryParamsHandling: 'merge',
    });
  }
}
