import React, { useState } from 'react';
import { ShieldCheck, Lock, X, KeyRound, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';

interface AdminSecretModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminSecretModal: React.FC<AdminSecretModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { loginAsDemoAdmin } = useAuth();
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Admin password configured to 147258
    if (passcode.trim() === '147258') {
      loginAsDemoAdmin();
      onSuccess();
      onClose();
    } else {
      setError('Invalid admin passcode. Access denied. Please enter 147258.');
    }
  };

  const handleQuickUnlock = () => {
    loginAsDemoAdmin();
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white border border-zinc-200 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-5 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-zinc-400 hover:text-zinc-900 rounded-full hover:bg-zinc-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-zinc-950 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <ShieldCheck className="w-6 h-6 text-orange-500" />
          </div>
          <h3 className="text-xl font-black text-zinc-950 font-display">
            Staff & Admin Gateway
          </h3>
          <p className="text-xs text-zinc-500">
            Internal APNA SHOES portal to manage product photos, prices, orders, AWB logistics, and dynamic branding.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1.5 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-zinc-500" />
              <span>Enter Admin Passcode (147258)</span>
            </label>
            <input
              type="password"
              autoFocus
              value={passcode}
              onChange={(e) => {
                setPasscode(e.target.value);
                setError(null);
              }}
              placeholder="Enter passcode (147258)..."
              className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono"
            />
          </div>

          {error && (
            <div className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-2 pt-1">
            <button
              type="submit"
              className="w-full py-3 bg-zinc-950 hover:bg-zinc-900 text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4 text-orange-500" />
              <span>Verify & Open Admin Portal</span>
            </button>

            <button
              type="button"
              onClick={handleQuickUnlock}
              className="w-full py-2 bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4 text-orange-600" />
              <span>One-Click Authorize Super Admin</span>
            </button>
          </div>
        </form>

        <div className="text-center pt-2 border-t border-zinc-100">
          <p className="text-[10px] text-zinc-400">
            Tip: Press <kbd className="px-1 py-0.5 bg-zinc-100 rounded text-zinc-700 font-mono">Ctrl+Shift+A</kbd> anywhere to open this prompt.
          </p>
        </div>
      </div>
    </div>
  );
};
