import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

var baseAddress=environment.apiUrl;
@Injectable({
  providedIn: 'root'
})
export class AssessmentService {
  
    private GetHttpHeaders():HttpHeaders
    {
        return new HttpHeaders().set("Content-type","application/json");
    }
    constructor(private http:HttpClient){

    } 
    getAssessments(LearnerId:any):Observable<any>{
        return this.http.get(`${baseAddress}/Assessment?LearnerId=${LearnerId}`,{headers:this.GetHttpHeaders()});
    }
    getAssessmentQuestions(assessmentId:any):Observable<any>{
        return this.http.get(`${baseAddress}/Assessment/${assessmentId}/questions`,{headers:this.GetHttpHeaders()});
    }
    saveAssessmentResult(data:any,assessmentId:number):Observable<any>{
        return this.http.post(`${baseAddress}/Assessment/assessments/${assessmentId}/results`,data,{headers:this.GetHttpHeaders()});
    }
    getAssessmentByAssessmentId(AssessmentId:any):Observable<any>{
        return this.http.get(`${baseAddress}/Assessment/${AssessmentId}`,{headers:this.GetHttpHeaders()});
    }
    getAdaptiveAssessmentNextQuestion(assessmentId:any,learnerId:any,userPaperSetId:any):Observable<any>{
        return this.http.get(`${baseAddress}/Assessment/GetAdaptiveAssessmentNextQuestion?AssessmentId=${assessmentId}&LearnerId=${learnerId}&UserPaperSetId=${userPaperSetId}`,{headers:this.GetHttpHeaders()});
    }
    getUserPaperSet(userPaperSetId:any):Observable<any>{
        return this.http.get(`${baseAddress}/Assessment/GetUserPaperSet?UserPaperSetId=${userPaperSetId}`,{headers:this.GetHttpHeaders()});
    }
    getLearnerAssessmentAttempt(learnerId:any,assessmentId:any):Observable<any>{
        return this.http.get(`${baseAddress}/Assessment/${assessmentId}/learners/${learnerId}/attempts`,{headers:this.GetHttpHeaders()});
    }
}
