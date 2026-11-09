import React, { useEffect, useState } from 'react';
import { Timer, AlertTriangle } from 'lucide-react';
import { getTimeRemaining } from '@/utils';
import { cn } from '@/lib/utils';

interface CountdownTimerProps {
  expiresAt: string;
  onExpire?: () => void;
  className?: string;
  compact?: boolean;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  expiresAt,
  onExpire,
  className,
  compact = false,
}) => {
  const [time, setTime] = useState(() => getTimeRemaining(expiresAt));

  useEffect(() => {
    const update = () => {
      const remaining = getTimeRemaining(expiresAt);
      setTime(remaining);
      if (remaining.isExpired && onExpire) {
        onExpire();
      }
    };

    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [expiresAt, onExpire]);

  if (time.isExpired) {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200',
          className
        )}
      >
        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
        <span>Hold Expired</span>
      </div>
    );
  }

  const isUrgent = time.totalSeconds <= 120; // 2 minutes or less

  if (compact) {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-mono text-xs font-semibold border transition-colors',
          isUrgent
            ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
            : 'bg-amber-50 text-amber-800 border-amber-200',
          className
        )}
      >
        <Timer className="w-3.5 h-3.5" />
        <span>{time.formatted}</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex items-center justify-between p-3.5 rounded-xl border transition-all',
        isUrgent
          ? 'bg-rose-50/80 border-rose-200 text-rose-900'
          : 'bg-amber-50/80 border-amber-200 text-amber-900',
        className
      )}
    >
      <div className="flex items-center gap-2.5">
        <div
          className={cn(
            'p-2 rounded-lg',
            isUrgent ? 'bg-rose-100 text-rose-700 animate-pulse' : 'bg-amber-100 text-amber-700'
          )}
        >
          <Timer className="w-4 h-4" />
        </div>
        <div>
          <span className="text-xs uppercase font-bold tracking-wider opacity-80 block">
            {isUrgent ? 'Ending Soon: Complete Admission' : 'Seat Held Temporarily'}
          </span>
          <span className="text-xs text-slate-600">
            Expires in {time.minutes}m {time.seconds}s
          </span>
        </div>
      </div>
      <div className="font-mono text-lg font-extrabold tracking-tight px-3 py-1 bg-white text-slate-900 rounded-lg border border-slate-200 shadow-xs">
        {time.formatted}
      </div>
    </div>
  );
};
