import { Subject, PriorityBreakdown } from '../types/study';

/**
 * Calculates the number of whole days remaining until the given exam date.
 * Takes the difference between the exam midnight and current date midnight.
 */
export function calculateDaysRemaining(examDateStr: string, referenceDate: Date = new Date()): number {
  const ref = new Date(referenceDate);
  ref.setHours(0, 0, 0, 0);

  const [year, month, day] = examDateStr.split('-').map(Number);
  const exam = new Date(year, month - 1, day);
  exam.setHours(0, 0, 0, 0);

  const diffTime = exam.getTime() - ref.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Calculates the Urgency Score (0 - 50 points) based on days remaining.
 * Exams happening today or tomorrow receive maximum urgency.
 */
export function calculateUrgencyScore(daysRemaining: number): number {
  if (daysRemaining <= 0) return 50; // Today or past due
  if (daysRemaining === 1) return 46; // Tomorrow
  if (daysRemaining <= 3) return 40 - (daysRemaining - 1) * 4; // 36, 32
  if (daysRemaining <= 7) return 30 - (daysRemaining - 3) * 2; // 28 down to 22
  if (daysRemaining <= 14) return 21 - (daysRemaining - 7) * 1; // 20 down to 14
  return Math.max(5, Math.round(14 - (daysRemaining - 14) * 0.3)); // Distant exams
}

/**
 * Calculates Difficulty Score (10 - 30 points)
 * Easy: 10, Medium: 20, Hard: 30
 */
export function calculateDifficultyScore(difficulty: Subject['difficulty']): number {
  switch (difficulty) {
    case 'Hard':
      return 30;
    case 'Medium':
      return 20;
    case 'Easy':
    default:
      return 10;
  }
}

/**
 * Calculates Preparation Gap Score (0 - 40 points)
 * Preparation Gap = 100 - CurrentPreparation%
 * Score = (Gap / 100) * 40
 */
export function calculatePrepGapScore(currentPreparation: number): number {
  const clampedPrep = Math.max(0, Math.min(100, currentPreparation));
  const gap = 100 - clampedPrep;
  return Math.round((gap / 100) * 40);
}

/**
 * Computes Priority Score and relative breakdown for a single subject.
 * Priority Score = Urgency Score + Difficulty Score + Preparation Gap Score
 */
export function calculateSubjectPriority(
  subject: Subject,
  referenceDate: Date = new Date()
): Omit<PriorityBreakdown, 'weightPercentage' | 'allocatedMinutesPerDay'> {
  const daysRemaining = calculateDaysRemaining(subject.examDate, referenceDate);
  const urgencyScore = calculateUrgencyScore(daysRemaining);
  const difficultyScore = calculateDifficultyScore(subject.difficulty);
  const prepGapScore = calculatePrepGapScore(subject.currentPreparation);

  const totalScore = urgencyScore + difficultyScore + prepGapScore;

  return {
    subjectId: subject.id,
    subjectName: subject.name,
    daysRemaining,
    urgencyScore,
    difficultyScore,
    prepGapScore,
    totalScore,
  };
}

/**
 * Calculates priority scores and relative percentage weights for all active subjects.
 */
export function calculateAllPriorities(
  subjects: Subject[],
  referenceDate: Date = new Date(),
  dailyAvailableMinutes: number = 240
): PriorityBreakdown[] {
  if (subjects.length === 0) return [];

  const rawBreakdowns = subjects.map((sub) => calculateSubjectPriority(sub, referenceDate));
  const sumScores = rawBreakdowns.reduce((acc, curr) => acc + curr.totalScore, 0);

  return rawBreakdowns.map((raw) => {
    const weightPercentage = sumScores > 0 ? (raw.totalScore / sumScores) * 100 : 100 / subjects.length;
    const allocatedMinutesPerDay = Math.round((weightPercentage / 100) * dailyAvailableMinutes);

    return {
      ...raw,
      weightPercentage: Math.round(weightPercentage * 10) / 10,
      allocatedMinutesPerDay,
    };
  });
}
