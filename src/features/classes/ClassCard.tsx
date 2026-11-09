import React, { useState } from 'react';
import type { SchoolClass } from '@/types';
import { useStudent } from '@/hooks/useStudent';
import { useToast } from '@/hooks/useToast';
import { api, ApiError } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  const bookedSeats = schoolClass.confirmedSeats + schoolClass.heldSeats;
  const fillPct = schoolClass.totalSeats > 0 ? Math.round((bookedSeats / schoolClass.totalSeats) * 100) : 0;

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
        'Seat Reserved Successfully!',
        `Your seat in ${schoolClass.name} is held for 10 minutes. Please confirm admission.`
      );
      onHoldCreated();
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          error('Application Conflict', err.message);
        } else if (err.status === 400) {
          error('Invalid Request', err.message);
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
    <Card className="bg-white border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
      <div>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                Grade Division
              </span>
              <CardTitle className="text-xl text-slate-900 mt-2">
                {schoolClass.name}
              </CardTitle>
            </div>

            {/* Status Badge */}
            {existingHold ? (
              <Badge
                variant={existingHold.status === 'CONFIRMED' ? 'emerald' : 'amber'}
                className="gap-1.5"
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
              </Badge>
            ) : isFull ? (
              <Badge variant="destructive">Class Full</Badge>
            ) : schoolClass.availableSeats <= 5 ? (
              <Badge variant="amber">Only {schoolClass.availableSeats} Left</Badge>
            ) : (
              <Badge variant="emerald">Seats Available</Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Seat Counters Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <Armchair className="w-3.5 h-3.5 text-indigo-600" />
                <span>Available Seats</span>
              </div>
              <p className="text-xl font-extrabold text-slate-900 mt-1">
                {schoolClass.availableSeats}{' '}
                <span className="text-xs font-normal text-slate-400">/ {schoolClass.totalSeats}</span>
              </p>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <Users className="w-3.5 h-3.5 text-emerald-600" />
                <span>Confirmed</span>
              </div>
              <p className="text-xl font-extrabold text-emerald-600 mt-1">
                {schoolClass.confirmedSeats}
              </p>
            </div>
          </div>

          {/* Seat Progress Gauge */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-medium">Quota Filled</span>
              <span className="text-slate-700 font-bold">{fillPct}%</span>
            </div>
            <Progress value={fillPct} className="h-2" />
            <div className="flex justify-between text-[11px] text-slate-500 pt-0.5">
              <span>{schoolClass.heldSeats} in pending holds</span>
              <span>{schoolClass.availableSeats} open</span>
            </div>
          </div>
        </CardContent>
      </div>

      <CardFooter className="pt-2 border-t border-slate-100">
        {existingHold ? (
          <Button
            variant="outline"
            className="w-full text-indigo-600 border-indigo-200 hover:bg-indigo-50"
            onClick={onViewMyApplications}
            leftIcon={<Clock className="w-4 h-4 text-amber-500" />}
          >
            {existingHold.status === 'CONFIRMED' ? 'View Enrollment' : 'Complete Admission'}
          </Button>
        ) : (
          <Button
            variant={isFull ? 'secondary' : 'default'}
            disabled={isFull}
            isLoading={isReserving}
            onClick={handleApplyHold}
            className="w-full"
            leftIcon={<Sparkles className="w-4 h-4" />}
          >
            {isFull ? 'Class Fully Booked' : 'Apply / Reserve Seat (Hold)'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
