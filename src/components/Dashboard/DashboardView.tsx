import React from 'react';
import { LayoutDashboard, CheckSquare, Calendar, Sparkles, RefreshCw } from 'lucide-react';
import { Subject, DayPlan, PlanHealth, StudySession } from '../../types/study';
import { SummaryCards } from './SummaryCards';
import { PlanHealthCard } from './PlanHealthCard';
import { SubjectProgress } from './SubjectProgress';
import { UpcomingExams } from './UpcomingExams';
import { HoursAnalytics } from './HoursAnalytics';
import { SessionCard } from '../Plan/SessionCard';

interface DashboardViewProps {
  subjects: Subject[];
  timetable: DayPlan[];
  health: PlanHealth;
  onToggleComplete: (sessionId: string) => void;
  onToggleMissed: (sessionId: string) => void;
  onStartFocus: (session: StudySession) => void;
  onRecalculate: () => void;
  onNavigateToSetup: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  subjects,
  timetable,
  health,
  onToggleComplete,
  onToggleMissed,
  onStartFocus,
  onRecalculate,
  onNavigateToSetup,
}) => {
  if (subjects.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-2xl mx-auto shadow-xs">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
          <LayoutDashboard className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">No Active Study Plan</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
          Add your subjects and exam schedule in Setup to access complete dashboard analytics and study plan health monitoring.
        </p>
        <button
          onClick={onNavigateToSetup}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-md transition cursor-pointer"
        >
          Go to Setup
        </button>
      </div>
    );
  }

  // Find today's plan
  const todayPlan = timetable.find((d) => d.isToday) || timetable[0];

  return (
    <div className="space-y-8">
      {/* 1. Summary Cards */}
      <SummaryCards subjects={subjects} timetable={timetable} />

      {/* 2. Study Plan Health Banner */}
      <PlanHealthCard health={health} onRecalculate={onRecalculate} />

      {/* 3. Today's Plan Section (Immediate action checklist) */}
      {todayPlan && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-ping" />
                <h3 className="text-lg font-bold text-slate-900">
                  Today's Study Plan — {todayPlan.dayLabel}
                </h3>
              </div>
              <p className="text-xs text-slate-500">
                Check off sessions as you complete them to update progress in real time.
              </p>
            </div>

            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-200 shrink-0 self-start sm:self-center">
              {Math.round((todayPlan.studyMinutes / 60) * 10) / 10} Hours Scheduled Today
            </span>
          </div>

          <div className="space-y-2">
            {todayPlan.sessions.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">
                No study sessions scheduled for today. Take time to review formulas or recharge!
              </p>
            ) : (
              todayPlan.sessions.map((session) => {
                const sub = subjects.find((s) => s.id === session.subjectId);
                return (
                  <SessionCard
                    key={session.id}
                    session={session}
                    subject={sub}
                    onToggleComplete={onToggleComplete}
                    onToggleMissed={onToggleMissed}
                    onStartFocus={onStartFocus}
                  />
                );
              })
            )}
          </div>
        </div>
      )}

      {/* 4. Subject-Wise Progress & Upcoming Exams Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SubjectProgress subjects={subjects} timetable={timetable} />
        <UpcomingExams subjects={subjects} />
      </div>

      {/* 5. Planned vs Completed Hours Analytics */}
      <HoursAnalytics timetable={timetable} />
    </div>
  );
};
