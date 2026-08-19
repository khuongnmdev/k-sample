import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import {isPlatformBrowser} from '@angular/common';
import {CodePresenter} from '@components/code-presenter/code-presenter';

@Component({
  selector: 'app-core-primitives',
  imports: [CodePresenter],
  templateUrl: './core-primitives.html',
  styleUrl: './core-primitives.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CorePrimitives {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  protected showExplainPrimitives = signal<boolean>(false);
  protected showAvoidEffect = signal<boolean>(false);

  // 1. signal: state gốc (writable)
  protected readonly quantity = signal(1);
  protected readonly price = signal(50_000);

  // 2. computed: state dẫn xuất (read-only, lazy + memoized)
  protected readonly total = computed(() => this.quantity() * this.price());

  constructor() {
    // 3. effect: side effect - log mỗi khi total đổi
    // (browser-only: keep SSR/prerender terminal output clean)
    effect(() => {
      const total = this.total();
      if (this.isBrowser) {
        console.log(`[effect] total = ${total}`);
      }
    });
  }

  protected addQuantity() {
    this.quantity.update((q) => q + 1);
  }

  protected addPrice() {
    this.price.update((p) => p + 10_000);
  }

  protected reset() {
    this.quantity.set(1);
    this.price.set(50_000);
  }

  protected triggerExplainPrimitives() {
    this.showExplainPrimitives.set(true);
  }

  protected triggerAvoidEffect() {
    this.showAvoidEffect.set(true);
  }
}
