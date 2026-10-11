import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Building2,
  Code2,
  Scale,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Lock,
  Mail,
  User,
  KeyRound,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useFairwork } from '../context/FairworkContext';
import { authService } from '../lib/authService';
import { UserRole } from '../types/fairwork';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { allUsers, setCurrentUser, showToast } = useFairwork();

  const [activeTab, setActiveTab] = useState<'SANDBOX' | 'AUTH'>('SANDBOX');
  const [authMode, setAuthMode] = useState<'LOGIN' | 'SIGNUP' | 'RESET'>('LOGIN');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<UserRole>('CLIENT');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSelectRole = (userId: string) => {
    const user = allUsers[userId];
    if (user) {
      setCurrentUser(user);
    }
    navigate('/app');
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    try {
      if (authMode === 'LOGIN') {
        const res = await authService.signIn(email, password);
        if (res.error) {
          setErrorMessage(res.error);
        } else if (res.user) {
          setCurrentUser(res.user);
          showToast({
            type: 'success',
            title: 'Welcome Back',
            message: `Signed in as ${res.user.displayName}.`,
          });
          navigate('/app');
        }
      } else if (authMode === 'SIGNUP') {
        if (!displayName.trim()) {
          setErrorMessage('Display name is required.');
          setLoading(false);
          return;
        }
        const res = await authService.signUp({ email, password, displayName, role });
        if (res.error) {
          setErrorMessage(res.error);
        } else if (res.user) {
          setCurrentUser(res.user);
          showToast({
            type: 'success',
            title: 'Account Initialized',
            message: `Registered as ${res.user.displayName} (${res.user.role}).`,
          });
          navigate('/app');
        }
      } else if (authMode === 'RESET') {
        const res = await authService.resetPassword(email);
        if (res.error) {
          setErrorMessage(res.error);
        } else {
          setSuccessMessage('Password reset link sent. Please check your inbox.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F5EE] text-[#1C1917] flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Bar */}
      <div className="max-w-4xl w-full mx-auto flex items-center justify-between">
        <div
          onClick={() => navigate('/')}
          className="flex items-center gap-2.5 cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-[#264235] flex items-center justify-center text-white shadow-xs">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <span className="font-bold text-base tracking-tight text-[#1C1917]">
            Fairwork
          </span>
        </div>

        <Button
          variant="ghost"
          size="sm"
          leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
          onClick={() => navigate('/')}
        >
          Back to Overview
        </Button>
      </div>

      {/* Main Container */}
      <div className="max-w-md w-full mx-auto my-8">
        {/* Toggle Mode: Sandbox Demo vs Production Auth */}
        <div className="flex p-1 bg-white border border-[#E5DFD5] rounded-2xl mb-6 shadow-xs">
          <button
            type="button"
            onClick={() => setActiveTab('SANDBOX')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
              activeTab === 'SANDBOX'
                ? 'bg-[#264235] text-white shadow-xs'
                : 'text-[#605A53] hover:text-[#1C1917]'
            }`}
          >
            Demo Sandbox (1-Click)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('AUTH')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
              activeTab === 'AUTH'
                ? 'bg-[#264235] text-white shadow-xs'
                : 'text-[#605A53] hover:text-[#1C1917]'
            }`}
          >
            Credential Auth &amp; Profiles
          </button>
        </div>

        {activeTab === 'SANDBOX' ? (
          <div>
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#FAF7F2] border border-[#E5DFD5] text-[#264235] text-[11px] font-semibold mb-2">
                <span>Evaluator / Judge Sandbox Access</span>
              </div>
              <h1 className="text-xl font-bold tracking-tight text-[#1C1917]">
                Choose Your Demo Persona
              </h1>
              <p className="text-xs text-[#605A53] mt-1 leading-relaxed">
                Instantly enter the verified environment as Client, Freelancer, or Arbitrator with zero signup friction.
              </p>
            </div>

            <div className="space-y-3">
              {/* Client Persona */}
              <div
                onClick={() => handleSelectRole('client_01')}
                className="p-4 rounded-2xl bg-white border border-[#E5DFD5] hover:border-[#264235] hover:shadow-xs transition cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#E8F0FE] text-[#1E429F] flex items-center justify-center">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#1C1917] group-hover:text-[#264235] transition">
                        Nexus Ventures (Alice)
                      </h3>
                      <span className="text-[11px] text-[#605A53]">Client Account</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#E8F0FE] text-[#1E429F] border border-[#D0E1FD]">
                    CLIENT
                  </span>
                </div>
                <p className="text-xs text-[#605A53] mb-3">
                  Fund escrow deposits, inspect deliverable criteria checklists, request revisions, and release payouts.
                </p>
                <div className="flex items-center justify-between text-[11px] pt-2 border-t border-[#EFECE6] text-[#264235] font-semibold">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> ID_VERIFIED
                  </span>
                  <span className="flex items-center gap-1 group-hover:translate-x-0.5 transition">
                    Enter as Client <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>

              {/* Freelancer Persona */}
              <div
                onClick={() => handleSelectRole('freelancer_01')}
                className="p-4 rounded-2xl bg-white border border-[#E5DFD5] hover:border-[#264235] hover:shadow-xs transition cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#EBF4EE] text-[#285C42] flex items-center justify-center">
                      <Code2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#1C1917] group-hover:text-[#264235] transition">
                        Bob Martinez
                      </h3>
                      <span className="text-[11px] text-[#605A53]">Senior Engineer</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#EBF4EE] text-[#285C42] border border-[#C2DEC9]">
                    FREELANCER
                  </span>
                </div>
                <p className="text-xs text-[#605A53] mb-3">
                  Sign agreements, submit deliverables with SHA-256 fingerprints, track funded escrow, and manage revision history.
                </p>
                <div className="flex items-center justify-between text-[11px] pt-2 border-t border-[#EFECE6] text-[#264235] font-semibold">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> VERIFIED_PRO
                  </span>
                  <span className="flex items-center gap-1 group-hover:translate-x-0.5 transition">
                    Enter as Freelancer <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>

              {/* Arbitrator Persona */}
              <div
                onClick={() => handleSelectRole('arbitrator_01')}
                className="p-4 rounded-2xl bg-white border border-[#E5DFD5] hover:border-[#264235] hover:shadow-xs transition cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#F3E8FF] text-[#6B21A8] flex items-center justify-center">
                      <Scale className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#1C1917] group-hover:text-[#264235] transition">
                        Claire Justice, Esq.
                      </h3>
                      <span className="text-[11px] text-[#605A53]">Commercial Arbitrator</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#F3E8FF] text-[#6B21A8] border border-[#E9D5FF]">
                    ARBITRATOR
                  </span>
                </div>
                <p className="text-xs text-[#605A53] mb-3">
                  Inspect submitted evidence, evaluate milestone criteria disputes, and rule on structured settlement splits.
                </p>
                <div className="flex items-center justify-between text-[11px] pt-2 border-t border-[#EFECE6] text-[#264235] font-semibold">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> VERIFIED_PRO
                  </span>
                  <span className="flex items-center gap-1 group-hover:translate-x-0.5 transition">
                    Enter as Arbitrator <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Production Credential Auth Form */
          <div className="bg-white p-6 rounded-2xl border border-[#E5DFD5] shadow-xs">
            <div className="text-center mb-5">
              <h2 className="text-lg font-bold text-[#1C1917]">
                {authMode === 'LOGIN' && 'Sign In to Fairwork'}
                {authMode === 'SIGNUP' && 'Create Verified Account'}
                {authMode === 'RESET' && 'Reset Password'}
              </h2>
              <p className="text-xs text-[#605A53] mt-0.5">
                {authMode === 'LOGIN' && 'Authenticate with your verified email and password'}
                {authMode === 'SIGNUP' && 'Role will be strictly bound to your server-side profile'}
                {authMode === 'RESET' && 'We will send a secure password recovery link to your email'}
              </p>
            </div>

            {/* Error or Success alert */}
            {errorMessage && (
              <div className="p-3 mb-4 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B] text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
            {successMessage && (
              <div className="p-3 mb-4 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] text-[#166534] text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-3.5">
              {authMode === 'SIGNUP' && (
                <div>
                  <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                    Full Name / Organization
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#8A837A] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g. Nexus Ventures or Jane Doe"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#E5DFD5] bg-[#FAF7F2] focus:bg-white focus:outline-none focus:border-[#264235]"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#8A837A] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#E5DFD5] bg-[#FAF7F2] focus:bg-white focus:outline-none focus:border-[#264235]"
                  />
                </div>
              </div>

              {authMode !== 'RESET' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-[#1C1917]">
                      Password
                    </label>
                    {authMode === 'LOGIN' && (
                      <button
                        type="button"
                        onClick={() => setAuthMode('RESET')}
                        className="text-[11px] text-[#264235] hover:underline cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-[#8A837A] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#E5DFD5] bg-[#FAF7F2] focus:bg-white focus:outline-none focus:border-[#264235]"
                    />
                  </div>
                </div>
              )}

              {authMode === 'SIGNUP' && (
                <div>
                  <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                    Requested Account Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5DFD5] bg-[#FAF7F2] focus:bg-white focus:outline-none focus:border-[#264235]"
                  >
                    <option value="CLIENT">Client (Commission &amp; Fund Escrow)</option>
                    <option value="FREELANCER">Freelancer (Deliver &amp; Collect Payment)</option>
                    <option value="ARBITRATOR">Arbitrator (Neutral Dispute Resolution)</option>
                  </select>
                  <span className="block text-[10px] text-[#8A837A] mt-1">
                    Note: Server RLS enforces permissions according to the stored profile role record.
                  </span>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={loading}
                className="w-full justify-center mt-2"
              >
                {authMode === 'LOGIN' && 'Sign In'}
                {authMode === 'SIGNUP' && 'Create Account'}
                {authMode === 'RESET' && 'Send Reset Link'}
              </Button>
            </form>

            {/* Switch mode links */}
            <div className="mt-4 pt-3 border-t border-[#EFECE6] text-center text-xs text-[#605A53]">
              {authMode === 'LOGIN' ? (
                <span>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('SIGNUP');
                      setErrorMessage('');
                    }}
                    className="text-[#264235] font-bold hover:underline cursor-pointer"
                  >
                    Register here
                  </button>
                </span>
              ) : (
                <span>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('LOGIN');
                      setErrorMessage('');
                    }}
                    className="text-[#264235] font-bold hover:underline cursor-pointer"
                  >
                    Sign in here
                  </button>
                </span>
              )}
            </div>
          </div>
        )}

        <p className="text-[11px] text-[#8A837A] text-center mt-6">
          Backend authorization is checked server-side via Row Level Security (RLS).
        </p>
      </div>

      {/* Footer text */}
      <div className="max-w-md w-full mx-auto text-center text-[11px] text-[#8A837A]">
        Fairwork &bull; Verifiable Freelance &amp; Milestone Agreement Platform
      </div>
    </div>
  );
};
