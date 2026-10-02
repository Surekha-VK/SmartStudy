import React from 'react';
import { BookOpen, CheckCircle, BarChart3 } from 'lucide-react';
import { Subject, DayPlan } from '../../types/study';

interface SubjectProgressProps {
  subjects: Subject[];
  timetable: DayPlan[];
}

export const SubjectProgress: React.FC<SubjectProgressProps> = ({ subjects, timetable }) => {
  if (subjects.length === 0) return null;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            Subject-Wise Progress
          </h3>
          <p className="text-xs text-slate-500">
            Current preparation baseline and study session completion
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {subjects.map((sub) => {
          // Count total and completed sessions for this subject
          let plannedSessions = 0;
          let completedSessions = 0;

          timetable.forEach((day) => {
            day.sessions.forEach((s) => {
              if (s.subjectId === sub.id) {
                plannedSessions++;
                if (s.completed) completedSessions++;
              }
            });
          });

          const timetableProgress =
            plannedSessions > 0 ? Math.round((completedSessions / plannedSessions) * 100) : 0;

          // Effective mastery: Baseline Prep + incremental gains from completed study blocks
          const effectiveMastery = Math.min(
            100,
            Math.round(sub.currentPreparation + (completedSessions * 4))
          );

          return (
            <div key={sub.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: sub.color }}
                  />
                  <span className="font-extrabold text-slate-900 text-sm">{sub.name}</span>
                  <span className="text-[11px] font-semibold px-2 py-0.2 rounded-md bg-white border border-slate-200 text-slate-600">
                    {sub.difficulty}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <div>
                    <span className="text-slate-400">Baseline Prep: </span>
                    <span className="font-bold text-slate-700">{sub.currentPreparation}%</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Sessions Done: </span>
                    <span className="font-bold text-emerald-600">
                      {completedSessions}/{plannedSessions}
                    </span>
                  </div>
                  <div className="bg-indigo-100 text-indigo-800 font-extrabold px-2 py-0.5 rounded-md">
                    Mastery: {effectiveMastery}%
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden flex">
                <div
                  className="h-full transition-all duration-500 rounded-l-full"
                  style={{
                    width: `${effectiveMastery}%`,
                    backgroundColor: sub.color,
                  }}
                  title={`Effective Mastery: ${effectiveMastery}%`}
                />
              </div>

              <div className="flex justify-between text-[11px] text-slate-400">
                <span>0%</span>
                <span>50%</span>
                <span>100% Exam Ready</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
