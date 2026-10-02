import { Subject, DayPlan, StudyAvailability, Recommendation } from '../types/study';
import { calculateAllPriorities, calculateDaysRemaining } from '../scheduler/priorityEngine';
import { formatDateISO } from '../scheduler/timetableGenerator';

/**
 * Generates dynamic, data-driven recommendations tailored to the student's
 * real subjects, exam countdowns, preparation gaps, and session completion records.
 */
export function generateRecommendations(
  subjects: Subject[],
  timetable: DayPlan[],
  availability: StudyAvailability
): Recommendation[] {
  const recommendations: Recommendation[] = [];
  const todayStr = formatDateISO(new Date());

  if (subjects.length === 0) {
    recommendations.push({
      id: 'rec-no-subjects',
      type: 'info',
      title: 'Get Started with Subjects',
      message: 'Add your upcoming exam subjects and current preparation levels to receive tailored study allocations.',
    });
    return recommendations;
  }

  // 1. Calculate Priority Scores to identify highest priority subject
  const priorities = calculateAllPriorities(subjects, new Date(), 240);
  if (priorities.length > 0) {
    const highest = priorities[0];
    const highSub = subjects.find((s) => s.id === highest.subjectId);
    if (highSub) {
      recommendations.push({
        id: `rec-highest-${highSub.id}`,
        type: highest.daysRemaining <= 3 ? 'urgent' : 'warning',
        title: `Top Priority: ${highSub.name}`,
        message: `${highSub.name} is currently your highest-priority subject (${highest.totalScore} pts) because ${
          highest.daysRemaining <= 3
            ? `its exam is in only ${highest.daysRemaining === 0 ? 'today' : `${highest.daysRemaining} days`}`
            : 'its exam is rapidly approaching'
        } and preparation is at ${highSub.currentPreparation}%.`,
        subjectName: highSub.name,
      });
    }
  }

  // 2. Nearest exam check
  const sortedExams = [...subjects]
    .map((s) => ({ subject: s, days: calculateDaysRemaining(s.examDate) }))
    .sort((a, b) => a.days - b.days);

  if (sortedExams.length > 0) {
    const nextExam = sortedExams[0];
    if (nextExam.days >= 0 && nextExam.days <= 3) {
      recommendations.push({
        id: 'rec-next-exam',
        type: 'urgent',
        title: `Upcoming Exam: ${nextExam.subject.name}`,
        message: `Your next exam (${nextExam.subject.name}) is in ${nextExam.days === 0 ? 'today' : `${nextExam.days} day(s)`}. Focus on high-yield revision summaries and previous exam questions today!`,
        subjectName: nextExam.subject.name,
      });
    }
  }

  // 3. Unfinished / missed session check
  let missedCount = 0;
  let totalPastSessions = 0;
  let completedCount = 0;

  timetable.forEach((day) => {
    if (day.date <= todayStr) {
      day.sessions.forEach((s) => {
        if (!s.isBreak) {
          totalPastSessions++;
          if (s.completed) {
            completedCount++;
          } else if (day.date < todayStr || s.missed) {
            missedCount++;
          }
        }
      });
    }
  });

  if (missedCount > 0) {
    recommendations.push({
      id: 'rec-missed-sessions',
      type: 'warning',
      title: `${missedCount} Unfinished Session${missedCount > 1 ? 's' : ''}`,
      message: `You have ${missedCount} unfinished study session(s). Click "Recalculate My Plan" to dynamically redistribute missed topics across your remaining days without overloading any single day.`,
    });
  }

  // 4. Positive momentum praise
  if (totalPastSessions >= 3 && (completedCount / totalPastSessions) >= 0.75) {
    recommendations.push({
      id: 'rec-praise',
      type: 'success',
      title: 'Strong Study Momentum! 🔥',
      message: `You've completed ${completedCount} of ${totalPastSessions} scheduled sessions (${Math.round(
        (completedCount / totalPastSessions) * 100
      )}%). Consistency is the key to exam retention. Keep going!`,
    });
  }

  // 5. Workload vs study availability check
  const totalDaysSpan = sortedExams.length > 0 ? Math.max(1, sortedExams[sortedExams.length - 1].days) : 7;
  const avgHours = availability.mode === 'uniform' ? availability.dailyHours : 3;
  const totalEstimatedStudyHours = avgHours * totalDaysSpan;
  const hardSubjectsLowPrep = subjects.filter((s) => s.difficulty === 'Hard' && s.currentPreparation < 50);

  if (hardSubjectsLowPrep.length >= 2 && totalEstimatedStudyHours < 20) {
    recommendations.push({
      id: 'rec-increase-hours',
      type: 'info',
      title: 'Study Time Recommendation',
      message: `You have ${hardSubjectsLowPrep.length} difficult subjects with under 50% preparation (${hardSubjectsLowPrep
        .map((s) => s.name)
        .join(', ')}). Consider boosting daily study time by 30–60 minutes in Setup.`,
    });
  }

  // 6. Balanced Rest & Pomodoro Tip
  recommendations.push({
    id: 'rec-rest-tip',
    type: 'info',
    title: 'Cognitive Retention Tip',
    message: 'Stick to the 10-minute breaks between 50-minute blocks. Evidence shows short breaks prevent mental fatigue and enhance recall speed during exams.',
  });

  return recommendations;
}
