import { AppState, Subject, StudyAvailability, DayPlan } from '../types/study';
import { getDemoSubjects, DEFAULT_AVAILABILITY } from '../data/demoData';
import { generateStudyTimetable } from '../scheduler/timetableGenerator';

const STORAGE_KEY = 'smartstudy_state_v1';

/**
 * Loads persisted app state from localStorage or initializes with demo data.
 */
export function loadSavedState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AppState>;
      if (parsed.subjects && parsed.subjects.length > 0 && parsed.availability) {
        return {
          subjects: parsed.subjects,
          availability: parsed.availability,
          timetable: parsed.timetable || [],
          lastGeneratedAt: parsed.lastGeneratedAt || null,
          lastAdjustedAt: parsed.lastAdjustedAt || null,
        };
      }
    }
  } catch (err) {
    console.warn('Failed to parse saved SmartStudy state from localStorage:', err);
  }

  // Initial state with demo subjects ready for live demo
  const initialSubjects = getDemoSubjects();
  const initialAvailability = DEFAULT_AVAILABILITY;
  const initialTimetable = generateStudyTimetable(initialSubjects, initialAvailability);

  return {
    subjects: initialSubjects,
    availability: initialAvailability,
    timetable: initialTimetable,
    lastGeneratedAt: new Date().toISOString(),
    lastAdjustedAt: null,
  };
}

/**
 * Saves current app state to localStorage.
 */
export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save SmartStudy state to localStorage:', err);
  }
}

/**
 * Clears saved state and resets planner to empty default.
 */
export function clearSavedState(): AppState {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear SmartStudy state:', err);
  }

  return {
    subjects: [],
    availability: DEFAULT_AVAILABILITY,
    timetable: [],
    lastGeneratedAt: null,
    lastAdjustedAt: null,
  };
}
