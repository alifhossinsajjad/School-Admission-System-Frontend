import React, { useEffect, useState } from 'react';
import { Timer, AlertTriangle } from 'lucide-react';
import { getTimeRemaining, cn } from '../../utils';

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
          'inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/30',
          className
        )}
      >
        <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
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
            ? 'bg-rose-500/15 text-rose-300 border-rose-500/40 animate-pulse'
            : 'bg-amber-500/15 text-amber-300 border-amber-500/30',
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
        'flex items-center justify-between p-3 rounded-xl border backdrop-blur-sm transition-all',
        isUrgent
          ? 'bg-rose-950/40 border-rose-500/40 text-rose-200'
          : 'bg-amber-950/30 border-amber-500/30 text-amber-200',
        className
      )}
    >
      <div className="flex items-center gap-2">
        <div
          className={cn(
            'p-1.5 rounded-lg',
            isUrgent ? 'bg-rose-500/20 text-rose-300 animate-pulse' : 'bg-amber-500/20 text-amber-300'
          )}
        >
          <Timer className="w-4 h-4" />
        </div>
        <div>
          <span className="text-xs uppercase font-bold tracking-wider opacity-75 block">
            {isUrgent ? 'Urgent: Reserve Ending Soon' : 'Seat Held For'}
          </span>
          <span className="text-xs text-slate-300">
            Expires in {time.minutes}m {time.seconds}s
          </span>
        </div>
      </div>
      <div className="font-mono text-lg font-extrabold tracking-tight px-3 py-1 bg-slate-900/80 rounded-lg border border-white/5">
        {time.formatted}
      </div>
    </div>
  );
};

