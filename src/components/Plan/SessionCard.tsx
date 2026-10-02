import React from 'react';
import { Check, Coffee, Clock, PlayCircle, AlertCircle, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { StudySession, Subject } from '../../types/study';

interface SessionCardProps {
  session: StudySession;
  subject?: Subject;
  onToggleComplete: (sessionId: string) => void;
  onToggleMissed: (sessionId: string) => void;
  onStartFocus: (session: StudySession) => void;
}

export const SessionCard: React.FC<SessionCardProps> = ({
  session,
  subject,
  onToggleComplete,
  onToggleMissed,
  onStartFocus,
}) => {
  // Break session styling
  if (session.isBreak) {
    return (
      <div className="flex items-center gap-3 py-2 px-4 rounded-xl bg-amber-50/70 border border-amber-200/60 text-amber-900 my-1.5 transition">
        <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700">
          <Coffee className="w-4 h-4" />
        </div>
        <div className="flex-1 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
              ☕ Break
            </span>
            <span className="text-xs text-amber-700/80">
              ({session.durationMinutes} min) — {session.topic}
            </span>
          </div>
          <span className="text-xs font-semibold font-mono text-amber-800/80">
            {session.startTime} – {session.endTime}
          </span>
        </div>
      </div>
    );
  }

  const handleCheckboxClick = () => {
    if (!session.completed) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    }
    onToggleComplete(session.id);
  };

  const subjectColor = subject?.color || '#4f46e5';

  return (
    <div
      className={`group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border transition-all duration-200 ${
        session.completed
          ? 'bg-slate-50/90 border-slate-200/70 opacity-75'
          : session.missed
          ? 'bg-rose-50/60 border-rose-200 hover:border-rose-300'
          : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-xs'
      }`}
    >
      {/* Left section: Checkbox + Subject tag + Time + Topic */}
      <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
        {/* Interactive Checkbox */}
        <button
          type="button"
          onClick={handleCheckboxClick}
          className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition shrink-0 cursor-pointer mt-0.5 sm:mt-0 ${
            session.completed
              ? 'bg-emerald-600 border-emerald-600 text-white'
              : 'border-slate-300 hover:border-indigo-600 bg-white'
          }`}
          title={session.completed ? 'Mark incomplete' : 'Mark completed'}
        >
          {session.completed && <Check className="w-4 h-4 stroke-[3]" />}
        </button>

        {/* Color stripe & Subject info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            {/* Subject badge with custom subject color */}
            <span
              className="text-xs font-extrabold px-2.5 py-0.5 rounded-md text-white shadow-2xs"
              style={{ backgroundColor: subjectColor }}
            >
              {session.subjectName}
            </span>

            {/* Time range badge */}
            <span className="text-xs font-semibold text-slate-500 font-mono flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {session.startTime} – {session.endTime} ({session.durationMinutes}m)
            </span>

            {/* Priority points badge */}
            {typeof session.priorityScore === 'number' && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                Priority: {session.priorityScore} pts
              </span>
            )}

            {/* Rescheduled badge */}
            {session.rescheduledCount && session.rescheduledCount > 0 ? (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 flex items-center gap-1">
                <RefreshCw className="w-3 h-3" />
                Catch-up Block
              </span>
            ) : null}

            {/* Missed badge */}
            {session.missed && !session.completed && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Unfinished
              </span>
            )}
          </div>

          {/* Topic title */}
          <h5
            className={`text-sm font-semibold truncate ${
              session.completed ? 'line-through text-slate-400' : 'text-slate-800'
            }`}
          >
            {session.topic}
          </h5>
        </div>
      </div>

      {/* Right section: Action Buttons */}
      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
        {/* Focus timer button */}
        {!session.completed && (
          <button
            type="button"
            onClick={() => onStartFocus(session)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition cursor-pointer"
            title="Start Pomodoro focus session"
          >
            <PlayCircle className="w-3.5 h-3.5 text-indigo-600" />
            <span>Focus</span>
          </button>
        )}

        {/* Toggle Missed status (Allows testing adaptive recalculation) */}
        {!session.completed && (
          <button
            type="button"
            onClick={() => onToggleMissed(session.id)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              session.missed
                ? 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
            }`}
            title={session.missed ? 'Unmark missed' : 'Simulate missed session'}
          >
            {session.missed ? 'Marked Missed' : 'Missed?'}
          </button>
        )}
      </div>
    </div>
  );
};
