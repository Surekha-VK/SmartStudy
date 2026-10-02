import React, { useState, useEffect, useMemo } from 'react';
import {
  Subject,
  StudyAvailability,
  DayPlan,
  PlanHealth,
  Recommendation,
} from './types/study';
import { Navbar, NavTab } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { SubjectForm } from './components/Setup/SubjectForm';
import { AvailabilityForm } from './components/Setup/AvailabilityForm';
import { TimetableOverview } from './components/Plan/TimetableOverview';
import { DashboardView } from './components/Dashboard/DashboardView';
import { RecommendationsView } from './components/Recommendations/RecommendationsView';
import { ToastContainer, ToastMessage } from './components/Common/Toast';
import { ConfirmModal } from './components/Common/ConfirmModal';

import { generateStudyTimetable } from './scheduler/timetableGenerator';
import { adaptRemainingPlan, auditMissedSessions } from './scheduler/adaptiveEngine';
import { calculatePlanHealth } from './services/healthService';
import { generateRecommendations } from './services/recommendationService';
import { loadSavedState, saveState, clearSavedState } from './services/storageService';
import { getDemoSubjects, DEFAULT_AVAILABILITY } from './data/demoData';

export function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [availability, setAvailability] = useState<StudyAvailability>(DEFAULT_AVAILABILITY);
  const [timetable, setTimetable] = useState<DayPlan[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load persisted state on mount
  useEffect(() => {
    const saved = loadSavedState();
    setSubjects(saved.subjects);
    setAvailability(saved.availability);
    setTimetable(saved.timetable);
    setIsInitialized(true);
  }, []);

  // Persist state changes
  useEffect(() => {
    if (!isInitialized) return;
    saveState({
      subjects,
      availability,
      timetable,
      lastGeneratedAt: new Date().toISOString(),
      lastAdjustedAt: null,
    });
  }, [subjects, availability, timetable, isInitialized]);

  // Toast utility
  const showToast = (text: string, type: 'success' | 'warning' | 'info' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Plan Health & Recommendations
  const health: PlanHealth = useMemo(() => {
    return calculatePlanHealth(timetable, subjects);
  }, [timetable, subjects]);

  const recommendations: Recommendation[] = useMemo(() => {
    return generateRecommendations(subjects, timetable, availability);
  }, [subjects, timetable, availability]);

  // Handlers
  const handleAddSubject = (newSubject: Subject) => {
    setSubjects((prev) => [...prev, newSubject]);
    showToast(`Added ${newSubject.name} (${newSubject.difficulty}, exam ${newSubject.examDate}).`, 'success');
  };

  const handleRemoveSubject = (subjectId: string) => {
    const sub = subjects.find((s) => s.id === subjectId);
    setSubjects((prev) => prev.filter((s) => s.id !== subjectId));
    // Regenerate timetable without removed subject if active
    if (timetable.length > 0) {
      const remaining = subjects.filter((s) => s.id !== subjectId);
      const updated = generateStudyTimetable(remaining, availability);
      setTimetable(updated);
    }
    showToast(`Removed subject ${sub?.name || ''}.`, 'info');
  };

  const handleGeneratePlan = () => {
    if (subjects.length === 0) {
      showToast('Please add at least one subject to generate your study timetable.', 'warning');
      return;
    }
    const newTimetable = generateStudyTimetable(subjects, availability);
    setTimetable(newTimetable);
    setCurrentTab('plan');
    showToast('Day-by-day revision schedule generated successfully! 📅', 'success');
  };

  const handleToggleComplete = (sessionId: string) => {
    setTimetable((prevDays) =>
      prevDays.map((day) => ({
        ...day,
        sessions: day.sessions.map((sess) => {
          if (sess.id === sessionId) {
            const nextCompleted = !sess.completed;
            return {
              ...sess,
              completed: nextCompleted,
              missed: nextCompleted ? false : sess.missed,
            };
          }
          return sess;
        }),
      }))
    );
  };

  const handleToggleMissed = (sessionId: string) => {
    setTimetable((prevDays) =>
      prevDays.map((day) => ({
        ...day,
        sessions: day.sessions.map((sess) => {
          if (sess.id === sessionId) {
            const nextMissed = !sess.missed;
            return {
              ...sess,
              missed: nextMissed,
              completed: nextMissed ? false : sess.completed,
            };
          }
          return sess;
        }),
      }))
    );
    showToast('Session status updated. Click "Recalculate Plan" to dynamically redistribute workload.', 'info');
  };

  const handleRecalculate = () => {
    const result = adaptRemainingPlan(timetable, subjects, availability);
    setTimetable(result.updatedTimetable);
    showToast(result.message, 'warning');
  };

  const handleLoadDemoData = () => {
    const demoSubjects = getDemoSubjects();
    const demoAvailability = DEFAULT_AVAILABILITY;
    const demoTimetable = generateStudyTimetable(demoSubjects, demoAvailability);

    setSubjects(demoSubjects);
    setAvailability(demoAvailability);
    setTimetable(demoTimetable);
    showToast('Loaded demo dataset: DBMS, COA, Python, and Mathematics! 🚀', 'success');
  };

  const handleConfirmReset = () => {
    const emptyState = clearSavedState();
    setSubjects(emptyState.subjects);
    setAvailability(emptyState.availability);
    setTimetable(emptyState.timetable);
    setCurrentTab('setup');
    showToast('Planner reset successfully.', 'info');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onLoadDemo={handleLoadDemoData}
        onReset={() => setIsResetModalOpen(true)}
        onRecalculate={handleRecalculate}
        health={health}
        subjectsCount={subjects.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentTab === 'home' && (
          <LandingPage
            onNavigate={setCurrentTab}
            onLoadDemo={handleLoadDemoData}
            hasPlan={timetable.length > 0}
          />
        )}

        {currentTab === 'setup' && (
          <div className="space-y-8 max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  Student Study Setup
                </h1>
                <p className="text-sm text-slate-500">
                  Configure your exam schedule, difficulty ratings, and daily study availability.
                </p>
              </div>

              {subjects.length > 0 && (
                <button
                  onClick={handleGeneratePlan}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl text-sm shadow-md transition cursor-pointer self-start sm:self-auto"
                >
                  Generate My Plan →
                </button>
              )}
            </div>

            <SubjectForm
              subjects={subjects}
              onAddSubject={handleAddSubject}
              onRemoveSubject={handleRemoveSubject}
              onLoadDemoSubjects={handleLoadDemoData}
            />

            <AvailabilityForm
              availability={availability}
              onChange={setAvailability}
              onGeneratePlan={handleGeneratePlan}
              canGenerate={subjects.length > 0}
              subjectsCount={subjects.length}
            />
          </div>
        )}

        {currentTab === 'plan' && (
          <TimetableOverview
            timetable={timetable}
            subjects={subjects}
            onToggleComplete={handleToggleComplete}
            onToggleMissed={handleToggleMissed}
            onRecalculate={handleRecalculate}
            onNavigateToSetup={() => setCurrentTab('setup')}
            missedCount={health.missedCount}
          />
        )}

        {currentTab === 'dashboard' && (
          <DashboardView
            subjects={subjects}
            timetable={timetable}
            health={health}
            onToggleComplete={handleToggleComplete}
            onToggleMissed={handleToggleMissed}
            onStartFocus={(session) => {
              // Switch to plan and open focus
              setCurrentTab('plan');
            }}
            onRecalculate={handleRecalculate}
            onNavigateToSetup={() => setCurrentTab('setup')}
          />
        )}

        {currentTab === 'recommendations' && (
          <RecommendationsView
            recommendations={recommendations}
            onRecalculate={handleRecalculate}
            onNavigateToSetup={() => setCurrentTab('setup')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-16 py-10 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-extrabold text-slate-900">
                  📚 Smart<span className="text-indigo-600">Study</span>
                </span>
                <span className="text-xs text-slate-400">| "Plan smarter. Study better."</span>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-md">
                Deterministic, priority-based study planner designed for multi-exam revision during college hackathons.
              </p>
            </div>

            <div className="flex items-center gap-6 text-xs text-slate-500 font-medium">
              <span>React 19</span>
              <span>•</span>
              <span>TypeScript</span>
              <span>•</span>
              <span>Vite</span>
              <span>•</span>
              <span>Tailwind CSS</span>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
            <span>© 2026 SmartStudy Project Team. Built for the College Hackathon.</span>
            <span>Local persistence enabled • Zero third-party telemetry</span>
          </div>
        </div>
      </footer>

      {/* Modals & Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <ConfirmModal
        isOpen={isResetModalOpen}
        title="Reset Study Planner?"
        message="Are you sure you want to reset your study planner? This will clear all configured subjects, study availability preferences, and generated timetables from your browser."
        confirmLabel="Reset Everything"
        cancelLabel="Keep My Plan"
        isDestructive={true}
        onConfirm={handleConfirmReset}
        onCancel={() => setIsResetModalOpen(false)}
      />
    </div>
  );
}

export default App;
