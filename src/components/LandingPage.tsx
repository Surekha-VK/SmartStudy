import React from 'react';
import {
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Clock,
  CheckCircle2,
  TrendingUp,
  Brain,
  Coffee,
} from 'lucide-react';
import { NavTab } from './Navbar';

interface LandingPageProps {
  onNavigate: (tab: NavTab) => void;
  onLoadDemo: () => void;
  hasPlan: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigate,
  onLoadDemo,
  hasPlan,
}) => {
  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto px-4 pt-6 pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-6 shadow-xs animate-fade-in">
          <Sparkles className="w-3.5 h-3.5" />
          Hackathon Edition • College Exam Revision Planner
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-6">
          Plan smarter.{' '}
          <span className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
            Study better.
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed mb-10">
          Create a personalized study schedule based on your exams, difficulty,
          preparation level, and available time. Turn exam chaos into high-yield, structured revision.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
          <button
            onClick={() => onNavigate('setup')}
            className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Get Started</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            onClick={() => {
              onLoadDemo();
              onNavigate('plan');
            }}
            className="w-full sm:w-auto px-7 py-4 rounded-xl text-base font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 shadow-xs transition hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <span>View Demo</span>
          </button>
        </div>

        {hasPlan && (
          <div className="mt-6 text-sm text-slate-500">
            You already have an active study schedule.{' '}
            <button
              onClick={() => onNavigate('plan')}
              className="text-indigo-600 font-semibold underline hover:text-indigo-800"
            >
              Go straight to your Timetable →
            </button>
          </div>
        )}
      </section>

      {/* Feature Value Grid */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
            Built for Real College Exam Prep
          </h2>
          <p className="text-slate-600 max-w-xl mx-auto text-sm sm:text-base">
            No fluff or fake AI claims. SmartStudy uses deterministic, transparent priority math to maximize your retention.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-5">
              <Brain className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Smart Priority Engine</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Calculates priority using a transparent formula:{' '}
              <span className="font-semibold text-slate-800">Urgency + Difficulty + Preparation Gap</span>.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-5">
              <Coffee className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Dynamic Breaks</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Every schedule interleaves 50-minute focused revision blocks with 10-minute restorative breaks to avoid burnout.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-5">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Adaptive Rescheduling</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Missed a study session? The engine redistributes unfinished topics across remaining days without overloading any single day.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-5">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Plan Health & Insights</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Monitor your real-time 🟢 On Track status, exam countdowns, subject progress, and personalized study tips.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works 3-Step Section */}
      <section className="bg-slate-100/70 border-y border-slate-200/80 py-14">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-10">
            How It Works in 3 Simple Steps
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs text-center">
              <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-black text-lg flex items-center justify-center mx-auto mb-4">
                1
              </div>
              <h4 className="font-bold text-slate-900 mb-2">Input Your Subjects</h4>
              <p className="text-sm text-slate-600">
                Enter subject names, exam dates, perceived difficulty (Easy/Medium/Hard), and preparation percentages (0–100%).
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs text-center">
              <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-black text-lg flex items-center justify-center mx-auto mb-4">
                2
              </div>
              <h4 className="font-bold text-slate-900 mb-2">Set Your Study Availability</h4>
              <p className="text-sm text-slate-600">
                Choose average daily hours or specify custom hours for different days of the week, plus preferred start time.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs text-center">
              <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-black text-lg flex items-center justify-center mx-auto mb-4">
                3
              </div>
              <h4 className="font-bold text-slate-900 mb-2">Generate & Track</h4>
              <p className="text-sm text-slate-600">
                Click Generate My Plan to get a day-by-day timetable with breaks. Check off sessions as you study and adapt if you fall behind.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Presentation/Demo Summary Box */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white p-8 sm:p-10 rounded-3xl shadow-xl border border-indigo-700/50">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <span className="px-3 py-1 rounded-full bg-indigo-500/30 text-indigo-200 text-xs font-bold uppercase tracking-wider">
                Live Hackathon Demo
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold mt-3 mb-2">
                Ready to see it in action?
              </h3>
              <p className="text-indigo-200 text-sm sm:text-base max-w-xl leading-relaxed">
                Load the official sample dataset with DBMS, COA, Python, and Mathematics to test scheduling, adaptive recalculations, and analytics instantly.
              </p>
            </div>

            <button
              onClick={() => {
                onLoadDemo();
                onNavigate('dashboard');
              }}
              className="px-6 py-3.5 rounded-xl font-bold bg-white text-indigo-900 hover:bg-indigo-50 transition shadow-lg shrink-0 flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <span>Launch Demo</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
