import { Component, signal } from '@angular/core';
import { CommonModule, DatePipe, NgIf, NgFor } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Course } from '../services/course';
import { LRS } from '../services/lrs';
import { XAPI } from '../Scorm/xapi';
import { ScormToXAPIFunctions } from '../Scorm/scorm-to-xapifunctions';
import { AuthService } from '../services/auth-service';
import { ICourse } from '../models/course';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-package-courses',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor],
  templateUrl: './package-courses.html',
  styleUrls: ['./package-courses.css']
})
export class PackageCourses {
  courseId: any = '';
  course = signal<ICourse | null>(null);
  courses = signal<ICourse[]>([]);
  constructor(
    private courseService: Course,
    private activatedRoute: ActivatedRoute,
    private lrsDetails: ScormToXAPIFunctions,
    private xAPIService: XAPI,
    private authService: AuthService,
    private lrsService: LRS,
    private route: Router,
    private sanitizer: DomSanitizer // 👈 inject here
  ) {
    this.activatedRoute.queryParams.subscribe((param) => {
      this.courseId = param['courseId'];
      this.getCourseById();
    });
  }

  ngOnInit(): void {
    this.getCourseById();
    this.getCoursesByPackageId();
  }

  getCourseById() {
    this.courseService.getCourseById(this.courseId).subscribe({
      next: (data) => {
        if (data.success && data.statusCode === 200) {
          this.course.set(data.result);
        }
      },
      error: (err) => {
        console.error('Error fetching course:', err);
      }
    });
  }

  // ✅ method to sanitize URLs
  getSafeUrl(url: string | null): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url || '');
  }

  getCoursesByPackageId(){
     this.courseService.getAllCourseByPackageId(this.courseId).subscribe({
      next:(data)=>{
         if(data.success==true && data.statusCode ==200){
            this.courses.set(data.result);
         }
      },
      error:(err)=>{
      }
     })
  }


openCourse(item: ICourse) {  
  if (item.isPackage) {
    this.route.navigateByUrl(`/package-courses?courseId=${item.courseId}`);
  }
  else {
    this.route.navigateByUrl(`/course-launch?courseId=${item.courseId}`);
  }
}

}
