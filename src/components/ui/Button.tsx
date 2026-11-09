import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none active:scale-[0.98]',
  {
    variants: {
      variant: {
        default:
          'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-500 border border-indigo-500/30',
        primary:
          'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-500 border border-indigo-500/30',
        destructive:
          'bg-rose-600 text-white shadow-lg shadow-rose-600/25 hover:bg-rose-500 border border-rose-500/30',
        danger:
          'bg-rose-600 text-white shadow-lg shadow-rose-600/25 hover:bg-rose-500 border border-rose-500/30',
        outline:
          'border border-slate-700 bg-slate-900/60 text-slate-200 hover:bg-slate-800 hover:text-white hover:border-slate-600',
        secondary:
          'bg-slate-800 text-slate-100 hover:bg-slate-700 border border-slate-700/60 shadow-sm',
        ghost:
          'text-slate-400 hover:bg-slate-800/80 hover:text-slate-100',
        link:
          'text-indigo-400 underline-offset-4 hover:underline',
        emerald:
          'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25 hover:bg-emerald-500 border border-emerald-500/30',
      },
      size: {
        default: 'h-10 px-4 py-2',
        md: 'h-10 px-4 py-2',
        sm: 'h-8 rounded-lg px-3 text-xs gap-1.5',
        lg: 'h-11 rounded-xl px-6 text-base gap-2.5',
        icon: 'h-9 w-9 rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoading = false, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-current shrink-0" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </Comp>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
