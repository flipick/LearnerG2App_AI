import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, of, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { ICourse } from '../models/course';
import { IAssessment } from '../models/assessment';

// API response interface
export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  result: T;
  message?: string;
}

// Dashboard result interface
export interface DashboardResult {
  courses: ICourse[];
  assessments: IAssessment[];
  // Additional dashboard data can be added here
}

// Activity item interface
export interface ActivityItem {
  id: number;
  type: 'course' | 'assessment' | 'badge' | 'certificate';
  title: string;
  description: string;
  timestamp: Date;
  entityId?: string | number;
  metadata?: any;
}

// Dropout risk item interface
export interface DropoutRiskItem {
  courseId: number;
  courseTitle: string;
  riskLevel: 'low' | 'medium' | 'high';
  reason: string;
  suggestedAction?: string;
  riskFactors?: Array<{
    factor: string;
    weight: number;
  }>;
}

// Learning recommendation interface
export interface LearningRecommendation {
  type: 'course' | 'assessment' | 'resource';
  id?: string | number;
  title: string;
  reason: string;
  priority?: number;
  matchScore?: number;
  prerequisites?: Array<{
    id: number;
    title: string;
    completed: boolean;
  }>;
}

// Badge interface
export interface Badge {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  earnedOn: Date;
  category: string;
  level?: number;
  criteria?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  /**
   * Get main dashboard data
   */
  getDashboard(learnerId: number, tenantId: number): Observable<ApiResponse<DashboardResult>> {
    return this.http.get<ApiResponse<DashboardResult>>(
      `${this.apiUrl}/dashboard/${learnerId}/${tenantId}`
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get learner activity timeline
   * @param learnerId Learner ID
   * @param limit Optional limit of results
   * @param before Optional timestamp to get activities before
   */
  getLearnerActivity(
    learnerId: number, 
    limit?: number, 
    before?: Date
  ): Observable<ApiResponse<ActivityItem[]>> {
    let params = new HttpParams();
    
    if (limit) {
      params = params.append('limit', limit.toString());
    }
    
    if (before) {
      params = params.append('before', before.toISOString());
    }
    
    return this.http.get<ApiResponse<ActivityItem[]>>(
      `${this.apiUrl}/learner/${learnerId}/activity`,
      { params }
    ).pipe(
      map(response => {
        // Convert string dates to Date objects
        if (response.success && response.result) {
          response.result.forEach(item => {
            item.timestamp = new Date(item.timestamp);
          });
        }
        return response;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Get learner earned badges
   * @param learnerId Learner ID
   */
  getLearnerBadges(learnerId: number): Observable<ApiResponse<Badge[]>> {
    return this.http.get<ApiResponse<Badge[]>>(
      `${this.apiUrl}/learner/${learnerId}/badges`
    ).pipe(
      map(response => {
        // Convert string dates to Date objects
        if (response.success && response.result) {
          response.result.forEach(badge => {
            badge.earnedOn = new Date(badge.earnedOn);
          });
        }
        return response;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Get dropout risk analysis
   * @param learnerId Learner ID
   */
  getDropoutRiskAnalysis(learnerId: number): Observable<ApiResponse<DropoutRiskItem[]>> {
    return this.http.get<ApiResponse<DropoutRiskItem[]>>(
      `${this.apiUrl}/learner/${learnerId}/dropout-risk`
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get learning recommendations
   * @param learnerId Learner ID
   */
  getLearningRecommendations(learnerId: number): Observable<ApiResponse<LearningRecommendation[]>> {
    return this.http.get<ApiResponse<LearningRecommendation[]>>(
      `${this.apiUrl}/learner/${learnerId}/recommendations`
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Refresh dashboard data in real-time
   * @param learnerId Learner ID
   * @param tenantId Tenant ID
   */
  refreshDashboard(learnerId: number, tenantId: number): Observable<ApiResponse<DashboardResult>> {
    return this.http.get<ApiResponse<DashboardResult>>(
      `${this.apiUrl}/dashboard/${learnerId}/${tenantId}/refresh`
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get optimized learning path
   * @param learnerId Learner ID
   * @param goals Learning goals
   */
  getOptimizedLearningPath(
    learnerId: number, 
    goals: string[]
  ): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/learner/${learnerId}/learning-path/optimize`,
      { goals }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Error handler
   */
  private handleError(error: any) {
    console.error('API Error:', error);
    
    if (error.status === 0) {
      // A client-side or network error occurred
      return throwError(() => new Error('Network error - please check your connection'));
    } else {
      // The backend returned an unsuccessful response code
      const message = error.error?.message || 'An unknown error occurred';
      return throwError(() => new Error(message));
    }
  }

  // Temporary methods to handle missing APIs - will be removed once APIs are implemented
  
  /**
   * Temporary: Get mock learner activity
   * Use this if the activity API is not yet available
   */
  getMockLearnerActivity(learnerId: number, courses: ICourse[], assessments: IAssessment[]): Observable<ApiResponse<ActivityItem[]>> {
    const activities: ActivityItem[] = [];
    
    // Generate activities based on courses
    courses.forEach((course, index) => {
      if (index < 3) { // Limit to 3 items
        const completionPercentage = parseInt(course.completionPercentage);
        
        if (completionPercentage === 100) {
          activities.push({
            id: activities.length + 1,
            type: 'course',
            title: course.courseName,
            description: 'Course completed',
            timestamp: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)),
            entityId: course.courseId
          });
        } else if (completionPercentage > 0) {
          activities.push({
            id: activities.length + 1,
            type: 'course',
            title: course.courseName,
            description: `Made progress (${completionPercentage}%)`,
            timestamp: new Date(Date.now() - Math.floor(Math.random() * 3 * 24 * 60 * 60 * 1000)),
            entityId: course.courseId
          });
        }
      }
    });
    
    // Generate activities based on assessments
    assessments.forEach((assessment, index) => {
      if (index < 2) { // Limit to 2 items
        activities.push({
          id: activities.length + 1,
          type: 'assessment',
          title: assessment.assessmentTitle,
          description: `Assessment score: ${assessment.bestScore}%`,
          timestamp: new Date(Date.now() - Math.floor(Math.random() * 14 * 24 * 60 * 60 * 1000)),
          entityId: assessment.assessmentId
        });
      }
    });
    
    // Sort by timestamp (newest first)
    activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    return of({
      success: true,
      statusCode: 200,
      result: activities
    });
  }
  
  /**
   * Temporary: Get mock dropout risk analysis
   * Use this if the risk analysis API is not yet available
   */
  getMockDropoutRiskAnalysis(courses: ICourse[]): Observable<ApiResponse<DropoutRiskItem[]>> {
    const riskItems: DropoutRiskItem[] = [];
    
    courses.forEach(course => {
      const completionPercentage = parseInt(course.completionPercentage);
      
      // Skip completed courses
      if (completionPercentage === 100) return;
      
      // Skip not started courses
      if (completionPercentage === 0) return;
      
      // Calculate days since last activity (mock data for demo)
      const daysSinceActivity = Math.floor(Math.random() * 30); // Random 0-30 days
      
      // Calculate progress rate (percent per week)
      const progressRate = completionPercentage / 4; // Assume course has been active for 4 weeks
      
      // Identify risk factors
      if (daysSinceActivity > 14 && completionPercentage < 50) {
        riskItems.push({
          courseId: course.courseId,
          courseTitle: course.courseName,
          riskLevel: 'high',
          reason: 'No activity for 2+ weeks with <50% completion'
        });
      } else if (daysSinceActivity > 7 && progressRate < 10) {
        riskItems.push({
          courseId: course.courseId,
          courseTitle: course.courseName,
          riskLevel: 'medium',
          reason: 'Slow progress rate (<10% per week)'
        });
      } else if (completionPercentage > 80 && daysSinceActivity > 5) {
        riskItems.push({
          courseId: course.courseId,
          courseTitle: course.courseName,
          riskLevel: 'low',
          reason: 'Nearly complete but stalled'
        });
      }
    });
    
    return of({
      success: true,
      statusCode: 200,
      result: riskItems
    });
  }
  
  /**
   * Temporary: Get mock learning recommendations
   * Use this if the recommendations API is not yet available
   */
  getMockLearningRecommendations(
    completedCourseCount: number,
    assessments: IAssessment[]
  ): Observable<ApiResponse<LearningRecommendation[]>> {
    const recommendations: LearningRecommendation[] = [];
    
    // Add recommendations based on completion patterns
    if (completedCourseCount > 0) {
      recommendations.push({
        type: 'course',
        title: 'Advanced Data Analytics',
        reason: 'Based on your completed courses',
        matchScore: 85
      });
    }
    
    // Add recommendations based on assessment scores
    const lowScoreAssessments = assessments.filter(a => a.bestScore < 70);
    if (lowScoreAssessments.length > 0) {
      recommendations.push({
        type: 'resource',
        title: 'Study Guide: ' + lowScoreAssessments[0].assessmentTitle,
        reason: 'To improve your assessment score',
        matchScore: 92
      });
    }
    
    // Add general recommendation
    recommendations.push({
      type: 'assessment',
      title: 'Skills Gap Analysis',
      reason: 'Recommended for all learners',
      matchScore: 75
    });
    
    return of({
      success: true,
      statusCode: 200,
      result: recommendations
    });
  }
}