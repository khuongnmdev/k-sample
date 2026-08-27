import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';

// The OLD way: decorators + EventEmitter + lifecycle dependence
@Component({
  selector: 'app-quantity-stepper-old',
  standalone: true,
  template: `
    <b>{{ label }}</b>
    <button (click)="decrease()">-</button>
    <span>{{ quantity }}</span>
    <button #plusBtn (click)="increase()">+</button>
    <small>(max {{ max }})</small>
  `,
})
export class QuantityStepperOld implements OnChanges, AfterViewInit {
  // @Input: a plain field - NOT reactive.
  // To react when the parent changes the value you must write ngOnChanges
  @Input({required: true}) label!: string;
  @Input() max = 5;

  // Manual two-way binding: you must create the @Input + @Output pair
  // following the "<name>Change" naming convention for [( )] to work
  @Input() quantity = 1;
  @Output() quantityChange = new EventEmitter<number>();

  @Output() reachedMax = new EventEmitter<number>();

  // @ViewChild: undefined until AfterViewInit, and NOT reactive -
  // cannot be read inside computed/effect; with @ViewChildren, to know
  // when the list changes you must listen to QueryList.changes yourself
  @ViewChild('plusBtn') plusBtn?: ElementRef<HTMLButtonElement>;

  ngOnChanges(changes: SimpleChanges) {
    // Manually figure out which input changed...
    if (changes['max']) {
      console.log('max changed to', this.max);
    }
  }

  ngAfterViewInit() {
    // Must wait for the right lifecycle hook before touching the query
    console.log('plus button:', this.plusBtn?.nativeElement);
  }

  increase() {
    if (this.quantity >= this.max) {
      this.reachedMax.emit(this.quantity);
      return;
    }
    this.quantity += 1;
    this.quantityChange.emit(this.quantity); // must emit MANUALLY for two-way to work
  }

  decrease() {
    this.quantity = Math.max(1, this.quantity - 1);
    this.quantityChange.emit(this.quantity);
  }
}
