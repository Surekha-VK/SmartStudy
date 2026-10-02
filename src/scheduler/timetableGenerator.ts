import { Subject, StudyAvailability, DayPlan, StudySession } from '../types/study';
import { calculateAllPriorities, calculateDaysRemaining } from './priorityEngine';
import { getAvailableHoursForDate, formatMinutesToTime, parseTimeToMinutes } from './timeAllocator';

/**
 * Formats a Date into YYYY-MM-DD
 */
export function formatDateISO(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formats a Date into a friendly day label, e.g. "Wednesday, Oct 2"
 */
export function formatDayLabel(d: Date): string {
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Generates a full multi-day study timetable based on priority scoring,
 * realistic session lengths, and integrated study breaks.
 */
export function generateStudyTimetable(
  subjects: Subject[],
  availability: StudyAvailability,
  startDate: Date = new Date(),
  overrideDaysCount?: number
): DayPlan[] {
  if (subjects.length === 0) return [];

  const todayStr = formatDateISO(new Date());

  // Determine span: from startDate to latest exam date (minimum 7 days, maximum 21 days)
  let maxDaysToExam = 7;
  for (const s of subjects) {
    const days = calculateDaysRemaining(s.examDate, startDate);
    if (days > maxDaysToExam) {
      maxDaysToExam = days;
    }
  }

  const daysToGenerate = overrideDaysCount || Math.min(21, Math.max(7, maxDaysToExam + 1));
  const resultDays: DayPlan[] = [];

  // Track topic indices so subjects progress through their revision curriculum
  const topicPointer: Record<string, number> = {};
  subjects.forEach((s) => {
    topicPointer[s.id] = 0;
  });

  const sessionLength = Math.max(25, Math.min(120, availability.sessionLengthMinutes || 50));
  const breakLength = Math.max(5, Math.min(30, availability.breakLengthMinutes || 10));
  const baseStartMinutes = parseTimeToMinutes(availability.preferredStartTime || '17:00');

  for (let dayOffset = 0; dayOffset < daysToGenerate; dayOffset++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(currentDate.getDate() + dayOffset);
    const currentDateStr = formatDateISO(currentDate);

    // Filter subjects that still have exams on or after this day
    const activeSubjects = subjects.filter((s) => {
      const days = calculateDaysRemaining(s.examDate, currentDate);
      return days >= 0;
    });

    const isToday = currentDateStr === todayStr;
    const isPast = currentDateStr < todayStr;
    const availableHours = getAvailableHoursForDate(currentDate, availability);
    const availableMinutes = Math.round(availableHours * 60);

    if (activeSubjects.length === 0 || availableMinutes < 30) {
      // Free day / rest day or all exams done
      resultDays.push({
        date: currentDateStr,
        dayLabel: formatDayLabel(currentDate),
        isToday,
        isPast,
        availableMinutes,
        studyMinutes: 0,
        breakMinutes: 0,
        sessions: [],
      });
      continue;
    }

    // Calculate dynamic priorities for this specific day
    const priorities = calculateAllPriorities(activeSubjects, currentDate, availableMinutes);
    const sortedPriorities = [...priorities].sort((a, b) => b.totalScore - a.totalScore);

    // Calculate how many study sessions fit into available time
    // e.g. with 50m study + 10m break:
    // 1 session: 50m
    // 2 sessions: 50 + 10 + 50 = 110m
    // 3 sessions: 50 + 10 + 50 + 10 + 50 = 170m
    let numSessions = 0;
    while (true) {
      const neededMinutes = (numSessions + 1) * sessionLength + numSessions * breakLength;
      if (neededMinutes <= availableMinutes + 5) {
        numSessions++;
      } else {
        break;
      }
    }
    if (numSessions === 0 && availableMinutes >= 25) {
      numSessions = 1;
    }

    // Allocate session slots to subjects using Largest Remainder (Hare-Niemeyer) Method
    const slotsAllocated: { subjectId: string; subjectName: string; priorityScore: number }[] = [];
    if (numSessions > 0) {
      // Calculate exact quota per subject based on weight percentage
      const subjectQuotas = sortedPriorities.map((p) => {
        const floatQuota = (p.weightPercentage / 100) * numSessions;
        const integerPart = Math.floor(floatQuota);
        const remainder = floatQuota - integerPart;
        return {
          priority: p,
          integerPart,
          remainder,
        };
      });

      let allocatedCount = 0;
      subjectQuotas.forEach((sq) => {
        for (let i = 0; i < sq.integerPart; i++) {
          slotsAllocated.push({
            subjectId: sq.priority.subjectId,
            subjectName: sq.priority.subjectName,
            priorityScore: sq.priority.totalScore,
          });
          allocatedCount++;
        }
      });

      // Distribute remaining slots to subjects with largest remainders
      if (allocatedCount < numSessions) {
        const sortedByRemainder = [...subjectQuotas].sort((a, b) => b.remainder - a.remainder);
        let remIndex = 0;
        while (allocatedCount < numSessions) {
          const sq = sortedByRemainder[remIndex % sortedByRemainder.length];
          slotsAllocated.push({
            subjectId: sq.priority.subjectId,
            subjectName: sq.priority.subjectName,
            priorityScore: sq.priority.totalScore,
          });
          allocatedCount++;
          remIndex++;
        }
      }
    }

    // Interleave sessions intelligently so the student doesn't study the exact same subject back-to-back if multiple subjects exist
    const orderedSlots: typeof slotsAllocated = [];
    const pool = [...slotsAllocated];
    while (pool.length > 0) {
      const lastSubjectId = orderedSlots.length > 0 ? orderedSlots[orderedSlots.length - 1].subjectId : null;
      // Prefer a different subject than the immediate previous
      let candidateIdx = pool.findIndex((p) => p.subjectId !== lastSubjectId);
      if (candidateIdx === -1) candidateIdx = 0;
      orderedSlots.push(pool.splice(candidateIdx, 1)[0]);
    }

    // Construct the actual study sessions with clock times and realistic breaks
    const daySessions: StudySession[] = [];
    let currentMinutePointer = baseStartMinutes;
    let dayStudyMinutes = 0;
    let dayBreakMinutes = 0;

    orderedSlots.forEach((slot, idx) => {
      const subjectObj = subjects.find((s) => s.id === slot.subjectId);
      const topics = subjectObj?.topics && subjectObj.topics.length > 0 ? subjectObj.topics : ['Comprehensive Revision & Practice Problems'];
      const topicIndex = (topicPointer[slot.subjectId] || 0) % topics.length;
      const topicTitle = topics[topicIndex];
      topicPointer[slot.subjectId] = (topicPointer[slot.subjectId] || 0) + 1;

      const sessionStart = currentMinutePointer;
      const sessionEnd = currentMinutePointer + sessionLength;

      daySessions.push({
        id: `sess-${currentDateStr}-${idx}-${slot.subjectId}`,
        date: currentDateStr,
        subjectId: slot.subjectId,
        subjectName: slot.subjectName,
        topic: topicTitle,
        startTime: formatMinutesToTime(sessionStart),
        endTime: formatMinutesToTime(sessionEnd),
        durationMinutes: sessionLength,
        isBreak: false,
        completed: false,
        missed: false,
        priorityScore: slot.priorityScore,
      });

      dayStudyMinutes += sessionLength;
      currentMinutePointer = sessionEnd;

      // Add realistic break between sessions (except after the final session of the day)
      if (idx < orderedSlots.length - 1 && breakLength > 0) {
        const breakStart = currentMinutePointer;
        const breakEnd = currentMinutePointer + breakLength;

        daySessions.push({
          id: `break-${currentDateStr}-${idx}`,
          date: currentDateStr,
          subjectName: 'Break',
          topic: 'Hydrate, stretch, rest eyes ☕',
          startTime: formatMinutesToTime(breakStart),
          endTime: formatMinutesToTime(breakEnd),
          durationMinutes: breakLength,
          isBreak: true,
          completed: false,
          missed: false,
        });

        dayBreakMinutes += breakLength;
        currentMinutePointer = breakEnd;
      }
    });

    resultDays.push({
      date: currentDateStr,
      dayLabel: formatDayLabel(currentDate),
      isToday,
      isPast,
      availableMinutes,
      studyMinutes: dayStudyMinutes,
      breakMinutes: dayBreakMinutes,
      sessions: daySessions,
    });
  }

  return resultDays;
}
