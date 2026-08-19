// ===== Bẫy 1: toObservable phát BẤT ĐỒNG BỘ và gộp giá trị (coalesce) =====
const counter = signal(0);
toObservable(counter).subscribe((value) => console.log(value));

counter.set(1);
counter.set(2);
counter.set(3);
// Output: chỉ log "3" MỘT lần - không phải 0, 1, 2, 3!
// toObservable chạy qua effect: mỗi "nhịp" chỉ lấy giá trị MỚI NHẤT.
// Khác hẳn BehaviorSubject.next() vốn phát đồng bộ từng giá trị.

// ===== Bẫy 2: toSignal subscribe NGAY LẬP TỨC (eager) =====
// Không "lười" như async pipe (chờ template render mới subscribe):
readonly data = toSignal(this.http.get('/api/heavy'));
// -> request bắn ngay tại dòng khai báo, kể cả khi template chưa dùng data().
// Subscription sống tới khi injector destroy (component destroy).

// ===== Bẫy 3: Observable lỗi -> ĐỌC signal sẽ throw =====
readonly risky = toSignal(
  this.http.get('/api/may-fail'), // nếu stream lỗi...
);
// risky() -> THROW ngay tại chỗ đọc (trong template!)
// => luôn catchError TRƯỚC khi đưa vào toSignal:
readonly safe = toSignal(
  this.http.get<Item[]>('/api/may-fail').pipe(catchError(() => of([] as Item[]))),
  {initialValue: [] as Item[]},
);

// ===== Bẫy 4: Observable complete -> signal "đóng băng" =====
// Sau khi nguồn complete, signal giữ nguyên giá trị cuối cùng mãi mãi -
// muốn dữ liệu "sống" thì nguồn phải là stream còn mở (Subject, interval...).
