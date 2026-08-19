// Cách CŨ: decorator + EventEmitter + phụ thuộc lifecycle
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

  // @ViewChild: undefined cho tới AfterViewInit,
  // và không tự cập nhật khi element nằm trong @if/@for
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
}
