import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

interface User {
  name: string;
  age: number;
}

@Component({
  selector: 'app-custom-equality-demo',
  template: `<p>{{ userSmart().name }} - {{ userSmart().age }} tuổi</p>`,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomEqualityDemo {
  // Mặc định signal so sánh bằng Object.is:
  // - primitive (number, string, boolean): so sánh giá trị -> ổn
  // - object / array: so sánh REFERENCE -> đây là nơi sinh ra 2 cái bẫy
  readonly user = signal<User>({ name: 'Tèo', age: 20 });

  // equal tùy chỉnh: tự định nghĩa thế nào là "không đổi" (so sánh nội dung)
  readonly userSmart = signal<User>(
    { name: 'Tèo', age: 20 },
    { equal: (a, b) => a.name === b.name && a.age === b.age },
  );

  // BẪY 1 - notify thừa: polling trả về object MỚI nhưng nội dung Y HỆT
  refreshFromServer() {
    const data = { name: 'Tèo', age: 20 }; // reference mới, nội dung cũ
    this.user.set(data); // "đã đổi" -> mọi computed/effect/template chạy lại THỪA
    this.userSmart.set(data); // equal bảo "không đổi" -> im lặng, không ai chạy lại
  }

  // BẪY 2 - không update: MUTATE tại chỗ rồi set lại CÙNG reference
  wrongMutation() {
    const u = this.user();
    u.age = 99; // mutate trực tiếp
    this.user.set(u); // cùng reference -> Object.is bảo "không đổi" -> UI ĐỨNG IM!
  }

  // Cách đúng: luôn tạo object mới khi nội dung đổi (immutable update)
  correctUpdate() {
    this.user.update((u) => ({ ...u, age: 99 }));
  }

  // computed cũng nhận equal y như vậy:
  //   readonly total = computed(() => ({...}), { equal: (a, b) => a.sum === b.sum });
}
