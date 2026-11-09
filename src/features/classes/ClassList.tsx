import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { SchoolClass } from '../../types';
import { api } from '../../services/api';
import { useStudent } from '../../hooks/useStudent';
import { ClassCard } from './ClassCard';
import { Button } from '../../components/ui/Button';
import {
  RotateCw,
  Search,
  Filter,
  Layers,
  Armchair,
  Clock,
  CheckCircle,
  AlertCircle,
  GraduationCap,
} from 'lucide-react';

interface ClassListProps {
  onViewMyApplications: () => void;
  onNavigateToAdmin: () => void;
}

export const ClassList: React.FC<ClassListProps> = ({
  onViewMyApplications,
  onNavigateToAdmin,
}) => {
  const { refreshMyHolds } = useStudent();
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<'all' | 'available' | 'full'>('all');

  const fetchClasses = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true);
    try {
      setErrorMsg(null);
      const data = await api.getClasses();
      setClasses(data || []);
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'Failed to connect to backend server. Make sure the API is running on port 8080.'
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let isCurrent = true;

    api.getClasses()
      .then((data) => {
        if (isCurrent) setClasses(data || []);
      })
      .catch((err) => {
        if (isCurrent) {
          setErrorMsg(
            err instanceof Error
              ? err.message
              : 'Failed to connect to backend server. Make sure the API is running on port 8080.'
          );
        }
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    // Auto-polling every 6 seconds to show dynamic hold expiry & real-time seat changes
    const interval = setInterval(() => {
      fetchClasses();
      refreshMyHolds();
    }, 6000);

    return () => {
      isCurrent = false;
      clearInterval(interval);
    };
  }, [fetchClasses, refreshMyHolds]);

  const handleHoldCreated = () => {
    fetchClasses();
    refreshMyHolds();
  };

  // Metrics summary
  const stats = useMemo(() => {
    return classes.reduce(
      (acc, c) => ({
        totalSeats: acc.totalSeats + c.totalSeats,
        availableSeats: acc.availableSeats + c.availableSeats,
        heldSeats: acc.heldSeats + c.heldSeats,
        confirmedSeats: acc.confirmedSeats + c.confirmedSeats,
      }),
      { totalSeats: 0, availableSeats: 0, heldSeats: 0, confirmedSeats: 0 }
    );
  }, [classes]);

  // Filtered classes
  const filteredClasses = useMemo(() => {
    return classes.filter((c) => {
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      if (filterType === 'available') return c.availableSeats > 0;
      if (filterType === 'full') return c.availableSeats <= 0;
      return true;
    });
  }, [classes, searchQuery, filterType]);

  return (
    <div className="space-y-8">
      {/* Top Hero / Stats Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold border border-indigo-500/20">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Real-Time Seat Allocation & Admission Control</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              School Admission Portal
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Explore available classes, inspect real-time seat counts, and reserve your seat instantly.
              Seats are held for 10 minutes to guarantee complete concurrency safety with no over-allocation.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="md"
              onClick={() => fetchClasses(true)}
              isLoading={isRefreshing}
              leftIcon={<RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />}
            >
              Refresh Seats
            </Button>
            <Button variant="emerald" size="md" onClick={onViewMyApplications}>
              My Applications
            </Button>
          </div>
        </div>

        {/* Global Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-8">
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Total Classes</span>
              <Layers className="w-4 h-4 text-indigo-400" />
            </div>
            <p className="text-2xl font-extrabold text-white mt-2">{classes.length}</p>
            <p className="text-[11px] text-slate-400 mt-1">Active grade divisions</p>
          </div>

          <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Available Seats</span>
              <Armchair className="w-4 h-4 text-indigo-400" />
            </div>
            <p className="text-2xl font-extrabold text-indigo-300 mt-2">
              {stats.availableSeats}{' '}
              <span className="text-xs font-normal text-slate-500">/ {stats.totalSeats}</span>
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Ready for application</p>
          </div>

          <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Active Holds</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl font-extrabold text-amber-400 mt-2">{stats.heldSeats}</p>
            <p className="text-[11px] text-slate-400 mt-1">10-minute hold window</p>
          </div>

          <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Confirmed Admissions</span>
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-extrabold text-emerald-400 mt-2">{stats.confirmedSeats}</p>
            <p className="text-[11px] text-slate-400 mt-1">Verified enrollments</p>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search class by name (e.g. Class 1, Class 10)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5 pl-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filterType === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({classes.length})
            </button>
            <button
              onClick={() => setFilterType('available')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filterType === 'available'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Available
            </button>
            <button
              onClick={() => setFilterType('full')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filterType === 'full'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Full
            </button>
          </div>
        </div>
      </div>

      {/* Error State */}
      {errorMsg && (
        <div className="p-5 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-rose-100">Unable to Fetch Class Data</h4>
              <p className="text-xs text-rose-300 mt-1">{errorMsg}</p>
            </div>
          </div>
          <Button variant="danger" size="sm" onClick={() => fetchClasses(true)}>
            Try Again
          </Button>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-64 rounded-2xl bg-slate-900/60 border border-slate-800/60 animate-pulse p-6 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="h-4 bg-slate-800 rounded w-1/3" />
                <div className="h-6 bg-slate-800 rounded w-2/3" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="h-16 bg-slate-800/80 rounded-xl" />
                <div className="h-16 bg-slate-800/80 rounded-xl" />
              </div>
              <div className="h-10 bg-slate-800 rounded-xl" />
            </div>
          ))}
        </div>
      )}

      {/* Class Cards Grid */}
      {!isLoading && filteredClasses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((item) => (
            <ClassCard
              key={item.id}
              schoolClass={item}
              onHoldCreated={handleHoldCreated}
              onViewMyApplications={onViewMyApplications}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !errorMsg && filteredClasses.length === 0 && (
        <div className="text-center py-16 px-4 bg-slate-900/40 border border-slate-800 rounded-3xl">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-800/60 flex items-center justify-center text-slate-400 mb-4">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white">No Classes Found</h3>
          <p className="text-sm text-slate-400 max-w-sm mx-auto mt-1">
            {searchQuery
              ? `No classes matching "${searchQuery}". Try a different keyword.`
              : 'No admission classes have been created yet. Head over to the Admin Portal to set up new classes.'}
          </p>
          {!searchQuery && (
            <Button
              variant="primary"
              size="md"
              className="mt-5"
              onClick={onNavigateToAdmin}
            >
              Go to Admin Portal
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
