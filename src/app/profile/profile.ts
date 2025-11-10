import { ChangeDetectorRef, Component, OnInit, signal } from '@angular/core';
import { appData } from '../appdata';
import { get } from '../utility/sessionStorage';
import { CapitalizePipe } from '../pipe/capitalize-pipe';
import { CommonModule } from '@angular/common';
import { ICourse } from '../models/course';
import { Course } from '../services/course';
import { AuthService } from '../services/auth-service';
import { IAssessment } from '../models/assessment';
import { AssessmentService } from '../services/assessment-service';
import { IUserInfo } from '../models/user.state';

@Component({
  selector: 'app-profile',
  standalone: true, // Make sure standalone is true
  imports: [CommonModule, CapitalizePipe],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {
   appData: any = appData;
   courses = signal<ICourse[]>([]);
   assessments = signal<IAssessment[]>([]);
   userProfile = signal<IUserInfo | null>(null);
   earnedBadges = signal<number>(0);
   userTitle = signal<string>('');
   completedAssessmentsCount = signal<number>(0);
   
   constructor(
     private couresService: Course,
     private cdref: ChangeDetectorRef,
     private authService: AuthService,
     private assessmentService: AssessmentService
   ) {}
   
  ngOnInit(): void {
    this.userProfile.set(this.authService.user ? this.authService.user : null);
    this.userTitle.set(this.getUserInitials(this.userProfile()?.name || ''));
    this.getCourses();
    this.getAssessments();
  }
  
  getUserInitials(name: string): string {
    return name.split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  }
  
  getCourses() {
    const tenantId = this.authService.user?.tenantId ? parseInt(this.authService.user.tenantId) : 0;
    const learnerId = this.authService.user?.learnerId ? parseInt(this.authService.user.learnerId) : 0;
    
    this.couresService.getAllCourse(learnerId, tenantId).subscribe({
      next: (data) => {
        if (data.success && data.statusCode == 200) {
           this.courses.set(data.result);
           this.earnedBadges.set(this.courses().filter(x => x.completionPercentage == "100").length);
        }
      },
      error: (err) => {
        console.error('Error loading courses:', err);
      }
    });
  }
  
  getAssessments() {    
    const learnerId = this.authService.user?.learnerId ? parseInt(this.authService.user.learnerId) : 0;
    
    this.assessmentService.getAssessments(learnerId).subscribe({
      next: (data) => {
        if (data.success && data.statusCode == 200) {
           this.assessments.set(data.result);
           this.completedAssessmentsCount.set(
             this.assessments().filter(x => x.status == "Completed").length
           );
        }
      },
      error: (err) => {
        console.error('Error loading assessments:', err);
      }
    });
  }
}