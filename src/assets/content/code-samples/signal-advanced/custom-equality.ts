import { ChangeDetectionStrategy, Component, effect, signal } from '@angular/core';

interface User {
  name: string;
  age: number;
}

@Component({
  selector: 'app-custom-equality-demo',
  template: `
    <button (click)="refreshSameContent()">Server trả y hệt (ref mới)</button>
    <button (click)="increaseAge()">Tăng tuổi (+1)</button>
    <p>signal mặc định notify: {{ defaultNotifyCount() }}</p>
    <p>signal có equal notify: {{ smartNotifyCount() }}</p>
  `,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomEqualityDemo {
  // Mặc định so sánh bằng Object.is: với object là so sánh REFERENCE
  // -> object MỚI cùng nội dung vẫn bị coi là "đã đổi"
  readonly defaultUser = signal<User>({ name: 'Tèo', age: 20 });

  // equal tùy chỉnh: so sánh theo NỘI DUNG
  // -> nội dung trùng thì im lặng, không notify ai cả
  readonly smartUser = signal<User>(
    { name: 'Tèo', age: 20 },
    { equal: (a, b) => a.name === b.name && a.age === b.age },
  );

  // "Máy đếm" của demo: mỗi effect ĐỌC một signal - chỉ cần đọc là effect
  // phụ thuộc vào signal đó. Signal notify -> effect chạy lại -> counter +1.
  // Cả hai bắt đầu từ 1 vì effect luôn chạy lần đầu khi khởi tạo.
  readonly defaultNotifyCount = signal(0);
  readonly smartNotifyCount = signal(0);

  constructor() {
    effect(() => {
      this.defaultUser();
      this.defaultNotifyCount.update((c) => c + 1);
    });
    effect(() => {
      this.smartUser();
      this.smartNotifyCount.update((c) => c + 1);
    });
    // Lưu ý: effect ở đây chỉ làm nhiệm vụ ĐO ĐẠC cho demo (như log) - hợp lệ.
    // Đừng dùng effect để TÍNH state từ signal khác - đó là việc của computed.
  }

  // Nút 1: giả lập server trả DỮ LIỆU Y HỆT nhưng là object mới (reference mới)
  // -> defaultUser notify (THỪA - render/tính lại vô ích), smartUser im lặng nhờ equal
  refreshSameContent() {
    this.defaultUser.set({ ...this.defaultUser() });
    this.smartUser.set({ ...this.smartUser() });
  }

  // Nút 2: nội dung đổi thật -> CẢ HAI cùng notify (equal trả false)
  increaseAge() {
    this.defaultUser.update((u) => ({ ...u, age: u.age + 1 }));
    this.smartUser.update((u) => ({ ...u, age: u.age + 1 }));
  }

  // Bẫy NGƯỢC cần nhớ: mutate tại chỗ rồi set lại CÙNG reference
  //   const u = this.defaultUser();
  //   u.age = 99;
  //   this.defaultUser.set(u); // cùng ref -> Object.is bảo "không đổi" -> UI ĐỨNG IM!
  // Cách đúng: luôn immutable update như increaseAge() ở trên.

  // computed cũng nhận equal y hệt:
  //   readonly total = computed(() => ({ ... }), { equal: (a, b) => a.sum === b.sum });
}
