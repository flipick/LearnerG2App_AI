import { Component, EventEmitter, Input, input, OnDestroy, OnInit, Output, signal, ViewChild } from '@angular/core';
import { IAssessment, IAssessmentQuestion, IAssessmentQuestionResult, ICheckAnwser, IStudentAssessmentResultRequest } from '../models/assessment';
import { AssessmentService } from '../services/assessment-service';
import { CommonModule } from '@angular/common';
import { EventEmitterService } from '../services/event-emitter-service';
import { sign } from 'chart.js/helpers';
import { AuthService } from '../services/auth-service';
import { get, set } from '../utility/sessionStorage';
import { PopUpConfig, PopUpConfigFactory } from '../popup/popup.config.model';
import { Popup } from '../popup/popup';
import { MessagePopup } from '../message-popup/message-popup';
import { Router } from '@angular/router';


@Component({
  selector: 'app-assessment-popup',
  standalone: true, // Add standalone: true if not already present
  imports: [CommonModule, MessagePopup, Popup],
  templateUrl: './assessment-popup.html',
  styleUrl: './assessment-popup.css'
})
export class AssessmentPopup implements OnInit,OnDestroy {
  // Signals for state management
  assessment = signal<IAssessment | null>(null);
  questions = signal<IAssessmentQuestion[]>([]);
  currentQuestionIndex = signal<number>(0);
  
  finalScore = signal<string>("");
  feedbackText = signal<string>("");

  isSubmitted = signal<boolean>(false);
  isShowSubmit = signal<boolean>(false);
  isReviewTest = signal<boolean>(false);
  isShowReviewTestBtn = signal<boolean>(false);
  
  // Added signal for Adaptive Learning support
  hasAdaptiveLearning = signal<boolean>(false);

  //Local variables 
  answers: any = [];
  mulitpleAnswer: any = [];  
  correctAnwserCnt: any = 0;
  wrongAnwserCnt: any = 0;
  totalSkipped: any = 0;
  
  @Output() CloseEvent: any = new EventEmitter();
  totalScoredMarks: number = 0;
  attemptedQuestionsArr: IAssessmentQuestionResult[] = [];
  minStr=signal<string>("00");
  secStr=signal<string>("00");
  timerInterval:any=null;
  min:number=0;
  sec:number=0;
   popupConfig: PopUpConfig = PopUpConfigFactory.getPopUpConfig({
    header: '',
    isShowPopup: false
  });

  @ViewChild('popup1') popup?: Popup;
  isShowMessagePopup=signal<boolean>(false);
  isTimerStop:boolean=false;
  constructor(
  private assessmentService: AssessmentService,
  private eventEmitterService: EventEmitterService,
  private authService: AuthService,
  private router: Router
) {
}
  
  ngOnInit(): void {
    this.eventEmitterService.invokeAssessmentQuestion.subscribe((data) => {
      if (data) {
        if(data.attemptsAllowed!=null && data.attemptsAllowed>0){
           this.getAttemptCount(data);
        }
        else{
           this.resetAssessment(data);
        }
      }
    });

  }
  getAttemptCount(item:IAssessment){
     this.assessmentService.getLearnerAssessmentAttempt(this.authService.user?.learnerId,item.assessmentId).subscribe({
         next:(data)=>{
             if(data.success && data.statusCode == 200){
                var isAttemptExceeded=item.attemptsAllowed<=data.result.attempted;
                if(isAttemptExceeded){
                    this.openMessagePopup("Attempt limit exceeded. Please contact your course administrator.");
                    return;
                }
                else{
                    this.resetAssessment(item);
                }
             }
         },
         error:(err)=>{

         }
     });
  }
  resetAssessment(data:IAssessment){
      sessionStorage.removeItem("UserPaperSetId");
        this.isReviewTest.set(false);
        this.isShowReviewTestBtn.set(false);
        this.assessment.set(data);
        this.answers = [];
        this.correctAnwserCnt = 0;
        this.finalScore.set("");
        this.isSubmitted.set(false);
        this.isShowSubmit.set(false);
        this.currentQuestionIndex.set(0);
        this.isTimerStop=false;
        
        // Check for Adaptive Learning support
        this.checkAdaptiveLearningSupport();
        
        if (this.assessment()?.assessmentType.toUpperCase() == 'ADAPTIVE ASSESSMENT') {
          this.questions.set(Array.from({ length: this.assessment()!.noOfQuestions }, () => this.createEmptyQuestion()));
          this.getAdaptiveAssessmentNextQuestion();
        }
        else {
          this.getAssessmentQuestions();
        }
  }
  
