import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { SchoolClass } from '@/types';
import { api } from '@/services/api';
import { useStudent } from '@/hooks/useStudent';
import { ClassCard } from './ClassCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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

    // Auto-polling every 6 seconds to update real-time seat numbers
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
      {/* Hero Welcome Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-200">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Academic Admission Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Apply for Grade Admission
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              Explore available classes and reserve your admission seat in real-time. Once reserved,
              your seat is held for 10 minutes to allow you to confirm enrollment.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="default"
              onClick={() => fetchClasses(true)}
              isLoading={isRefreshing}
              leftIcon={<RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />}
            >
              Refresh Seats
            </Button>
            <Button variant="default" size="default" onClick={onViewMyApplications}>
              My Applications
            </Button>
          </div>
        </div>

        {/* Metric Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>Grade Divisions</span>
              <Layers className="w-4 h-4 text-indigo-600" />
            </div>
            <p className="text-2xl font-extrabold text-slate-900 mt-2">{classes.length}</p>
            <p className="text-xs text-slate-400 mt-1">Active class sections</p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>Open Seats</span>
              <Armchair className="w-4 h-4 text-indigo-600" />
            </div>
            <p className="text-2xl font-extrabold text-indigo-600 mt-2">
              {stats.availableSeats}{' '}
              <span className="text-xs font-normal text-slate-400">/ {stats.totalSeats}</span>
            </p>
            <p className="text-xs text-slate-400 mt-1">Available for application</p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>Active Holds</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-2xl font-extrabold text-amber-600 mt-2">{stats.heldSeats}</p>
            <p className="text-xs text-slate-400 mt-1">Temporary 10m holds</p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>Confirmed Admissions</span>
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-extrabold text-emerald-600 mt-2">{stats.confirmedSeats}</p>
            <p className="text-xs text-slate-400 mt-1">Officially enrolled</p>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search grade or class (e.g. Class 1, Class 9)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-semibold flex items-center gap-1.5 pl-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filterType === 'all'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({classes.length})
            </button>
            <button
              onClick={() => setFilterType('available')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filterType === 'available'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Available
            </button>
            <button
              onClick={() => setFilterType('full')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filterType === 'full'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Full
            </button>
          </div>
        </div>
      </div>

      {/* Error State */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-rose-900">Unable to Fetch Class Data</h4>
              <p className="text-xs text-rose-700 mt-0.5">{errorMsg}</p>
            </div>
          </div>
          <Button variant="destructive" size="sm" onClick={() => fetchClasses(true)}>
            Try Again
          </Button>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="bg-white border-slate-200 animate-pulse p-6 h-64 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="h-4 bg-slate-200 rounded w-1/3" />
                <div className="h-6 bg-slate-200 rounded w-2/3" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="h-16 bg-slate-100 rounded-xl" />
                <div className="h-16 bg-slate-100 rounded-xl" />
              </div>
              <div className="h-10 bg-slate-200 rounded-xl" />
            </Card>
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
        <Card className="text-center py-16 px-4 bg-white border-slate-200">
          <CardContent>
            <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
              <GraduationCap className="w-7 h-7 text-indigo-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No Admission Classes Found</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1">
              {searchQuery
                ? `No classes matching "${searchQuery}". Try a different keyword.`
                : 'No admission classes are currently active. Head over to the Admin Portal to set up new classes.'}
            </p>
            {!searchQuery && (
              <Button
                variant="default"
                size="default"
                className="mt-5"
                onClick={onNavigateToAdmin}
              >
                Go to Admin Portal
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
