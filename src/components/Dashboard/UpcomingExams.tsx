import React from 'react';
import { Calendar, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { Subject } from '../../types/study';
import { calculateDaysRemaining } from '../../scheduler/priorityEngine';

interface UpcomingExamsProps {
  subjects: Subject[];
}

export const UpcomingExams: React.FC<UpcomingExamsProps> = ({ subjects }) => {
  if (subjects.length === 0) return null;

  const sortedExams = [...subjects]
    .map((s) => ({
      ...s,
      daysRemaining: calculateDaysRemaining(s.examDate),
    }))
    .sort((a, b) => a.daysRemaining - b.daysRemaining);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            Upcoming Exams
          </h3>
          <p className="text-xs text-slate-500">
            Sorted by exam date with real-time urgency indicators
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {sortedExams.map((exam) => {
          let badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
          let urgencyLabel = 'Upcoming';
          let isCritical = false;

          if (exam.daysRemaining <= 0) {
            badgeColor = 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse';
            urgencyLabel = 'TODAY';
            isCritical = true;
          } else if (exam.daysRemaining <= 3) {
            badgeColor = 'bg-rose-50 text-rose-700 border-rose-200';
            urgencyLabel = `${exam.daysRemaining} days left (Urgent)`;
            isCritical = true;
          } else if (exam.daysRemaining <= 7) {
            badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
            urgencyLabel = `${exam.daysRemaining} days left (Approaching)`;
          } else {
            urgencyLabel = `${exam.daysRemaining} days left`;
          }

          return (
            <div
              key={exam.id}
              className={`p-4 rounded-2xl border transition-all ${
                isCritical
                  ? 'border-rose-200 bg-rose-50/30'
                  : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3.5 h-3.5 rounded-full shrink-0"
                    style={{ backgroundColor: exam.color }}
                  />
                  <h4 className="font-extrabold text-slate-900 text-base">{exam.name}</h4>
                </div>
                <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full border ${badgeColor}`}>
                  {urgencyLabel}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 mt-2 pt-2 border-t border-slate-200/60">
                <span className="flex items-center gap-1 font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  {exam.examDate}
                </span>
                <span className="font-bold text-slate-700">
                  Prep: {exam.currentPreparation}% ({exam.difficulty})
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
