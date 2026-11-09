import React, { useState } from 'react';
import type { StudentHold } from '@/types';
import { useStudent } from '@/hooks/useStudent';
import { useToast } from '@/hooks/useToast';
import { api, ApiError } from '@/services/api';
import { Badge } from '@/components/ui/badge';
import { CountdownTimer } from '@/components/ui/CountdownTimer';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { formatDateTime } from '@/utils';
import { CheckCircle2, Trash2, CreditCard, AlertTriangle, ShieldCheck } from 'lucide-react';

interface HoldDetailCardProps {
  hold: StudentHold;
  onRefresh: () => void;
}

export const HoldDetailCard: React.FC<HoldDetailCardProps> = ({ hold, onRefresh }) => {
  const { student } = useStudent();
  const { success, error } = useToast();

  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const isHeld = hold.status === 'HELD';
  const isConfirmed = hold.status === 'CONFIRMED';

  const handleConfirmAdmission = async () => {
    setIsConfirming(true);
    try {
      await api.confirmHold(hold.holdId, student.id);
      setIsConfirmDialogOpen(false);
      success(
        'Admission Confirmed! 🎉',
        `Admission successfully confirmed for ${hold.className}. Welcome to the class!`
      );
      onRefresh();
    } catch (err) {
      if (err instanceof ApiError) {
        error('Confirmation Failed', err.message);
      } else {
        error('Confirmation Failed', 'An unexpected error occurred during confirmation.');
      }
    } finally {
      setIsConfirming(false);
    }
  };

  const handleCancelHold = async () => {
    setIsCancelling(true);
    try {
      await api.cancelHold(hold.holdId, student.id);
      setIsCancelDialogOpen(false);
      success('Seat Released', `Hold for ${hold.className} has been cancelled.`);
      onRefresh();
    } catch (err) {
      if (err instanceof ApiError) {
        error('Cancellation Failed', err.message);
      } else {
        error('Cancellation Failed', 'An unexpected error occurred during cancellation.');
      }
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
                  Application #{hold.holdId.slice(0, 8)}
                </span>
                <CardTitle className="text-xl text-slate-900 mt-2">
                  {hold.className}
                </CardTitle>
              </div>
              <Badge status={hold.status} />
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Details */}
            <div className="space-y-2 text-xs text-slate-600 py-3 border-y border-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-400">Application ID:</span>
                <span className="font-mono text-slate-800 truncate max-w-[180px] sm:max-w-none">
                  {hold.holdId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Class ID:</span>
                <span className="font-mono text-slate-800 truncate max-w-[180px] sm:max-w-none">
                  {hold.classId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">
                  {isHeld ? 'Expires At:' : 'Hold Expiration:'}
                </span>
                <span className="font-mono text-slate-800">{formatDateTime(hold.expiresAt)}</span>
              </div>
            </div>

            {/* Live Countdown Timer (If Active HELD status) */}
            {isHeld && (
              <div className="my-2">
                <CountdownTimer expiresAt={hold.expiresAt} onExpire={onRefresh} />
              </div>
            )}

            {/* Confirmed Banner */}
            {isConfirmed && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-800 text-xs">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <strong className="block font-semibold">Seat Officially Secured</strong>
                  <span>Your admission is confirmed. No further action is required.</span>
                </div>
              </div>
            )}
          </CardContent>
        </div>

        {/* Action Controls for HELD status */}
        {isHeld && (
          <CardFooter className="pt-2 border-t border-slate-100 flex items-center gap-2">
            <Button
              variant="emerald"
              size="sm"
              className="flex-1"
              leftIcon={<CreditCard className="w-4 h-4" />}
              onClick={() => setIsConfirmDialogOpen(true)}
            >
              Confirm Admission
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-rose-600 border-rose-200 hover:bg-rose-50"
              leftIcon={<Trash2 className="w-4 h-4" />}
              onClick={() => setIsCancelDialogOpen(true)}
            >
              Cancel
            </Button>
          </CardFooter>
        )}
      </Card>

      {/* Official Radix shadcn Confirm Admission Dialog */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Student Admission</DialogTitle>
            <DialogDescription>
              Secure the seat reservation permanently in {hold.className}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-2">
            <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-900 text-xs space-y-1">
              <div className="flex items-center gap-2 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Admission Confirmation</span>
              </div>
              <p className="text-slate-600">
                Once confirmed, your seat count transitions from Held to Confirmed in the school database.
              </p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Class Name:</span>
                <strong className="text-slate-900">{hold.className}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Student BRN:</span>
                <span className="font-mono text-slate-800">{student.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Admission Fee:</span>
                <span className="font-semibold text-emerald-600">Simulated / Verified</span>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                variant="outline"
                onClick={() => setIsConfirmDialogOpen(false)}
                disabled={isConfirming}
              >
                Back
              </Button>
              <Button
                variant="emerald"
                isLoading={isConfirming}
                onClick={handleConfirmAdmission}
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
              >
                Confirm Admission
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Official Radix shadcn Cancel Hold Dialog */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel Seat Hold</DialogTitle>
            <DialogDescription>
              Are you sure you want to release this held seat?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-2">
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs space-y-1">
              <div className="flex items-center gap-2 font-semibold text-rose-800">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Seat Release Warning</span>
              </div>
              <p className="text-slate-600">
                Cancelling this hold immediately returns the seat to the available pool for other students to reserve.
              </p>
            </div>

            <DialogFooter className="pt-2">
              <Button
                variant="outline"
                onClick={() => setIsCancelDialogOpen(false)}
                disabled={isCancelling}
              >
                Keep Seat
              </Button>
              <Button
                variant="destructive"
                isLoading={isCancelling}
                onClick={handleCancelHold}
                leftIcon={<Trash2 className="w-4 h-4" />}
              >
                Release Seat
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
