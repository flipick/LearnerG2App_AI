import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

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
        // For testing, return mock data
        if (AssessmentId) {
            const mockAssessment = {
                assessmentId: Number(AssessmentId),
                assessmentTitle: 'Web Development Fundamentals',
                description: 'Test your knowledge of HTML, CSS, and JavaScript basics.',
                assessmentType: 'Multiple Choice',
                status: 'Available',
                passingScore: 70,
                timeLimitInMinutes: 60,
                hasAdaptiveLearning: true,
                noOfQuestions: 20
            };
            
            return of({
                success: true,
                statusCode: 200,
                result: mockAssessment
            }).pipe(delay(500));
        }
        
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

    /**
     * Checks if an assessment supports Adaptive Learning
     * @param assessmentId The ID of the assessment to check
     * @returns Observable with boolean result indicating support for Adaptive Learning
     */
    checkAdaptiveLearningSupport(assessmentId: number): Observable<any> {
        // Mock implementation for testing
        const result = {
            success: true,
            result: true,
            message: ''
        };
        
        return of(result).pipe(delay(300));
    }

    /**
     * Get assessments that support Adaptive Learning
     * @param learnerId The ID of the learner
     * @returns Observable with list of assessments that support Adaptive Learning
     */
    getAdaptiveLearningAssessments(learnerId: string): Observable<any> {
        // Mock implementation for testing
        const mockAssessments = [
            {
                assessmentId: 101,
                assessmentTitle: 'Web Development Fundamentals',
                description: 'Test your knowledge of HTML, CSS, and JavaScript basics.',
                assessmentType: 'Multiple Choice',
                status: 'Available',
                passingScore: 70,
                timeLimitInMinutes: 60,
                hasAdaptiveLearning: true,
                attempted: '0',
                completionStatus: 'not-started'
            },
            {
                assessmentId: 102,
                assessmentTitle: 'Data Science Essentials',
                description: 'Test your knowledge of statistics, data analysis, and machine learning concepts.',
                assessmentType: 'Multiple Choice',
                status: 'Available',
                passingScore: 75,
                timeLimitInMinutes: 90,
                hasAdaptiveLearning: true,
                attempted: '1',
                bestScore: 68,
                completionStatus: 'completed',
                lastAttemptDate: '2025-10-28'
            },
            {
                assessmentId: 103,
                assessmentTitle: 'Project Management Fundamentals',
                description: 'Test your knowledge of project management methodologies and practices.',
                assessmentType: 'Multiple Choice',
                status: 'Available',
                passingScore: 80,
                timeLimitInMinutes: 75,
                hasAdaptiveLearning: true,
                attempted: '1',
                bestScore: 92,
                completionStatus: 'completed',
                lastAttemptDate: '2025-10-25'
            }
        ];
        
        return of({
            success: true,
            result: mockAssessments,
            message: ''
        }).pipe(delay(800));
    }

    /**
     * Get recent assessment results with adaptive learning
     * @param learnerId The ID of the learner
     * @param limit Maximum number of results to return
     * @returns Observable with list of recent assessment results
     */
    getRecentAdaptiveLearningResults(learnerId: string, limit: number = 5): Observable<any> {
        // Mock implementation for testing
        const mockResults = [
            {
                assessmentId: 102,
                assessmentTitle: 'Data Science Essentials',
                completionDate: '2025-10-28',
                score: 68,
                weakAreas: ['Statistical Analysis', 'Machine Learning Algorithms'],
                recommendedMaterialsCount: 5
            },
            {
                assessmentId: 103,
                assessmentTitle: 'Project Management Fundamentals',
                completionDate: '2025-10-25',
                score: 92,
                weakAreas: ['Risk Management'],
                recommendedMaterialsCount: 2
            }
        ];
        
        return of({
            success: true,
            result: mockResults.slice(0, limit),
            message: ''
        }).pipe(delay(800));
    }
}