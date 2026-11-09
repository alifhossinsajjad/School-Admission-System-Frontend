import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import type { HoldStatus } from '@/types';
import { Clock, CheckCircle, AlertOctagon, Ban } from 'lucide-react';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-indigo-500/30 bg-indigo-500/10 text-indigo-300',
        secondary:
          'border-slate-700 bg-slate-800 text-slate-300',
        destructive:
          'border-rose-500/30 bg-rose-500/10 text-rose-300',
        outline:
          'text-slate-300 border-slate-700',
        emerald:
          'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
        amber:
          'border-amber-500/30 bg-amber-500/10 text-amber-300',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  status?: HoldStatus | 'AVAILABLE' | 'FULL';
  showIcon?: boolean;
}

const statusConfigs: Record<
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

function Badge({ className, variant, status, showIcon = true, children, ...props }: BadgeProps) {
  if (status) {
    const config = statusConfigs[status];
    return (
      <div
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border backdrop-blur-sm tracking-wide',
          config.styles,
          className
        )}
        {...props}
      >
        {showIcon && <span className={cn('shrink-0', config.pulse && 'animate-pulse')}>{config.icon}</span>}
        <span>{children || config.label}</span>
      </div>
    );
  }

  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {children}
    </div>
  );
}

export { Badge, badgeVariants };
