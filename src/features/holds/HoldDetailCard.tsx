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
import { formatDateTime, getTimeRemaining } from '@/utils';
import { CheckCircle2, Trash2, CreditCard, AlertTriangle, ShieldCheck, AlertOctagon } from 'lucide-react';

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

  // Live expiration state without requiring page reload
  const [hasTimerExpired, setHasTimerExpired] = useState(false);
  const isTimeUp = getTimeRemaining(hold.expiresAt).isExpired;
  const isExpired = hasTimerExpired || isTimeUp;

  const handleExpire = () => {
    setHasTimerExpired(true);
    onRefresh();
  };

  const isHeld = hold.status === 'HELD' && !isExpired;
  const isConfirmed = hold.status === 'CONFIRMED';
  const isEffectivelyExpired = hold.status === 'EXPIRED' || (hold.status === 'HELD' && isExpired);

  const handleConfirmAdmission = async () => {
    if (isEffectivelyExpired) {
      error('মেয়াদ উত্তীর্ণ', 'এই আবেদনের ১০ মিনিটের মেয়াদ শেষ হয়ে গেছে। আর ফি প্রদান করা যাবে না।');
      return;
    }

    setIsConfirming(true);
    try {
      await api.confirmHold(hold.holdId, student.id);
      setIsConfirmDialogOpen(false);
      success(
        'ভর্তি সফলভাবে নিশ্চিত হয়েছে! 🎉',
        `${hold.className} শ্রেণীতে আপনার আসনটি স্থায়ীভাবে কনফার্ম করা হয়েছে।`
      );
      onRefresh();
    } catch (err) {
      if (err instanceof ApiError) {
        error('ভর্তি নিশ্চিত করা যায়নি', err.message);
      } else {
        error('এরর', 'একটি অপ্রত্যাশিত সার্ভার এরর ঘটেছে।');
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
      success('আবেদন বাতিল হয়েছে', `${hold.className} শ্রেণীর সিট হোল্ড বাতিল করে আসনটি উন্মুক্ত করা হয়েছে।`);
      onRefresh();
    } catch (err) {
      if (err instanceof ApiError) {
        error('বাতিল করা যায়নি', err.message);
      } else {
        error('এরর', 'আবেদন বাতিল করতে সমস্যা হয়েছে।');
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
                  আবেদন #{hold.holdId.slice(0, 8)}
                </span>
                <CardTitle className="text-xl text-slate-900 mt-2">
                  {hold.className}
                </CardTitle>
              </div>
              <Badge status={isEffectivelyExpired ? 'EXPIRED' : hold.status} />
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Details */}
            <div className="space-y-2 text-xs text-slate-600 py-3 border-y border-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-400">Hold ID:</span>
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
                  {isHeld ? 'মেয়াদ শেষ হবে:' : 'মেয়াদ:'}
                </span>
                <span className="font-mono text-slate-800">{formatDateTime(hold.expiresAt)}</span>
              </div>
            </div>

            {/* Live Countdown Timer (If Active HELD status) */}
            {isHeld && (
              <div className="my-2">
                <CountdownTimer expiresAt={hold.expiresAt} onExpire={handleExpire} />
              </div>
            )}

            {/* Expired Notice (Without Page Reload) */}
            {isEffectivelyExpired && hold.status !== 'CANCELLED' && (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3 text-slate-700 text-xs">
                <AlertOctagon className="w-5 h-5 text-slate-400 shrink-0" />
                <div>
                  <strong className="block font-semibold text-slate-800">আবেদনের মেয়াদ উত্তীর্ণ (EXPIRED)</strong>
                  <span className="text-slate-500">১০ মিনিট পার হওয়ায় আসনটি স্বয়ংক্রিয়ভাবে উন্মুক্ত হয়ে গেছে। "ভর্তি ফি দিন" বাটন বন্ধ করা হয়েছে।</span>
                </div>
              </div>
            )}

            {/* Confirmed Banner */}
            {isConfirmed && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-800 text-xs">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <strong className="block font-semibold">আসনটি স্থায়ীভাবে নিশ্চিত হয়েছে</strong>
                  <span>আপনার ভর্তি সম্পূর্ণ হয়েছে। নতুন কোনো ফি দেওয়ার প্রয়োজন নেই।</span>
                </div>
              </div>
            )}
          </CardContent>
        </div>

        {/* Action Controls for HELD status */}
        <CardFooter className="pt-2 border-t border-slate-100 flex items-center gap-2">
          {isHeld ? (
            <>
              <Button
                variant="emerald"
                size="sm"
                className="flex-1"
                leftIcon={<CreditCard className="w-4 h-4" />}
                onClick={() => setIsConfirmDialogOpen(true)}
              >
                ভর্তি ফি দিন (Confirm)
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-rose-600 border-rose-200 hover:bg-rose-50"
                leftIcon={<Trash2 className="w-4 h-4" />}
                onClick={() => setIsCancelDialogOpen(true)}
              >
                আবেদন বাতিল
              </Button>
            </>
          ) : isEffectivelyExpired && hold.status !== 'CANCELLED' && hold.status !== 'CONFIRMED' ? (
            <Button
              variant="outline"
              size="sm"
              disabled
              className="w-full opacity-60 cursor-not-allowed text-slate-400"
              leftIcon={<AlertOctagon className="w-4 h-4" />}
            >
              মেয়াদ শেষ (ভর্তি ফি বন্ধ)
            </Button>
          ) : null}
        </CardFooter>
      </Card>

      {/* Official Radix shadcn Confirm Admission Dialog */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>ভর্তি নিশ্চিতকরণ (Confirm Admission)</DialogTitle>
            <DialogDescription>
              {hold.className} শ্রেণীতে আপনার সিটটি স্থায়ীভাবে নিশ্চিত করতে ফি প্রদান করুন।
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-2">
            <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-900 text-xs space-y-1">
              <div className="flex items-center gap-2 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>ভর্তি ফি প্রদান</span>
              </div>
              <p className="text-slate-600">
                ভর্তি ফি কনফার্ম করলে আসনটি স্থায়ীভাবে বুক হবে এবং অন্য কোনো শিক্ষার্থী এই আসনটি নিতে পারবে না।
              </p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">শ্রেণী:</span>
                <strong className="text-slate-900">{hold.className}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">শিক্ষার্থী BRN:</span>
                <span className="font-mono text-slate-800">{student.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">ভর্তি ফি:</span>
                <span className="font-semibold text-emerald-600">সিমুলেটেড / পরীক্ষামূলক ফি</span>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsConfirmDialogOpen(false)}
                disabled={isConfirming}
              >
                ফিরে যান
              </Button>
              <Button
                type="button"
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

      {/* Official Radix shadcn Cancel Hold (Delete Hold) Confirmation Modal */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>আবেদন বাতিল নিশ্চিতকরণ</DialogTitle>
            <DialogDescription>
              আপনি কি নিশ্চিত যে আপনি এই আবেদনটি বাতিল করতে চান?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-2">
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs space-y-1">
              <div className="flex items-center gap-2 font-semibold text-rose-800">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>সতর্কবার্তা</span>
              </div>
              <p className="text-slate-600">
                আবেদনটি বাতিল করলে আপনার জন্য সংরক্ষিত আসনটি সাথে সাথে ছেড়ে দেওয়া হবে এবং অন্য কোনো শিক্ষার্থী সেটি বুক করতে পারবে। একবার বাতিল করলে তা আর ফিরিয়ে আনা যাবে না।
              </p>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">শ্রেণী:</span>
                <span className="font-semibold text-slate-800">{hold.className}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">আবেদন ট্র্যাকিং নম্বর:</span>
                <span className="font-mono text-slate-800">{hold.holdId}</span>
              </div>
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
