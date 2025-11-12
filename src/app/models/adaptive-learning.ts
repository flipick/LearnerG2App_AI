export interface IAdaptiveLearningResult {
  assessmentId: number;
  assessmentTitle: string;
  learnerId: string;
  overallScore: number;
  completionDate: string;
  subCategories: ISubCategoryResult[];
}

export interface ISubCategoryResult {
  id: number;
  name: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
}

export interface ILearningMaterial {
  id: number;
  title: string;
  description: string;
  type: string; // Type can be: 'videos', 'pdfs', 'articles', 'interactive', 'ai-generated'
  category: string;
  level: string; // beginner, intermediate, advanced
  duration: number; // in minutes
  url: string;
  subCategoryId: number;
}

export interface IStudyPlan {
  id: number;
  day: string; // e.g., "Day 1", "Day 2"
  items: IStudyPlanItem[];
}

export interface IStudyPlanItem {
  id: number;
  title: string;
  duration: number; // in minutes
  materialId?: number;
}