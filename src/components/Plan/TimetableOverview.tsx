import React, { useState } from 'react';
import {
  Calendar,
  Printer,
  Calculator,
  RefreshCw,
  Coffee,
  CheckCircle2,
  Clock,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { DayPlan, Subject, StudySession } from '../../types/study';
import { SessionCard } from './SessionCard';
import { PriorityExplanationModal } from './PriorityExplanationModal';
import { PomodoroModal } from './PomodoroModal';

interface TimetableOverviewProps {
  timetable: DayPlan[];
  subjects: Subject[];
  onToggleComplete: (sessionId: string) => void;
  onToggleMissed: (sessionId: string) => void;
  onRecalculate: () => void;
  onNavigateToSetup: () => void;
  missedCount: number;
}

export const TimetableOverview: React.FC<TimetableOverviewProps> = ({
  timetable,
  subjects,
  onToggleComplete,
  onToggleMissed,
  onRecalculate,
  onNavigateToSetup,
  missedCount,
}) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'single' | 'all'>('single');
  const [showFormulaModal, setShowFormulaModal] = useState(false);
  const [focusSession, setFocusSession] = useState<StudySession | null>(null);

  // Set default selected date to today or first day
  const effectiveSelectedDate =
    selectedDate || (timetable.find((d) => d.isToday)?.date || (timetable[0]?.date ?? ''));

  const currentDayPlan = timetable.find((d) => d.date === effectiveSelectedDate) || timetable[0];

  const handlePrint = () => {
    window.print();
  };

  if (timetable.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-2xl mx-auto shadow-xs">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">No Timetable Generated Yet</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
          Set up your upcoming exam subjects and available study hours to generate your personalized day-by-day revision schedule.
        </p>
        <button
          onClick={onNavigateToSetup}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-md transition cursor-pointer"
        >
          Go to Setup & Generate
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs no-print">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            Day-by-Day Study Timetable
          </h2>
          <p className="text-xs text-slate-500">
            {timetable.length} revision days generated • Priority-weighted with 10m rest breaks
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Formula breakdown button */}
          <button
            onClick={() => setShowFormulaModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
            title="View mathematical priority breakdown"
          >
            <Calculator className="w-4 h-4 text-indigo-600" />
            <span>How Priority Works</span>
          </button>

          {/* Adaptive Reschedule button */}
          <button
            onClick={onRecalculate}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              missedCount > 0
                ? 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'
                : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
            }`}
            title="Recalculate remaining schedule"
          >
            <RefreshCw className="w-4 h-4 text-indigo-600" />
            <span>Recalculate Plan {missedCount > 0 ? `(${missedCount} Missed)` : ''}</span>
          </button>

          {/* Print button */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition cursor-pointer"
            title="Print or save as PDF"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Print</span>
          </button>

          {/* View toggle (Single Day vs All Days) */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setViewMode('single')}
              className={`px-3 py-1 rounded-lg transition ${
                viewMode === 'single' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-600'
              }`}
            >
              Day View
            </button>
            <button
              onClick={() => setViewMode('all')}
              className={`px-3 py-1 rounded-lg transition ${
                viewMode === 'all' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-600'
              }`}
            >
              All Days
            </button>
          </div>
        </div>
      </div>

      {/* Day Selector Pills (Single Day View) */}
      {viewMode === 'single' && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin no-print">
          {timetable.map((day) => {
            const isSelected = day.date === effectiveSelectedDate;
            const completedCount = day.sessions.filter((s) => !s.isBreak && s.completed).length;
            const studySessionsCount = day.sessions.filter((s) => !s.isBreak).length;

            return (
              <button
                key={day.date}
                onClick={() => setSelectedDate(day.date)}
                className={`flex flex-col items-center min-w-[110px] p-2.5 rounded-xl border text-xs font-bold transition shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                }`}
              >
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">
                  {day.isToday ? 'Today' : day.dayLabel.split(',')[0].slice(0, 3)}
                </span>
                <span className="text-sm font-extrabold my-0.5">
                  {day.dayLabel.split(',')[1]?.trim() || day.date}
                </span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                    isSelected
                      ? 'bg-indigo-700 text-indigo-100'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {studySessionsCount > 0 ? `${completedCount}/${studySessionsCount} done` : 'Rest Day'}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Main Schedule Content */}
      {viewMode === 'single' ? (
        currentDayPlan ? (
          <DayPlanCard
            day={currentDayPlan}
            subjects={subjects}
            onToggleComplete={onToggleComplete}
            onToggleMissed={onToggleMissed}
            onStartFocus={setFocusSession}
          />
        ) : null
      ) : (
        /* All Days View (Great for printing and full overview) */
        <div className="space-y-6">
          {timetable.map((day) => (
            <DayPlanCard
              key={day.date}
              day={day}
              subjects={subjects}
              onToggleComplete={onToggleComplete}
              onToggleMissed={onToggleMissed}
              onStartFocus={setFocusSession}
            />
          ))}
        </div>
      )}

      {/* Priority Mathematical Formula Modal */}
      <PriorityExplanationModal
        isOpen={showFormulaModal}
        onClose={() => setShowFormulaModal(false)}
        subjects={subjects}
      />

      {/* Pomodoro Focus Timer Modal */}
      <PomodoroModal
        isOpen={!!focusSession}
        session={focusSession}
        onClose={() => setFocusSession(null)}
        onCompleteSession={onToggleComplete}
      />
    </div>
  );
};

interface DayPlanCardProps {
  day: DayPlan;
  subjects: Subject[];
  onToggleComplete: (sessionId: string) => void;
  onToggleMissed: (sessionId: string) => void;
  onStartFocus: (session: StudySession) => void;
}

const DayPlanCard: React.FC<DayPlanCardProps> = ({
  day,
  subjects,
  onToggleComplete,
  onToggleMissed,
  onStartFocus,
}) => {
  const studySessions = day.sessions.filter((s) => !s.isBreak);
  const completedCount = studySessions.filter((s) => s.completed).length;
  const completionPercentage =
    studySessions.length > 0 ? Math.round((completedCount / studySessions.length) * 100) : 0;

  return (
    <div
      className={`bg-white rounded-3xl border shadow-xs overflow-hidden transition ${
        day.isToday ? 'border-indigo-400 ring-2 ring-indigo-100' : 'border-slate-200'
      }`}
    >
      {/* Day Header Banner */}
      <div className="p-5 bg-gradient-to-r from-slate-50 via-white to-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center font-bold text-center ${
              day.isToday
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                : 'bg-slate-100 text-slate-800'
            }`}
          >
            <span className="text-[10px] uppercase tracking-wider">
              {day.dayLabel.split(',')[0].slice(0, 3)}
            </span>
            <span className="text-base font-extrabold leading-none">
              {day.date.split('-')[2]}
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-lg font-extrabold text-slate-900">{day.dayLabel}</h4>
              {day.isToday && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-700">
                  Today
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
              <span>{Math.round((day.studyMinutes / 60) * 10) / 10}h study</span>
              <span>•</span>
              <span>{day.breakMinutes}m breaks</span>
              <span>•</span>
              <span>{studySessions.length} sessions</span>
            </p>
          </div>
        </div>

        {/* Completion Progress Bar */}
        {studySessions.length > 0 && (
          <div className="flex items-center gap-3 sm:text-right">
            <div className="w-32 bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <span className="text-xs font-bold text-slate-700 min-w-[50px]">
              {completedCount}/{studySessions.length} done
            </span>
          </div>
        )}
      </div>

      {/* Sessions Checklist */}
      <div className="p-5 space-y-2">
        {day.sessions.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <Coffee className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-semibold text-slate-600">Rest & Recharge Day</p>
            <p className="text-xs text-slate-400 mt-1">
              No sessions scheduled today. Good rest powers active recall!
            </p>
          </div>
        ) : (
          day.sessions.map((session) => {
            const subject = subjects.find((s) => s.id === session.subjectId);
            return (
              <SessionCard
                key={session.id}
                session={session}
                subject={subject}
                onToggleComplete={onToggleComplete}
                onToggleMissed={onToggleMissed}
                onStartFocus={onStartFocus}
              />
            );
          })
        )}
      </div>
    </div>
  );
};
