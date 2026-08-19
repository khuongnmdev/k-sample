// ❌ VÒNG LẶP VÔ HẠN: effect vừa ĐỌC vừa GHI cùng một signal
export class AuditLogBad {
  readonly user = signal('Tèo');
  readonly logCount = signal(0);

  constructor() {
    effect(() => {
      // Đọc user() VÀ logCount() -> effect phụ thuộc CẢ HAI signal
      console.log(`User: ${this.user()}, lần ghi log thứ ${this.logCount() + 1}`);

      // Ghi vào logCount -> logCount đổi -> effect bị kích hoạt lại
      // -> lại đọc + ghi logCount -> LẶP VÔ HẠN (treo app, ngốn CPU)
      this.logCount.update((count) => count + 1);
    });
  }
}

// ✅ FIX bằng untracked: đọc signal mà KHÔNG tạo dependency
export class AuditLogGood {
  readonly user = signal('Tèo');
  readonly logCount = signal(0);

  constructor() {
    effect(() => {
      // Effect CHỈ phụ thuộc user() - đây là tín hiệu ta muốn theo dõi
      const user = this.user();

      // untracked: mọi signal đọc bên trong đều KHÔNG thành dependency,
      // nên việc logCount đổi không kích hoạt lại effect -> hết vòng lặp
      untracked(() => {
        console.log(`User: ${user}, lần ghi log thứ ${this.logCount() + 1}`);
        this.logCount.update((count) => count + 1);
      });
    });
  }
}
