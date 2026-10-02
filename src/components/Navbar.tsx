import React, { useState } from 'react';
import {
  BookOpen,
  Calendar,
  LayoutDashboard,
  Sparkles,
  RotateCcw,
  Sliders,
  RefreshCw,
  Menu,
  X,
  Lightbulb,
  HeartPulse,
} from 'lucide-react';
import { PlanHealth } from '../types/study';

export type NavTab = 'home' | 'setup' | 'plan' | 'dashboard' | 'recommendations';

interface NavbarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onLoadDemo: () => void;
  onReset: () => void;
  onRecalculate: () => void;
  health: PlanHealth;
  subjectsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  onLoadDemo,
  onReset,
  onRecalculate,
  health,
  subjectsCount,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: NavTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'home', label: 'Home', icon: BookOpen },
    { id: 'setup', label: 'Setup', icon: Sliders },
    { id: 'plan', label: 'My Plan', icon: Calendar },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'recommendations', label: 'Insights', icon: Lightbulb },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Tagline */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => onTabChange('home')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight text-slate-900">
                  Smart<span className="text-indigo-600">Study</span>
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  v1.0
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                Plan smarter. Study better.
              </p>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-white text-indigo-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Quick Action Toolbar */}
          <div className="hidden lg:flex items-center gap-2.5">
            {/* Plan Health Indicator pill */}
            {subjectsCount > 0 && (
              <button
                onClick={() => onTabChange('dashboard')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border transition ${health.badgeClass} hover:opacity-90`}
                title={health.description}
              >
                <HeartPulse className="w-3.5 h-3.5 animate-pulse" />
                <span>{health.status}</span>
              </button>
            )}

            {/* Recalculate adaptive button */}
            {health.missedCount > 0 && (
              <button
                onClick={onRecalculate}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 transition shadow-xs animate-bounce"
                title="Adaptive catch-up rescheduling"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Recalculate ({health.missedCount} missed)</span>
              </button>
            )}

            {/* Load Demo Data */}
            <button
              onClick={onLoadDemo}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition"
              title="Preload hackathon exam demo data"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Load Demo Data</span>
            </button>

            {/* Reset */}
            <button
              onClick={onReset}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
              title="Reset Planner"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2 shadow-lg animate-slide-down">
          <div className="grid grid-cols-2 gap-2 mb-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-600 font-bold'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4 text-indigo-500" />
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            {health.missedCount > 0 && (
              <button
                onClick={() => {
                  onRecalculate();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-amber-900 bg-amber-100 border border-amber-300"
              >
                <RefreshCw className="w-4 h-4" />
                Recalculate Plan ({health.missedCount} Missed)
              </button>
            )}
            <button
              onClick={() => {
                onLoadDemo();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200"
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Load Demo Data (DBMS, COA, Python, Math)
            </button>
            <button
              onClick={() => {
                onReset();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Planner
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
