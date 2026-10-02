import React from 'react';
import { Clock, CalendarDays, Sliders, Play, AlertCircle, Coffee } from 'lucide-react';
import { StudyAvailability, DayOfWeek, AvailabilityMode } from '../../types/study';

interface AvailabilityFormProps {
  availability: StudyAvailability;
  onChange: (availability: StudyAvailability) => void;
  onGeneratePlan: () => void;
  canGenerate: boolean;
  subjectsCount: number;
}

const DAYS_OF_WEEK: DayOfWeek[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export const AvailabilityForm: React.FC<AvailabilityFormProps> = ({
  availability,
  onChange,
  onGeneratePlan,
  canGenerate,
  subjectsCount,
}) => {
  const handleModeChange = (mode: AvailabilityMode) => {
    onChange({ ...availability, mode });
  };

  const handleDailyHoursChange = (hours: number) => {
    const safeHours = Math.max(0, Math.min(16, hours));
    onChange({ ...availability, dailyHours: safeHours });
  };

  const handleCustomDayChange = (day: DayOfWeek, hours: number) => {
    const safeHours = Math.max(0, Math.min(16, hours));
    onChange({
      ...availability,
      customDays: {
        ...availability.customDays,
        [day]: safeHours,
      },
    });
  };

  const isZeroAvailable =
    availability.mode === 'uniform'
      ? availability.dailyHours === 0
      : Object.values(availability.customDays).every((h) => h === 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
      <div>
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Clock className="w-5 h-5 text-indigo-600" />
          2. Study Availability & Preferences
        </h3>
        <p className="text-xs sm:text-sm text-slate-500">
          Tell us how much time you can dedicate to studying each day. We never generate impossible schedules.
        </p>
      </div>

      {/* Mode Selector Tabs */}
      <div className="flex p-1 bg-slate-100 rounded-xl max-w-md border border-slate-200">
        <button
          type="button"
          onClick={() => handleModeChange('uniform')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs sm:text-sm font-bold rounded-lg transition ${
            availability.mode === 'uniform'
              ? 'bg-white text-indigo-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Clock className="w-4 h-4" />
          Same Hours Every Day
        </button>
        <button
          type="button"
          onClick={() => handleModeChange('custom')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs sm:text-sm font-bold rounded-lg transition ${
            availability.mode === 'custom'
              ? 'bg-white text-indigo-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CalendarDays className="w-4 h-4" />
          Custom Day-by-Day
        </button>
      </div>

      {/* Uniform Mode */}
      {availability.mode === 'uniform' ? (
        <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200/70 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-800">
                Average Daily Study Hours
              </label>
              <p className="text-xs text-slate-500">
                How many hours can you commit each day?
              </p>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="0"
                max="16"
                step="0.5"
                value={availability.dailyHours}
                onChange={(e) => handleDailyHoursChange(parseFloat(e.target.value) || 0)}
                className="w-24 px-3 py-2 bg-white border border-slate-300 rounded-xl text-center font-extrabold text-lg text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-sm font-semibold text-slate-600">Hours / day</span>
            </div>
          </div>

          <input
            type="range"
            min="0"
            max="12"
            step="0.5"
            value={availability.dailyHours}
            onChange={(e) => handleDailyHoursChange(parseFloat(e.target.value) || 0)}
            className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
          />
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>0 hrs (Rest day)</span>
            <span>2 hrs</span>
            <span>4 hrs</span>
            <span>6 hrs</span>
            <span>8 hrs</span>
            <span>12+ hrs</span>
          </div>
        </div>
      ) : (
        /* Custom Day-by-Day Mode */
        <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200/70 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-800">
              Set Daily Hours for Each Day
            </span>
            <span className="text-xs text-slate-500">
              e.g. Heavier on weekends, lighter on weekdays
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {DAYS_OF_WEEK.map((day) => {
              const currentVal = availability.customDays[day] ?? 3;
              return (
                <div key={day} className="bg-white p-3 rounded-xl border border-slate-200 text-center shadow-xs">
                  <span className="block text-xs font-bold text-slate-700 mb-1">
                    {day.slice(0, 3)}
                  </span>
                  <input
                    type="number"
                    min="0"
                    max="16"
                    step="0.5"
                    value={currentVal}
                    onChange={(e) => handleCustomDayChange(day, parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1.5 text-center font-extrabold text-base text-indigo-600 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">hours</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Study Session & Break Length Preferences */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Preferred Start Time
          </label>
          <input
            type="time"
            value={availability.preferredStartTime}
            onChange={(e) => onChange({ ...availability, preferredStartTime: e.target.value })}
            className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Study Block Duration
          </label>
          <select
            value={availability.sessionLengthMinutes}
            onChange={(e) => onChange({ ...availability, sessionLengthMinutes: parseInt(e.target.value, 10) })}
            className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500"
          >
            <option value="30">30 minutes</option>
            <option value="45">45 minutes</option>
            <option value="50">50 minutes (Recommended)</option>
            <option value="60">60 minutes</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Coffee className="w-3.5 h-3.5 text-amber-600" />
            Break Duration
          </label>
          <select
            value={availability.breakLengthMinutes}
            onChange={(e) => onChange({ ...availability, breakLengthMinutes: parseInt(e.target.value, 10) })}
            className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500"
          >
            <option value="5">5 minutes</option>
            <option value="10">10 minutes (Recommended)</option>
            <option value="15">15 minutes</option>
          </select>
        </div>
      </div>

      {/* Warnings & Notices */}
      {isZeroAvailable && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs sm:text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>
            You have set 0 study hours. Days with 0 hours will be marked as Rest Days with no revision sessions.
          </span>
        </div>
      )}

      {subjectsCount === 0 && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs sm:text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>
            Please add at least one subject above or click "Load Demo Subjects" to generate your timetable.
          </span>
        </div>
      )}

      {/* Big Action: GENERATE MY PLAN */}
      <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-slate-500 text-center sm:text-left">
          Generates a day-by-day revision schedule through your final exam date using priority scoring.
        </div>

        <button
          type="button"
          disabled={!canGenerate}
          onClick={onGeneratePlan}
          className={`w-full sm:w-auto px-8 py-4 rounded-xl text-base font-extrabold text-white flex items-center justify-center gap-2 shadow-lg transition cursor-pointer ${
            canGenerate
              ? 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-indigo-200 hover:-translate-y-0.5'
              : 'bg-slate-300 cursor-not-allowed shadow-none'
          }`}
        >
          <Play className="w-5 h-5 fill-current" />
          <span>GENERATE MY PLAN</span>
        </button>
      </div>
    </div>
  );
};
