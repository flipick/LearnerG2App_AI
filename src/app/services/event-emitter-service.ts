import { EventEmitter, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EventEmitterService {
    invokeAssessmentQuestion=new EventEmitter<any>();
    invokeMessagePopup=new EventEmitter<any>();

    openAssessmentQuestion(assessment:any){
      this.invokeAssessmentQuestion.emit(assessment);
    }
    openMessagePopup(message:any){
       this.invokeMessagePopup.emit(message);
    }
}
