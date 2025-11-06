import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { Course } from '../services/course';
import { ICourse } from '../models/course';
import { ActivatedRoute } from '@angular/router';
import { TrustHtmlPipe } from '../pipe/trust-html-pipe';
import { ScormToXAPIFunctions } from '../Scorm/scorm-to-xapifunctions';
import { XAPI } from '../Scorm/xapi';
import { AuthService } from '../services/auth-service';
import { LRS } from '../services/lrs';
import { CommonModule } from '@angular/common';
import { PostMessageService } from '../services/post-message-service';
import { Subscription } from 'rxjs';
import { ScormTimer } from '../Scorm/scorm-timer';

@Component({
  selector: 'app-course-launch',
  imports: [TrustHtmlPipe,CommonModule],
  templateUrl: './course-launch.html',
  styleUrl: './course-launch.css'
})
export class CourseLaunch implements OnInit,OnDestroy {
  private subscription!: Subscription;
  courseId:any="";
  constructor(private courseService:Course,private activatedRoute:ActivatedRoute,
              private scormToApiService:ScormToXAPIFunctions,private xAPIService:XAPI,
              private authService:AuthService,private lrsService:LRS,
              private postMessageService: PostMessageService,
              private scormTimer:ScormTimer
  ) { 

       this.activatedRoute.queryParams.subscribe((param)=>{
          this.courseId=param["courseId"];
          window.localStorage.removeItem("ScormStartTimer:" + this.courseId);
          window.localStorage.removeItem(`suspend_data:${this.courseId}_${this.authService.user?.learnerId?.toString()}`); 
          this.getCourseById();
       });
   //   this.subscription = this.postMessageService.messages$.subscribe(event => {
   //      this.dealWithObject(event.data);
   //   });

      
  }
   
  
  course = signal<ICourse | null>(null);
  ngOnInit(): void {
   this.getCourseById();
   //window.addEventListener("message",this.messageHandler);
  }
  messageHandler=(event: MessageEvent)=>
  {
     this.dealWithObject(event.data);
   //   if (event.origin !== 'https://trusted-domain.com') {
   //      console.warn('Blocked message from untrusted origin:', event.origin);
   //      return;
   //   }

     console.log('Message received:', event.data);
  }
  private dealWithObject=(data:any)=>
  {   
      if(data!=null){
          var action = data.Action || "NOACTION";
        action = action.toUpperCase();
        var from = data.From || "NOFROM";
        from = from.toUpperCase();
          switch (action) {
              case "SCORM":
                switch (data.ScormAction) {
                    case "SCORM_INITIALIZE":
                         this.scormToApiService.initializeAttempt();
                        break;

                    case "SCORM_TERMINATE":
                        this.scormToApiService.terminateAttempt();
                        break;

                    case "SCORM_SETVALUE":
                        this.scormToApiService.saveDataValue(data.Data.cmimodel, data.Data.cmidata);
                        break;

                    case "SCORM_COMMIT":
                        break;

                    case "SCORM_GETLASTERROR":
                        break;

                    case "SCORM_GETERRORSTRING":
                        break;

                    case "SCORM_GETDIAGNOSTIC":
                        break;

                    default:
                }

                break;
          }
      }
  }
  getCourseById(){
     this.courseService.getCourseById(this.courseId).subscribe({
      next:(data)=>{
         if(data.success==true && data.statusCode ==200){
            setTimeout(()=>{
               this.course.set(data.result);
            },1000);
            
            
            //this.cdRef.detectChanges();
         }
      },
      error:(err)=>{

      }
     })
  }
  
 onIframeLoad(){
    this.sendAttemptedStatement();
 }

  sendAttemptedStatement(){
     if (this.course()?.courseType.toUpperCase() == "PDF" || this.course()?.courseType.toUpperCase() == "URL"
          || this.course()?.courseType.toUpperCase() == "SCORM") {
        if (this.course()?.courseType.toUpperCase() == "SCORM") {
           window.localStorage.setItem("ScormStartTimer:" + this.course()?.courseId, this.scormTimer.startTimer().toString());
        }
         var stmt=this.scormToApiService.getBaseStatement();
         stmt.verb=this.xAPIService.getVerbByKey("attempted");
         
         var payload={
             LearnerId:this.authService.user?.learnerId ? parseInt(this.authService.user?.learnerId) : 0,
             TenantId:this.authService.user?.tenantId? parseInt(this.authService.user?.tenantId) : 0,
             CourseId:parseInt(this.courseId),
             CourseType:this.course()?.courseType,
             CourseName:this.course()?.courseName,
             Statement:stmt,
             SlideCount:0
         }
         
         this.lrsService.sendStatement(payload).subscribe({
            next:(data)=>{
               if(data.success && data.statusCode == 200){
                   this.sendExperienceStatement();
               }
            },
            error:(err)=>{

            }
         })
         
     }
  }
  sendExperienceStatement(){
      if (this.course()?.courseType.toUpperCase() == "PDF" || this.course()?.courseType.toUpperCase() == "URL") {
         var stmt=this.scormToApiService.getBaseStatement();
         stmt.verb=this.xAPIService.getVerbByKey("experienced");
         stmt.object.id=stmt.object.id + this.course()?.courseId;

        var payload={
             LearnerId:this.authService.user?.learnerId ? parseInt(this.authService.user?.learnerId) : 0,
             TenantId:this.authService.user?.tenantId? parseInt(this.authService.user?.tenantId) : 0,
             CourseId:parseInt(this.courseId),
             CourseType:this.course()?.courseType,
             CourseName:this.course()?.courseName,
             Statement:stmt,
             SlideCount:0
         }
         
         this.lrsService.sendStatement(payload).subscribe({
            next:(data)=>{
               if(data.success && data.statusCode == 200){
                   this.sendCompletedStatement();
               }
            },
            error:(err)=>{

            }
         })
         
     }
  }

  sendCompletedStatement(){
      if (this.course()?.courseType.toUpperCase() == "PDF" || this.course()?.courseType.toUpperCase() == "URL") {
         var stmt=this.scormToApiService.getBaseStatement();
         stmt.verb=this.xAPIService.getVerbByKey("completed");
         stmt.object.id=stmt.object.id + this.course()?.courseId;

         var payload={
             LearnerId:this.authService.user?.learnerId ? parseInt(this.authService.user?.learnerId) : 0,
             TenantId:this.authService.user?.tenantId? parseInt(this.authService.user?.tenantId) : 0,
             CourseId:parseInt(this.courseId),
             CourseType:this.course()?.courseType,
             CourseName:this.course()?.courseName,
             Statement:stmt,
             SlideCount:0
         }
         
         this.lrsService.sendStatement(payload).subscribe({
            next:(data)=>{
               if(data.success && data.statusCode == 200){
                   
               }
            },
            error:(err)=>{

            }
         })
         
     }
  }
  ngOnDestroy(): void {
      //window.removeEventListener('message', this.messageHandler);
      //this.subscription.unsubscribe();
   }
}
