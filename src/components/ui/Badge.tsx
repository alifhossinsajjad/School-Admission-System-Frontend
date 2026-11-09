import React from 'react';
import type { HoldStatus } from '../../types';
import { cn } from '../../utils';
import { Clock, CheckCircle, AlertOctagon, Ban } from 'lucide-react';

interface BadgeProps {
  status: HoldStatus | 'AVAILABLE' | 'FULL';
  className?: string;
  showIcon?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({ status, className, showIcon = true }) => {
  const configs: Record<
    HoldStatus | 'AVAILABLE' | 'FULL',
    { label: string; icon: React.ReactNode; styles: string; pulse?: boolean }
  > = {
    HELD: {
      label: 'Seat Held (Active)',
      icon: <Clock className="w-3.5 h-3.5" />,
      styles: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
      pulse: true,
    },
    CONFIRMED: {
      label: 'Admission Confirmed',
      icon: <CheckCircle className="w-3.5 h-3.5" />,
      styles: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    },
    EXPIRED: {
      label: 'Hold Expired',
      icon: <AlertOctagon className="w-3.5 h-3.5" />,
      styles: 'bg-slate-700/30 text-slate-400 border-slate-700/50',
    },
    CANCELLED: {
      label: 'Hold Cancelled',
      icon: <Ban className="w-3.5 h-3.5" />,
      styles: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
    },
    AVAILABLE: {
      label: 'Seats Available',
      icon: <CheckCircle className="w-3.5 h-3.5" />,
      styles: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
    },
    FULL: {
      label: 'Class Full',
      icon: <AlertOctagon className="w-3.5 h-3.5" />,
      styles: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
    },
  };

  const config = configs[status];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border backdrop-blur-sm tracking-wide',
        config.styles,
        className
      )}
    >
      {showIcon && <span className={cn('shrink-0', config.pulse && 'animate-pulse')}>{config.icon}</span>}
      <span>{config.label}</span>
    </span>
  );
};

