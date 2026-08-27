// Step 1: enable the feature ONCE in app.config.ts
//   provideRouter(routes, withComponentInputBinding())

import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-voucher-demo',
  template: `
    <button (click)="applyVoucher('SALE50')">?voucher=SALE50</button>
    <button (click)="applyVoucher('FREESHIP')">?voucher=FREESHIP</button>
    <button (click)="applyVoucher(null)">Clear voucher</button>

    <!-- Removing the param makes the input receive undefined -> need a display fallback -->
    <p>voucher() = {{ voucher() || '(none)' }}</p>
  `,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VoucherDemo {
  private readonly router = inject(Router);

  // Component inside a route + input matching the query param name -> auto bind:
  // URL ?voucher=SALE50 -> voucher() === 'SALE50'
  // No injecting ActivatedRoute, no subscribing to params, no unsubscribing.
  readonly voucher = input<string>('(none)');

  // Changing the param = navigating: the URL is the single source of truth.
  // Router updates the URL -> the binding pushes the new value into voucher()
  applyVoucher(code: string | null) {
    this.router.navigate([], {
      queryParams: { voucher: code }, // null = remove the param from the URL
      queryParamsHandling: 'merge', // keep the other params intact
    });
  }

  // PATH PARAMS bind exactly the same - route 'products/:id', URL /products/42:
  //   readonly id = input.required<number, string>({ transform: numberAttribute });
  // (params are always strings -> transform to number; on a name clash the priority is:
  //  route data > path param > query param)
  //
  // Because id() is a signal, wire it straight into a resource - URL changes -> auto refetch:
  //   readonly product = httpResource(() => `/api/products/${this.id()}`);
}
