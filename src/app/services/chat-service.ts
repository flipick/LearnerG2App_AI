import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

var baseAddress=environment.apiUrl;
@Injectable({
  providedIn: 'root'
})
export class ChatService {

    constructor(private http:HttpClient){}
    private GetHttpHeaders():HttpHeaders{
        return new HttpHeaders().set("Content-type", "application/json");
    }

     getQueryResponseBySource(data: any): Observable<any> {
        return this.http.post<any>(baseAddress + "/Chat/QueryResponseBySource", data, { headers: this.GetHttpHeaders(),withCredentials:true });
    }


}
