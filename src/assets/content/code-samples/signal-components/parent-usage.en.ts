import {ChangeDetectionStrategy, Component, computed, signal, viewChild} from '@angular/core';
import {QuantityStepper} from './quantity-stepper';

@Component({
  selector: 'app-parent-demo',
  imports: [QuantityStepper],
  template: `
    <!-- [(quantity)]: two-way binding straight into the child's model() -->
    <app-quantity-stepper
      label="Movie tickets"
      [max]="5"
      [(quantity)]="ticketQuantity"
      (reachedMax)="onReachedMax($event)"
    />

    <p>Parent-side signal: {{ ticketQuantity() }}</p>
    <p>{{ stepperInfo() }}</p>
    <button (click)="reset()">Reset from the parent</button>
  `,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ParentDemoComponent {
  // Parent-side WritableSignal, two-way bound to the child's model(quantity):
  // - Parent .set() -> child sees the new value immediately
  // - Child .update() -> this parent signal changes too
  readonly ticketQuantity = signal(1);

  // 4. viewChild(): queries the child component as a SIGNAL (replaces @ViewChild).
  //    Safe to read at any time (returns undefined before the view exists
  //    instead of having to wait for AfterViewInit), and since it is a signal,
  //    computed/effect re-run when the view is created/destroyed (even inside @if/@for)
  private readonly stepper = viewChild(QuantityStepper);

  // computed reads through viewChild -> re-computes AUTOMATICALLY when the child's state changes
  readonly stepperInfo = computed(() => {
    const child = this.stepper();
    return child ? `viewChild() sees quantity = ${child.quantity()}` : 'View not initialized yet';
  });

  onReachedMax(value: number) {
    console.log(`output reachedMax: child reports it hit the limit ${value}`);
  }

  reset() {
    this.ticketQuantity.set(1);
  }
}
