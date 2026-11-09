import React from 'react';
import type { ViewType } from '@/types';
import { useStudent } from '@/hooks/useStudent';
import { GraduationCap, BookOpen, Clock, ShieldCheck } from 'lucide-react';
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
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo & Branding */}
          <div
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={() => onViewChange('classes')}
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-slate-900 tracking-tight">EduAdmit</span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                School Admission & Enrollment Portal
              </p>
            </div>
          </div>

          {/* Navigation Tabs (Clean SaaS style) */}
          <nav className="hidden md:flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200">
            {navItems.map((item) => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span
                      className={`ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full ${
                        isActive
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-amber-500 text-white'
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
        <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-200 gap-1">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`relative flex-1 flex flex-col items-center gap-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <div className="relative">
                  {item.icon}
                  {item.badge !== undefined && (
                    <span className="absolute -top-1.5 -right-2 w-4 h-4 flex items-center justify-center text-[9px] font-bold rounded-full bg-amber-500 text-white">
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
