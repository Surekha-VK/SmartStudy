import React from 'react';
import { BarChart, Clock, CheckCircle2 } from 'lucide-react';
import { DayPlan } from '../../types/study';

interface HoursAnalyticsProps {
  timetable: DayPlan[];
}

export const HoursAnalytics: React.FC<HoursAnalyticsProps> = ({ timetable }) => {
  if (timetable.length === 0) return null;

  // Take first 7 days for the weekly distribution chart
  const weekDays = timetable.slice(0, 7);

  // Find maximum hours for scaling
  const maxHours = Math.max(
    ...weekDays.map((d) => d.studyMinutes / 60),
    4
  );

  let totalPlannedMinutes = 0;
  let totalCompletedMinutes = 0;

  timetable.forEach((d) => {
    d.sessions.forEach((s) => {
      if (!s.isBreak) {
        totalPlannedMinutes += s.durationMinutes;
        if (s.completed) totalCompletedMinutes += s.durationMinutes;
      }
    });
  });

  const totalPlannedHours = Math.round((totalPlannedMinutes / 60) * 10) / 10;
  const totalCompletedHours = Math.round((totalCompletedMinutes / 60) * 10) / 10;
  const completionPercentage =
    totalPlannedHours > 0 ? Math.round((totalCompletedHours / totalPlannedHours) * 100) : 0;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BarChart className="w-5 h-5 text-indigo-600" />
            Study Hours Analytics
          </h3>
          <p className="text-xs text-slate-500">
            Planned vs completed revision hours distribution
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-bold">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-indigo-500" />
            <span className="text-slate-600">Planned ({totalPlannedHours}h)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-emerald-500" />
            <span className="text-slate-600">Completed ({totalCompletedHours}h)</span>
          </div>
        </div>
      </div>

      {/* SVG Bar Chart for 7-day schedule */}
      <div className="space-y-4">
        <div className="grid grid-cols-7 gap-2 items-end h-44 pt-6 pb-2 border-b border-slate-200">
          {weekDays.map((day) => {
            const plannedH = Math.round((day.studyMinutes / 60) * 10) / 10;
            const completedMinutes = day.sessions
              .filter((s) => !s.isBreak && s.completed)
              .reduce((acc, curr) => acc + curr.durationMinutes, 0);
            const completedH = Math.round((completedMinutes / 60) * 10) / 10;

            const plannedHeight = maxHours > 0 ? (plannedH / maxHours) * 100 : 0;
            const completedHeight = maxHours > 0 ? (completedH / maxHours) * 100 : 0;

            return (
              <div key={day.date} className="flex flex-col items-center h-full justify-end group">
                <div className="text-[10px] font-bold text-slate-400 mb-1 opacity-0 group-hover:opacity-100 transition">
                  {completedH}h / {plannedH}h
                </div>
                <div className="w-full max-w-[36px] flex items-end justify-center gap-1 h-32 bg-slate-50 rounded-t-lg p-1">
                  {/* Planned bar */}
                  <div
                    className="w-1/2 bg-indigo-200 rounded-t-md transition-all duration-500"
                    style={{ height: `${Math.max(4, plannedHeight)}%` }}
                    title={`Planned: ${plannedH} hrs`}
                  />
                  {/* Completed bar */}
                  <div
                    className="w-1/2 bg-emerald-500 rounded-t-md transition-all duration-500"
                    style={{ height: `${Math.max(completedH > 0 ? 4 : 0, completedHeight)}%` }}
                    title={`Completed: ${completedH} hrs`}
                  />
                </div>
                <span
                  className={`text-[10px] font-bold mt-2 truncate w-full text-center ${
                    day.isToday ? 'text-indigo-600 font-extrabold' : 'text-slate-500'
                  }`}
                >
                  {day.isToday ? 'Today' : day.dayLabel.split(',')[0].slice(0, 3)}
                </span>
              </div>
            );
          })}
        </div>

        {/* Aggregate Ratio Bar */}
        <div className="pt-2">
          <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1.5">
            <span>Overall Time Fulfilled:</span>
            <span className="font-extrabold text-slate-900">
              {totalCompletedHours} / {totalPlannedHours} Hours ({completionPercentage}%)
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
