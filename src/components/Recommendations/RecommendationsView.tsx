import React from 'react';
import { Lightbulb, AlertTriangle, AlertCircle, CheckCircle2, Sparkles, RefreshCw } from 'lucide-react';
import { Recommendation, Subject } from '../../types/study';

interface RecommendationsViewProps {
  recommendations: Recommendation[];
  onRecalculate: () => void;
  onNavigateToSetup: () => void;
}

export const RecommendationsView: React.FC<RecommendationsViewProps> = ({
  recommendations,
  onRecalculate,
  onNavigateToSetup,
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            Smart Study Recommendations
          </h2>
          <p className="text-xs text-slate-500">
            Real-time, rule-based advice tailored to your exam timeline and revision performance
          </p>
        </div>

        <button
          onClick={onRecalculate}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4 text-indigo-600" />
          <span>Refresh Analysis</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recommendations.map((rec) => {
          let Icon = Lightbulb;
          let borderClass = 'border-slate-200 bg-white';
          let iconClass = 'bg-indigo-50 text-indigo-600';
          let tagColor = 'bg-slate-100 text-slate-700';

          if (rec.type === 'urgent') {
            Icon = AlertCircle;
            borderClass = 'border-rose-200 bg-rose-50/40';
            iconClass = 'bg-rose-100 text-rose-600';
            tagColor = 'bg-rose-100 text-rose-800 border border-rose-200 font-extrabold';
          } else if (rec.type === 'warning') {
            Icon = AlertTriangle;
            borderClass = 'border-amber-200 bg-amber-50/40';
            iconClass = 'bg-amber-100 text-amber-600';
            tagColor = 'bg-amber-100 text-amber-800 border border-amber-200 font-extrabold';
          } else if (rec.type === 'success') {
            Icon = CheckCircle2;
            borderClass = 'border-emerald-200 bg-emerald-50/40';
            iconClass = 'bg-emerald-100 text-emerald-600';
            tagColor = 'bg-emerald-100 text-emerald-800 border border-emerald-200 font-extrabold';
          }

          return (
            <div
              key={rec.id}
              className={`p-6 rounded-3xl border shadow-xs transition hover:shadow-md ${borderClass} flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${iconClass}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-extrabold text-slate-900 text-base">{rec.title}</h3>
                  </div>
                  <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${tagColor}`}>
                    {rec.type}
                  </span>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed mt-2">{rec.message}</p>
              </div>

              {rec.id === 'rec-missed-sessions' && (
                <div className="mt-4 pt-3 border-t border-amber-200/60">
                  <button
                    onClick={onRecalculate}
                    className="flex items-center gap-1.5 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 px-3.5 py-1.5 rounded-lg transition cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Recalculate Plan Now</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
