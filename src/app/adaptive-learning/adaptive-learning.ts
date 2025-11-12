import { Component, OnInit, signal, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AdaptiveLearningService } from '../services/adaptive-learning-service';
import { AssessmentService } from '../services/assessment-service';
import { AuthService } from '../services/auth-service';
import { IAdaptiveLearningResult, ILearningMaterial, ISubCategoryResult, IStudyPlan } from '../models/adaptive-learning';
import { IAssessment } from '../models/assessment';

@Component({
  selector: 'app-adaptive-learning',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './adaptive-learning.html',
  styleUrls: ['./adaptive-learning.css'],
  encapsulation: ViewEncapsulation.None
})
export class AdaptiveLearning implements OnInit {
  // Signals
  assessment = signal<IAssessment | null>(null);
  adaptiveLearningResult = signal<IAdaptiveLearningResult | null>(null);
  learningMaterials = signal<ILearningMaterial[]>([]);
  studyPlan = signal<IStudyPlan[]>([]);
  loading = signal<boolean>(true);
  errorMessage = signal<string>('');
  activeTab = signal<'overview' | 'learning-materials' | 'study-plan'>('overview');
  currentFilter = signal<'all' | 'videos' | 'pdfs' | 'articles' | 'interactive' | 'ai-generated'>('all');
  improvementThreshold = signal<number>(50);

  // AI Content generation form
  aiGenerationForm = {
    difficultyLevel: 'intermediate',
    contentType: 'explanation',
    keywords: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adaptiveLearningService: AdaptiveLearningService,
    private assessmentService: AssessmentService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    console.log('AdaptiveLearning component initialized');
    this.route.params.subscribe(params => {
      const assessmentId = params['id'];
      console.log('Route params:', params);
      
      if (assessmentId && !isNaN(Number(assessmentId))) {
        this.loadAssessmentData(Number(assessmentId));
      } else {
        console.error('Invalid assessment ID:', assessmentId);
        this.errorMessage.set('Invalid assessment ID provided');
        this.loading.set(false);
      }
    });
  }

  loadAssessmentData(assessmentId: number): void {
    this.loading.set(true);
    console.log('Loading assessment data for ID:', assessmentId);
    
    this.assessmentService.getAssessmentByAssessmentId(assessmentId).subscribe({
      next: (data: any) => {
        console.log('Assessment data response:', data);
        if (data.success) {
          this.assessment.set(data.result);
          this.loadAdaptiveLearningResults(assessmentId);
        } else {
          this.errorMessage.set(data.message || 'Failed to load assessment data');
          this.loading.set(false);
        }
      },
      error: (err) => {
        console.error('Error loading assessment:', err);
        this.errorMessage.set('Error loading assessment data');
        this.loading.set(false);
      }
    });
  }

  loadAdaptiveLearningResults(assessmentId: number): void {
    const learnerId = this.authService.user?.learnerId || '0';
    console.log('Loading adaptive learning results with learner ID:', learnerId);
    
    this.adaptiveLearningService.getAdaptiveLearningResults(assessmentId, learnerId).subscribe({
      next: (data: any) => {
        console.log('Adaptive learning results response:', data);
        if (data.success) {
          this.adaptiveLearningResult.set(data.result);
          this.loadLearningMaterials(assessmentId, learnerId);
        } else {
          this.errorMessage.set(data.message || 'Failed to load adaptive learning results');
          this.loading.set(false);
        }
      },
      error: (err) => {
        console.error('Error loading adaptive learning results:', err);
        this.errorMessage.set('Error loading adaptive learning results');
        this.loading.set(false);
      }
    });
  }

  loadLearningMaterials(assessmentId: number, learnerId: string): void {
    console.log('Loading learning materials...');
    
    // Fallback to mock data directly in the component if service call fails
    const mockMaterials = [
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
      }
    ];
    
    this.adaptiveLearningService.getLearningMaterials(assessmentId, learnerId).subscribe({
      next: (data: any) => {
        console.log('Learning materials response:', data);
        if (data && data.success) {
          this.learningMaterials.set(data.result || []);
        } else {
          console.warn('Service returned unsuccessful response:', data);
          // Fallback to mock data
          this.learningMaterials.set(mockMaterials);
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading learning materials:', err);
        // Use mock data as fallback
        this.learningMaterials.set(mockMaterials);
        this.loading.set(false);
      }
    });
  }

  setActiveTab(tab: 'overview' | 'learning-materials' | 'study-plan'): void {
    console.log(`Setting active tab to: ${tab}`);
    this.activeTab.set(tab);
    
    // If switching to learning materials tab, make sure we have data
    if (tab === 'learning-materials' && this.learningMaterials().length === 0) {
      console.log('No learning materials loaded yet, trying to load...');
      const assessmentId = this.assessment()?.assessmentId;
      const learnerId = this.authService.user?.learnerId || '0';
      
      if (assessmentId) {
        this.loadLearningMaterials(assessmentId, learnerId);
      }
    }
  }

