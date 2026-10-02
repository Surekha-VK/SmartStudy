import { DayPlan, Subject, StudyAvailability, StudySession } from '../types/study';
import { generateStudyTimetable, formatDateISO } from './timetableGenerator';

export interface RescheduleResult {
  updatedTimetable: DayPlan[];
  missedCount: number;
  rescheduledSubjects: string[];
  message: string;
}

/**
 * Checks all sessions and marks past uncompleted sessions as missed.
 */
export function auditMissedSessions(timetable: DayPlan[]): { updatedTimetable: DayPlan[]; missedCount: number } {
  const todayStr = formatDateISO(new Date());
  let missedCount = 0;

  const updatedTimetable = timetable.map((day) => {
    const isPastDay = day.date < todayStr;
    const isToday = day.date === todayStr;

    const updatedSessions = day.sessions.map((sess) => {
      if (sess.isBreak || sess.completed) return sess;

      // If it's a past day and not completed, mark as missed
      if (isPastDay && !sess.completed) {
        if (!sess.missed) missedCount++;
        return { ...sess, missed: true };
      }

      // If already explicitly flagged as missed
      if (sess.missed) {
        missedCount++;
      }

      return sess;
    });

    return {
      ...day,
      isPast: isPastDay,
      isToday,
      sessions: updatedSessions,
    };
  });

  return { updatedTimetable, missedCount };
}

/**
 * Adaptive Rescheduling Engine:
 * 1. Identifies uncompleted/missed sessions from the past or present.
 * 2. Collects uncompleted subject topics that need to be caught up.
 * 3. Keeps completed sessions intact.
 * 4. Regenerates the remaining future days, increasing priority and re-injecting unstudied topics.
 * 5. Respects student's daily study-hour limits without overloading any single day.
 */
export function adaptRemainingPlan(
  timetable: DayPlan[],
  subjects: Subject[],
  availability: StudyAvailability
): RescheduleResult {
  const todayStr = formatDateISO(new Date());

  // 1. Audit and collect missed sessions
  const missedSessions: StudySession[] = [];
  const subjectMissedCounts: Record<string, number> = {};

  timetable.forEach((day) => {
    // Only look at past days or current day sessions marked missed
    if (day.date <= todayStr) {
      day.sessions.forEach((s) => {
        if (!s.isBreak && !s.completed) {
          missedSessions.push(s);
          if (s.subjectId) {
            subjectMissedCounts[s.subjectId] = (subjectMissedCounts[s.subjectId] || 0) + 1;
          }
        }
      });
    }
  });

  if (missedSessions.length === 0) {
    return {
      updatedTimetable: timetable,
      missedCount: 0,
      rescheduledSubjects: [],
      message: 'All scheduled sessions to date are completed or up to date. No rescheduling needed!',
    };
  }

  // 2. Adjust subject preparation or create boosted subjects for remaining schedule
  // Missed sessions effectively mean preparation is lower than planned, boosting preparation gap
  const boostedSubjects: Subject[] = subjects.map((sub) => {
    const missed = subjectMissedCounts[sub.id] || 0;
    if (missed > 0) {
      // Temporarily lower effective prep to boost priority in remaining days
      const adjustedPrep = Math.max(0, sub.currentPreparation - missed * 5);
      return {
        ...sub,
        currentPreparation: adjustedPrep,
      };
    }
    return sub;
  });

  // 3. Find index of tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = formatDateISO(tomorrow);

  // Keep all days up to today exactly as they are (preserving completion checkmarks and history)
  const pastAndTodayDays = timetable.filter((day) => day.date <= todayStr).map((day) => ({
    ...day,
    sessions: day.sessions.map((sess) => {
      // Ensure past uncompleted are marked as missed
      if (!sess.isBreak && !sess.completed && day.date < todayStr) {
        return { ...sess, missed: true };
      }
      return sess;
    }),
  }));

  // 4. Generate fresh schedule for tomorrow onwards
  // Calculate remaining days count
  const futureDaysCount = Math.max(7, timetable.filter((d) => d.date >= tomorrowStr).length);
  const newFutureSchedule = generateStudyTimetable(boostedSubjects, availability, tomorrow, futureDaysCount);

  // Mark re-injected sessions with rescheduling flag
  const adjustedFutureSchedule = newFutureSchedule.map((day) => ({
    ...day,
    sessions: day.sessions.map((sess) => {
      const isAffectedSubject = sess.subjectId && subjectMissedCounts[sess.subjectId] > 0;
      return {
        ...sess,
        rescheduledCount: isAffectedSubject ? (sess.rescheduledCount || 0) + 1 : 0,
      };
    }),
  }));

  const updatedTimetable = [...pastAndTodayDays, ...adjustedFutureSchedule];
  const affectedNames = Object.keys(subjectMissedCounts)
    .map((id) => subjects.find((s) => s.id === id)?.name || id)
    .filter(Boolean);

  return {
    updatedTimetable,
    missedCount: missedSessions.length,
    rescheduledSubjects: affectedNames,
    message: `Your plan has been adjusted based on ${missedSessions.length} unfinished session(s). High-priority catch-up blocks added.`,
  };
}
