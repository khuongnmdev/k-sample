### 💡 Ba "hương vị" của Resource

| API                | Loader trả về    | Import từ                       | Dùng khi                                                                 |
| :----------------- | :--------------- | :------------------------------ | :------------------------------------------------------------------------ |
| **`resource()`**   | `Promise`        | `@angular/core`                 | Hàm async bất kỳ: `fetch`, SDK bên thứ ba, IndexedDB...                  |
| **`rxResource()`** | `Observable`     | `@angular/core/rxjs-interop`    | Service hiện có đã trả Observable (HttpClient, store...).                |
| **`httpResource()`** | (gói sẵn HTTP) | `@angular/common/http`          | Gọi HTTP GET theo signal: chỉ cần đưa **URL phản ứng**, không cần loader. |

Cả ba cùng trả về một **ResourceRef** với bộ signal thống nhất: `value()`, `status()`, `error()`, `isLoading()` + `reload()` và `hasValue()`. Điểm khác nhau duy nhất: **bạn còn phải tự viết bao nhiêu phần của pipeline**.

---

### ❌ Trước đây: tự dàn dựng cả pipeline

Muốn "fetch user theo `userId`" có đủ loading/error state, ta phải tự viết trọn bộ khung này:

```typescript
readonly userId = signal(1);

// Tự dàn dựng: switchMap + error handling + loading state
private readonly userState$ = toObservable(this.userId).pipe(
  switchMap((id) =>
    this.http.get<User>(`/api/users/${id}`).pipe(
      map((data) => ({loading: false, data, error: null})),           // gói data
      startWith({loading: true, data: null, error: null}),            // tự chế loading state
      catchError((error) => of({loading: false, data: null, error})), // tự chế error state
    ),
  ),
);

// ...rồi mới quay về được thế giới Signal
readonly userState = toSignal(this.userState$, {
  initialValue: {loading: true, data: null, error: null},
});
```

Bốn operator, một kiểu state tự định nghĩa `{loading, data, error}` - và **mọi component** làm data fetching đều lặp lại đúng bộ khung này.

---

### ✅ Bây giờ: chọn một trong ba, tùy bạn đang có gì trong tay

```typescript
// 1. resource() - bạn có một hàm ASYNC bất kỳ (fetch, SDK, IndexedDB...)
readonly user = resource({
  params: () => this.userId(),
  loader: ({params: id, abortSignal}) =>
    fetch(`/api/users/${id}`, {signal: abortSignal}).then((r) => r.json()),
});

// 2. rxResource() - service của bạn ĐÃ trả Observable: giữ nguyên service,
//    chỉ vứt bỏ phần map/startWith/catchError/toSignal tự chế
readonly user = rxResource({
  params: () => this.userId(),
  stream: ({params: id}) => this.http.get<User>(`/api/users/${id}`),
});

// 3. httpResource() - chỉ là một HTTP GET? Chỉ cần cái URL
readonly user = httpResource<User>(() => `/api/users/${this.userId()}`);
```

Đối chiếu 1-1 khi dùng trong template:

| Bản tự chế (`userState()`) | Resource (`user`)                                   |
| :------------------------- | :--------------------------------------------------- |
| `userState().loading`      | `user.isLoading()`                                  |
| `userState().data`         | `user.value()`                                      |
| `userState().error`        | `user.error()`                                      |
| _(phải tự viết thêm)_      | `user.status()`, `user.reload()`, `user.hasValue()` |

---

### Cách nhớ nhanh

> `computed` là dẫn xuất **đồng bộ**, còn `resource` là dẫn xuất **bất đồng bộ** - cùng triết lý "khai báo công thức, Angular tự lo phần còn lại". Ba hương vị chỉ khác nhau ở chỗ: bạn đưa cho nó một `Promise`, một `Observable`, hay chỉ một cái **URL**.