  /**
   * Checks if the current assessment supports Adaptive Learning
   */
  checkAdaptiveLearningSupport(): void {
    if (!this.assessment()) {
      this.hasAdaptiveLearning.set(false);
      return;
    }
    
    this.assessmentService.checkAdaptiveLearningSupport(this.assessment()!.assessmentId).subscribe({
      next: (data: any) => {
        if (data.success) {
          this.hasAdaptiveLearning.set(data.result);
        } else {
          this.hasAdaptiveLearning.set(false);
        }
      },
      error: (err: any) => {
        console.error('Error checking Adaptive Learning support:', err);
        this.hasAdaptiveLearning.set(false);
      }
    });
  }
  
  getAssessmentQuestions() {
    this.assessmentService.getAssessmentQuestions(this.assessment()?.assessmentId).subscribe({
      next: (data) => {
        if (data.success && data.statusCode == 200) {
          this.currentQuestionIndex.set(this.currentQuestionIndex() + 1);
          this.questions.set(data.result);
          this.startTimer();
        }
      },
      error: (err) => {

      }
    })
  }

  getAdaptiveAssessmentNextQuestion() {
    var userPaperSetId:any=get("UserPaperSetId") ? parseInt(get("UserPaperSetId")) : 0;
    this.assessmentService.getAdaptiveAssessmentNextQuestion(this.assessment()?.assessmentId, this.authService.user?.learnerId,userPaperSetId).subscribe({
      next: (data) => {
        if (data.success && data.statusCode == 200) {
          this.currentQuestionIndex.set(this.currentQuestionIndex() + 1);
          this.updateQuestion(this.currentQuestionIndex() - 1, data.result[0]);
          this.highlightCorrectOrWrongOptions();
          this.startTimer();
        }
      },
      error: (err) => {

      }
    })
  }
  goToPreviousQuestion() {
    if (this.currentQuestionIndex() > 1) {
      this.currentQuestionIndex.set(this.currentQuestionIndex() - 1);
      this.isShowSubmit.set(false);
      this.highlightCorrectOrWrongOptions();
    }
  }
  goToNextQuestion() {
    if (this.currentQuestionIndex() <= this.questions().length) {

      if (this.questions()[this.currentQuestionIndex()].questionId != 0) {
        this.currentQuestionIndex.set(this.currentQuestionIndex() + 1);
        this.highlightCorrectOrWrongOptions();
      }
      else if (this.assessment()?.assessmentType.toUpperCase() == 'ADAPTIVE ASSESSMENT') {
        this.submitAdaptiveQuestionScore();
      }
    }
  }
  highlightCorrectOrWrongOptions() {
    if (this.answers[this.currentQuestionIndex() - 1]) {
      var checkAnswerObj: ICheckAnwser = this.checkAnswer(this.questions()[this.currentQuestionIndex() - 1], this.currentQuestionIndex() - 1);
      var spltAnwser = this.answers[this.currentQuestionIndex() - 1].split(',');
      spltAnwser.forEach((item: any) => {
        setTimeout(() => {
          var inptEle: any = document.querySelector(`input[value="${item.trim()}"]`);
          if (inptEle) {
            if (this.isReviewTest()) {
              const parentLabel = inptEle.closest('label');

              if (parentLabel) {
                if (checkAnswerObj.isAnwserCorrect) {
                  parentLabel.classList.add('correct');
                  parentLabel.classList.remove('wrong');
                }
                else {
                  parentLabel.classList.add('wrong');
                  parentLabel.classList.remove('correct');

                  var spltActualAnwser = this.questions()[this.currentQuestionIndex() - 1].answer.toLowerCase().trim().split(',');
                  spltActualAnwser.forEach((obj: any) => {
                    var actaulInptEle: any = document.querySelector(`input[value="${obj.toLowerCase().trim()}"]`);
                    if (actaulInptEle) {
                      const parentLabell = actaulInptEle.closest('label');
                      parentLabell.classList.add('correct');
                      parentLabell.classList.remove('wrong');
                    }
                  });
                }
              }
            }
            inptEle.checked = true;

            if (this.currentQuestionIndex() == (this.questions().length)) {
              this.isShowSubmit.set(true);
            }
            else {
              this.isShowSubmit.set(false);
            }
          }
        }, 200);
      });
    }
  }
  submitAssessment() {
    this.resetScoreCounters();
    this.questions().forEach((q: any, idx: any) => {

      if (this.answers[idx]) {
        var check: ICheckAnwser = this.checkAnswer(q, idx);
       this.handleAttemptedAnswer(q,check,idx);
      }
      else {
        this.totalSkipped = this.totalSkipped + 1;
      }
    });

    var totalMarks: number = this.calculateTotalMarks();
    var score = 0;

    score = this.calculateScore(totalMarks);

    this.showAssessmentResults(score, this.totalScoredMarks, totalMarks);
    this.isSubmitted.set(true);
    this.saveAssessmentResult(totalMarks, score);
    this.isShowReviewTestBtn.set(true);
  }
  calculateTotalMarks(){
    return this.questions().reduce((sum, x) => sum + (x.points||1), 0); 
  }
  calculateScore(totalMarks:number){
     return Math.round((this.totalScoredMarks / totalMarks) * 100);
  }
  submitAdaptiveQuestionScore() {
    this.resetScoreCounters();
   
    if (this.currentQuestionIndex() == (this.questions().length || this.isTimerStop)) {
      this.questions().forEach((q: any, idx: any) => {
        if (this.answers[idx]) {
          //var element: IAssessmentQuestion = this.questions()[this.currentQuestionIndex() - 1];
          var check: ICheckAnwser = this.checkAnswer(q, idx);
          
          if (check.isAnwserCorrect) {
            var scoredMarks = q.points ? q.points : 1;
            this.totalScoredMarks = q.points ? this.totalScoredMarks + q.points : this.totalScoredMarks + scoredMarks;
            this.correctAnwserCnt = this.correctAnwserCnt + 1;

            //this.attemptedQuestionsArr.push({ questionId: element.questionId, userAnswer: checkAnswerObj.userAnwser, scoredMarks: scoredMarks, questionStatus: "", timeTaken: 0, action: "", shuffleSequence: "0", newAnswer: "" });
          }
          else {
            this.wrongAnwserCnt = this.wrongAnwserCnt + 1;
            //this.attemptedQuestionsArr.push({ questionId: element.questionId, userAnswer: checkAnswerObj.userAnwser, scoredMarks: 0, questionStatus: "", timeTaken: 0, action: "", shuffleSequence: "0", newAnswer: "" });
          }
        }
        else {
          this.totalSkipped = this.totalSkipped + 1;
        }
      });

      if (this.answers[this.currentQuestionIndex() - 1]) {
        var element: IAssessmentQuestion = this.questions()[this.currentQuestionIndex() - 1];
        var checkAnswerObj: ICheckAnwser = this.checkAnswer(element, this.currentQuestionIndex() - 1);
        if (checkAnswerObj.isAnwserCorrect) {
          var scoredMarks = element.points ? element.points : 1;
          if(this.attemptedQuestionsArr.filter(x=>x.questionId==element.questionId).length==0){
            this.attemptedQuestionsArr.push({ questionId: element.questionId, userAnswer: checkAnswerObj.userAnwser, scoredMarks: scoredMarks, questionStatus: "", timeTaken: 0, action: "", shuffleSequence: "0", newAnswer: "" });
          }
        }
        else {
          if(this.attemptedQuestionsArr.filter(x=>x.questionId==element.questionId).length==0){
            this.wrongAnwserCnt = this.wrongAnwserCnt + 1;
            this.attemptedQuestionsArr.push({ questionId: element.questionId, userAnswer: checkAnswerObj.userAnwser, scoredMarks: 0, questionStatus: "", timeTaken: 0, action: "", shuffleSequence: "0", newAnswer: "" });
          }
        }
      }


    }
    else {
      if (this.answers[this.currentQuestionIndex() - 1]) {
        var element: IAssessmentQuestion = this.questions()[this.currentQuestionIndex() - 1];
        var checkAnswerObj: ICheckAnwser = this.checkAnswer(element, this.currentQuestionIndex() - 1);
        this.handleAttemptedAnswer(element,checkAnswerObj,this.currentQuestionIndex() - 1);
      }

      else {
        this.totalSkipped = this.totalSkipped + 1;
      }

    }



    var totalMarks: number = this.calculateTotalMarks();
    var score = 0;

    score = this.calculateScore(totalMarks);

    //this.showAssessmentResults(score, this.totalScoredMarks, totalMarks);
    //this.isSubmitted.set(true);
    this.saveAssessmentResult(totalMarks, score);
    //this.isShowReviewTestBtn.set(true);
  }
  resetScoreCounters(){
    this.correctAnwserCnt = 0;
    this.wrongAnwserCnt = 0;
    this.totalSkipped = 0;
    this.isSubmitted.set(false);
    this.totalScoredMarks = 0;
    this.attemptedQuestionsArr = [];
  }
  checkAnswer(question: IAssessmentQuestion, idx: number): ICheckAnwser {
    const selected = this.answers[idx]?.split(",").map((a:any) => a.trim().toLowerCase()).sort() || [];
    const actual = question.answer.split(",").map(a => a.trim().toLowerCase()).sort();
    return {
      userAnwser: JSON.stringify(selected),
      isAnwserCorrect: JSON.stringify(selected) === JSON.stringify(actual)
    };
  }
  handleAttemptedAnswer(q: IAssessmentQuestion, check: ICheckAnwser, idx: number) {
    if (check.isAnwserCorrect) {
      const scored = q.points || 1;
      this.totalScoredMarks += scored;
      this.correctAnwserCnt++;
      this.attemptedQuestionsArr.push({ questionId: q.questionId, userAnswer: check.userAnwser, scoredMarks: scored, questionStatus: "", timeTaken: 0, action: "", shuffleSequence: "0", newAnswer: "" });
    } else {
      this.wrongAnwserCnt++;
      this.attemptedQuestionsArr.push({ questionId: q.questionId, userAnswer: check.userAnwser, scoredMarks: 0, questionStatus: "", timeTaken: 0, action: "", shuffleSequence: "0", newAnswer: "" });
    }
  }
  changeOnRadio(e: any, idx: any) {    
    this.answers[idx]=e.currentTarget.checked ? e.currentTarget.value : "";
    this.toggleSubmitVisibility();
  }
  changeOnCheckBox(e: any, idx: any) {    
    const value= e.currentTarget.value;
    if (e.currentTarget.checked) {
        this.answers[idx] =this.answers[idx] ? `this.answers[idx],${value}` : value;
    }
    else {
        this.answers[idx] =this.answers[idx] ? this.answers[idx].replaceAll(value, "") : "";
    }
    this.toggleSubmitVisibility();
  }
  toggleSubmitVisibility() {
    this.isShowSubmit.set(this.currentQuestionIndex() === this.questions().length && !!this.answers[this.currentQuestionIndex() - 1]);
  }
  showAssessmentResults(score: any, correct: any, total: any) {

    this.isSubmitted.set(true);
    this.finalScore.set(`Score: ${score}% (${correct}/${total} correct)`);

    this.feedbackText.set("");
    if (score >= 80) {
      this.feedbackText.set('🎉 Excellent work! You passed the assessment.');
    } else if (score >= 60) {
      this.feedbackText.set('👍 Good effort! Consider reviewing the material.');
    } else {
      this.feedbackText.set('📚 Keep studying! You can retake this assessment.');
    }


  }
  saveAssessmentResult(totalMarks: any, score: any) {
    // var totalMarks: number = this.questions().reduce((sum, x) => sum + x.points, 0);
    // const score = Math.round((this.totalScoredMarks / totalMarks) * 100);
    //var payloadFinal:IStudentAssessmentResultRequest[]=[]; 
    var Payload: IStudentAssessmentResultRequest = {
      userPaperSetId: get("UserPaperSetId") ? parseInt(get("UserPaperSetId")) : 0,
      paperSetNo: 0,
      totalCorrect: this.correctAnwserCnt,
      learnerId: this.authService.user?.learnerId ? parseInt(this.authService.user?.learnerId) : 0,
      totalWrong: this.wrongAnwserCnt,
      totalSkipped: this.totalSkipped,
      totalMarks: totalMarks,
      totalScoredMarks: this.totalScoredMarks,
      scorePercentage: score,
      //assessmentId: this.assessment()?.assessmentId ?? 0,
      scoredPercentage: score, // numeric(18,2)
      backupTotalCorrect: 0,
      backupTotalWrong: 0,
      backupTotalScoredMarks: 0,
      backupScorePercentage: 0,
      elapsedTime: "0",
      isPartial: "N",
      meetingId: "",
      testPostedFrom: "",
      testZipUrl: '',
      paperSetPackageId: 0,
      isImported: '',
      completedLrsAttemptId: 0,
      questionsRusultList: this.attemptedQuestionsArr
    };

    this.assessmentService.saveAssessmentResult(Payload,this.assessment()?.assessmentId ?? 0).subscribe({
      next: (data) => {
        if (data.success && data.statusCode == 200) {
          
          if (this.assessment()?.assessmentType.toUpperCase() == 'ADAPTIVE ASSESSMENT') {
            set("UserPaperSetId", data.result);
            if (this.currentQuestionIndex() == this.questions().length) {
              this.updateUserPaperSet();
              this.stopTimer();              
            }
            else {
              this.getAdaptiveAssessmentNextQuestion();
            }
          }
        }
      },
      error: (err) => {

      }
    })
  }
  close() {
    this.CloseEvent.next(true);
    this.stopTimer();
  }
  reviewAssessment() {
    this.isShowSubmit.set(false);
    this.isReviewTest.set(true);
    this.currentQuestionIndex.set(1);

    if (this.answers[this.currentQuestionIndex() - 1]) {
      var checkAnswerObj: ICheckAnwser = this.checkAnswer(this.questions()[this.currentQuestionIndex() - 1], this.currentQuestionIndex() - 1);
      var spltAnwser = this.answers[this.currentQuestionIndex() - 1].split(',');
      spltAnwser.forEach((item: any) => {
        setTimeout(() => {
          var inptEle: any = document.querySelector(`input[value="${item.trim()}"]`);
          if (inptEle) {
            const parentLabel = inptEle.closest('label');
            if (parentLabel) {
              if (checkAnswerObj.isAnwserCorrect) {
                parentLabel.classList.add('correct');
                parentLabel.classList.remove('wrong');
              }
              else {
                parentLabel.classList.add('wrong');
                parentLabel.classList.remove('correct');

                var spltActualAnwser = this.questions()[this.currentQuestionIndex() - 1].answer.toLowerCase().trim().split(',');
                spltActualAnwser.forEach((obj: any) => {
                  var actaulInptEle: any = document.querySelector(`input[value="${obj.toLowerCase().trim()}"]`);
                  if (actaulInptEle) {
                    const parentLabell = actaulInptEle.closest('label');
                    parentLabell.classList.add('correct');
                    parentLabell.classList.remove('wrong');
                  }
                });
              }
            }
            inptEle.checked = true;
          }
        }, 200);
      });



    }
  }

