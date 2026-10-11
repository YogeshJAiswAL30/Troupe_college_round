import React from 'react';
import { ShieldCheck, UserCheck, AlertTriangle } from 'lucide-react';
import { UserProfile, UserRole } from '../types/fairwork';

interface HeaderProps {
  currentUser: UserProfile;
  allUsers: Record<string, UserProfile>;
  onSelectUser: (user: UserProfile) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  allUsers,
  onSelectUser,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-sm">
      {/* Simulation & Integrity Notice Banner */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-xs text-amber-300 flex items-center justify-between">
        <div className="flex items-center gap-2 max-w-4xl">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
          <span>
            <strong>Hackathon Prototype Mode:</strong> All escrow deposits, payments, and file uploads are simulated. File and agreement hashes (SHA-256) demonstrate tamper-evident integrity.
          </span>
        </div>
        <span className="hidden sm:inline bg-amber-500/20 text-amber-200 px-2 py-0.5 rounded font-mono text-[11px]">
          Simulated Escrow
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Logo and core workflow tag */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xl tracking-tight text-white">Fairwork</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                MVP Prototype
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Agreement &rarr; Deliverable &rarr; Decision &rarr; Payment
            </p>
          </div>
        </div>

        {/* Persona Switcher for pair-programming & demo verification */}
        <div className="flex items-center gap-3 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700/60">
          <div className="flex items-center gap-1.5 px-2 text-xs text-slate-400 font-medium">
            <UserCheck className="w-4 h-4 text-indigo-400" />
            <span>Viewing As:</span>
          </div>

          <div className="flex items-center gap-1">
            {Object.values(allUsers).map((user) => {
              const isActive = user.id === currentUser.id;
              const roleColor: Record<UserRole, string> = {
                CLIENT: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
                FREELANCER: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
                ARBITRATOR: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
                ADMIN: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
              };

              return (
                <button
                  key={user.id}
                  onClick={() => onSelectUser(user)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 border ${
                    isActive
                      ? 'bg-slate-700 text-white shadow-sm border-slate-600'
                      : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-current opacity-80" />
                  <span>{user.displayName.split(' ')[0]}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-mono border ${
                      roleColor[user.role]
                    }`}
                  >
                    {user.role}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
};
