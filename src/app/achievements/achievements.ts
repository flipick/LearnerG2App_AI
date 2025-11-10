import { Component, OnInit, signal } from '@angular/core';
import { Course } from '../services/course';
import { AuthService } from '../services/auth-service';
import { ICourse } from '../models/course';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-achievements',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './achievements.html',
  styleUrl: './achievements.css'
})
export class Achievements implements OnInit {
    completedCourses = signal<ICourse[]>([]);
    loading = signal<boolean>(true);
    error = signal<string | null>(null);

    constructor(private courseService: Course, private authService: AuthService) {}
    
    ngOnInit(): void {
       this.getLearnerCompletedCourses();
    }

    getLearnerCompletedCourses() {
       const learnerId = this.authService.user?.learnerId ? parseInt(this.authService.user.learnerId) : 0;
       const tenantId = this.authService.user?.tenantId ? parseInt(this.authService.user.tenantId) : 0;
       
       this.loading.set(true);
       this.error.set(null);
       
       this.courseService.getLearnerAchievements(tenantId, learnerId).subscribe({
            next: (data) => {
                this.loading.set(false);
                if (data.success && data.statusCode == 200) {
                    this.completedCourses.set(data.result);
                }
            },
            error: (err) => {
                this.loading.set(false);
                this.error.set('Failed to load achievements. Please try again later.');
                console.error('Error loading achievements:', err);
            }
       });
    }
}