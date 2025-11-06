import { ITenant } from "./tenant";

export interface IAssessment{
      assessmentId: number;
      assessmentTitle: string;
      assessmentTypeId: number;
      assessmentType: string;
      description:string;
      tenantScope: string;
      assessmentTenants: ITenant[] | null;
      timeLimitInMinutes:number;
      attemptsAllowed:number;
      passingScore:number;
      noOfQuestions:number;
      status:string;
      flag:0;
      row: string | null
      totalRowCount:string;
      bestScore:number;
      aiAssessmentUrl:string;
      attempted:string;
      formattedExpirationDate:string;
}

export interface ICheckAnwser{
   isAnwserCorrect:boolean;
   userAnwser:string;
}

export interface IAssessmentQuestion {
  questionId: number;
  assessmentId: number;
  assessmentTitle: string;
  questionTypeId: number;
  questionTypeName: string;
  questionText: string;
  a?: string | null;
  b?: string | null;
  c?: string | null;
  d?: string | null;
  e?: string | null;
  f?: string | null;
  isCorrect: boolean;
  answer: string;
  description?: string | null;
  points: number;
  explanation?: string | null;
  isSelected:boolean;
}

export interface IStudentAssessmentResultRequest {
  paperSetNo: number;
  totalCorrect: number;
  learnerId: number;
  totalWrong: number;
  totalSkipped: number;
  totalMarks: number;
  totalScoredMarks: number;
  scorePercentage: number;
 // assessmentId: number;
  scoredPercentage: number; // numeric(18,2)
  backupTotalCorrect: number;
  backupTotalWrong: number;
  backupTotalScoredMarks: number;
  backupScorePercentage: number;
  elapsedTime: string;
  isPartial: string;
  meetingId: string;
  testPostedFrom: string;
  testZipUrl: string;
  paperSetPackageId: number;
  isImported: string;
  completedLrsAttemptId: number;
  questionsRusultList: IAssessmentQuestionResult[];
  userPaperSetId:number;
}

export interface IAssessmentQuestionResult {
  questionId: number;
  userAnswer: string;
  questionStatus: string;
  action: string;
  timeTaken: number;
  shuffleSequence: string;
  newAnswer: string;
  scoredMarks: number;
}
