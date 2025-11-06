import { CommonModule } from '@angular/common';
import { Component, signal, ViewChild } from '@angular/core';
import { Popup } from '../popup/popup';
import { AssessmentPopup } from '../assessment-popup/assessment-popup';
import { PopUpConfig, PopUpConfigFactory } from '../popup/popup.config.model';
import { appData } from '../appdata';
import { AssessmentService } from '../services/assessment-service';
import { IAssessment } from '../models/assessment';
import { single } from 'rxjs';
import { EventEmitterService } from '../services/event-emitter-service';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth-service';
import { MessagePopup } from '../message-popup/message-popup';

@Component({
  selector: 'app-assessments',
  imports: [CommonModule, Popup, AssessmentPopup,MessagePopup],
  templateUrl: './assessments.html',
  styleUrl: './assessments.css'
})
export class Assessments {
  popupConfig: PopUpConfig = PopUpConfigFactory.getPopUpConfig({
    header: '',
    isShowPopup: false
  });

  @ViewChild('popup1') popup?: Popup;
  isShowAssessmentPopup: boolean = false;
  appData: any = appData;
  assessments=signal<IAssessment[]>([]);
  selectedAssessment!:IAssessment;
  isShowMessagePopup=signal<boolean>(false);
  constructor(private assessmentService:AssessmentService,
              private eventEmitterService:EventEmitterService,
              private route:Router,
              private authService:AuthService
  ) { }
  ngOnInit(): void {  
     this.getAssessments();
  }
  getAssessments(){    
    var learnerId:number=parseInt(this.authService.user?.learnerId || "0");
     this.assessmentService.getAssessments(learnerId).subscribe({
      next:(data)=>{
          if(data.success && data.statusCode == 200){
             this.assessments.set([]);
             this.assessments.set(data.result);
          }
      },
      error:(err)=>{
         
      }
     })
  }
  openAssessment(item: IAssessment) {
    if(item.attemptsAllowed!=0 && item.attempted!=null && parseInt(item.attempted) >= item.attemptsAllowed){
        this.openMessagePopup();
        return;
    }
    if (item.assessmentType == "Role Play Assessment") {
      this.route.navigateByUrl(`/assessment-launch?AssessmentId=${item.assessmentId}`);
    }
    else {
      this.selectedAssessment = item;
      this.isShowMessagePopup.set(false);
      this.isShowAssessmentPopup = true;
      this.setPopupConfig(item.assessmentTitle);
      this.eventEmitterService.openAssessmentQuestion(item);
    }
  }
  setPopupConfig(title:any){
      this.popupConfig.isShowPopup = true;
      this.popupConfig.isShowHeaderText = true;
      this.popupConfig.isClose = true;
      this.popupConfig.header = title;
      this.popupConfig.popupFor = "small";
      this.popup?.open(this.popupConfig);
  }
  closeAssessment(e: any) {
    this.isShowAssessmentPopup = false;
    this.popupConfig.isShowPopup = false;
  }
  openMessagePopup() {
      this.isShowAssessmentPopup=false;
      this.isShowMessagePopup.set(true);
      this.setPopupConfig("warning");
      this.eventEmitterService.openMessagePopup("Attempt limit exceeded. Please contact your administrator.");
    
  }
  closeMessagePopup(e: any) {
    this.isShowMessagePopup.set(false);
    this.popupConfig.isShowPopup = false;    
  }

  
}
