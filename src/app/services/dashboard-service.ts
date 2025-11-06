import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
var baseAddress=environment.apiUrl;
@Injectable({
  providedIn: 'root'
})
export class DashboardService {
   constructor(private http:HttpClient){}
   private GetHttpHeaders():HttpHeaders{
      return new HttpHeaders().set("Content-type","application/json");
   }

   getDashboard(learnerId:number, tenantId:number):Observable<any>{
      return this.http.get(`${baseAddress}/learners/${learnerId}/tenants/${tenantId}/dashboard`,{headers:this.GetHttpHeaders(),withCredentials:true});
   }
}
