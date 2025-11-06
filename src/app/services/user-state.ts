import { Injectable } from '@angular/core';
import { IUserInfo } from '../models/user.state';
import { AuthService } from './auth-service';

@Injectable({
  providedIn: 'root'
})
export class UserState {
   private user: IUserInfo | null = null;
   private storageKey = 'AuthValue';
   
  constructor(private authService:AuthService) {
    // Load from sessionStorage on service init
    // const savedUser = sessionStorage.getItem(this.storageKey);
    // if (savedUser) {
      this.user = this.authService.user;
    //}
  }
  
  getCurrentUser(){
     return this.authService.user;
  }
  /** Set user info (also saves to sessionStorage) */
  setUser(user: IUserInfo): void {
    this.user = user;
    sessionStorage.setItem(this.storageKey, JSON.stringify(user));
  }

  /** Get current user info */
  getUser(): IUserInfo | null {
    return this.user;
  }

  /** Get a specific field from the user */
  getField<K extends keyof IUserInfo>(key: K): IUserInfo[K] | undefined {
    return this.user ? this.user[key] : undefined;
  }

  /** Clear user info (on logout) */
  clearUser(): void {
    this.user = null;
    sessionStorage.removeItem(this.storageKey);
  }

  /** Check if user is logged in */
  isLoggedIn(): boolean {
    return !!this.user;
  }
}
