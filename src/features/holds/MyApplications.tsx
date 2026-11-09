import React, { useState, useEffect, useMemo } from 'react';
import { useStudent } from '../../hooks/useStudent';
import { HoldDetailCard } from './HoldDetailCard';
import { Button } from '../../components/ui/Button';
import { formatBRN } from '../../utils';
import {
  Clock,
  RotateCw,
  BookOpen,
  UserCheck,
  CheckCircle2,
  AlertOctagon,
  Inbox,
} from 'lucide-react';

interface MyApplicationsProps {
  onBrowseClasses: () => void;
}

export const MyApplications: React.FC<MyApplicationsProps> = ({ onBrowseClasses }) => {
  const { student, myHolds, isLoadingHolds, refreshMyHolds } = useStudent();
  const [filter, setFilter] = useState<'all' | 'HELD' | 'CONFIRMED' | 'HISTORY'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    refreshMyHolds();

    // Poll every 5 seconds for live status updates on active holds
    const interval = setInterval(() => {
      refreshMyHolds();
    }, 5000);

    return () => clearInterval(interval);
  }, [refreshMyHolds]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refreshMyHolds();
    setIsRefreshing(false);
  };

  const filteredHolds = useMemo(() => {
    return myHolds.filter((h) => {
      if (filter === 'HELD') return h.status === 'HELD';
      if (filter === 'CONFIRMED') return h.status === 'CONFIRMED';
      if (filter === 'HISTORY') return h.status === 'EXPIRED' || h.status === 'CANCELLED';
      return true;
    });
  }, [myHolds, filter]);

  const activeCount = myHolds.filter((h) => h.status === 'HELD').length;
  const confirmedCount = myHolds.filter((h) => h.status === 'CONFIRMED').length;
  const historyCount = myHolds.filter((h) => h.status === 'EXPIRED' || h.status === 'CANCELLED').length;

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">
            <UserCheck className="w-4 h-4" />
            <span>Student Dashboard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            My Applications & Reservations
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Tracking applications for <strong className="text-slate-200">{student.name}</strong> (BRN:{' '}
            <span className="font-mono text-indigo-300">{formatBRN(student.id)}</span>)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="md"
            onClick={handleManualRefresh}
            isLoading={isRefreshing || isLoadingHolds}
            leftIcon={<RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />}
          >
            Refresh Status
          </Button>
          <Button variant="primary" size="md" onClick={onBrowseClasses} leftIcon={<BookOpen className="w-4 h-4" />}>
            Browse Classes
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800/80 pb-4 overflow-x-auto">
        <button
          onClick={() => setFilter('all')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            filter === 'all'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Inbox className="w-4 h-4" />
          <span>All ({myHolds.length})</span>
        </button>

        <button
          onClick={() => setFilter('HELD')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            filter === 'HELD'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Active Holds ({activeCount})</span>
        </button>

        <button
          onClick={() => setFilter('CONFIRMED')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            filter === 'CONFIRMED'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Confirmed ({confirmedCount})</span>
        </button>

        <button
          onClick={() => setFilter('HISTORY')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            filter === 'HISTORY'
              ? 'bg-slate-700 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <AlertOctagon className="w-4 h-4" />
          <span>Expired / Cancelled ({historyCount})</span>
        </button>
      </div>

      {/* Grid of Applications */}
      {filteredHolds.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHolds.map((hold) => (
            <HoldDetailCard key={hold.holdId} hold={hold} onRefresh={refreshMyHolds} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-4 bg-slate-900/40 border border-slate-800 rounded-3xl">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-800/60 flex items-center justify-center text-slate-400 mb-4">
            <Inbox className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white">No Applications Found</h3>
          <p className="text-sm text-slate-400 max-w-sm mx-auto mt-1">
            {filter === 'all'
              ? "You haven't submitted any admission holds yet. Browse our active classes to reserve a seat."
              : `No applications found with status filter "${filter}".`}
          </p>
          <Button variant="primary" size="md" className="mt-5" onClick={onBrowseClasses}>
            Explore Available Classes
          </Button>
        </div>
      )}
    </div>
  );
};
