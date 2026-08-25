import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  // ReplaySubject(3): BẠN tự phát giá trị bằng .next(), không cần nguồn cold phía sau.
  // Subscriber muộn (toast component mount sau) vẫn nhận lại 3 thông báo gần nhất.
  private readonly _notifications$ = new ReplaySubject<string>(3);

  // Che subject sau asObservable() - bên ngoài chỉ được nghe, không được .next()
  readonly notifications$ = this._notifications$.asObservable();

  push(message: string) {
    this._notifications$.next(message);
  }

  // ReplaySubject không tự complete - bạn quản lý vòng đời của nó.
  // Service providedIn root thì sống theo app, không cần complete thủ công.
}
