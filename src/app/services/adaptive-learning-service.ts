import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { IAdaptiveLearningResult, ILearningMaterial, IStudyPlan } from '../models/adaptive-learning';

@Injectable({
  providedIn: 'root'
})
export class AdaptiveLearningService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Get adaptive learning results for a specific assessment and learner
  getAdaptiveLearningResults(assessmentId: number, learnerId: string): Observable<any> {
    console.log('Getting adaptive learning results for:', { assessmentId, learnerId });
    
    // Mock implementation
    const result: IAdaptiveLearningResult = {
      assessmentId: assessmentId,
      assessmentTitle: 'Web Development Fundamentals',
      learnerId: learnerId,
      overallScore: 68,
      completionDate: '2025-10-28',
      subCategories: [
        {
          id: 1,
          name: 'HTML Basics',
          score: 80,
          correctAnswers: 4,
          totalQuestions: 5
        },
        {
          id: 2,
          name: 'CSS Styling',
          score: 60,
          correctAnswers: 3,
          totalQuestions: 5
        },
        {
          id: 3,
          name: 'JavaScript Fundamentals',
          score: 40,
          correctAnswers: 2,
          totalQuestions: 5
        },
        {
          id: 4,
          name: 'Responsive Design',
          score: 40,
          correctAnswers: 2,
          totalQuestions: 5
        }
      ]
    };

    return of({ success: true, result: result }).pipe(delay(800));
  }

  // Get learning materials for a specific assessment and learner
  getLearningMaterials(assessmentId: number, learnerId: string): Observable<any> {
    console.log('Getting learning materials for:', { assessmentId, learnerId });
    
    // Mock implementation
    const materials: ILearningMaterial[] = [
      {
        id: 1,
        title: 'JavaScript Fundamentals: Variables and Data Types',
        description: 'Learn the basics of JavaScript variables, data types, and operations.',
        type: 'videos',
        category: 'JavaScript Fundamentals',
        level: 'beginner',
        duration: 15,
        url: 'https://example.com/materials/js-fundamentals',
        subCategoryId: 3
      },
      {
        id: 2,
        title: 'Introduction to Responsive Design',
        description: 'Learn how to create websites that work well on all devices.',
        type: 'articles',
        category: 'Responsive Design',
        level: 'beginner',
        duration: 20,
        url: 'https://example.com/materials/responsive-design',
        subCategoryId: 4
      },
      {
        id: 3,
        title: 'Advanced JavaScript Functions',
        description: 'Dive deeper into JavaScript functions, closures, and scope.',
        type: 'interactive',
        category: 'JavaScript Fundamentals',
        level: 'intermediate',
        duration: 30,
        url: 'https://example.com/materials/advanced-js',
        subCategoryId: 3
      }
    ];

    return of({ success: true, result: materials }).pipe(delay(800));
  }

  // Generate AI content
  generateAIContent(
    assessmentId: number,
    learnerId: string,
    difficultyLevel: string,
    contentType: string,
    keywords: string
  ): Observable<any> {
    console.log('Generating AI content:', { assessmentId, learnerId, difficultyLevel, contentType, keywords });
    
    // Mock implementation
    const material: ILearningMaterial = {
      id: 4,
      title: `${keywords || 'JavaScript'} ${contentType.charAt(0).toUpperCase() + contentType.slice(1)}`,
      description: `AI-generated ${contentType} about ${keywords || 'JavaScript'} for ${difficultyLevel} level.`,
      type: 'ai-generated',
      category: 'JavaScript Fundamentals',
      level: difficultyLevel,
      duration: 10,
      url: 'https://example.com/materials/ai-generated',
      subCategoryId: 3
    };

    return of({ success: true, result: material }).pipe(delay(1500));
  }

  // Search library for content
  searchLibrary(
    assessmentId: number,
    learnerId: string,
    difficultyLevel: string,
    contentType: string,
    keywords: string
  ): Observable<any> {
    console.log('Searching library:', { assessmentId, learnerId, difficultyLevel, contentType, keywords });
    
    // Mock implementation
    const materials: ILearningMaterial[] = [
      {
        id: 5,
        title: `${keywords || 'JavaScript'} Guide for ${difficultyLevel}`,
        description: `Comprehensive guide on ${keywords || 'JavaScript'} for ${difficultyLevel} level.`,
        type: contentType === 'explanation' ? 'articles' : contentType === 'tutorial' ? 'videos' : 'interactive',
        category: 'JavaScript Fundamentals',
        level: difficultyLevel,
        duration: 25,
        url: 'https://example.com/materials/js-guide',
        subCategoryId: 3
      }
    ];

    return of({ success: true, result: materials }).pipe(delay(1000));
  }

  // Generate study plan
  generateStudyPlan(
    assessmentId: number, 
    learnerId: string,
    timeAvailable: number = 60 // Default to 60 minutes per day if not specified
  ): Observable<any> {
    console.log('Generating study plan:', { assessmentId, learnerId, timeAvailable });
    
    // Mock implementation
    const studyPlan: IStudyPlan[] = [
      {
        id: 1,
        day: 'Day 1',
        items: [
          {
            id: 1,
            title: 'JavaScript Variables and Data Types',
            duration: 30,
            materialId: 1
          },
          {
            id: 2,
            title: 'Practice Exercises: Variables',
            duration: 30
          }
        ]
      },
      {
        id: 2,
        day: 'Day 2',
        items: [
          {
            id: 3,
            title: 'Introduction to Responsive Design',
            duration: 20,
            materialId: 2
          },
          {
            id: 4,
            title: 'Practice: Building a Responsive Layout',
            duration: 40
          }
        ]
      },
      {
        id: 3,
        day: 'Day 3',
        items: [
          {
            id: 5,
            title: 'Advanced JavaScript Functions',
            duration: 30,
            materialId: 3
          },
          {
            id: 6,
            title: 'Code Review: JavaScript Exercises',
            duration: 30
          }
        ]
      }
    ];

    return of({ success: true, result: studyPlan }).pipe(delay(1200));
  }
}