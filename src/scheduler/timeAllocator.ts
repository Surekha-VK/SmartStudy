import { Subject, StudyAvailability, DayOfWeek } from '../types/study';
import { calculateAllPriorities } from './priorityEngine';

export interface SubjectAllocationSlot {
  subject: Subject;
  topic: string;
  durationMinutes: number;
  priorityScore: number;
}

/**
 * Returns available study hours for a specific date given the student's availability settings.
 */
export function getAvailableHoursForDate(date: Date, availability: StudyAvailability): number {
  if (availability.mode === 'uniform') {
    return Math.max(0, availability.dailyHours);
  }

  const days: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = days[date.getDay()];
  const hours = availability.customDays[dayName];
  return Math.max(0, typeof hours === 'number' ? hours : availability.dailyHours);
}

/**
 * Formats minutes into 12-hour AM/PM string, e.g., 1020 mins (17:00) -> "5:00 PM"
 */
export function formatMinutesToTime(totalMinutes: number): string {
  const normalized = ((totalMinutes % 1440) + 1440) % 1440;
  const hours24 = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  const period = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  const minuteStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
  return `${hours12}:${minuteStr} ${period}`;
}

/**
 * Parses "HH:mm" (24h) string into minutes from midnight.
 */
export function parseTimeToMinutes(timeStr: string): number {
  const [h, m] = (timeStr || '17:00').split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}
