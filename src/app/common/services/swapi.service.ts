import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

export const SWAPI_BASE_URL = 'https://swapi.info/api';

export interface SwapiPerson {
  name: string;
  height: string;
  mass: string;
  birth_year: string;
  gender: string;
}

@Injectable({providedIn: 'root'})
export class SwapiService {
  private readonly http = inject(HttpClient);

  // Cold Observable: mỗi lượt subscribe = một HTTP request mới tới server
  getPerson(id: number): Observable<SwapiPerson> {
    return this.http.get<SwapiPerson>(`${SWAPI_BASE_URL}/people/${id}`);
  }
}
