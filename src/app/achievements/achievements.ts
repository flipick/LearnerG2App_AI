import { Component, OnInit, signal } from '@angular/core';
import { Course } from '../services/course';
import { AuthService } from '../services/auth-service';
import { ICourse } from '../models/course';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-achievements',
  imports: [CommonModule],
  templateUrl: './achievements.html',
  styleUrl: './achievements.css'
})
export class Achievements implements OnInit {
    completedCourses = signal<ICourse[] | null>([]);
    constructor(private courseService:Course,private authService:AuthService){}
    ngOnInit(): void {
       this.getLearnerCompletedCourses();
    }

    getLearnerCompletedCourses(){
       var learnerId:number= this.authService.user?.learnerId ? parseInt(this.authService.user?.learnerId) : 0;
       var tenantId:number= this.authService.user?.tenantId ? parseInt(this.authService.user?.tenantId) : 0;
       this.courseService.getLearnerAchievements(tenantId,learnerId).subscribe({
            next:(data)=>{
                if(data.success && data.statusCode == 200){
                    this.completedCourses.set(data.result);
                }
            },
            error:(err)=>{

            }
       });
    }
}
