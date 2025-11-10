/**
 * Activity model for timeline
 */
export interface ActivityItem {
  id: number;
  type: 'course' | 'assessment' | 'badge' | 'certificate';
  title: string;
  description: string;
  timestamp: Date;
  icon: string;
  iconColor: string;
  entityId?: string | number;
}

/**
 * Dropout risk analysis item
 */
export interface DropoutRiskItem {
  courseId: number;
  courseTitle: string;
  riskLevel: 'low' | 'medium' | 'high';
  reason: string;
  suggestedAction?: string;
}

/**
 * Learning recommendation
 */
export interface LearningRecommendation {
  type: 'course' | 'assessment' | 'resource';
  id?: string | number;
  title: string;
  reason: string;
  priority?: number;
}

/**
 * Learning insight
 */
export interface LearningInsight {
  type: string;
  message: string;
  metric?: number;
  trend?: 'up' | 'down' | 'stable';
}