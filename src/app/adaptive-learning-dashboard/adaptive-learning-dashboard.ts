import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IAssessment } from '../models/assessment';
import { AssessmentService } from '../services/assessment-service';
import { AuthService } from '../services/auth-service';
import { AdaptiveLearningSplash } from '../adaptive-learning-splash/adaptive-learning-splash';

@Component({
  selector: 'app-adaptive-learning-dashboard',
  standalone: true,
  imports: [CommonModule, AdaptiveLearningSplash],
  templateUrl: './adaptive-learning-dashboard.html',
  styleUrl: './adaptive-learning-dashboard.css'
})
export class AdaptiveLearningDashboard implements OnInit {
  // State signals
  adaptiveAssessments = signal<IAssessment[]>([]);
  recentResults = signal<any[]>([]);
  loading = signal<boolean>(false);
  errorMessage = signal<string>('');
  showSplash = signal<boolean>(false);
  
  constructor(
    private assessmentService: AssessmentService,
    private authService: AuthService,
    private router: Router
  ) {}
  
  ngOnInit(): void {
    // Check if we should show the splash screen
    const hideIntro = localStorage.getItem('hideAdaptiveLearningIntro');
    if (!hideIntro) {
      this.showSplash.set(true);
    }
    
    this.loading.set(true);
    this.loadAdaptiveAssessments();
  }
  
  loadAdaptiveAssessments(): void {
    const learnerId = this.authService.user?.learnerId || '0';
    
    this.assessmentService.getAdaptiveLearningAssessments(learnerId).subscribe({
      next: (data: any) => {
        if (data.success) {
          this.adaptiveAssessments.set(data.result);
          this.loadRecentResults();
        } else {
          this.errorMessage.set(data.message || 'Failed to load adaptive assessments');
          this.loading.set(false);
        }
      },
      error: (err: any) => {
        this.errorMessage.set('Error loading adaptive assessments');
        this.loading.set(false);
        console.error('Error loading adaptive assessments:', err);
      }
    });
  }
  
  loadRecentResults(): void {
    const learnerId = this.authService.user?.learnerId || '0';
    
    this.assessmentService.getRecentAdaptiveLearningResults(learnerId).subscribe({
      next: (data: any) => {
        if (data.success) {
          this.recentResults.set(data.result);
        }
        this.loading.set(false);
      },
      error: (err: any) => {
        this.loading.set(false);
        console.error('Error loading recent results:', err);
      }
    });
  }
  
  startAssessment(assessmentId: number): void {
    this.router.navigate(['/assessment-launch'], { 
      queryParams: { AssessmentId: assessmentId } 
    });
  }
  
  viewAdaptiveLearning(assessmentId: number): void {
    this.router.navigate(['/adaptive-learning', assessmentId]);
  }
  
  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'available':
        return 'status-available';
      case 'completed':
        return 'status-completed';
      case 'in-progress':
        return 'status-in-progress';
      default:
        return '';
    }
  }
  
  getScoreClass(score: number): string {
    if (score >= 80) return 'score-excellent';
    if (score >= 60) return 'score-good';
    return 'score-needs-improvement';
  }
  
  closeSplash(): void {
    this.showSplash.set(false);
  }
}