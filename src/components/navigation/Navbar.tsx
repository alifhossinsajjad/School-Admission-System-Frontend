import React from 'react';
import type { ViewType } from '../../types';
import { useStudent } from '../../hooks/useStudent';
import { GraduationCap, BookOpen, Clock, ShieldCheck, Sparkles } from 'lucide-react';
import { StudentIdentityBar } from './StudentIdentityBar';

interface NavbarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onViewChange }) => {
  const { myHolds } = useStudent();
  const activeHoldsCount = myHolds.filter((h) => h.status === 'HELD').length;

  const navItems: { id: ViewType; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'classes',
      label: 'Admission Classes',
      icon: <BookOpen className="w-4 h-4" />,
    },
    {
      id: 'my-applications',
      label: 'My Applications',
      icon: <Clock className="w-4 h-4" />,
      badge: activeHoldsCount > 0 ? activeHoldsCount : undefined,
    },
    {
      id: 'admin',
      label: 'Admin Portal',
      icon: <ShieldCheck className="w-4 h-4" />,
    },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onViewChange('classes')}>
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 p-0.5 shadow-lg shadow-indigo-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-white tracking-tight">EduAdmit</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Sparkles className="w-2.5 h-2.5" /> High-Concurrency
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                School Admission & Seat Allocation System
              </p>
            </div>
          </div>

          {/* Navigation Tabs (Manual Route Switcher) */}
          <nav className="hidden md:flex items-center gap-1.5 p-1 bg-slate-900/90 rounded-2xl border border-slate-800/90 shadow-inner">
            {navItems.map((item) => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span
                      className={`ml-1 px-1.5 py-0.5 text-[10px] font-extrabold rounded-full ${
                        isActive
                          ? 'bg-white text-indigo-700'
                          : 'bg-amber-500 text-slate-950 animate-pulse'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Student Identity Pill */}
          <div className="shrink-0">
            <StudentIdentityBar />
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="md:hidden flex items-center justify-around py-2.5 border-t border-slate-800/60 gap-1">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`relative flex-1 flex flex-col items-center gap-1 py-1.5 px-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="relative">
                  {item.icon}
                  {item.badge !== undefined && (
                    <span className="absolute -top-1.5 -right-2 w-4 h-4 flex items-center justify-center text-[9px] font-extrabold rounded-full bg-amber-500 text-slate-950">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
