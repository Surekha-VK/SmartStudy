import React, { useState } from 'react';
import { Plus, Trash2, Calendar, AlertCircle, BookOpen, Sparkles } from 'lucide-react';
import { Subject, Difficulty } from '../../types/study';
import { calculateDaysRemaining } from '../../scheduler/priorityEngine';
import { SUBJECT_TOPIC_BANK, getRelativeDateString } from '../../data/demoData';

interface SubjectFormProps {
  subjects: Subject[];
  onAddSubject: (subject: Subject) => void;
  onRemoveSubject: (subjectId: string) => void;
  onLoadDemoSubjects: () => void;
}

const COLOR_PALETTE = ['#ef4444', '#f97316', '#10b981', '#6366f1', '#8b5cf6', '#ec4899', '#06b6d4'];

export const SubjectForm: React.FC<SubjectFormProps> = ({
  subjects,
  onAddSubject,
  onRemoveSubject,
  onLoadDemoSubjects,
}) => {
  const [name, setName] = useState('');
  const [examDate, setExamDate] = useState(getRelativeDateString(5));
  const [difficulty, setDifficulty] = useState<Difficulty>('Hard');
  const [preparation, setPreparation] = useState<number>(40);
  const [error, setError] = useState<string | null>(null);

  const minDate = new Date().toISOString().split('T')[0];

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Please enter a valid subject name (e.g., DBMS, Machine Learning, Calculus).');
      return;
    }

    if (subjects.some((s) => s.name.toLowerCase() === trimmedName.toLowerCase())) {
      setError(`Subject "${trimmedName}" is already added. Please use a unique subject name.`);
      return;
    }

    if (!examDate) {
      setError('Please select an exam date.');
      return;
    }

    const days = calculateDaysRemaining(examDate);
    if (days < 0) {
      setError('Exam date cannot be in the past. Please choose today or a future date.');
      return;
    }

    const assignedColor = COLOR_PALETTE[subjects.length % COLOR_PALETTE.length];
    const defaultTopics = SUBJECT_TOPIC_BANK[trimmedName] || [
      'Core Fundamentals & Definitions',
      'Advanced Concepts & Deep Dive',
      'High-Yield Practice Questions',
      'Formula Sheet & Previous Year Exam Papers',
    ];

    const newSubject: Subject = {
      id: `sub-${Date.now()}`,
      name: trimmedName,
      examDate,
      difficulty,
      currentPreparation: Math.max(0, Math.min(100, preparation)),
      color: assignedColor,
      topics: defaultTopics,
    };

    onAddSubject(newSubject);
    setName('');
    setPreparation(50);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            1. Subject Information
          </h3>
          <p className="text-xs sm:text-sm text-slate-500">
            Enter each subject, scheduled exam date, difficulty, and your current preparation level (0–100%).
          </p>
        </div>

        {subjects.length === 0 && (
          <button
            type="button"
            onClick={onLoadDemoSubjects}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition shrink-0 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Load Demo Subjects
          </button>
        )}
      </div>

      {/* Validation Error banner */}
      {error && (
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Add Subject Input Form */}
      <form onSubmit={handleAdd} className="space-y-4 bg-slate-50/80 p-4 rounded-xl border border-slate-200/60">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Subject Name */}
          <div className="md:col-span-4">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Subject Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. DBMS, COA, Python, Math"
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
          </div>

          {/* Exam Date */}
          <div className="md:col-span-3">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Exam Date *
            </label>
            <div className="relative">
              <input
                type="date"
                min={minDate}
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              />
            </div>
          </div>

          {/* Difficulty */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Difficulty
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as Difficulty)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition font-medium"
            >
              <option value="Hard">Hard (30 pts)</option>
              <option value="Medium">Medium (20 pts)</option>
              <option value="Easy">Easy (10 pts)</option>
            </select>
          </div>

          {/* Current Preparation Slider */}
          <div className="md:col-span-3">
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Current Prep
              </label>
              <span className="text-xs font-extrabold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800">
                {preparation}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={preparation}
              onChange={(e) => setPreparation(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>0% (Not started)</span>
              <span>100% (Ready)</span>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-xs hover:shadow transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Subject</span>
          </button>
        </div>
      </form>

      {/* Added Subjects List */}
      <div>
        <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">
          Configured Subjects ({subjects.length})
        </h4>

        {subjects.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
            <p className="text-sm text-slate-500 mb-3">No subjects configured yet.</p>
            <button
              onClick={onLoadDemoSubjects}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-100 hover:bg-indigo-200 transition cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Load Hackathon Demo Subjects (DBMS, COA, Python, Math)
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {subjects.map((sub) => {
              const days = calculateDaysRemaining(sub.examDate);
              const urgencyTag =
                days === 0
                  ? 'TODAY'
                  : days === 1
                  ? 'TOMORROW'
                  : `${days} days left`;

              let badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
              if (days <= 2) badgeColor = 'bg-rose-50 text-rose-700 border-rose-200';
              else if (days <= 6) badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';

              return (
                <div
                  key={sub.id}
                  className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xl-hover transition relative group"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: sub.color }}
                      />
                      <h5 className="font-extrabold text-slate-900 text-base">{sub.name}</h5>
                    </div>
                    <button
                      onClick={() => onRemoveSubject(sub.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded-lg opacity-80 group-hover:opacity-100 transition"
                      title="Remove Subject"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${badgeColor}`}>
                      {urgencyTag}
                    </span>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                      {sub.difficulty}
                    </span>
                  </div>

                  <div className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Exam: {sub.examDate}</span>
                  </div>

                  {/* Preparation progress bar */}
                  <div className="mt-3">
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-500">Preparation</span>
                      <span className="text-slate-800">{sub.currentPreparation}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${sub.currentPreparation}%`,
                          backgroundColor: sub.color,
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
