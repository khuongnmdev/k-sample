import {ChangeDetectionStrategy, Component, signal} from '@angular/core';
import {httpResource} from '@angular/common/http';

interface SwapiPerson {
  name: string;
  birth_year: string;
  gender: string;
}

@Component({
  selector: 'app-person-detail',
  standalone: true,
  template: `
    <button (click)="personId.set(1)">Person 1</button>
    <button (click)="personId.set(2)">Person 2</button>
    <button (click)="personId.set(9999)">Person 9999 (404)</button>

    @if (person.isLoading()) {
      <p>Loading...</p>
    } @else if (person.error()) {
      <div class="error-box">
        <!-- statusCode(): signal metadata riêng của httpResource - 404 THẬT từ server -->
        <p>HTTP status: {{ person.statusCode() }}</p>
        <button (click)="person.reload()">Retry</button>
      </div>
    } @else if (person.hasValue()) {
      <!-- hasValue() trước khi đọc - value() sẽ THROW khi đang error -->
      <h3>{{ person.value().name }}</h3>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PersonDetailComponent {
  readonly personId = signal(1);

  // URL là hàm reactive: personId đổi -> request MỚI tự bắn, request cũ tự hủy.
  // Không cần loader, không cần switchMap, không cần state tự chế.
  readonly person = httpResource<SwapiPerson>(
    () => `https://swapi.info/api/people/${this.personId()}`,
  );

  // Ngoài bộ ResourceRef chuẩn (value/status/error/isLoading/reload/hasValue),
  // httpResource còn có thêm signal metadata HTTP:
  //   person.statusCode() - HTTP status code của response
  //   person.headers()    - HttpHeaders của response
  //   person.progress()   - tiến độ tải (khi bật reportProgress)
}
