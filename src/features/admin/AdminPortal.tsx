import React, { useState, useEffect, useCallback } from 'react';
import type { SchoolClass } from '@/types';
import { api, ApiError } from '@/services/api';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  ShieldCheck,
  PlusCircle,
  RotateCw,
  Layers,
  GraduationCap,
  Clock,
  CheckCircle2,
  Users,
  AlertCircle,
  FileCheck,
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

  // Summary Metrics
  const totalSchoolSeats = classes.reduce((acc, c) => acc + c.totalSeats, 0);
  const totalConfirmed = classes.reduce((acc, c) => acc + c.confirmedSeats, 0);
  const totalHeld = classes.reduce((acc, c) => acc + c.heldSeats, 0);
  const totalAvailable = classes.reduce((acc, c) => acc + c.availableSeats, 0);

  return (
    <div className="space-y-8">
      {/* Admin Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4" />
            <span>School Authority Administration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Class Capacity & Admissions Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure seat quotas, monitor real-time admission numbers, and oversee school-wide enrollment.
          </p>
        </div>

        <Button
          variant="outline"
          size="default"
          onClick={() => fetchClasses(true)}
          isLoading={isRefreshing || isLoading}
          leftIcon={<RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />}
        >
          Refresh Data
        </Button>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white border-slate-200">
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>Total Grade Divisions</span>
              <Layers className="w-4 h-4 text-indigo-600" />
            </div>
            <p className="text-2xl font-extrabold text-slate-900 mt-2">{classes.length}</p>
            <p className="text-xs text-slate-500 mt-1">Active class sections</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200">
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>Total School Capacity</span>
              <GraduationCap className="w-4 h-4 text-indigo-600" />
            </div>
            <p className="text-2xl font-extrabold text-slate-900 mt-2">{totalSchoolSeats}</p>
            <p className="text-xs text-slate-500 mt-1">Approved total seats</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200">
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>Confirmed Admissions</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-extrabold text-emerald-600 mt-2">{totalConfirmed}</p>
            <p className="text-xs text-slate-500 mt-1">Official enrolled students</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200">
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>Pending Seat Holds</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-2xl font-extrabold text-amber-600 mt-2">{totalHeld}</p>
            <p className="text-xs text-slate-500 mt-1">10-minute hold window</p>
          </CardContent>
        </Card>
      </div>

      {/* Grid: Create Class & Real-world Operational Guidelines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Class Form Card */}
        <Card className="lg:col-span-1 bg-white border-slate-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-indigo-600" />
              <CardTitle className="text-lg">Create New Class</CardTitle>
            </div>
            <CardDescription>
              Set up a new grade or section with a defined student seat quota.
            </CardDescription>
          </CardHeader>

          <CardContent>
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
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Quick Grade Presets
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
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-medium text-slate-700 transition-colors cursor-pointer border border-slate-200"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                variant="default"
                className="w-full mt-2"
                isLoading={isSubmitting}
                leftIcon={<PlusCircle className="w-4 h-4" />}
              >
                Create Admission Class
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Real-World School Admission Policy & Guidelines Card */}
        <Card className="lg:col-span-2 bg-white border-slate-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-indigo-600" />
              <CardTitle className="text-lg">Seat Allocation & Admission Policies</CardTitle>
            </div>
            <CardDescription>
              Operational standards governing student seat reservations and enrollment confirmation.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  <span>10-Minute Hold Window</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  When a student reserves a seat, it is temporarily locked for 10 minutes to allow fee payment.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Single Hold Restriction</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Each student (17-digit BRN) is limited to 1 active hold per class to eliminate seat hoarding.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-2 text-amber-700 font-bold text-xs">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span>Auto Seat Recovery</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  If an application is not confirmed within 10 minutes, the seat automatically returns to the open pool.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-100 flex items-center justify-between text-xs text-slate-700">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                <span>
                  Total Open Seats Available Across All Grades: <strong className="text-indigo-700 font-bold">{totalAvailable}</strong>
                </span>
              </div>
              <Badge variant="outline" className="bg-white border-indigo-200 text-indigo-700 font-medium">
                Live Status
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Class Capacity Table Card */}
      <Card className="bg-white border-slate-200 overflow-hidden shadow-xs">
        <CardHeader className="border-b border-slate-200 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              <CardTitle className="text-base">Grade Divisions & Quota Breakdown</CardTitle>
            </div>
            <span className="text-xs text-slate-500">Live Database Counters</span>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {classes.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3.5">Class / Section</th>
                    <th className="px-5 py-3.5">Total Capacity</th>
                    <th className="px-5 py-3.5">Available</th>
                    <th className="px-5 py-3.5">Pending Holds</th>
                    <th className="px-5 py-3.5">Confirmed</th>
                    <th className="px-5 py-3.5 min-w-[180px]">Fill Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {classes.map((cls) => {
                    const booked = cls.confirmedSeats + cls.heldSeats;
                    const fillPct = cls.totalSeats > 0 ? Math.round((booked / cls.totalSeats) * 100) : 0;
                    return (
                      <tr key={cls.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-5 py-4 font-semibold text-slate-900">
                          {cls.name}
                          <span className="block font-mono text-[10px] text-slate-400">ID: {cls.id.slice(0, 8)}...</span>
                        </td>
                        <td className="px-5 py-4 font-bold text-slate-800">{cls.totalSeats}</td>
                        <td className="px-5 py-4 font-bold text-indigo-600">{cls.availableSeats}</td>
                        <td className="px-5 py-4 font-bold text-amber-600">{cls.heldSeats}</td>
                        <td className="px-5 py-4 font-bold text-emerald-600">{cls.confirmedSeats}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex-1">
                              <Progress value={fillPct} className="h-2" />
                            </div>
                            <span className="font-semibold text-xs text-slate-700 w-10 text-right">
                              {fillPct}%
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
              No classes created yet. Use the form above to add your first admission class.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
