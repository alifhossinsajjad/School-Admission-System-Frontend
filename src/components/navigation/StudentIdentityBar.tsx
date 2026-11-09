import React, { useState } from 'react';
import { useStudent } from '../../hooks/useStudent';
import { useToast } from '../../hooks/useToast';
import { formatBRN, isValidBRN } from '../../utils';
import { UserCheck, Users, ChevronDown, Check, Plus, AlertCircle } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export const StudentIdentityBar: React.FC = () => {
  const { student, setStudent, setCustomStudent, demoStudents } = useStudent();
  const { success, error } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customBRN, setCustomBRN] = useState('');
  const [customName, setCustomName] = useState('');
  const [brnError, setBrnError] = useState('');

  const handleSelectDemo = (demo: typeof student) => {
    setStudent(demo);
    setIsModalOpen(false);
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
      setIsModalOpen(false);
      setCustomBRN('');
      setCustomName('');
      success('Custom Applicant Set', `Header X-Student-Id: ${clean}`);
    } else {
      error('Invalid Student ID', 'Please check the 17-digit number format.');
    }
  };

  return (
    <>
      <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-800 rounded-2xl p-2 sm:px-4 sm:py-2.5 backdrop-blur-md shadow-lg shadow-black/20">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-600/30 shrink-0">
          <UserCheck className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Logged in as:</span>
            <span className="text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
              Student / Applicant
            </span>
          </div>
          <div className="flex items-center gap-2 truncate">
            <h4 className="text-sm font-bold text-white truncate">{student.name}</h4>
            <span className="text-xs font-mono text-slate-400 hidden sm:inline-block">
              ({formatBRN(student.id)})
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700/60 transition-all hover:border-slate-600 cursor-pointer shrink-0"
        >
          <Users className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden sm:inline">Switch Student</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>

      {/* Switch Student Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Switch Student Identity"
        description="Select a test student or enter a custom 17-digit National Birth Registration Number (X-Student-Id)."
        maxWidth="md"
      >
        <div className="space-y-5">
          {/* Preset Demo Students */}
          <div>
            <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
              Preset Demo Applicants
            </h5>
            <div className="space-y-2">
              {demoStudents.map((demo) => {
                const isSelected = demo.id === student.id;
                return (
                  <button
                    key={demo.id}
                    onClick={() => handleSelectDemo(demo)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all text-left cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600/15 border-indigo-500/60 text-white shadow-sm'
                        : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-sm text-white flex items-center gap-2">
                        {demo.name}
                        {isSelected && (
                          <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-md font-normal">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-mono text-slate-400 mt-0.5">
                        BRN: {formatBRN(demo.id)}
                      </div>
                    </div>
                    {isSelected && <Check className="w-5 h-5 text-indigo-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="relative flex items-center justify-center my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <span className="relative px-3 bg-slate-900 text-xs text-slate-500 uppercase tracking-wider">
              Or Use Custom BRN
            </span>
          </div>

          {/* Custom BRN Form */}
          <form onSubmit={handleSaveCustom} className="space-y-3.5">
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

            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 flex items-start gap-2.5 text-xs text-slate-400">
              <AlertCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <span>
                The backend validates the <code className="text-indigo-300">X-Student-Id</code> HTTP header with regex <code className="text-indigo-300">^\d&#123;17&#125;$</code>.
              </span>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
                Apply Identity
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
};
