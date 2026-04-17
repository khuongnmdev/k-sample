import { computed, Injectable, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';

export interface UserProfile {
  id: number;
  name: string;
  code: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly _isLoggedin = signal<boolean>(false);
  readonly isLoggedin = computed(() => this._isLoggedin()); // Public Signal Value
  readonly isLoggedIn$ = toObservable(this._isLoggedin); // Public Observable Value

  private readonly _userProfile = signal<UserProfile | null>(null);
  readonly userProfile = computed(() => this._userProfile()); // Public Signal Value
  readonly userProfile$ = toObservable(this._userProfile); // Public Observable Value

  constructor() {}

  login(userId: number) {
    this._isLoggedin.set(true);
    if (userId === 1) {
      this._userProfile.set({ id: userId, name: 'Tèo', code: 'A' });
    } else {
      this._userProfile.set({ id: userId, name: 'Tý', code: 'B' });
    }
  }

  logout() {
    this._isLoggedin.set(false);
    this._userProfile.set(null);
  }
}
