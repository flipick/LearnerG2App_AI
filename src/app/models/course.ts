export interface ICourse {
  courseId: number;
  courseName: string;
  duration: string;
  description: string;
  categoryId: number;
  difficultyLevelId: number;
  courseType: string;
  courseTypeUrl: string;
  tags: string;
  tenantScope: string;
  enrollmentId: number;
  status: string;
  isTrackLearnerProgess: boolean;
  isTrackTimeSpent: boolean;
  isTrackAssessmentScores: boolean;
  isPackage:boolean;
  certificationSetting: string;
  thumbnailUrl: string | null;
  thumbnailurl:string | null;
  courseTenants: any; // You can replace `any` with a proper type if you know the structure
  completionPercentage:string;
  formattedExpirationDate:string;
}