import {
  calculateDaysRemaining,
  calculateUrgencyScore,
  calculateDifficultyScore,
  calculatePrepGapScore,
  calculateSubjectPriority,
  calculateAllPriorities,
} from '../scheduler/priorityEngine';
import { generateStudyTimetable } from '../scheduler/timetableGenerator';
import { adaptRemainingPlan, auditMissedSessions } from '../scheduler/adaptiveEngine';
import { calculatePlanHealth } from '../services/healthService';
import { generateRecommendations } from '../services/recommendationService';
import { getDemoSubjects, DEFAULT_AVAILABILITY, getRelativeDateString } from '../data/demoData';
import { Subject, StudyAvailability } from '../types/study';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, details?: string) {
  if (condition) {
    console.log(`✅ [PASS] ${testName}`);
    passed++;
  } else {
    console.error(`❌ [FAIL] ${testName} ${details ? `- ${details}` : ''}`);
    failed++;
  }
}

console.log('====================================================');
console.log('🧪 RUNNING SMARTSTUDY AUTOMATED TEST SUITE');
console.log('====================================================\n');

// Test 1: One subject
const singleSubject: Subject = {
  id: 'sub-single',
  name: 'Physics',
  examDate: getRelativeDateString(5),
  difficulty: 'Hard',
  currentPreparation: 40,
  color: '#ef4444',
  topics: ['Mechanics', 'Thermodynamics', 'Optics'],
};
const singlePriorities = calculateAllPriorities([singleSubject]);
assert(singlePriorities.length === 1 && singlePriorities[0].weightPercentage === 100, 'Test 1: Single subject gets 100% allocation');

// Test 2: Multiple subjects
const demoSubjects = getDemoSubjects();
const multiPriorities = calculateAllPriorities(demoSubjects);
assert(multiPriorities.length === 4, 'Test 2: Multiple subjects all receive priority scores');

// Test 3: Hard subject receives greater priority than Easy (all else equal)
const subHard: Subject = {
  id: 'h',
  name: 'HardSub',
  examDate: getRelativeDateString(7),
  difficulty: 'Hard',
  currentPreparation: 50,
  color: '#000',
  topics: [],
};
const subEasy: Subject = {
  id: 'e',
  name: 'EasySub',
  examDate: getRelativeDateString(7),
  difficulty: 'Easy',
  currentPreparation: 50,
  color: '#000',
  topics: [],
};
const prioHard = calculateSubjectPriority(subHard);
const prioEasy = calculateSubjectPriority(subEasy);
assert(prioHard.totalScore > prioEasy.totalScore, 'Test 3: Hard difficulty produces higher score than Easy', `${prioHard.totalScore} vs ${prioEasy.totalScore}`);

// Test 4: Exam tomorrow receives higher urgency than exam in 14 days
const subTomorrow: Subject = {
  id: 'tmrw',
  name: 'TmrwSub',
  examDate: getRelativeDateString(1),
  difficulty: 'Medium',
  currentPreparation: 50,
  color: '#000',
  topics: [],
};
const subFar: Subject = {
  id: 'far',
  name: 'FarSub',
  examDate: getRelativeDateString(14),
  difficulty: 'Medium',
  currentPreparation: 50,
  color: '#000',
  topics: [],
};
const prioTomorrow = calculateSubjectPriority(subTomorrow);
const prioFar = calculateSubjectPriority(subFar);
assert(prioTomorrow.urgencyScore > prioFar.urgencyScore, 'Test 4: Exam tomorrow has higher urgency than 14 days away', `${prioTomorrow.urgencyScore} vs ${prioFar.urgencyScore}`);

// Test 5: Low preparation receives increased priority
const subLowPrep: Subject = {
  id: 'low',
  name: 'LowPrepSub',
  examDate: getRelativeDateString(8),
  difficulty: 'Medium',
  currentPreparation: 20,
  color: '#000',
  topics: [],
};
const subHighPrep: Subject = {
  id: 'high',
  name: 'HighPrepSub',
  examDate: getRelativeDateString(8),
  difficulty: 'Medium',
  currentPreparation: 90,
  color: '#000',
  topics: [],
};
const prioLow = calculateSubjectPriority(subLowPrep);
const prioHigh = calculateSubjectPriority(subHighPrep);
assert(prioLow.prepGapScore > prioHigh.prepGapScore, 'Test 5: Low prep (20%) produces higher gap score than high prep (90%)', `${prioLow.prepGapScore} vs ${prioHigh.prepGapScore}`);

