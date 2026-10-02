import React from 'react';
import { HeartPulse, CheckCircle2, AlertTriangle, AlertOctagon, RefreshCw } from 'lucide-react';
import { PlanHealth } from '../../types/study';

interface PlanHealthCardProps {
  health: PlanHealth;
  onRecalculate: () => void;
}

export const PlanHealthCard: React.FC<PlanHealthCardProps> = ({ health, onRecalculate }) => {
  let Icon = CheckCircle2;
  let iconBg = 'bg-emerald-100 text-emerald-600';
  let badgeBorder = 'border-emerald-200 bg-emerald-50 text-emerald-800';

  if (health.status === 'HIGH ATTENTION') {
    Icon = AlertOctagon;
    iconBg = 'bg-rose-100 text-rose-600';
    badgeBorder = 'border-rose-200 bg-rose-50 text-rose-800';
  } else if (health.status === 'NEEDS ATTENTION') {
    Icon = AlertTriangle;
    iconBg = 'bg-amber-100 text-amber-600';
    badgeBorder = 'border-amber-200 bg-amber-50 text-amber-800';
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-2xl ${iconBg} shadow-xs`}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Study Plan Health
              </span>
              <span className={`text-xs font-black px-2.5 py-0.5 rounded-full border ${badgeBorder}`}>
                {health.status}
              </span>
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 mt-0.5">
              {health.headline}
            </h3>
          </div>
        </div>

        {health.missedCount > 0 && (
          <button
            onClick={onRecalculate}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow transition shrink-0 cursor-pointer animate-pulse"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Recalculate Remaining Plan</span>
          </button>
        )}
      </div>

      <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-5">
        {health.description}
      </p>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-[11px] font-bold text-slate-500 block uppercase">
            Completion Rate
          </span>
          <span className="text-lg font-black text-slate-900">{health.completionRate}%</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-[11px] font-bold text-slate-500 block uppercase">
            Completed Sessions
          </span>
          <span className="text-lg font-black text-emerald-600">
            {health.completedCount} / {health.totalSessionsCount}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-[11px] font-bold text-slate-500 block uppercase">
            Missed Sessions
          </span>
          <span
            className={`text-lg font-black ${
              health.missedCount > 0 ? 'text-rose-600' : 'text-slate-900'
            }`}
          >
            {health.missedCount}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-[11px] font-bold text-slate-500 block uppercase">
            Critical Exams (≤3d)
          </span>
          <span
            className={`text-lg font-black ${
              health.urgentExamsCount > 0 ? 'text-rose-600' : 'text-slate-900'
            }`}
          >
            {health.urgentExamsCount}
          </span>
        </div>
      </div>
    </div>
  );
};
