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

// Cách CŨ: decorator + EventEmitter + phụ thuộc lifecycle
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
  // @Input: biến thường - KHÔNG reactive.
  // Muốn phản ứng khi cha đổi giá trị phải viết ngOnChanges
  @Input({required: true}) label!: string;
  @Input() max = 5;

  // Two-way binding thủ công: phải tự tạo cặp @Input + @Output
  // theo đúng convention tên "<name>Change" thì [( )] mới hoạt động
  @Input() quantity = 1;
  @Output() quantityChange = new EventEmitter<number>();

  @Output() reachedMax = new EventEmitter<number>();

  // @ViewChild: undefined cho tới AfterViewInit, và KHÔNG reactive -
  // không đọc được trong computed/effect; @ViewChildren muốn biết
  // danh sách thay đổi phải tự nghe QueryList.changes
  @ViewChild('plusBtn') plusBtn?: ElementRef<HTMLButtonElement>;

  ngOnChanges(changes: SimpleChanges) {
    // Tự dò xem input nào đổi...
    if (changes['max']) {
      console.log('max đổi thành', this.max);
    }
  }

  ngAfterViewInit() {
    // Phải đợi đúng lifecycle mới dám đụng vào query
    console.log('plus button:', this.plusBtn?.nativeElement);
  }

  increase() {
    if (this.quantity >= this.max) {
      this.reachedMax.emit(this.quantity);
      return;
    }
    this.quantity += 1;
    this.quantityChange.emit(this.quantity); // phải TỰ emit để two-way chạy
  }

  decrease() {
    this.quantity = Math.max(1, this.quantity - 1);
    this.quantityChange.emit(this.quantity);
  }
}
