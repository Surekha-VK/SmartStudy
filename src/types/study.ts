export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface Subject {
  id: string;
  name: string;
  examDate: string; // ISO format: YYYY-MM-DD
  difficulty: Difficulty;
  currentPreparation: number; // 0 - 100
  color: string;
  topics: string[];
}

export interface PriorityBreakdown {
  subjectId: string;
  subjectName: string;
  daysRemaining: number;
  urgencyScore: number;
  difficultyScore: number;
  prepGapScore: number;
  totalScore: number;
  weightPercentage: number;
  allocatedMinutesPerDay: number;
}

export type AvailabilityMode = 'uniform' | 'custom';

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export interface StudyAvailability {
  mode: AvailabilityMode;
  dailyHours: number; // For uniform mode (e.g. 4)
  customDays: Record<DayOfWeek, number>; // For custom mode
  preferredStartTime: string; // e.g. "17:00"
  sessionLengthMinutes: number; // default 50
  breakLengthMinutes: number; // default 10
}

export interface StudySession {
  id: string;
  date: string; // YYYY-MM-DD
  subjectId?: string;
  subjectName: string;
  topic: string;
  startTime: string; // "17:00" or "5:00 PM"
  endTime: string;   // "17:50" or "5:50 PM"
  durationMinutes: number;
  isBreak: boolean;
  completed: boolean;
  missed: boolean;
  rescheduledCount?: number;
  priorityScore?: number;
}

export interface DayPlan {
  date: string; // YYYY-MM-DD
  dayLabel: string; // e.g. "Wednesday, Oct 2"
  isToday: boolean;
  isPast: boolean;
  availableMinutes: number;
  studyMinutes: number;
  breakMinutes: number;
  sessions: StudySession[];
}

export type HealthStatusType = 'ON TRACK' | 'NEEDS ATTENTION' | 'HIGH ATTENTION';

export interface PlanHealth {
  status: HealthStatusType;
  badgeClass: string;
  headline: string;
  description: string;
  completionRate: number; // 0 - 100
  missedCount: number;
  completedCount: number;
  totalSessionsCount: number;
  urgentExamsCount: number;
}

export interface Recommendation {
  id: string;
  type: 'urgent' | 'warning' | 'success' | 'info';
  title: string;
  message: string;
  subjectName?: string;
}

export interface AppState {
  subjects: Subject[];
  availability: StudyAvailability;
  timetable: DayPlan[];
  lastGeneratedAt: string | null;
  lastAdjustedAt: string | null;
}
