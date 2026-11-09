import React, { useState } from 'react';
import type { SchoolClass } from '@/types';
import { useStudent } from '@/hooks/useStudent';
import { useToast } from '@/hooks/useToast';
import { api, ApiError } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Users, Armchair, Sparkles, CheckCircle2, Clock, Trash2, CreditCard, AlertTriangle } from 'lucide-react';

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
  const { student, myHolds, refreshMyHolds } = useStudent();
  const { success, error, warning } = useToast();
  const [isReserving, setIsReserving] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // Check if current student has an active hold or confirmed seat in this class
  const existingHold = myHolds.find(
    (h) => h.classId === schoolClass.id && (h.status === 'HELD' || h.status === 'CONFIRMED')
  );

  const isFull = schoolClass.availableSeats <= 0;
  const bookedSeats = schoolClass.confirmedSeats + schoolClass.heldSeats;
  const fillPct = schoolClass.totalSeats > 0 ? Math.round((bookedSeats / schoolClass.totalSeats) * 100) : 0;

  const handleApplyHold = async () => {
    if (!student.id) {
      warning('Student ID প্রয়োজন', 'অনুগ্রহ করে শিক্ষার্থী সিলেক্ট বা ১৭-ডিজিট জন্ম নিবন্ধন নম্বর দিন।');
      return;
    }

    if (existingHold) {
      warning(
        'ইতিমধ্যে আবেদন করা হয়েছে',
        existingHold.status === 'CONFIRMED'
          ? 'এই শ্রেণীতে আপনার ভর্তি ইতিমধ্যে নিশ্চিত হয়েছে।'
          : 'এই শ্রেণীতে আপনার একটি সক্রিয় আবেদন রয়েছে। অনুগ্রহ করে ভর্তি ফি দিন অথবা আবেদন বাতিল করুন।'
      );
      onViewMyApplications();
      return;
    }

    setIsReserving(true);
    try {
      await api.createHold(schoolClass.id, student.id);
      success(
        'সিট সংরক্ষিত হয়েছে! (Seat Held)',
        `${schoolClass.name} শ্রেণীতে আসনটি ১০ মিনিটের জন্য ধরে রাখা হয়েছে। নির্ধারিত সময়ের মধ্যে ভর্তি ফি দিন।`
      );
      onHoldCreated();
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          error('আবেদন দ্বন্দ (409)', err.message);
        } else if (err.status === 400) {
          error('ভুল তথ্য (400)', err.message);
        } else {
          error('আবেদন ব্যর্থ হয়েছে', err.message);
        }
      } else {
        error('আবেদন ব্যর্থ হয়েছে', 'সার্ভারে সংযোগে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
      }
    } finally {
      setIsReserving(false);
    }
  };

  const handleConfirmAdmission = async () => {
    if (!existingHold) return;
    setIsConfirming(true);
    try {
      await api.confirmHold(existingHold.holdId, student.id);
      setIsConfirmDialogOpen(false);
      success('ভর্তি নিশ্চিত হয়েছে! 🎉', `${schoolClass.name} শ্রেণীতে আপনার ভর্তি সম্পূর্ণ হয়েছে।`);
      await refreshMyHolds();
      onHoldCreated();
    } catch (err) {
      error('ভর্তি নিশ্চিত করা যায়নি', err instanceof Error ? err.message : 'ত্রুটি ঘটেছে');
    } finally {
      setIsConfirming(false);
    }
  };

  const handleCancelHold = async () => {
    if (!existingHold) return;
    setIsCancelling(true);
    try {
      await api.cancelHold(existingHold.holdId, student.id);
      setIsCancelDialogOpen(false);
      success('আবেদন বাতিল হয়েছে', `${schoolClass.name} শ্রেণীর সিট হোল্ড বাতিল করা হয়েছে।`);
      await refreshMyHolds();
      onHoldCreated();
    } catch (err) {
      error('আবেদন বাতিল করা যায়নি', err instanceof Error ? err.message : 'ত্রুটি ঘটেছে');
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <>
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

        {/* Action Buttons: Apply, Confirm ("ভর্তি ফি দিন"), or Cancel ("আবেদন বাতিল") */}
        <CardFooter className="pt-2 border-t border-slate-100 flex items-center gap-2">
          {existingHold?.status === 'HELD' ? (
            <>
              <Button
                variant="emerald"
                size="sm"
                className="flex-1 text-xs"
                leftIcon={<CreditCard className="w-4 h-4" />}
                onClick={() => setIsConfirmDialogOpen(true)}
              >
                ভর্তি ফি দিন
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-rose-600 border-rose-200 hover:bg-rose-50 text-xs"
                leftIcon={<Trash2 className="w-4 h-4" />}
                onClick={() => setIsCancelDialogOpen(true)}
              >
                বাতিল করুন
              </Button>
            </>
          ) : existingHold?.status === 'CONFIRMED' ? (
            <Button
              variant="outline"
              className="w-full text-emerald-700 border-emerald-200 bg-emerald-50/50"
              onClick={onViewMyApplications}
              leftIcon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />}
            >
              ভর্তি নিশ্চিত হয়েছে (View)
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

      {/* Confirm Admission Dialog */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>ভর্তি নিশ্চিতকরণ ({schoolClass.name})</DialogTitle>
            <DialogDescription>
              {schoolClass.name} শ্রেণীতে আপনার সিটটি স্থায়ীভাবে নিশ্চিত করতে ফি প্রদান করুন।
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2 text-xs">
            <p className="text-slate-600">
              ভর্তি ফি প্রদান করলে আসনটি নিশ্চিত হবে এবং ১০ মিনিটের হোল্ড টাইমার স্থায়ী আসনে রূপান্তরিত হবে।
            </p>
            <DialogFooter className="pt-2">
              <Button variant="outline" onClick={() => setIsConfirmDialogOpen(false)}>
                ফিরে যান
              </Button>
              <Button
                variant="emerald"
                isLoading={isConfirming}
                onClick={handleConfirmAdmission}
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
              >
                ভর্তি ফি জমা দিন (Confirm)
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete / Cancel Hold Confirmation Modal */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>আবেদন বাতিল নিশ্চিতকরণ</DialogTitle>
            <DialogDescription>
              আপনি কি নিশ্চিত যে আপনি {schoolClass.name} শ্রেণীর সংরক্ষিত আসনটি বাতিল করতে চান?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2 text-xs">
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>সতর্কবার্তা</span>
              </div>
              <p>আবেদন বাতিল করলে আসনটি তাৎক্ষণিক অন্য শিক্ষার্থীদের জন্য উন্মুক্ত হয়ে যাবে।</p>
            </div>
            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCancelDialogOpen(false)}
                disabled={isCancelling}
              >
                না, আসনটি রাখুন
              </Button>
              <Button
                type="button"
                variant="destructive"
                isLoading={isCancelling}
                onClick={handleCancelHold}
                leftIcon={<Trash2 className="w-4 h-4" />}
              >
                হ্যাঁ, আবেদন বাতিল করুন
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
