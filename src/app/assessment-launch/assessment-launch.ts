import { Component, OnInit, signal } from '@angular/core';
import { IAssessment } from '../models/assessment';
import { AssessmentService } from '../services/assessment-service';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { TrustHtmlPipe } from '../pipe/trust-html-pipe';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth-service';

@Component({
  selector: 'app-assessment-launch',
  imports: [TrustHtmlPipe,CommonModule],
  templateUrl: './assessment-launch.html',
  styleUrl: './assessment-launch.css'
})
export class AssessmentLaunch implements OnInit {
  assessment=signal<IAssessment | null>(null);
  assessmentId:any="";
  constructor(private assessmentService:AssessmentService,private activatedRoute:ActivatedRoute,
              private authService:AuthService
  ){
      
  }
  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(param=>{
        this.assessmentId=param["AssessmentId"];
        this.getAssessmentById();
    });
  }

  getAssessmentById(){
     this.assessmentService.getAssessmentByAssessmentId(this.assessmentId).subscribe({
        next:(data)=>{
            if(data.success && data.statusCode == 200){
                this.assessment.set(data.result);
                this.assessment()!.aiAssessmentUrl=this.assessment()?.aiAssessmentUrl!=undefined ? `${this.assessment()?.aiAssessmentUrl}&LearnerId=${this.authService.user?.learnerId}`.toString() : "";
            }
        }
     })
  }
      
}
