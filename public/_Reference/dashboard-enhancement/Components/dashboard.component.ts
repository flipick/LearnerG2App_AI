import { AfterViewInit, Component, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { AuthService } from '../services/auth-service';
import { ICourse } from '../models/course';
import { IAssessment } from '../models/assessment';
import { 
  DashboardService, 
  ActivityItem, 
  DropoutRiskItem, 
  LearningRecommendation,
  Badge
} from '../services/dashboard-service';
import { Subject, forkJoin, of, switchMap, takeUntil } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit, AfterViewInit, OnDestroy {
  // Loading state signals
  isLoading = signal<boolean>(false);
  isLoadingActivity = signal<boolean>(false);
  isLoadingInsights = signal<boolean>(false);
  isLoadingCharts = signal<boolean>(false);
  
  // Error state signals
  hasError = signal<boolean>(false);
  errorMessage = signal<string>('');
  
  // Data loaded flags
  dataLoaded = signal<boolean>(false);
  
  // Charts
  courseProgressChart: Chart | null = null;
  assessmentScoresChart: Chart | null = null;
  
  // Data signals
  private _courses = signal<ICourse[]>([]);
  private _assessments = signal<IAssessment[]>([]);
  private _activityItems = signal<ActivityItem[]>([]);
  private _dropoutRiskItems = signal<DropoutRiskItem[]>([]);
  private _learningRecommendations = signal<LearningRecommendation[]>([]);
  private _badges = signal<Badge[]>([]);
  private _completedCourseCount = signal<number>(0);
  private _inProgressCourseCount = signal<number>(0);
  private _notStartedCourseCount = signal<number>(0);
  private _badgeCount = signal<number>(0);
  
  // Chart colors
  chartColors = {
    completed: '#1FB8CD',  // Teal
    inProgress: '#FFC185', // Orange
    notStarted: '#B4413C', // Red
    scoreBar: '#1FB8CD',   // Teal
  };
  
  // Destroy subject for cleanup
  private destroy$ = new Subject<void>();
  
  // Getter methods for signals
  courses() { return this._courses(); }
  assessments() { return this._assessments(); }
  activityItems() { return this._activityItems(); }
  dropoutRiskItems() { return this._dropoutRiskItems(); }
  learningRecommendations() { return this._learningRecommendations(); }
  badges() { return this._badges(); }
  completedCourseCount() { return this._completedCourseCount(); }
  inProgressCourseCount() { return this._inProgressCourseCount(); }
  notStartedCourseCount() { return this._notStartedCourseCount(); }
  badgeCount() { return this._badgeCount(); }
  
  constructor(
    private router: Router,
    public authService: AuthService,
    private dashboardService: DashboardService
  ) {
    Chart.register(...registerables);
  }
  
  ngOnInit(): void {
    // Initial data load
    this.loadDashboardData();
  }
  
  ngAfterViewInit(): void {
    // Initialize sidebar
    this.initSidebarToggle();
    
    // Charts will be initialized after data is loaded
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    
    // Destroy charts
    if (this.courseProgressChart) {
      this.courseProgressChart.destroy();
    }
    
    if (this.assessmentScoresChart) {
      this.assessmentScoresChart.destroy();
    }
  }
  
  /**
   * Initialize sidebar toggle
   */
  initSidebarToggle(): void {
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    
    if (menuToggle && sidebar) {
      menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
      });
    }
  }
  
  /**
   * Load all dashboard data
   */
  loadDashboardData(): void {
    this.isLoading.set(true);
    this.hasError.set(false);
    
    const learnerId = this.authService.user?.learnerId ? parseInt(this.authService.user.learnerId) : 0;
    const tenantId = this.authService.user?.tenantId ? parseInt(this.authService.user.tenantId) : 0;
    
    if (learnerId === 0 || tenantId === 0) {
      console.error('Invalid learner or tenant ID');
      this.hasError.set(true);
      this.errorMessage.set('User information is missing. Please log in again.');
      this.isLoading.set(false);
      return;
    }
    
    // Load main dashboard data
    this.dashboardService.getDashboard(learnerId, tenantId)
      .pipe(
        switchMap(dashboardData => {
          if (!dashboardData.success) {
            throw new Error(dashboardData.message || 'Failed to load dashboard data');
          }
          
          // Set main data
          this._courses.set(dashboardData.result.courses);
          this._assessments.set(dashboardData.result.assessments);
          
          // Process data for counts and charts
          this.processData();
          
          // Initialize UI with available data
          this.initializeDashboard();
          
          // Now load additional data in parallel
          this.isLoadingActivity.set(true);
          this.isLoadingInsights.set(true);
          
          // Try to get data from real APIs, fall back to mock data if APIs not available
          return forkJoin({
            // Activity data - try real API, fall back to mock
            activities: this.dashboardService.getLearnerActivity(learnerId)
              .pipe(
                switchMap(response => {
                  if (response.success) {
                    return of(response);
                  } else {
                    console.warn('Activity API failed, using mock data');
                    return this.dashboardService.getMockLearnerActivity(
                      learnerId, 
                      dashboardData.result.courses, 
                      dashboardData.result.assessments
                    );
                  }
                })
              ),
            
            // Badges - try real API, fall back to badge count from courses
            badges: this.dashboardService.getLearnerBadges(learnerId)
              .pipe(
                switchMap(response => {
                  if (response.success) {
                    return of(response);
                  } else {
                    console.warn('Badges API not available, using course completion count');
                    return of({
                      success: true,
                      statusCode: 200,
                      result: [] // Empty badges array, we'll use course count
                    });
                  }
                })
              ),
            
            // Risk analysis - try real API, fall back to mock
            dropoutRisk: this.dashboardService.getDropoutRiskAnalysis(learnerId)
              .pipe(
                switchMap(response => {
                  if (response.success) {
                    return of(response);
                  } else {
                    console.warn('Dropout risk API not available, using mock analysis');
                    return this.dashboardService.getMockDropoutRiskAnalysis(
                      dashboardData.result.courses
                    );
                  }
                })
              ),
            
            // Recommendations - try real API, fall back to mock
            recommendations: this.dashboardService.getLearningRecommendations(learnerId)
              .pipe(
                switchMap(response => {
                  if (response.success) {
                    return of(response);
                  } else {
                    console.warn('Recommendations API not available, using mock data');
                    return this.dashboardService.getMockLearningRecommendations(
                      this.completedCourseCount(),
                      dashboardData.result.assessments
                    );
                  }
                })
              )
          });
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (additionalData) => {
          // Set activity data
          this._activityItems.set(additionalData.activities.result);
          this.isLoadingActivity.set(false);
          
          // Set badges data
          this._badges.set(additionalData.badges.result);
          if (additionalData.badges.result.length > 0) {
            this._badgeCount.set(additionalData.badges.result.length);
          }
          
          // Set insights data
          this._dropoutRiskItems.set(additionalData.dropoutRisk.result);
          this._learningRecommendations.set(additionalData.recommendations.result);
          this.isLoadingInsights.set(false);
          
          this.dataLoaded.set(true);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Error loading dashboard data:', err);
          this.hasError.set(true);
          this.errorMessage.set(err.message || 'An error occurred loading dashboard data');
          this.isLoading.set(false);
          this.isLoadingActivity.set(false);
          this.isLoadingInsights.set(false);
        }
      });
  }
  
  /**
   * Process the courses and assessments data
   */
  processData(): void {
    const courses = this._courses();
    
    // Calculate counts
    const completed = courses.filter(c => parseInt(c.completionPercentage) === 100).length;
    const notStarted = courses.filter(c => parseInt(c.completionPercentage) === 0).length;
    const inProgress = courses.length - completed - notStarted;
    
    // Set signals
    this._completedCourseCount.set(completed);
    this._notStartedCourseCount.set(notStarted);
    this._inProgressCourseCount.set(inProgress);
    
    // If no badges API available, use completed courses as badge count
    if (this._badges().length === 0) {
      this._badgeCount.set(completed);
    }
  }
  
  /**
   * Initialize dashboard UI elements
   */
  initializeDashboard(): void {
    this.updateDashboardHeader();
    this.updateStatCards();
    this.initializeCharts();
    
    // Add event listeners for refresh buttons
    this.setupEventListeners();
  }
  
  /**
   * Update dashboard header with greeting and progress
   */
  updateDashboardHeader(): void {
    const greeting = document.getElementById('dashboardGreeting');
    const progress = document.getElementById('dashboardProgress');
    
    if (greeting) {
      // Personalize greeting based on time of day
      const hour = new Date().getHours();
      let timeGreeting = 'Welcome back';
      
      if (hour < 12) {
        timeGreeting = 'Good morning';
      } else if (hour < 18) {
        timeGreeting = 'Good afternoon';
      } else {
        timeGreeting = 'Good evening';
      }
      
      greeting.textContent = `${timeGreeting}, ${this.authService.user?.name || 'Learner'}!`;
    }
    
    if (progress) {
      const totalCourses = this._courses().length;
      const completedPercentage = totalCourses === 0 ? 0 : 
        Math.round((this.completedCourseCount() / totalCourses) * 100);
      
      progress.textContent = `You've completed ${completedPercentage}% of your courses`;
    }
  }
  
  /**
   * Update the stat cards with current numbers
   */
  updateStatCards(): void {
    const totalCourses = document.getElementById('totalCourses');
    const completedCourses = document.getElementById('completedCourses');
    const inProgressCourses = document.getElementById('inProgressCourses');
    const earnedBadges = document.getElementById('earnedBadges');
    
    if (totalCourses) {
      totalCourses.textContent = this._courses().length.toString();
    }
    
    if (completedCourses) {
      completedCourses.textContent = this._completedCourseCount().toString();
    }
    
    if (inProgressCourses) {
      inProgressCourses.textContent = this._inProgressCourseCount().toString();
    }
    
    if (earnedBadges) {
      earnedBadges.textContent = this._badgeCount().toString();
    }
  }
  
  /**
   * Set up event listeners for refresh and action buttons
   */
  setupEventListeners(): void {
    // Refresh buttons for charts
    const refreshProgressBtn = document.getElementById('refreshProgressBtn');
    const refreshScoresBtn = document.getElementById('refreshScoresBtn');
    
    if (refreshProgressBtn) {
      refreshProgressBtn.addEventListener('click', () => this.refreshProgressChart());
    }
    
    if (refreshScoresBtn) {
      refreshScoresBtn.addEventListener('click', () => this.refreshScoresChart());
    }
  }
  
  /**
   * Initialize and render charts
   */
  initializeCharts(): void {
    this.isLoadingCharts.set(true);
    
    // Initialize charts after a short delay to ensure DOM is ready
    setTimeout(() => {
      this.initCourseProgressChart();
      this.initAssessmentScoresChart();
      this.isLoadingCharts.set(false);
    }, 100);
  }
  
  /**
   * Initialize course progress doughnut chart
   */
  initCourseProgressChart(): void {
    const courseCtx = document.getElementById('courseProgressChart') as HTMLCanvasElement;
    
    if (!courseCtx) {
      console.error('Course progress chart canvas not found');
      return;
    }
    
    // Destroy existing chart if it exists
    if (this.courseProgressChart) {
      this.courseProgressChart.destroy();
    }
    
    // Create new chart
    this.courseProgressChart = new Chart(courseCtx, {
      type: 'doughnut',
      data: {
        labels: ['Completed', 'In Progress', 'Not Started'],
        datasets: [{
          data: [
            this._completedCourseCount(),
            this._inProgressCourseCount(),
            this._notStartedCourseCount()
          ],
          backgroundColor: [
            this.chartColors.completed,
            this.chartColors.inProgress,
            this.chartColors.notStarted
          ],
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '75%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#374151',
              padding: 16,
              usePointStyle: true,
              pointStyle: 'circle'
            }
          },
          tooltip: {
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            titleColor: '#1f2937',
            bodyColor: '#1f2937',
            borderColor: '#e5e7eb',
            borderWidth: 1,
            padding: 12,
            cornerRadius: 8,
            displayColors: true,
            callbacks: {
              label: (context) => {
                const label = context.dataset.data[context.dataIndex];
                const total = context.dataset.data.reduce((a, b) => (a as number) + (b as number), 0);
                const percentage = Math.round((context.dataset.data[context.dataIndex] as number / total) * 100);
                return `${context.label}: ${label} (${percentage}%)`;
              }
            }
          }
        },
        animation: {
          animateScale: true,
          animateRotate: true
        }
      }
    });
  }
  
  /**
   * Initialize assessment scores chart
   */
  initAssessmentScoresChart(): void {
    const assessmentCtx = document.getElementById('assessmentScoresChart') as HTMLCanvasElement;
    
    if (!assessmentCtx) {
      console.error('Assessment scores chart canvas not found');
      return;
    }
    
    // Destroy existing chart if it exists
    if (this.assessmentScoresChart) {
      this.assessmentScoresChart.destroy();
    }
    
    // Format assessment data
    const assessmentData = this._assessments().map(a => ({
      title: a.assessmentTitle,
      score: a.bestScore
    }));
    
    // Create new chart
    this.assessmentScoresChart = new Chart(assessmentCtx, {
      type: 'bar',
      data: {
        labels: assessmentData.map(a => a.title),
        datasets: [{
          label: 'Best Score (%)',
          data: assessmentData.map(a => a.score),
          backgroundColor: this.chartColors.scoreBar,
          borderColor: this.chartColors.scoreBar,
          borderWidth: 0,
          borderRadius: 4,
          maxBarThickness: 40
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            beginAtZero: true,
            max: 100,
            grid: {
              color: '#e5e7eb'
            },
            ticks: {
              color: '#374151'
            }
          },
          y: {
            grid: {
              display: false
            },
            ticks: {
              color: '#374151'
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            titleColor: '#1f2937',
            bodyColor: '#1f2937',
            borderColor: '#e5e7eb',
            borderWidth: 1,
            padding: 12,
            cornerRadius: 8,
            displayColors: false,
            callbacks: {
              title: (context) => {
                const index = context[0].dataIndex;
                return assessmentData[index].title;
              },
              label: (context) => {
                return `Score: ${context.parsed.x}%`;
              },
              afterLabel: (context) => {
                const score = context.parsed.x;
                let message = '';
                
                if (score >= 90) {
                  message = 'Excellent!';
                } else if (score >= 70) {
                  message = 'Good work!';
                } else {
                  message = 'Consider reviewing this topic.';
                }
                
                return message;
              }
            }
          }
        },
        animation: {
          duration: 1000
        }
      }
    });
  }
  
  /**
   * Refresh the progress chart with latest data
   * In a real app, this would fetch fresh data from the API
   */
  refreshProgressChart(): void {
    const loadingOverlay = document.querySelector('#courseProgressChart + .loading-overlay');
    if (loadingOverlay) {
      loadingOverlay.classList.add('active');
    }
    
    // In a real app, we would call an API to get fresh data
    // For now, we'll just refresh with current data
    setTimeout(() => {
      if (this.courseProgressChart) {
        this.courseProgressChart.data.datasets[0].data = [
          this._completedCourseCount(),
          this._inProgressCourseCount(),
          this._notStartedCourseCount()
        ];
        
        this.courseProgressChart.update();
      }
      
      if (loadingOverlay) {
        loadingOverlay.classList.remove('active');
      }
    }, 1000); // Simulate API delay
  }
  
  /**
   * Refresh the assessment scores chart with latest data
   * In a real app, this would fetch fresh data from the API
   */
  refreshScoresChart(): void {
    const loadingOverlay = document.querySelector('#assessmentScoresChart + .loading-overlay');
    if (loadingOverlay) {
      loadingOverlay.classList.add('active');
    }
    
    // In a real app, we would call an API to get fresh data
    // For now, we'll just refresh with current data
    setTimeout(() => {
      if (this.assessmentScoresChart) {
        const assessmentData = this._assessments().map(a => ({
          title: a.assessmentTitle,
          score: a.bestScore
        }));
        
        this.assessmentScoresChart.data.labels = assessmentData.map(a => a.title);
        this.assessmentScoresChart.data.datasets[0].data = assessmentData.map(a => a.score);
        
        this.assessmentScoresChart.update();
      }
      
      if (loadingOverlay) {
        loadingOverlay.classList.remove('active');
      }
    }, 1000); // Simulate API delay
  }
  
  /**
   * Format a date for display
   */
  formatDate(date: Date): string {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  }
  
  /**
   * Navigate to the courses page
   */
  redirectToCourses(): void {
    this.router.navigateByUrl('/courses');
  }
  
  /**
   * Navigate to the assessments page
   */
  redirectToAssessments(): void {
    this.router.navigateByUrl('/assessments');
  }
  
  /**
   * Navigate to the learning path page
   */
  viewLearningPath(): void {
    this.router.navigateByUrl('/learning-path');
  }
}