import { Component, OnInit, signal } from '@angular/core';
import { IAssessment } from '../models/assessment';
import { AssessmentService } from '../services/assessment-service';
import { ActivatedRoute } from '@angular/router';
import { TrustHtmlPipe } from '../pipe/trust-html-pipe';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth-service';

@Component({
  selector: 'app-assessment-launch',
  imports: [TrustHtmlPipe, CommonModule],
  templateUrl: './assessment-launch.html',
  styleUrl: './assessment-launch.css'
})
export class AssessmentLaunch implements OnInit {
  assessment = signal<IAssessment | null>(null);
  assessmentId: any = "";
  
  // UI state variables
  isSidebarCollapsed = false;
  isAssessmentStarted = false; // Added to track if assessment is started
  
  constructor(
    private assessmentService: AssessmentService,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService
  ) {}
  
  ngOnInit(): void {
    // Check local storage for sidebar state
    const savedSidebarState = localStorage.getItem('assessment_sidebar_collapsed');
    if (savedSidebarState) {
      this.isSidebarCollapsed = savedSidebarState === 'true';
    }
    
    // Check if assessment was previously started
    const assessmentStarted = localStorage.getItem(`assessment_started_${this.assessmentId}`);
    if (assessmentStarted === 'true') {
      this.isAssessmentStarted = true;
    }
    
    this.activatedRoute.queryParams.subscribe(param => {
      this.assessmentId = param["AssessmentId"];
      this.getAssessmentById();
      
      // Check if this specific assessment was started
      const assessmentStarted = localStorage.getItem(`assessment_started_${this.assessmentId}`);
      if (assessmentStarted === 'true') {
        this.isAssessmentStarted = true;
      }
    });
  }
  
  // Toggle sidebar visibility
  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
    localStorage.setItem('assessment_sidebar_collapsed', this.isSidebarCollapsed.toString());
  }
  
  // Start assessment function
  startAssessment(): void {
    this.isAssessmentStarted = true;
    localStorage.setItem(`assessment_started_${this.assessmentId}`, 'true');
  }

  getAssessmentById() {
    this.assessmentService.getAssessmentByAssessmentId(this.assessmentId).subscribe({
      next: (data) => {
        if (data.success && data.statusCode == 200) {
          this.assessment.set(data.result);
          // Keep your existing URL handling exactly as it was
          this.assessment()!.aiAssessmentUrl = this.assessment()?.aiAssessmentUrl != undefined 
            ? `${this.assessment()?.aiAssessmentUrl}&LearnerId=${this.authService.user?.learnerId}`.toString() 
            : "";
        }
      }
    });
  }
}