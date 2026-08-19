// ===== toSignal: Observable -> Signal =====

// Cơ bản: chưa có giá trị thì signal trả undefined
readonly user = toSignal(this.userService.user$);
// -> Signal<User | undefined>

// initialValue: có giá trị ngay từ đầu, template không phải xử lý undefined
readonly products = toSignal(this.productService.products$, {initialValue: []});
// -> Signal<Product[]>

// requireSync: nguồn phát ĐỒNG BỘ ngay khi subscribe (BehaviorSubject,
// stream có startWith/shareReplay...) - không cần initialValue,
// nhưng sẽ THROW nếu nguồn không phát ngay
readonly theme = toSignal(this.themeSubject$, {requireSync: true});
// -> Signal<Theme>

// ===== toObservable: Signal -> Observable =====

readonly query = signal('');

// Đưa signal vào pipeline RxJS để dùng operator thời gian / điều phối
readonly suggestions$ = toObservable(this.query).pipe(
  debounceTime(300),
  switchMap((q) => this.api.suggest(q)),
);

// Ghi chú: cả toSignal lẫn toObservable đều cần INJECTION CONTEXT
// (khai báo ở field/constructor), hoặc truyền {injector} khi gọi ở nơi khác.

// Pattern "cây cầu khứ hồi" - chính CodePresenter của app này đang dùng:
// input signal -> computed(fileInfo) -> toObservable -> switchMap(HTTP) -> toSignal
