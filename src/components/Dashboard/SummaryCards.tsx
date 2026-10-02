import React from 'react';
import { BookOpen, Clock, CheckCircle2, TrendingUp, Calendar, AlertCircle } from 'lucide-react';
import { Subject, DayPlan } from '../../types/study';
import { calculateDaysRemaining } from '../../scheduler/priorityEngine';

interface SummaryCardsProps {
  subjects: Subject[];
  timetable: DayPlan[];
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ subjects, timetable }) => {
  // 1. Total Subjects
  const totalSubjects = subjects.length;

  // 2. Planned Study Hours & Completed Hours
  let plannedMinutes = 0;
  let completedMinutes = 0;
  let totalSessions = 0;
  let completedSessions = 0;

  timetable.forEach((day) => {
    day.sessions.forEach((s) => {
      if (!s.isBreak) {
        totalSessions++;
        plannedMinutes += s.durationMinutes;
        if (s.completed) {
          completedSessions++;
          completedMinutes += s.durationMinutes;
        }
      }
    });
  });

  const plannedHours = Math.round((plannedMinutes / 60) * 10) / 10;
  const completedHours = Math.round((completedMinutes / 60) * 10) / 10;
  const overallProgress =
    totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;

  // 3. Next Exam
  const sortedExams = [...subjects]
    .map((s) => ({ ...s, daysRemaining: calculateDaysRemaining(s.examDate) }))
    .sort((a, b) => a.daysRemaining - b.daysRemaining);

  const nextExam = sortedExams.find((e) => e.daysRemaining >= 0) || sortedExams[0];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* Total Subjects */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
          <BookOpen className="w-6 h-6" />
        </div>
        <div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Total Subjects
          </span>
          <span className="text-2xl font-black text-slate-900">{totalSubjects}</span>
          <span className="text-[11px] text-slate-400 block mt-0.5">Active curriculum</span>
        </div>
      </div>

      {/* Planned Study Hours */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
          <Clock className="w-6 h-6" />
        </div>
        <div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Planned Hours
          </span>
          <span className="text-2xl font-black text-slate-900">{plannedHours}h</span>
          <span className="text-[11px] text-slate-400 block mt-0.5">
            {totalSessions} total sessions
          </span>
        </div>
      </div>

      {/* Completed Hours */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Completed Hours
          </span>
          <span className="text-2xl font-black text-emerald-600">{completedHours}h</span>
          <span className="text-[11px] text-slate-400 block mt-0.5">
            {completedSessions} sessions done
          </span>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
          <TrendingUp className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Overall Progress
          </span>
          <span className="text-2xl font-black text-purple-600">{overallProgress}%</span>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
            <div
              className="bg-purple-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Next Exam */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
          <Calendar className="w-6 h-6" />
        </div>
        <div className="min-w-0 flex-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Next Exam
          </span>
          {nextExam ? (
            <div>
              <span className="text-lg font-black text-slate-900 truncate block">
                {nextExam.name}
              </span>
              <span
                className={`text-[11px] font-bold ${
                  nextExam.daysRemaining <= 2 ? 'text-rose-600 animate-pulse' : 'text-slate-500'
                }`}
              >
                {nextExam.daysRemaining === 0
                  ? 'TODAY'
                  : nextExam.daysRemaining === 1
                  ? 'Tomorrow'
                  : `${nextExam.daysRemaining} days left`}
              </span>
            </div>
          ) : (
            <span className="text-sm font-semibold text-slate-400">None</span>
          )}
        </div>
      </div>
    </div>
  );
};
