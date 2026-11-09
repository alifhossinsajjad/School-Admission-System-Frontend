import React, { useState } from 'react';
import type { StudentHold } from '../../types';
import { useStudent } from '../../hooks/useStudent';
import { useToast } from '../../hooks/useToast';
import { api, ApiError } from '../../services/api';
import { Badge } from '../../components/ui/Badge';
import { CountdownTimer } from '../../components/ui/CountdownTimer';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { formatDateTime } from '../../utils';
import { CheckCircle2, Trash2, CreditCard, AlertTriangle, ShieldCheck } from 'lucide-react';

interface HoldDetailCardProps {
  hold: StudentHold;
  onRefresh: () => void;
}

export const HoldDetailCard: React.FC<HoldDetailCardProps> = ({ hold, onRefresh }) => {
  const { student } = useStudent();
  const { success, error } = useToast();

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const isHeld = hold.status === 'HELD';
  const isConfirmed = hold.status === 'CONFIRMED';

  const handleConfirmAdmission = async () => {
    setIsConfirming(true);
    try {
      await api.confirmHold(hold.holdId, student.id);
      setIsConfirmModalOpen(false);
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
      setIsCancelModalOpen(false);
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
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md flex flex-col justify-between hover:border-slate-700/80 transition-all duration-200">
        <div>
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                Application #{hold.holdId.slice(0, 8)}
              </span>
              <h3 className="text-xl font-bold text-white mt-1.5">{hold.className}</h3>
            </div>
            <Badge status={hold.status} />
          </div>

          {/* Details */}
          <div className="space-y-2.5 text-xs text-slate-300 py-3 border-y border-slate-800/80 my-3">
            <div className="flex justify-between">
              <span className="text-slate-400">Application ID:</span>
              <span className="font-mono text-slate-200 truncate max-w-[180px] sm:max-w-none">
                {hold.holdId}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Class ID:</span>
              <span className="font-mono text-slate-200 truncate max-w-[180px] sm:max-w-none">
                {hold.classId}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">
                {isHeld ? 'Expires At:' : 'Hold Expiration:'}
              </span>
              <span className="font-mono text-slate-200">{formatDateTime(hold.expiresAt)}</span>
            </div>
          </div>

          {/* Live Countdown Timer (If Active HELD status) */}
          {isHeld && (
            <div className="my-4">
              <CountdownTimer expiresAt={hold.expiresAt} onExpire={onRefresh} />
            </div>
          )}

          {/* Confirmed Banner */}
          {isConfirmed && (
            <div className="my-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center gap-3 text-emerald-200 text-xs">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <strong className="block font-semibold">Seat Officially Secured</strong>
                <span>Your admission is confirmed. No further action is required.</span>
              </div>
            </div>
          )}
        </div>

        {/* Action Controls for HELD status */}
        {isHeld && (
          <div className="flex items-center gap-2.5 pt-2">
            <Button
              variant="emerald"
              size="sm"
              className="flex-1"
              leftIcon={<CreditCard className="w-4 h-4" />}
              onClick={() => setIsConfirmModalOpen(true)}
            >
              Confirm Admission
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-rose-400 border-rose-500/30 hover:bg-rose-500/10"
              leftIcon={<Trash2 className="w-4 h-4" />}
              onClick={() => setIsCancelModalOpen(true)}
            >
              Cancel
            </Button>
          </div>
        )}
      </div>

      {/* Confirm Admission Modal */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="Confirm Student Admission"
        description={`Secure the seat reservation permanently in ${hold.className}.`}
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-200 text-xs space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-white">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Admission Confirmation (Rule 5)</span>
            </div>
            <p>
              Once confirmed, your seat count transitions from Held to Confirmed in the school database.
              The seat cannot be taken by another applicant.
            </p>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Class Name:</span>
              <strong className="text-white">{hold.className}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Student BRN:</span>
              <span className="font-mono text-slate-200">{student.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Admission Fee:</span>
              <span className="font-semibold text-emerald-400">Waived / Simulated</span>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <Button
              variant="outline"
              onClick={() => setIsConfirmModalOpen(false)}
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
              Confirm Admission Now
            </Button>
          </div>
        </div>
      </Modal>

      {/* Cancel Hold Modal */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title="Cancel Seat Hold"
        description="Are you sure you want to release this held seat?"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-200 text-xs space-y-1">
            <div className="flex items-center gap-2 font-semibold text-white">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Seat Release Warning</span>
            </div>
            <p>
              Cancelling this hold immediately returns the seat to the available pool for other students to reserve.
            </p>
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <Button
              variant="outline"
              onClick={() => setIsCancelModalOpen(false)}
              disabled={isCancelling}
            >
              Keep My Seat
            </Button>
            <Button
              variant="danger"
              isLoading={isCancelling}
              onClick={handleCancelHold}
              leftIcon={<Trash2 className="w-4 h-4" />}
            >
              Release Seat (Cancel)
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
