import React, { useState, useEffect, useCallback } from 'react';
import type { ViewType } from './types';
import { ToastProvider } from './context/ToastContext';
import { StudentProvider } from './context/StudentContext';
import { Navbar } from './components/navigation/Navbar';
import { ClassList } from './features/classes/ClassList';
import { MyApplications } from './features/holds/MyApplications';
import { AdminPortal } from './features/admin/AdminPortal';
import { GraduationCap, Database, Sparkles } from 'lucide-react';

export const AppContent: React.FC = () => {
  // Manual URL hash-based routing for full control, zero reload, and back/forward browser support
  const getInitialView = (): ViewType => {
    const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase();
    if (hash === 'my-applications' || hash === 'applications') return 'my-applications';
    if (hash === 'admin' || hash === 'admin-portal') return 'admin';
    return 'classes';
  };

  const [currentView, setCurrentView] = useState<ViewType>(getInitialView);

  const handleViewChange = useCallback((view: ViewType) => {
    setCurrentView(view);
    window.location.hash = `#/${view}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Listen to browser back/forward navigation
  useEffect(() => {
    const handleHashChange = () => {
      setCurrentView(getInitialView());
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar currentView={currentView} onViewChange={handleViewChange} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'classes' && (
          <ClassList
            onViewMyApplications={() => handleViewChange('my-applications')}
            onNavigateToAdmin={() => handleViewChange('admin')}
          />
        )}

        {currentView === 'my-applications' && (
          <MyApplications onBrowseClasses={() => handleViewChange('classes')} />
        )}

        {currentView === 'admin' && <AdminPortal />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/90 py-8 px-4 sm:px-6 lg:px-8 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-indigo-400" />
            <span className="font-semibold text-slate-300">School Admission System</span>
            <span>• Concurrency-Safe SaaS Frontend</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
              <Database className="w-3 h-3 text-emerald-400" /> PostgreSQL Row Locks
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
              <Sparkles className="w-3 h-3 text-indigo-400" /> React 19 + Vite + Tailwind v4
            </span>
          </div>

          <div className="text-slate-500">
            Engineered for <span className="text-slate-400 font-medium">OnnoRokom Projukti Limited</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <StudentProvider>
        <AppContent />
      </StudentProvider>
    </ToastProvider>
  );
}
