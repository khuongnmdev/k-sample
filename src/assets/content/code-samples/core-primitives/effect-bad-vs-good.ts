// ❌ BAD: dùng effect để "đồng bộ" state dẫn xuất - effect đi set một signal khác
export class CartBad {
  readonly quantity = signal(1);
  readonly price = signal(50_000);
  readonly total = signal(0); // state dẫn xuất nhưng khai báo là signal thường

  constructor() {
    effect(() => {
      // Data flow chạy "ngược": effect chạy SAU khi Angular đã render,
      // nên total luôn trễ một nhịp so với quantity/price;
      // dễ tạo vòng lặp cập nhật (effect set signal -> effect khác chạy...),
      // khó debug - Angular khuyến cáo TRÁNH pattern này.
      this.total.set(this.quantity() * this.price());
    });
  }
}

// ✅ GOOD: state dẫn xuất là computed - đồng bộ ngay trong cùng một nhịp,
// lazy + memoized, read-only nên không ai set sai được
export class CartGood {
  readonly quantity = signal(1);
  readonly price = signal(50_000);
  readonly total = computed(() => this.quantity() * this.price());
}
