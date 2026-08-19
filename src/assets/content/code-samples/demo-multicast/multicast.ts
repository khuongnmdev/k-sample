import { ChangeDetectionStrategy, Component, inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AsyncPipe } from '@angular/common';
import { Observable, share } from 'rxjs';

interface SwapiPerson {
  name: string;
}

@Injectable({ providedIn: 'root' })
export class SwapiService {
  private readonly http = inject(HttpClient);

  getPerson(id: number): Observable<SwapiPerson> {
    return this.http.get<SwapiPerson>(`https://swapi.info/api/people/${id}`);
  }
}

@Component({
  selector: 'app-person-profile',
  imports: [AsyncPipe],
  template: `
    <!-- 2 async pipe = 2 lượt subscribe nhưng chỉ 1 HTTP request được gửi đi -->
    <h4>Tên: {{ (person$ | async)?.name }}</h4>
    <p>Tên lần nữa: {{ (person$ | async)?.name }}</p>
  `,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PersonProfile {
  private readonly swapi = inject(SwapiService);

  // share(): các subscriber chia sẻ CHUNG 1 request đang bay (Multicast)
  // Dùng shareReplay(1) nếu muốn subscriber muộn nhận lại kết quả đã cache
  readonly person$ = this.swapi.getPerson(1).pipe(share());
}
