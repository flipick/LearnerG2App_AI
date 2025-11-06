import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
const baseAddress=`${environment.apiUrl}`;

@Injectable({
  providedIn: 'root'
})
export class LRS {
    
     GetHttpHeaders() : HttpHeaders {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return headers;
  }
  constructor(private http:HttpClient){}
  sendStatement(data:any):Observable<any>{
      return this.http.post(`${baseAddress}/LRS/SendStatement`,data,{headers:this.GetHttpHeaders(),withCredentials:true});
  }

}
