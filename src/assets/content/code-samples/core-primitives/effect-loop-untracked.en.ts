// ❌ INFINITE LOOP: the effect both READS and WRITES the same signal
export class AuditLogBad {
  readonly user = signal('Tèo');
  readonly logCount = signal(0);

  constructor() {
    effect(() => {
      // Reads user() AND logCount() -> the effect depends on BOTH signals
      console.log(`User: ${this.user()}, log entry #${this.logCount() + 1}`);

      // Writes logCount -> logCount changes -> the effect is triggered again
      // -> reads + writes logCount again -> INFINITE LOOP (frozen app, CPU burn)
      this.logCount.update((count) => count + 1);
    });
  }
}

// ✅ FIX with untracked: read a signal WITHOUT creating a dependency
export class AuditLogGood {
  readonly user = signal('Tèo');
  readonly logCount = signal(0);

  constructor() {
    effect(() => {
      // The effect ONLY depends on user() - the signal we want to track
      const user = this.user();

      // untracked: any signal read inside does NOT become a dependency,
      // so logCount changing does not re-trigger the effect -> loop gone
      untracked(() => {
        console.log(`User: ${user}, log entry #${this.logCount() + 1}`);
        this.logCount.update((count) => count + 1);
      });
    });
  }
}
