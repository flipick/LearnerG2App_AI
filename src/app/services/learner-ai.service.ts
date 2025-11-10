import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

// Define API response interface
export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  result: T;
  message?: string;
}

// Define learning goals interface
export interface LearningGoals {
  learnerId: number;
  careerPath: string;
  targetRole: string;
  timeframe: string;
  isJobSearching: boolean;
  skills: string[];
  timeCommitment: 'low' | 'medium' | 'high';
  learningStyle: 'visual' | 'reading' | 'interactive';
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  objective: string;
  wantsCertifications: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class LearnerAiService {
  // Use a simple API URL for now
  private apiUrl = '/api';

  constructor(private http: HttpClient) { }

  /**
   * Get learning goals for a learner
   * @param learnerId Learner ID
   */
  getLearningGoals(learnerId: number): Observable<ApiResponse<LearningGoals>> {
    // For development, use mock data
    // When API is ready, uncomment: return this.http.get<ApiResponse<LearningGoals>>(`${this.apiUrl}/learner/${learnerId}/learning-goals`);
    
    return of({
      success: true,
      statusCode: 200,
      result: {
        learnerId,
        careerPath: 'software-dev',
        targetRole: 'fullstack-dev',
        timeframe: '6-12',
        isJobSearching: false,
        skills: ['javascript', 'react', 'node'],
        timeCommitment: 'medium',
        learningStyle: 'visual',
        difficultyLevel: 'intermediate',
        objective: 'I want to become a full stack developer proficient in React and Node.js',
        wantsCertifications: true
      }
    });
  }

  /**
   * Save learning goals for a learner
   * @param goals Learning goals data
   */
  saveLearningGoals(goals: LearningGoals): Observable<ApiResponse<boolean>> {
    // For development, use mock data
    // When API is ready, uncomment: return this.http.post<ApiResponse<boolean>>(`${this.apiUrl}/learner/${goals.learnerId}/learning-goals`, goals);
    
    console.log('Saving goals:', goals);
    return of({
      success: true,
      statusCode: 200,
      result: true
    });
  }

  /**
   * Generate learning path based on goals
   * @param learnerId Learner ID
   */
  generateLearningPath(learnerId: number): Observable<ApiResponse<any>> {
    // For development, use mock data
    // When API is ready, uncomment: return this.http.post<ApiResponse<any>>(`${this.apiUrl}/learner/${learnerId}/generate-learning-path`, {});
    
    return of({
      success: true,
      statusCode: 200,
      result: {
        path: [
          // Mock learning path data
        ]
      }
    });
  }
}