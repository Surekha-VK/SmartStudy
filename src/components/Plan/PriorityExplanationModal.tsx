import React from 'react';
import { X, HelpCircle, Check, Award, Calculator } from 'lucide-react';
import { Subject } from '../../types/study';
import { calculateAllPriorities } from '../../scheduler/priorityEngine';

interface PriorityExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: Subject[];
}

export const PriorityExplanationModal: React.FC<PriorityExplanationModalProps> = ({
  isOpen,
  onClose,
  subjects,
}) => {
  if (!isOpen) return null;

  const breakdowns = calculateAllPriorities(subjects, new Date(), 240);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in no-print">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-100 text-indigo-600">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                Transparent Priority Formula
              </h3>
              <p className="text-xs text-slate-500">
                100% deterministic & explainable priority scoring
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formula Card */}
        <div className="bg-indigo-50/80 border border-indigo-200/80 rounded-2xl p-5 mb-6 text-center">
          <span className="text-xs font-bold text-indigo-700 uppercase tracking-widest block mb-2">
            The Priority Formula
          </span>
          <div className="text-lg sm:text-xl font-black text-indigo-950 tracking-tight">
            Priority Score = Urgency + Difficulty + Preparation Gap
          </div>
          <p className="text-xs text-indigo-800/80 mt-2 max-w-lg mx-auto">
            Every subject is scored dynamically each day. Higher priority subjects receive greater study time allocation.
          </p>
        </div>

        {/* Component Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-bold text-slate-500 uppercase block mb-1">
              1. Urgency (0–50 pts)
            </span>
            <p className="text-xs text-slate-600 leading-relaxed">
              Based on days remaining to exam date. Exam today = 50 pts, tomorrow = 46 pts, decreasing smoothly with distance.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-bold text-slate-500 uppercase block mb-1">
              2. Difficulty (10–30 pts)
            </span>
            <p className="text-xs text-slate-600 leading-relaxed">
              Hard = 30 pts<br />
              Medium = 20 pts<br />
              Easy = 10 pts
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-bold text-slate-500 uppercase block mb-1">
              3. Prep Gap (0–40 pts)
            </span>
            <p className="text-xs text-slate-600 leading-relaxed">
              Formula: <span className="font-mono text-[11px]">(100 - Prep%) × 0.4</span>.<br />
              Lower preparation yields higher priority.
            </p>
          </div>
        </div>

        {/* Live Subject Priority Breakdown Table */}
        <div>
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
            Live Priority Breakdown for Your Subjects
          </h4>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/80 text-slate-600 font-bold uppercase border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Subject</th>
                  <th className="py-2.5 px-3">Days Left</th>
                  <th className="py-2.5 px-3">Urgency</th>
                  <th className="py-2.5 px-3">Diff.</th>
                  <th className="py-2.5 px-3">Prep Gap</th>
                  <th className="py-2.5 px-3 font-extrabold text-indigo-700">Total Score</th>
                  <th className="py-2.5 px-3 text-right">Study Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {breakdowns.map((b) => (
                  <tr key={b.subjectId} className="hover:bg-slate-50/80 transition">
                    <td className="py-2.5 px-3 font-bold text-slate-900">{b.subjectName}</td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {b.daysRemaining <= 0 ? 'Today' : `${b.daysRemaining}d`}
                    </td>
                    <td className="py-2.5 px-3 text-indigo-600 font-semibold">{b.urgencyScore}</td>
                    <td className="py-2.5 px-3 text-amber-600 font-semibold">{b.difficultyScore}</td>
                    <td className="py-2.5 px-3 text-rose-600 font-semibold">{b.prepGapScore}</td>
                    <td className="py-2.5 px-3 font-extrabold text-indigo-900 text-sm">
                      {b.totalScore}
                    </td>
                    <td className="py-2.5 px-3 text-right font-extrabold text-slate-800">
                      {b.weightPercentage}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition cursor-pointer"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
