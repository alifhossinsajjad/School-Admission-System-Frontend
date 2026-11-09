import React, { useState, useEffect, useCallback } from 'react';
import type { SchoolClass } from '../../types';
import { api, ApiError } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ClassSeatProgressBar } from '../classes/ClassSeatProgressBar';
import {
  ShieldCheck,
  PlusCircle,
  RotateCw,
  Layers,
  Database,
  Lock,
  Timer,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export const AdminPortal: React.FC = () => {
  const { success, error } = useToast();

  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Create Class Form
  const [className, setClassName] = useState('');
  const [totalSeats, setTotalSeats] = useState<number | ''>(60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchClasses = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const data = await api.getClasses();
      setClasses(data || []);
    } catch (err) {
      error(
        'Backend Error',
        err instanceof Error ? err.message : 'Failed to fetch class list from backend.'
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [error]);

  useEffect(() => {
    let isCurrent = true;

    api.getClasses()
      .then((data) => {
        if (isCurrent) setClasses(data || []);
      })
      .catch((err) => {
        if (isCurrent) {
          error(
            'Backend Error',
            err instanceof Error ? err.message : 'Failed to fetch class list from backend.'
          );
        }
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    const interval = setInterval(() => fetchClasses(), 6000);
    return () => {
      isCurrent = false;
      clearInterval(interval);
    };
  }, [fetchClasses, error]);

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = className.trim();
    if (!name || name.length < 2) {
      setFormError('Class name must be at least 2 characters.');
      return;
    }
    if (typeof totalSeats !== 'number' || totalSeats <= 0) {
      setFormError('Total seats must be a positive integer greater than zero.');
      return;
    }

    setFormError('');
    setIsSubmitting(true);
    try {
      const newClass = await api.createClass({ name, totalSeats });
      success('Class Created Successfully', `Created "${newClass.name}" with ${newClass.totalSeats} seats.`);
      setClassName('');
      setTotalSeats(60);
      fetchClasses(true);
    } catch (err) {
      if (err instanceof ApiError) {
        error('Failed to Create Class', err.message);
      } else {
        error('Error', 'An unexpected error occurred while creating the class.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickPreset = (name: string, seats: number) => {
    setClassName(name);
    setTotalSeats(seats);
    setFormError('');
  };

  return (
    <div className="space-y-8">
      {/* Admin Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4" />
            <span>School Authority Administration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Class Capacity & Admissions Management
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Configure seat quotas, monitor real-time database locks, and oversee school-wide admission statistics.
          </p>
        </div>

        <Button
          variant="outline"
          size="md"
          onClick={() => fetchClasses(true)}
          isLoading={isRefreshing || isLoading}
          leftIcon={<RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />}
        >
          Refresh Data
        </Button>
      </div>

      {/* Grid: Create Class & Architecture Invariants */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Class Form */}
        <div className="lg:col-span-1 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <PlusCircle className="w-5 h-5 text-indigo-400" />
              <h3 className="text-lg font-bold text-white">Create New Class</h3>
            </div>

            <form onSubmit={handleCreateClass} className="space-y-4">
              <Input
                label="Class / Grade Name"
                placeholder="e.g. Class 1 (Section A)"
                value={className}
                onChange={(e) => {
                  setClassName(e.target.value);
                  setFormError('');
                }}
              />

              <Input
                label="Total Seat Capacity"
                type="number"
                min={1}
                max={10000}
                placeholder="e.g. 60"
                value={totalSeats}
                onChange={(e) => {
                  const val = e.target.value ? parseInt(e.target.value, 10) : '';
                  setTotalSeats(val);
                  setFormError('');
                }}
                error={formError}
              />

              {/* Quick Presets */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Quick Presets
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: 'Class 6 (60)', name: 'Class 6', seats: 60 },
                    { label: 'Class 9 (80)', name: 'Class 9', seats: 80 },
                    { label: 'Class 11 (120)', name: 'Class 11 (Science)', seats: 120 },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => handleQuickPreset(preset.name, preset.seats)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-slate-300 transition-colors cursor-pointer border border-slate-700/60"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  isLoading={isSubmitting}
                  leftIcon={<PlusCircle className="w-4 h-4" />}
                >
                  Create Admission Class
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Backend Invariants & Architecture Card */}
        <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 to-indigo-950/40 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Database className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-bold text-white">System Architecture & Concurrency Rules</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              The underlying .NET 8 + PostgreSQL backend enforces mathematical invariants directly inside atomic transactions:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Row-Level Lock</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-normal">
                  <code className="text-indigo-300">SELECT ... FOR UPDATE</code> locks class rows exclusively. Concurrent applicants wait in queue; overselling is impossible.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Invariant Check</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Guaranteed: <code className="text-emerald-300">held + confirmed &lt;= total</code>. If full, returns HTTP 409 Conflict immediately.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                  <Timer className="w-3.5 h-3.5" />
                  <span>Auto-Expiry (10m)</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Holds expire automatically when <code className="text-amber-300">expiresAt &lt;= UtcNow</code>. Seats return to pool with zero external API calls.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Multi-instance load balancing safe across separate processes</span>
            </span>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              PostgreSQL ACID
            </span>
          </div>
        </div>
      </div>

      {/* Classes Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">All Active Classes ({classes.length})</h3>
          </div>
          <span className="text-xs text-slate-400">Real-time database state</span>
        </div>

        {classes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[11px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Class Name</th>
                  <th className="px-5 py-3.5">Total Seats</th>
                  <th className="px-5 py-3.5">Available</th>
                  <th className="px-5 py-3.5">Held (Pending)</th>
                  <th className="px-5 py-3.5">Confirmed</th>
                  <th className="px-5 py-3.5 min-w-[200px]">Allocation Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {classes.map((cls) => {
                  const booked = cls.confirmedSeats + cls.heldSeats;
                  const bookedPct = cls.totalSeats > 0 ? Math.round((booked / cls.totalSeats) * 100) : 0;
                  return (
                    <tr key={cls.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-4 font-semibold text-white">
                        {cls.name}
                        <span className="block font-mono text-[10px] text-slate-500">{cls.id}</span>
                      </td>
                      <td className="px-5 py-4 font-bold text-slate-200">{cls.totalSeats}</td>
                      <td className="px-5 py-4 font-bold text-indigo-400">{cls.availableSeats}</td>
                      <td className="px-5 py-4 font-bold text-amber-400">{cls.heldSeats}</td>
                      <td className="px-5 py-4 font-bold text-emerald-400">{cls.confirmedSeats}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <ClassSeatProgressBar schoolClass={cls} showLegend={false} />
                          </div>
                          <span className="font-semibold text-xs text-slate-300 w-10 text-right">
                            {bookedPct}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400">
            No classes available. Use the form above to create the first class.
          </div>
        )}
      </div>
    </div>
  );
};
