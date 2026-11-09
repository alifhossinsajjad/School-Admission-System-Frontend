import React, { useState } from 'react';
import type { SchoolClass } from '../../types';
import { useStudent } from '../../hooks/useStudent';
import { useToast } from '../../hooks/useToast';
import { api, ApiError } from '../../services/api';
import { ClassSeatProgressBar } from './ClassSeatProgressBar';
import { Button } from '../../components/ui/Button';
import { Users, Armchair, Sparkles, CheckCircle2, Clock } from 'lucide-react';

interface ClassCardProps {
  schoolClass: SchoolClass;
  onHoldCreated: () => void;
  onViewMyApplications: () => void;
}

export const ClassCard: React.FC<ClassCardProps> = ({
  schoolClass,
  onHoldCreated,
  onViewMyApplications,
}) => {
  const { student, myHolds } = useStudent();
  const { success, error, warning } = useToast();
  const [isReserving, setIsReserving] = useState(false);

  // Check if current student has an active hold or confirmed seat in this class
  const existingHold = myHolds.find(
    (h) => h.classId === schoolClass.id && (h.status === 'HELD' || h.status === 'CONFIRMED')
  );

  const isFull = schoolClass.availableSeats <= 0;

  const handleApplyHold = async () => {
    if (!student.id) {
      warning('Student ID Missing', 'Please select or enter a student birth registration number.');
      return;
    }

    if (existingHold) {
      warning(
        'Already Applied',
        existingHold.status === 'CONFIRMED'
          ? 'You already have confirmed admission in this class.'
          : 'You already have an active hold in this class. Please confirm or cancel it first.'
      );
      onViewMyApplications();
      return;
    }

    setIsReserving(true);
    try {
      await api.createHold(schoolClass.id, student.id);
      success(
        'Seat Held Successfully!',
        `Seat reserved in ${schoolClass.name}. You have 10 minutes to confirm admission.`
      );
      onHoldCreated();
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          error('Application Conflict (409)', err.message);
        } else if (err.status === 400) {
          error('Invalid Request (400)', err.message);
        } else {
          error('Reservation Failed', err.message);
        }
      } else {
        error('Reservation Failed', 'An unexpected error occurred while reserving your seat.');
      }
    } finally {
      setIsReserving(false);
    }
  };

  return (
    <div className="relative bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl hover:border-slate-700/80 transition-all duration-300 flex flex-col justify-between group backdrop-blur-sm">
      {/* Top Header */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/20">
              Grade / Division
            </span>
            <h3 className="text-xl font-bold text-white mt-1.5 tracking-tight group-hover:text-indigo-300 transition-colors">
              {schoolClass.name}
            </h3>
          </div>

          {/* Status Badge */}
          {existingHold ? (
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                existingHold.status === 'CONFIRMED'
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                  : 'bg-amber-500/15 text-amber-300 border-amber-500/30 animate-pulse'
              }`}
            >
              {existingHold.status === 'CONFIRMED' ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" /> Enrolled
                </>
              ) : (
                <>
                  <Clock className="w-3.5 h-3.5" /> Hold Active
                </>
              )}
            </span>
          ) : isFull ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">
              Class Full
            </span>
          ) : schoolClass.availableSeats <= 5 ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 animate-pulse">
              Only {schoolClass.availableSeats} Left
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              Available
            </span>
          )}
        </div>

        {/* Seat Counters Grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Armchair className="w-3.5 h-3.5 text-indigo-400" />
              <span>Available Seats</span>
            </div>
            <p className="text-xl font-extrabold text-white mt-1">
              {schoolClass.availableSeats}{' '}
              <span className="text-xs font-normal text-slate-500">/ {schoolClass.totalSeats}</span>
            </p>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span>Confirmed</span>
            </div>
            <p className="text-xl font-extrabold text-emerald-400 mt-1">
              {schoolClass.confirmedSeats}
            </p>
          </div>
        </div>

        {/* Multi-segment Seat Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="text-slate-400 font-medium">Seat Allocation</span>
            <span className="text-slate-300 font-semibold">
              {Math.round(((schoolClass.confirmedSeats + schoolClass.heldSeats) / schoolClass.totalSeats) * 100)}% Booked
            </span>
          </div>
          <ClassSeatProgressBar schoolClass={schoolClass} />
        </div>
      </div>

      {/* Action CTA */}
      <div className="pt-2 border-t border-slate-800/60">
        {existingHold ? (
          <Button
            variant="outline"
            className="w-full text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/10"
            onClick={onViewMyApplications}
            leftIcon={<Clock className="w-4 h-4 text-amber-400" />}
          >
            {existingHold.status === 'CONFIRMED' ? 'View Confirmed Admission' : 'View & Complete Hold'}
          </Button>
        ) : (
          <Button
            variant={isFull ? 'secondary' : 'primary'}
            disabled={isFull}
            isLoading={isReserving}
            onClick={handleApplyHold}
            className="w-full"
            leftIcon={<Sparkles className="w-4 h-4" />}
          >
            {isFull ? 'No Seats Available' : 'Apply / Reserve Seat (Hold)'}
          </Button>
        )}
      </div>
    </div>
  );
};
