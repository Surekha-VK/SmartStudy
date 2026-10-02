import { DayPlan, Subject, PlanHealth, HealthStatusType } from '../types/study';
import { calculateDaysRemaining } from '../scheduler/priorityEngine';
import { formatDateISO } from '../scheduler/timetableGenerator';

/**
 * Computes the real-time Study Plan Health status based on rigorous deterministic metrics:
 * 1. Completion rate of sessions up to today
 * 2. Missed session count
 * 3. Approaching exams with low preparation (< 40% prep within 3 days)
 */
export function calculatePlanHealth(timetable: DayPlan[], subjects: Subject[]): PlanHealth {
  const todayStr = formatDateISO(new Date());

  let totalSessionsToDate = 0;
  let completedCount = 0;
  let missedCount = 0;

  // Evaluate sessions scheduled up to today
  timetable.forEach((day) => {
    if (day.date <= todayStr) {
      day.sessions.forEach((s) => {
        if (!s.isBreak) {
          totalSessionsToDate++;
          if (s.completed) {
            completedCount++;
          } else if (day.date < todayStr || s.missed) {
            missedCount++;
          }
        }
      });
    }
  });

  // Calculate completion percentage to date
  const completionRate = totalSessionsToDate > 0
    ? Math.round((completedCount / totalSessionsToDate) * 100)
    : 100;

  // Check for critical exams (< 40% prep within 3 days)
  let urgentUnderpreparedCount = 0;
  subjects.forEach((s) => {
    const days = calculateDaysRemaining(s.examDate);
    if (days >= 0 && days <= 3 && s.currentPreparation < 40) {
      urgentUnderpreparedCount++;
    }
  });

  let status: HealthStatusType = 'ON TRACK';
  let badgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-300';
  let headline = 'Study Plan is On Track';
  let description = `You have completed ${completionRate}% of planned sessions with no critical overdue subjects.`;

  // Deterministic classification
  if (missedCount >= 3 || completionRate < 45 || (missedCount >= 1 && urgentUnderpreparedCount >= 1)) {
    status = 'HIGH ATTENTION';
    badgeClass = 'bg-rose-100 text-rose-800 border-rose-300';
    headline = 'High Attention Required';
    if (urgentUnderpreparedCount >= 1 && missedCount >= 1) {
      description = `Critical alert: You have ${missedCount} missed session(s) with an exam in ≤ 3 days. Recalculate your plan immediately to reallocate study time.`;
    } else {
      description = `You have ${missedCount} uncompleted session(s) and a ${completionRate}% completion rate. Immediate review recommended.`;
    }
  } else if (missedCount >= 1 || completionRate < 75 || urgentUnderpreparedCount >= 1) {
    status = 'NEEDS ATTENTION';
    badgeClass = 'bg-amber-100 text-amber-800 border-amber-300';
    headline = 'Needs Attention';
    if (urgentUnderpreparedCount >= 1 && missedCount === 0) {
      description = `Approaching exam notice: You have ${urgentUnderpreparedCount} exam(s) in ≤ 3 days with low initial preparation. Prioritize today's scheduled revision sessions.`;
    } else {
      description = `You have ${missedCount} missed session(s) or completion rate is at ${completionRate}%. Consider recalculating your timetable to distribute catch-up time.`;
    }
  } else {
    status = 'ON TRACK';
    badgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-300';
    headline = 'On Track';
    description = `Excellent momentum! You have completed ${completionRate}% of planned sessions with no missed study blocks.`;
  }

  return {
    status,
    badgeClass,
    headline,
    description,
    completionRate,
    missedCount,
    completedCount,
    totalSessionsCount: totalSessionsToDate,
    urgentExamsCount: urgentUnderpreparedCount,
  };
}
