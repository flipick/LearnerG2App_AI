import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { observableToBeFn } from 'rxjs/internal/testing/TestScheduler';
import { IUserInfo } from '../models/user.state';
import { Router } from '@angular/router';

var baseAddress=environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class AuthService {
    
    private currentUser!: IUserInfo | null;
  private userLoaded = false; // prevent duplicate calls
  
  constructor(private http: HttpClient,private router: Router) {}

  private GetHttpHeaders():HttpHeaders{
      return new HttpHeaders().set("Content-type", "application/json");
  }
  
  login(data:any):Observable<any>{
     return this.http.post(`${baseAddress}/Account/Login`, data, { headers: this.GetHttpHeaders(),withCredentials: true });
  }
  // updateLoginTime(data:any):Observable<any>{
  //    return this.http.post(`${baseAddress}/Account/UpdateLoginTime`, data, { headers: this.GetHttpHeaders(),withCredentials: true });
  // }
  logOut(){
     this.userLoaded = false;
     this.currentUser = null;
     this.http.post(`${baseAddress}/Account/Logout`, { headers: this.GetHttpHeaders(),withCredentials: true }).subscribe({
         next:(data)=>{
             this.router.navigateByUrl("/login");
         }
     });
  }
  /** Load user info from backend */
  loadUser(): Observable<IUserInfo | null> {
    if (this.userLoaded) {
      return of(this.currentUser);
    }
    return this.http.get(`${baseAddress}/Account/GetCurrentUser`, { withCredentials: true }).pipe(
      tap((user:any) => {
        this.currentUser = user;
        this.userLoaded = true;
      }),
      catchError(() => {
        this.currentUser = null;
        this.userLoaded = true;
        return of(null);
      })
    );
  }
  
  get user() {
    return this.currentUser;
  }

  isLoggedIn(): boolean {
    return !!this.currentUser;
  }

}
