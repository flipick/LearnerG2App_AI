import { AfterViewInit, Component, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { AuthService } from '../services/auth-service';
import { ICourse } from '../models/course';
import { IAssessment } from '../models/assessment';
import { DashboardService } from '../services/dashboard-service';
import { Subject, takeUntil } from 'rxjs';

// Define interfaces directly in this file to avoid import issues
interface ActivityItem {
  id: number;
  type: 'course' | 'assessment' | 'badge' | 'certificate';
  title: string;
  description: string;
  timestamp: Date;
  icon: string;
  iconColor: string;
  entityId?: string | number;
}

interface DropoutRiskItem {
  courseId: number;  // Using number type
  courseTitle: string;
  riskLevel: 'low' | 'medium' | 'high';
  reason: string;
  suggestedAction?: string;
}

interface LearningRecommendation {
  type: 'course' | 'assessment' | 'resource';
  id?: string | number;
  title: string;
  reason: string;
  priority?: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit, AfterViewInit, OnDestroy {
  // Regular properties (for template access)
  public isLoading = false;
  public completionPercentage = 0;
  public dataLoaded = false;
  
  // Charts
  courseProgressChart: Chart | null = null;
  assessmentScoresChart: Chart | null = null;
  
  // Data signals (for internal reactivity)
  private _courses = signal<ICourse[]>([]);
  private _assessments = signal<IAssessment[]>([]);
  private _activityItems = signal<ActivityItem[]>([]);
  private _dropoutRiskItems = signal<DropoutRiskItem[]>([]);
  private _learningRecommendations = signal<LearningRecommendation[]>([]);
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
  
  // Getter methods for signals (template access)
  courses() { return this._courses(); }
  assessments() { return this._assessments(); }
  activityItems() { return this._activityItems(); }
  dropoutRiskItems() { return this._dropoutRiskItems(); }
  learningRecommendations() { return this._learningRecommendations(); }
  completedCourseCount() { return this._completedCourseCount(); }
  inProgressCourseCount() { return this._inProgressCourseCount(); }
  notStartedCourseCount() { return this._notStartedCourseCount(); }
  badgeCount() { return this._badgeCount(); }
  
  constructor(
    private router: Router,
    public authService: AuthService, // Changed to public for template access
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
   * Get user initials for avatar
   */
  getInitials(name: string): string {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  }
  
  /**
   * Load all dashboard data
   */
  loadDashboardData(): void {
    this.isLoading = true;
    
    const learnerId = this.authService.user?.learnerId ? parseInt(this.authService.user.learnerId) : 0;
    const tenantId = this.authService.user?.tenantId ? parseInt(this.authService.user.tenantId) : 0;
    
    if (learnerId === 0 || tenantId === 0) {
      console.error('Invalid learner or tenant ID');
      this.isLoading = false;
      return;
    }
    
    this.dashboardService.getDashboard(learnerId, tenantId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          if (data.success && data.statusCode === 200) {
            // Set data
            this._courses.set(data.result.courses);
            this._assessments.set(data.result.assessments);
            
            // Process data
            this.processData();
            
            // Generate AI insights
            this.generateAIInsights();
            
            // Generate mock activity data (in real app, this would come from the API)
            this.generateActivityData();
            
            // Initialize UI
            this.initializeDashboard();
            
            this.dataLoaded = true;
          } else {
            console.error('Failed to load dashboard data:', data);
          }
          
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading dashboard data:', err);
          this.isLoading = false;
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
    
    // Calculate completion percentage
    const totalCourses = courses.length;
    const percentage = completed === 0 ? 0 : Math.round((completed / totalCourses) * 100);
    
    // Set both the signal and the property
    this.completionPercentage = percentage;
    
    // Set badge count (in real app, this would be from API)
    this._badgeCount.set(completed);
  }
  
  /**
   * Generate AI insights based on course and assessment data
   */
  generateAIInsights(): void {
    const courses = this._courses();
    const assessments = this._assessments();
    
    // Generate dropout risk analysis
    // This would be a real AI model in production, for now we'll use simple heuristics
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
          courseTitle: course.courseName, // Using courseName from ICourse
          riskLevel: 'high',
          reason: 'No activity for 2+ weeks with <50% completion'
        });
      } else if (daysSinceActivity > 7 && progressRate < 10) {
        riskItems.push({
          courseId: course.courseId,
          courseTitle: course.courseName, // Using courseName from ICourse
          riskLevel: 'medium',
          reason: 'Slow progress rate (<10% per week)'
        });
      } else if (completionPercentage > 80 && daysSinceActivity > 5) {
        riskItems.push({
          courseId: course.courseId,
          courseTitle: course.courseName, // Using courseName from ICourse
          riskLevel: 'low',
          reason: 'Nearly complete but stalled'
        });
      }
    });
    
    this._dropoutRiskItems.set(riskItems);
    
    // Generate learning recommendations
    // This would be a real AI model in production using collaborative filtering
    const recommendations: LearningRecommendation[] = [];
    
    // Add recommendations based on completion patterns
    if (this._completedCourseCount() > 0) {
      recommendations.push({
        type: 'course',
        title: 'Advanced Data Analytics',
        reason: 'Based on your completed courses'
      });
    }
    
    // Add recommendations based on assessment scores
    const lowScoreAssessments = assessments.filter(a => a.bestScore < 70);
    if (lowScoreAssessments.length > 0) {
      recommendations.push({
        type: 'resource',
        title: 'Study Guide: ' + lowScoreAssessments[0].assessmentTitle,
        reason: 'To improve your assessment score'
      });
    }
    
    // Add general recommendation
    recommendations.push({
      type: 'assessment',
      title: 'Skills Gap Analysis',
      reason: 'Recommended for all learners'
    });
    
    this._learningRecommendations.set(recommendations);
  }
  
  /**
   * Generate mock activity data
   * In a real app, this would come from the API
   */
  generateActivityData(): void {
    const activities: ActivityItem[] = [];
    const courses = this._courses();
    const assessments = this._assessments();
    
    // Generate activities based on courses
    courses.forEach((course, index) => {
      if (index < 3) { // Limit to 3 items for demo
        const completionPercentage = parseInt(course.completionPercentage);
        
        if (completionPercentage === 100) {
          activities.push({
            id: activities.length + 1,
            type: 'course',
            title: course.courseName, // Using courseName from ICourse
            description: 'Course completed',
            timestamp: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)), // Random in last week
            icon: 'check-circle',
            iconColor: 'green'
          });
        } else if (completionPercentage > 0) {
          activities.push({
            id: activities.length + 1,
            type: 'course',
            title: course.courseName, // Using courseName from ICourse
            description: `Made progress (${completionPercentage}%)`,
            timestamp: new Date(Date.now() - Math.floor(Math.random() * 3 * 24 * 60 * 60 * 1000)), // Random in last 3 days
            icon: 'arrow-up',
            iconColor: 'blue'
          });
        }
      }
    });
    
    // Generate activities based on assessments
    assessments.forEach((assessment, index) => {
      if (index < 2) { // Limit to 2 items for demo
        activities.push({
          id: activities.length + 1,
          type: 'assessment',
          title: assessment.assessmentTitle,
          description: `Assessment score: ${assessment.bestScore}%`,
          timestamp: new Date(Date.now() - Math.floor(Math.random() * 14 * 24 * 60 * 60 * 1000)), // Random in last 2 weeks
          icon: 'clipboard-check',
          iconColor: 'purple'
        });
      }
    });
    
    // Add a badge earned activity if completed courses > 0
    if (this._completedCourseCount() > 0) {
      activities.push({
        id: activities.length + 1,
        type: 'badge',
        title: 'Course Completion Badge',
        description: 'Earned a new badge',
        timestamp: new Date(Date.now() - Math.floor(Math.random() * 10 * 24 * 60 * 60 * 1000)), // Random in last 10 days
        icon: 'badge-check',
        iconColor: 'yellow'
      });
    }
    
    // Sort by timestamp (newest first)
    activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    this._activityItems.set(activities);
  }
  
  /**
   * Initialize dashboard UI elements
   */
  initializeDashboard(): void {
    this.updateDashboardHeader();
    this.updateStatCards();
    this.initializeCharts();
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
      progress.textContent = `You've completed ${this.completionPercentage}% of your courses`;
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
   * Initialize and render charts
   */
  initializeCharts(): void {
    this.initCourseProgressChart();
    this.initAssessmentScoresChart();
    
    // Add event listeners for chart refresh buttons
    document.getElementById('refreshProgressBtn')?.addEventListener('click', () => this.refreshProgressChart());
    document.getElementById('refreshScoresBtn')?.addEventListener('click', () => this.refreshScoresChart());
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
          borderColor: '#ffffff' // Always use light mode colors
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
              color: '#374151', // Always use light mode colors
              padding: 16,
              usePointStyle: true,
              pointStyle: 'circle'
            }
          },
          tooltip: {
            backgroundColor: 'rgba(255, 255, 255, 0.9)', // Always use light mode colors
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
    
    // Create new chart with horizontal orientation
    this.assessmentScoresChart = new Chart(assessmentCtx, {
      type: 'bar',
      data: {
        labels: assessmentData.map(a => a.title), // Using full title, no truncation
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
        indexAxis: 'y', // This makes the chart horizontal
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { // This becomes the vertical axis when horizontal
            beginAtZero: true,
            max: 100,
            grid: {
              color: '#e5e7eb'
            },
            ticks: {
              color: '#374151'
            }
          },
          y: { // This becomes the horizontal axis when horizontal
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
                // Return the full assessment title
                const index = context[0].dataIndex;
                return assessmentData[index].title;
              },
              label: (context) => {
                return `Score: ${context.parsed.x}%`;  // Changed from y to x since we're horizontal
              },
              afterLabel: (context) => {
                const score = context.parsed.x;  // Changed from y to x
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
   */
  refreshProgressChart(): void {
    if (!this.courseProgressChart) {
      return;
    }
    
    this.courseProgressChart.data.datasets[0].data = [
      this._completedCourseCount(),
      this._inProgressCourseCount(),
      this._notStartedCourseCount()
    ];
    
    this.courseProgressChart.update();
  }
  
  /**
   * Refresh the assessment scores chart with latest data
   */
  refreshScoresChart(): void {
    if (!this.assessmentScoresChart) {
      return;
    }
    
    const assessmentData = this._assessments().map(a => ({
      title: a.assessmentTitle,
      score: a.bestScore
    }));
    
    this.assessmentScoresChart.data.labels = assessmentData.map(a => a.title);
    this.assessmentScoresChart.data.datasets[0].data = assessmentData.map(a => a.score);
    
    this.assessmentScoresChart.update();
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
  /**
 * Navigate to the learning goals page
 */
  navigateToLearningGoals(): void {
    this.router.navigateByUrl('/learning-goals');
  }
  
  /**
   * Format a date for display
   */
  public formatDate(date: Date): string {
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
   * Truncate a string with ellipsis
   */
  private truncateTitle(title: string, maxLength: number): string {
    if (title.length <= maxLength) {
      return title;
    }
    
    return title.substring(0, maxLength - 3) + '...';
  }
}