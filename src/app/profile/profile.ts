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
import { sign } from 'chart.js/helpers';
import { IUserInfo } from '../models/user.state';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, CapitalizePipe],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {
   appData:any=appData;
   authValue:any=get("AuthValue");
   courses=signal<ICourse[]>([]);
   assessments=signal<IAssessment[]>([]);
   userProfile=signal<IUserInfo | null>(null);
   earnedBadges=signal<number>(0);
   userTitle=signal<string>('');
   completedAssessmentsCount=signal<number>(0);
   constructor(private couresService:Course,private cdref:ChangeDetectorRef,
               private authService:AuthService,private assessmentService:AssessmentService
   ){}
  ngOnInit(): void {
    
    this.userTitle.set(this.userProfile()?.name.split(' ').map((x:any)=>x[0]).join('').toUpperCase()!);
    this.userProfile.set(this.authService.user ? this.authService.user : null);
    const profileName:any = document.getElementById('profileName');
    const profileAvatar:any = document.getElementById('profileAvatar');
    const profileBadgesSummary:any = document.getElementById('profileBadgesSummary');    
    
    // profileName.textContent = this.authService.user?.name;
    // profileAvatar.textContent = this.authService.user?.name.split(' ').map((n:any) => n[0]).join('').toUpperCase();
    
    //this.earnedBadges.set(appData.badges.filter(b => b.earned).length);
    //profileBadgesSummary.textContent = `${earnedBadges} badges earned`;

    this.getCourses();
    this.getAssessments();
  }
  getCourses(){
    var tenantId:number=this.authService.user?.tenantId ? parseInt(this.authService.user.tenantId) : 0;
     var learnerId:number=this.authService.user?.learnerId ? parseInt(this.authService.user.learnerId) : 0;
    this.couresService.getAllCourse(learnerId,tenantId).subscribe({
      next:(data)=>{
        if(data.success && data.statusCode == 200){
           this.courses.set(data.result);
           this.earnedBadges.set(this.courses().filter(x=>x.completionPercentage=="100").length);
           //this.cdref.detectChanges();
        }
      },
      error:(err)=>{

      }
    })
  }
  getAssessments(){    
    this.assessmentService.getAssessments(this.authService.user?.learnerId).subscribe({
      next:(data)=>{
        if(data.success && data.statusCode == 200){
           this.assessments.set(data.result);
           this.completedAssessmentsCount.set(this.assessments().filter(x=>x.status == "Completed").length);
           //this.cdref.detectChanges();
        }
      },
      error:(err)=>{

      }
    })
  }
}
