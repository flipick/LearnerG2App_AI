import { ChangeDetectorRef, Component, OnInit, signal, ViewChild } from '@angular/core';
import { PopUpConfig, PopUpConfigFactory } from '../popup/popup.config.model';
import { Popup } from '../popup/popup';
import { CommonModule } from '@angular/common';
import { CoursePopup } from '../course-popup/course-popup';
import { appData } from '../appdata';
import { Course } from '../services/course';
import { ICourse } from '../models/course';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth-service';
import { CapitalizePipe } from '../pipe/capitalize-pipe';
import { CourseState } from '../services/course-state';

@Component({
  standalone:true,
  selector: 'app-courses',
  imports: [CommonModule,CoursePopup,Popup],
  templateUrl: './courses.html',
  styleUrl: './courses.css'
})
export class Courses implements OnInit{
  popupConfig: PopUpConfig = PopUpConfigFactory.getPopUpConfig({
    header: '',
    isShowPopup:false
  });
  @ViewChild('popup1') popup?: Popup;
  isShowCoursePopup:boolean=false;
  appData:any=appData;
  courses = signal<ICourse[]>([]);
  constructor(private course:Course,
              private cdRef: ChangeDetectorRef,
              private route:Router,
              private authService:AuthService,
              private courseStateService:CourseState){}
  ngOnInit(): void {
     this.getCourses();
  }
  getCourses(){
     var tenantId:number=this.authService.user?.tenantId ? parseInt(this.authService.user.tenantId) : 0;
     var learnerId:number=this.authService.user?.learnerId ? parseInt(this.authService.user.learnerId) : 0;
     this.course.getAllCourse(learnerId,tenantId).subscribe({
      next:(data)=>{
         if(data.success==true && data.statusCode ==200){
            this.courses.set(data.result);
            //this.cdRef.detectChanges();
         }
      },
      error:(err)=>{

      }
     })
  }
  openCourse(item:ICourse){
    this.courseStateService.setCourseInfo(item.courseId,item.courseName,item.courseType);
    if(item.isPackage){
      this.route.navigateByUrl(`/package-courses?courseId=${item.courseId}`);
    }
    else{
      this.route.navigateByUrl(`/course-launch?courseId=${item.courseId}`);
    }
   
    // this.isShowCoursePopup=true;
    // this.popupConfig.isShowPopup = true;  
    // this.popupConfig.isShowHeaderText = true; 
    // this.popupConfig.isClose=true;
    // this.popupConfig.header = item.title;
    // this.popupConfig.popupFor = "small";    
    // this.popup?.open(this.popupConfig);  
  } 
  closeCourse(e:any){
    this.isShowCoursePopup=false;
    this.popupConfig.isShowPopup = false;
  }
}
