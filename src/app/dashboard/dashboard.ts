import { AfterViewInit, Component, OnInit, signal } from '@angular/core';
import { appData } from '../appdata';
import { Chart, registerables } from 'chart.js';
import { Route, Router } from '@angular/router';
import { get } from '../utility/sessionStorage';
import { AuthService } from '../services/auth-service';
import { ICourse } from '../models/course';
import { IAssessment } from '../models/assessment';
import { Course } from '../services/course';
import { AssessmentService } from '../services/assessment-service';
import { DashboardService } from '../services/dashboard-service';

@Component({
    selector: 'app-dashboard',
    imports: [],
    templateUrl: './dashboard.html',
    styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit, AfterViewInit {


    courseProgressChart: any = null;
    assessmentScoresChart: any = null;
    authValue: any;
    courses = signal<ICourse[]>([]);
    assessments = signal<IAssessment[]>([]);
    constructor(private route: Router,
        private authService: AuthService,
                private dashboardService:DashboardService
    ) {

    }
    ngAfterViewInit(): void {
        this.getLearnerDashboard();
    }
    initDashboard(){
        const greeting: any = document.getElementById('dashboardGreeting');
        const progress: any = document.getElementById('dashboardProgress');
        const totalCourses: any = document.getElementById('totalCourses');
        const completedCourses: any = document.getElementById('completedCourses');
        const earnedBadges: any = document.getElementById('earnedBadges');

        greeting.textContent = `Welcome back, ${this.authService.user?.name}!`;

        const completed = this.courses().filter(c => c.completionPercentage === '100').length;
        const total = this.courses().length;
        const completionPercentage =completed==0? 0 : Math.round((completed / total) * 100);

        progress.textContent = `You've completed ${completionPercentage}% of your courses`;
        totalCourses.textContent = total;
        completedCourses.textContent = completed;
        earnedBadges.textContent = completed;

        this.initializeDashboardCharts();
    }
    ngOnInit(): void {
        // Chart.register(ArcElement, Tooltip, Legend);
        //this.authValue=get("AuthValue");
    }
    getLearnerDashboard(){
        var learnerid:number=this.authService.user?.learnerId?parseInt(this.authService.user.learnerId) : 0;
        var tenantid:number=this.authService.user?.tenantId ? parseInt(this.authService.user.tenantId) : 0;
         this.dashboardService.getDashboard(learnerid,tenantid).subscribe({
            next:(data)=>{
                 if(data.success && data.statusCode == 200){
                     this.courses.set(data.result.courses);
                     this.assessments.set(data.result.assessments);
                     this.initDashboard();
                 }
            },
            error:(err)=>{

            }
           }
         )
    }
    initializeDashboardCharts() {
        Chart.register(...registerables);
        // Course Progress Doughnut Chart

        var courseProgressChartEle: any = document.getElementById('courseProgressChart');
        const courseCtx = document.getElementById('courseProgressChart') as HTMLCanvasElement; //courseProgressChartEle.getContext('2d');
        const completed = this.courses().filter(c => parseInt(c.completionPercentage)==100).length;
        //const inProgress = this.courses().filter(c => c.status === 'in-progress').length;
        const notStarted = this.courses().filter(c => parseInt(c.completionPercentage)==0).length;

        if (this.courseProgressChart) {
            this.courseProgressChart.destroy();
        }

        this.courseProgressChart = new Chart(courseCtx, {
            type: 'doughnut',
            data: {
                labels: ['Completed', 'Not Started'],
                datasets: [{
                    data: [completed, notStarted],
                    backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C'],
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });

        // Assessment Scores Bar Chart
        var assessmentScoresChartEle: any = document.getElementById('assessmentScoresChart');
        const assessmentCtx = assessmentScoresChartEle.getContext('2d');
        const assessmentData = this.assessments().map(a => ({
            title: a.assessmentTitle,
            score: a.bestScore
        }));

        if (this.assessmentScoresChart) {
            this.assessmentScoresChart.destroy();
        }

        this.assessmentScoresChart = new Chart(assessmentCtx, {
            type: 'bar',
            data: {
                labels: assessmentData.map(a => a.title),
                datasets: [{
                    label: 'Best Score (%)',
                    data: assessmentData.map(a => a.score),
                    backgroundColor: '#1FB8CD',
                    borderColor: '#1FB8CD',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    updateDashboardCharts() {
        if (this.courseProgressChart && this.assessmentScoresChart) {
            const completed = appData.courses.filter(c => c.status === 'completed').length;
            const inProgress = appData.courses.filter(c => c.status === 'in-progress').length;
            const notStarted = appData.courses.filter(c => c.status === 'not-started').length;

            this.courseProgressChart.data.datasets[0].data = [completed, inProgress, notStarted];
            this.courseProgressChart.update();

            const assessmentData = appData.assessments.map(a => a.bestScore);
            this.assessmentScoresChart.data.datasets[0].data = assessmentData;
            this.assessmentScoresChart.update();

            // Update stats
            var completedCourses: any = document.getElementById('completedCourses');
            completedCourses.textContent = completed;
            var earnedBadges: any = document.getElementById('earnedBadges');
            earnedBadges.textContent = appData.badges.filter(b => b.earned).length;

            const total = appData.courses.length;
            const completionPercentage = Math.round((completed / total) * 100);
            var dashboardProgress: any = document.getElementById('dashboardProgress');
            dashboardProgress.textContent = `You've completed ${completionPercentage}% of your courses`;
        }
    }
    redirectToCourses() {
        this.route.navigateByUrl("/courses");
    }
    redirectToAssessments() {
        this.route.navigateByUrl("/assessments");
    }
}