// Test 6: Generate timetable with realistic breaks
const timetable = generateStudyTimetable(demoSubjects, DEFAULT_AVAILABILITY);
assert(timetable.length >= 7, 'Test 6a: Timetable generates multi-day schedule');
const firstDay = timetable[0];
const hasStudy = firstDay.sessions.some((s) => !s.isBreak);
const hasBreak = firstDay.sessions.some((s) => s.isBreak);
assert(hasStudy && hasBreak, 'Test 6b: Timetable interleaves study sessions with breaks');
assert(firstDay.sessions[0].startTime === '5:00 PM', 'Test 6c: Schedule starts at configured start time (5:00 PM)');

// Test 7 & 8: Mark session complete and verify progress updates
firstDay.sessions[0].completed = true;
const healthAfterComplete = calculatePlanHealth(timetable, demoSubjects);
assert(healthAfterComplete.completedCount >= 1, 'Test 7: Marking session complete increments completed count');
assert(healthAfterComplete.completionRate > 0, 'Test 8: Completion rate updates dynamically');

// Test 9: Missed session and adaptive rescheduling
// Mark a session as missed
const secondStudySession = firstDay.sessions.find((s) => !s.isBreak && !s.completed);
if (secondStudySession) {
  secondStudySession.missed = true;
}
const rescheduleResult = adaptRemainingPlan(timetable, demoSubjects, DEFAULT_AVAILABILITY);
assert(rescheduleResult.missedCount >= 1, 'Test 9a: Adaptive engine detects missed sessions');
assert(rescheduleResult.updatedTimetable.length >= timetable.length, 'Test 9b: Adaptive engine recalculates remaining days');
assert(rescheduleResult.message.includes('adjusted'), 'Test 9c: Clear user notification produced');

// Test 10: Invalid input handling
assert(calculateDaysRemaining(getRelativeDateString(-5)) < 0, 'Test 10a: Past exam date detected as negative days');
assert(calculatePrepGapScore(-20) === 40, 'Test 10b: Out-of-bounds prep < 0 clamped gracefully');
assert(calculatePrepGapScore(150) === 0, 'Test 10c: Out-of-bounds prep > 100 clamped gracefully');

// Test 11: Zero available study hours
const zeroAvailability: StudyAvailability = {
  ...DEFAULT_AVAILABILITY,
  mode: 'uniform',
  dailyHours: 0,
};
const zeroTimetable = generateStudyTimetable(demoSubjects, zeroAvailability);
const zeroDay = zeroTimetable[0];
assert(zeroDay.sessions.length === 0 && zeroDay.studyMinutes === 0, 'Test 11: Zero available hours handled gracefully as Rest Day');

// Test 12: Study Plan Health classification
const wellPreparedSubjects: Subject[] = demoSubjects.map((s) => ({
  ...s,
  currentPreparation: Math.max(60, s.currentPreparation),
}));
const healthyState = calculatePlanHealth(
  timetable.map((d) => ({
    ...d,
    sessions: d.sessions.map((s) => ({ ...s, completed: true, missed: false })),
  })),
  wellPreparedSubjects
);
assert(healthyState.status === 'ON TRACK', 'Test 12: Complete sessions with prepared subjects yield ON TRACK health status');

// Test 13: Dynamic recommendations generation
const recs = generateRecommendations(demoSubjects, timetable, DEFAULT_AVAILABILITY);
assert(recs.length >= 2, 'Test 13a: Rule-based recommendations generated');
assert(recs.some((r) => r.type === 'urgent' || r.type === 'warning'), 'Test 13b: Urgency warnings present for approaching exams');

// Test 14: Demo data structure integrity
assert(demoSubjects.length === 4, 'Test 14: Official demo subjects (DBMS, COA, Python, Math) exist');

console.log('\n====================================================');
console.log(`📊 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log('====================================================');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('🎉 ALL TESTS PASSED SUCCESSFULLY!\n');
}