  setFilter(filter: 'all' | 'videos' | 'pdfs' | 'articles' | 'interactive' | 'ai-generated'): void {
    console.log(`Setting filter to: ${filter}`);
    this.currentFilter.set(filter);
  }

  filteredMaterials(): ILearningMaterial[] {
    if (this.currentFilter() === 'all') {
      return this.learningMaterials();
    }
    
    return this.learningMaterials().filter(material => 
      material.type.toLowerCase() === this.currentFilter()
    );
  }

  getOverallFeedback(): string {
    const result = this.adaptiveLearningResult();
    if (!result) return '';
    
    if (result.overallScore >= 80) {
      return 'Excellent job!';
    } else if (result.overallScore >= 60) {
      return 'Good job!';
    } else {
      return 'Needs improvement';
    }
  }

  getSubCategoryFeedback(subCategory: ISubCategoryResult): string {
    if (subCategory.score >= this.improvementThreshold()) {
      return 'Good';
    } else {
      return 'Needs Improvement';
    }
  }

  viewMaterial(material: ILearningMaterial): void {
    console.log('Viewing material:', material);
    
    // Check if URL exists
    if (!material.url) {
      console.error('No URL available for this learning material');
      alert('This learning material is not available yet.');
      return;
    }
    
    // For mock materials, show an alert
    if (material.url.includes('example.com')) {
      console.log('This is a mock material - in a real app, this would open:', material.url);
      alert('In the actual application, this would open the learning material: ' + material.title);
      return;
    }
    
    // If we get here, we have a real URL that we can try to open
    window.open(material.url, '_blank');
  }

  generateAIContent(): void {
    console.log('Generating AI content with:', this.aiGenerationForm);
    
    const assessmentId = this.assessment()?.assessmentId;
    const learnerId = this.authService.user?.learnerId || '0';
    
    if (!assessmentId) {
      this.errorMessage.set('Missing assessment information');
      return;
    }
    
    // Show loading indicator
    this.loading.set(true);
    
    this.adaptiveLearningService.generateAIContent(
      assessmentId,
      learnerId,
      this.aiGenerationForm.difficultyLevel,
      this.aiGenerationForm.contentType,
      this.aiGenerationForm.keywords
    ).subscribe({
      next: (data: any) => {
        this.loading.set(false);
        if (data.success) {
          // Add the generated content to the materials
          this.learningMaterials.update(materials => [
            data.result,
            ...materials
          ]);
          
          // Switch to the AI-generated filter to show the new content
          this.setFilter('ai-generated');
          
          // Show success message
          alert('Content generated successfully!');
        } else {
          this.errorMessage.set(data.message || 'Failed to generate content');
        }
      },
      error: (err) => {
        console.error('Error generating AI content:', err);
        this.loading.set(false);
        this.errorMessage.set('Error generating AI content');
      }
    });
  }

  searchLibrary(): void {
    console.log('Searching library with:', this.aiGenerationForm);
    
    const assessmentId = this.assessment()?.assessmentId;
    const learnerId = this.authService.user?.learnerId || '0';
    
    if (!assessmentId) {
      this.errorMessage.set('Missing assessment information');
      return;
    }
    
    // Show loading indicator
    this.loading.set(true);
    
    // Mock implementation directly in component for simplicity
    setTimeout(() => {
      const materials: ILearningMaterial[] = [
        {
          id: 5,
          title: `${this.aiGenerationForm.keywords || 'JavaScript'} Guide for ${this.aiGenerationForm.difficultyLevel}`,
          description: `Comprehensive guide on ${this.aiGenerationForm.keywords || 'JavaScript'} for ${this.aiGenerationForm.difficultyLevel} level.`,
          type: this.aiGenerationForm.contentType === 'explanation' ? 'articles' : this.aiGenerationForm.contentType === 'tutorial' ? 'videos' : 'interactive',
          category: 'JavaScript Fundamentals',
          level: this.aiGenerationForm.difficultyLevel,
          duration: 25,
          url: 'https://example.com/materials/js-guide',
          subCategoryId: 3
        }
      ];
      
      // Update the materials
      this.learningMaterials.update(existing => [...materials, ...existing]);
      
      // Hide loading indicator
      this.loading.set(false);
      
      // Show success message
      alert('Search completed! Found matching materials in the library.');
    }, 1000);
  }

  generateStudyPlan(): void {
    console.log('Generating study plan...');
    
    const assessmentId = this.assessment()?.assessmentId;
    const learnerId = this.authService.user?.learnerId || '0';
    
    if (!assessmentId) {
      this.errorMessage.set('Missing assessment information');
      return;
    }
    
    // Show loading indicator
    this.loading.set(true);
    
    // Mock implementation
    setTimeout(() => {
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
      
      // Update state
      this.studyPlan.set(studyPlan);
      
      // Hide loading indicator
      this.loading.set(false);
      
      // Switch to study plan tab
      this.setActiveTab('study-plan');
      
      // Show success message
      alert('Study plan generated successfully!');
    }, 1200);
  }

  goBackToAdaptiveLearning(): void {
    console.log('Navigating back to adaptive learning dashboard');
    this.router.navigate(['/adaptive-learning']);
  }
}