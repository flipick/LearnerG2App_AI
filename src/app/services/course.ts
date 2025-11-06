import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

const baseAddress =`${environment.apiUrl}`;
@Injectable({
  providedIn: 'root'
})
export class Course {
    
    GetHttpHeaders() : HttpHeaders {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return headers;
  }
  constructor(private http: HttpClient) {}
  
  getAllCourse(learnerId:number=0,tenantId:number=0):Observable<any>{
     return this.http.get(`${baseAddress}/Course/GetCourses?TenantId=${tenantId}&LearnerId=${learnerId}`,{headers:this.GetHttpHeaders()});
  }
  getCourseById(id:any):Observable<any>{
     return this.http.get(`${baseAddress}/Course/GetCourseById?CourseId=${id}`,{headers:this.GetHttpHeaders()});
  }
  getAllCourseByPackageId(PackageId:number=0):Observable<any>{
     return this.http.get(`${baseAddress}/Course/GetCoursesByPackageId?PackageId=${PackageId}`,{headers:this.GetHttpHeaders()});
  }
  getLearnerAchievements(tenantId:number, learnerId:number=0):Observable<any>{
     return this.http.get(`${baseAddress}/Course/GetLearnerAchievements?TenantId=${tenantId}&LearnerId=${learnerId}`,{headers:this.GetHttpHeaders()});
  }
  
}