  createEmptyQuestion(): IAssessmentQuestion {
    return {
      questionId: 0,
      assessmentId: 0,
      assessmentTitle: '',
      questionTypeId: 0,
      questionTypeName: '',
      questionText: '',
      a: null,
      b: null,
      c: null,
      d: null,
      e: null,
      f: null,
      isCorrect: false,
      answer: '',
      description: null,
      points: 0,
      explanation: null,
      isSelected: false
    };
  }
  updateQuestion(index: number, partial: Partial<IAssessmentQuestion>) {
    this.questions.update(qs => {
      const updated = [...qs];
      updated[index] = { ...updated[index], ...partial };
      return updated;
    });
  }

  updateUserPaperSet(){
     this.assessmentService.getUserPaperSet(get("UserPaperSetId")).subscribe({
       next:(data)=>{
          if(data.success && data.statusCode == 200){
             this.showAssessmentResults(data.result.scorePercentage, this.totalScoredMarks,data.result.totalMarks);
             this.isShowReviewTestBtn.set(true);
          }
       },
       error:(err)=>{

       }
     })
  }
  startTimer(){
      this.min=this.assessment()!.timeLimitInMinutes;
      this.sec=60;
      this.secStr.set("60");
      this.minStr.set(this.min.toString());
      this.min--;
      switch(this.assessment()!.timeLimitInMinutes.toString().length){
         case 1: 
         this.minStr.set(`0${this.min}`); 
         break;         
      }
      this.timerInterval=setInterval(() => {
          if(this.sec==0 && this.min==0){
             this.stopTimer();
             this.openMessagePopup("Your time is up.");
             return;
          }
          else if(this.sec == 0){
             this.min--;
             this.sec =60;
            
          }
          
          this.sec--;  
          this.minStr.set(this.min.toString().length==1?`0${this.min.toString()}`: this.min.toString());              
          this.secStr.set(this.sec.toString().length==1?`0${this.sec.toString()}`: this.sec.toString());           
          
      }, 1000);
  }
  stopTimer(){
    this.isTimerStop=true;
    clearInterval(this.timerInterval);
  }
openMessagePopup(message:any) {
   
      this.isShowMessagePopup.set(true);
      this.setPopupConfig();
      this.eventEmitterService.openMessagePopup(message);
    
  }
  setPopupConfig(){
      this.popupConfig.isShowPopup = true;
      this.popupConfig.isShowHeaderText = true;
      this.popupConfig.isClose = true;
      this.popupConfig.header = "Warning";
      this.popupConfig.popupFor = "small";
      this.popup?.open(this.popupConfig);
  }
  closeMessagePopup(e: any) {
    this.isShowMessagePopup.set(false);
    this.popupConfig.isShowPopup = false;
    this.submitPaper();
  }
  submitPaper(){
    this.stopTimer();
     if(this.assessment()?.assessmentType?.toUpperCase() == 'ADAPTIVE ASSESSMENT') {
       this.submitAdaptiveQuestionScore();
     }
     else{
      this.submitAssessment();
      }
  }
  ngOnDestroy(): void {
    this.stopTimer();
  }
navigateToAdaptiveLearning(): void {
  if (this.assessment()) {
    // Close the current popup
    this.close();
    
    // Navigate to the adaptive learning view for this assessment
    this.router.navigate(['/adaptive-learning', this.assessment()!.assessmentId]);
  }
}
}