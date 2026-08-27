// ❌ BAD: using an effect to "sync" derived state - the effect sets another signal
export class CartBad {
  readonly quantity = signal(1);
  readonly price = signal(50_000);
  readonly total = signal(0); // derived state, but declared as a plain signal

  constructor() {
    effect(() => {
      // Data flow runs "backwards": the effect runs AFTER Angular has rendered,
      // so total is always one tick behind quantity/price;
      // easy to create update loops (effect sets a signal -> another effect runs...),
      // hard to debug - Angular recommends AVOIDING this pattern.
      this.total.set(this.quantity() * this.price());
    });
  }
}

// ✅ GOOD: derived state as computed - synchronous within the same tick,
// lazy + memoized, read-only so nobody can set it incorrectly
export class CartGood {
  readonly quantity = signal(1);
  readonly price = signal(50_000);
  readonly total = computed(() => this.quantity() * this.price());
}
