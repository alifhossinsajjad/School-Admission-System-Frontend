import React, { useState } from 'react';
import { useStudent } from '@/hooks/useStudent';
import { useToast } from '@/hooks/useToast';
import { formatBRN, isValidBRN } from '@/utils';
import { UserCheck, Users, ChevronDown, Check, Plus, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const StudentIdentityBar: React.FC = () => {
  const { student, setStudent, setCustomStudent, demoStudents } = useStudent();
  const { success, error } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [customBRN, setCustomBRN] = useState('');
  const [customName, setCustomName] = useState('');
  const [brnError, setBrnError] = useState('');

  const handleSelectDemo = (demo: typeof student) => {
    setStudent(demo);
    setIsDialogOpen(false);
    success('Applicant Switched', `Active student is now: ${demo.name}`);
  };

  const handleSaveCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = customBRN.trim();
    if (!clean) {
      setBrnError('Please enter a 17-digit birth registration number.');
      return;
    }
    if (!isValidBRN(clean)) {
      setBrnError('BRN must be exactly 17 digits (e.g. 20051234567890123).');
      return;
    }

    setBrnError('');
    const ok = setCustomStudent(clean, customName.trim() || undefined);
    if (ok) {
      setIsDialogOpen(false);
      setCustomBRN('');
      setCustomName('');
      success('Custom Applicant Set', `Student ID: ${clean}`);
    } else {
      error('Invalid Student ID', 'Please check the 17-digit number format.');
    }
  };

  return (
    <>
      <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl p-2 sm:px-3 sm:py-2 shadow-xs">
        <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
          <UserCheck className="w-4 h-4" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 font-medium">Logged in:</span>
            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-200">
              Student / Applicant
            </span>
          </div>
          <div className="flex items-center gap-1.5 truncate">
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">{student.name}</h4>
            <span className="text-xs font-mono text-slate-500 hidden sm:inline-block">
              ({formatBRN(student.id)})
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsDialogOpen(true)}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer shrink-0"
        >
          <Users className="w-3.5 h-3.5 text-indigo-600" />
          <span className="hidden sm:inline">Switch Student</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>

      {/* Official Radix shadcn Dialog with Compact Tabs */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader className="pb-1">
            <DialogTitle>Switch Student Identity</DialogTitle>
            <DialogDescription>
              Choose a demo applicant profile or enter a custom 17-digit BRN.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="preset" className="w-full mt-2">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="preset">Preset Demo Students</TabsTrigger>
              <TabsTrigger value="custom">Custom 17-Digit BRN</TabsTrigger>
            </TabsList>

            <TabsContent value="preset" className="space-y-2 mt-3">
              {demoStudents.map((demo) => {
                const isSelected = demo.id === student.id;
                return (
                  <button
                    key={demo.id}
                    onClick={() => handleSelectDemo(demo)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all text-left cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50/80 border-indigo-500 text-slate-900 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-sm text-slate-900 flex items-center gap-2">
                        {demo.name}
                        {isSelected && (
                          <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-md font-medium">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-mono text-slate-500 mt-0.5">
                        BRN: {formatBRN(demo.id)}
                      </div>
                    </div>
                    {isSelected && <Check className="w-5 h-5 text-indigo-600 shrink-0" />}
                  </button>
                );
              })}
            </TabsContent>

            <TabsContent value="custom" className="mt-3">
              <form onSubmit={handleSaveCustom} className="space-y-3">
                <Input
                  label="Student Name (Optional)"
                  placeholder="e.g. Maria Sultana"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                />
                <Input
                  label="17-Digit Birth Registration Number (BRN)"
                  placeholder="e.g. 20051234567890123"
                  maxLength={17}
                  value={customBRN}
                  onChange={(e) => {
                    setCustomBRN(e.target.value.replace(/\D/g, ''));
                    setBrnError('');
                  }}
                  error={brnError}
                  helperText={`${customBRN.length}/17 digits entered`}
                />

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2 text-xs text-slate-600">
                  <AlertCircle className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span>
                    Validates 17-digit BRN for header <code className="text-indigo-600 font-mono">X-Student-Id</code>.
                  </span>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="default" leftIcon={<Plus className="w-4 h-4" />}>
                    Save & Switch
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
};
