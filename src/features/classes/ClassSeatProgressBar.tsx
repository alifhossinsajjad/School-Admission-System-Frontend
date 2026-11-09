import React from 'react';
import type { SchoolClass } from '../../types';

interface ClassSeatProgressBarProps {
  schoolClass: SchoolClass;
  showLegend?: boolean;
}

export const ClassSeatProgressBar: React.FC<ClassSeatProgressBarProps> = ({
  schoolClass,
  showLegend = true,
}) => {
  const { totalSeats, heldSeats, confirmedSeats, availableSeats } = schoolClass;

  const confirmedPct = totalSeats > 0 ? (confirmedSeats / totalSeats) * 100 : 0;
  const heldPct = totalSeats > 0 ? (heldSeats / totalSeats) * 100 : 0;
  const availablePct = totalSeats > 0 ? (availableSeats / totalSeats) * 100 : 0;

  return (
    <div className="space-y-2">
      {/* Multi-segment Progress Bar */}
      <div className="w-full h-3 bg-slate-950/80 rounded-full overflow-hidden flex p-0.5 border border-slate-800">
        {confirmedPct > 0 && (
          <div
            style={{ width: `${confirmedPct}%` }}
            className="h-full bg-emerald-500 rounded-l-full transition-all duration-500 relative group"
            title={`Confirmed: ${confirmedSeats} (${confirmedPct.toFixed(1)}%)`}
          />
        )}
        {heldPct > 0 && (
          <div
            style={{ width: `${heldPct}%` }}
            className="h-full bg-amber-500 transition-all duration-500 relative group"
            title={`Held: ${heldSeats} (${heldPct.toFixed(1)}%)`}
          />
        )}
        {availablePct > 0 && (
          <div
            style={{ width: `${availablePct}%` }}
            className="h-full bg-indigo-600/40 rounded-r-full transition-all duration-500 relative group"
            title={`Available: ${availableSeats} (${availablePct.toFixed(1)}%)`}
          />
        )}
      </div>

      {/* Legend & Stats */}
      {showLegend && (
        <div className="flex items-center justify-between text-xs text-slate-400 font-medium pt-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span>Confirmed: <strong className="text-slate-200">{confirmedSeats}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
            <span>Held: <strong className="text-slate-200">{heldSeats}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
            <span>Available: <strong className="text-slate-200">{availableSeats}</strong></span>
          </div>
        </div>
      )}
    </div>
  );
};

