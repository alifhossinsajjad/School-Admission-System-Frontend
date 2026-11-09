import React, { useState, useEffect, useMemo } from 'react';
import { useStudent } from '@/hooks/useStudent';
import { HoldDetailCard } from './HoldDetailCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatBRN } from '@/utils';
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
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-2">
            <UserCheck className="w-4 h-4" />
            <span>Student Admission Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Applications & Reservations
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Tracking applications for <strong className="text-slate-900">{student.name}</strong> (BRN:{' '}
            <span className="font-mono text-indigo-600 font-semibold">{formatBRN(student.id)}</span>)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="default"
            onClick={handleManualRefresh}
            isLoading={isRefreshing || isLoadingHolds}
            leftIcon={<RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />}
          >
            Refresh Status
          </Button>
          <Button variant="default" size="default" onClick={onBrowseClasses} leftIcon={<BookOpen className="w-4 h-4" />}>
            Browse Classes
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-4 overflow-x-auto">
        <button
          onClick={() => setFilter('all')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            filter === 'all'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Inbox className="w-4 h-4" />
          <span>All Applications ({myHolds.length})</span>
        </button>

        <button
          onClick={() => setFilter('HELD')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            filter === 'HELD'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Active Holds ({activeCount})</span>
        </button>

        <button
          onClick={() => setFilter('CONFIRMED')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            filter === 'CONFIRMED'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Confirmed ({confirmedCount})</span>
        </button>

        <button
          onClick={() => setFilter('HISTORY')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            filter === 'HISTORY'
              ? 'bg-slate-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
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
        <Card className="text-center py-16 px-4 bg-white border-slate-200">
          <CardContent>
            <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
              <Inbox className="w-7 h-7 text-indigo-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No Applications Found</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1">
              {filter === 'all'
                ? "You haven't submitted any admission applications yet. Browse active classes to reserve a seat."
                : `No applications found with status filter "${filter}".`}
            </p>
            <Button variant="default" size="default" className="mt-5" onClick={onBrowseClasses}>
              Explore Available Classes
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
