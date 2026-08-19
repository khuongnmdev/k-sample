import { ChangeDetectionStrategy, Component, inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AsyncPipe } from '@angular/common';
import { Observable } from 'rxjs';

interface SwapiPerson {
  name: string;
}

@Injectable({ providedIn: 'root' })
export class SwapiService {
  private readonly http = inject(HttpClient);

  // Cold Observable: mỗi lượt subscribe = một HTTP request MỚI tới server
  getPerson(id: number): Observable<SwapiPerson> {
    return this.http.get<SwapiPerson>(`https://swapi.info/api/people/${id}`);
  }
}

@Component({
  selector: 'app-person-profile',
  imports: [AsyncPipe],
  template: `
    <!-- 2 async pipe = 2 lượt subscribe => 2 HTTP request TRÙNG LẶP (xem Network tab) -->
    <h4>Tên: {{ (person$ | async)?.name }}</h4>
    <p>Tên lần nữa: {{ (person$ | async)?.name }}</p>
  `,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PersonProfile {
  private readonly swapi = inject(SwapiService);

  // Không có share(): Unicast (Cold)
  readonly person$ = this.swapi.getPerson(1);
}
