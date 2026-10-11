import React, { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  LayoutDashboard,
  FolderGit2,
  FileText,
  CreditCard,
  Scale,
  History,
  Settings,
  Menu,
  X,
  ExternalLink,
  UserCheck,
  ChevronDown,
  Sparkles,
  PlayCircle,
} from 'lucide-react';
import { useFairwork } from '../../context/FairworkContext';
import { Toast } from '../ui/Toast';
import { UserRole } from '../../types/fairwork';
import { DemoGuideModal } from '../demo/DemoGuideModal';

export const AppShell: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [personaDropdownOpen, setPersonaDropdownOpen] = useState(false);
  const [demoGuideOpen, setDemoGuideOpen] = useState(false);
  const { currentUser, allUsers, setCurrentUser, toast, dismissToast } = useFairwork();
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { to: '/app', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" />, end: true },
    { to: '/app/projects', label: 'Projects', icon: <FolderGit2 className="w-4 h-4" /> },
    { to: '/app/agreements', label: 'Agreements', icon: <FileText className="w-4 h-4" /> },
    { to: '/app/payments', label: 'Payments & Escrow', icon: <CreditCard className="w-4 h-4" /> },
    { to: '/app/disputes', label: 'Disputes', icon: <Scale className="w-4 h-4" /> },
    { to: '/app/activity', label: 'Activity Audit', icon: <History className="w-4 h-4" /> },
    { to: '/app/settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  const roleBadgeStyle: Record<UserRole, string> = {
    CLIENT: 'bg-[#E8F0FE] text-[#1E429F] border-[#D0E1FD]',
    FREELANCER: 'bg-[#EBF4EE] text-[#285C42] border-[#C2DEC9]',
    ARBITRATOR: 'bg-[#F3E8FF] text-[#6B21A8] border-[#E9D5FF]',
    ADMIN: 'bg-[#FEE2E2] text-[#991B1B] border-[#FECACA]',
  };

  return (
    <div className="min-h-screen bg-[#F8F5EE] text-[#1C1917] flex flex-col md:flex-row">
      {/* Toast Notification Container */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 max-w-sm w-full animate-in fade-in slide-in-from-top-2 duration-200">
          <Toast
            type={toast.type}
            title={toast.title}
            message={toast.message}
            onClose={dismissToast}
          />
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-[#E5DFD5] bg-white h-screen sticky top-0 shrink-0 select-none">
        {/* Brand Header */}
        <div className="p-5 border-b border-[#EFECE6] flex items-center justify-between">
          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition"
          >
            <div className="w-8 h-8 rounded-lg bg-[#264235] flex items-center justify-center text-white shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-[#1C1917]">
                Fairwork
              </span>
              <span className="block text-[10px] text-[#8A837A] font-medium tracking-wide">
                VERIFIABLE ESCROW
              </span>
            </div>
          </div>
          <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]">
            DEMO
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
          <div className="px-3 py-1.5 text-[10px] font-bold text-[#8A837A] uppercase tracking-wider">
            Workspace
          </div>
          {navLinks.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#264235] text-white shadow-xs'
                    : 'text-[#605A53] hover:text-[#1C1917] hover:bg-[#FAF7F2]'
                }`
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Public Website Shortcut & Documentation */}
        <div className="p-3 border-t border-[#EFECE6] bg-[#FAF7F2]/50">
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-[#605A53] hover:text-[#1C1917] hover:bg-white rounded-lg transition border border-transparent hover:border-[#E5DFD5] cursor-pointer"
          >
            <span>Public Site &amp; FAQ</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#8A837A]" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 border-b border-[#E5DFD5] bg-white sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
          {/* Mobile Brand & Hamburger */}
          <div className="flex items-center gap-3 md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg border border-[#E5DFD5] text-[#605A53] hover:bg-[#FAF7F2] cursor-pointer"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <span
              onClick={() => navigate('/')}
              className="font-bold text-base text-[#1C1917] cursor-pointer flex items-center gap-1.5"
            >
              <ShieldCheck className="w-5 h-5 text-[#264235]" />
              Fairwork
            </span>
          </div>

          {/* Breadcrumb / Current Route Indicator on Desktop */}
          <div className="hidden md:flex items-center gap-2 text-xs text-[#8A837A]">
            <span>App</span>
            <span>/</span>
            <span className="font-semibold text-[#1C1917] capitalize">
              {location.pathname.split('/')[2] || 'Dashboard'}
            </span>
          </div>

          {/* Right Header Controls: Demo Walkthrough Button + Demo Label + Persona Switcher */}
          <div className="flex items-center gap-2.5">
            {/* Demo Walkthrough Trigger Pill */}
            <button
              onClick={() => setDemoGuideOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#264235] text-white hover:bg-[#1E352A] transition text-xs font-semibold shadow-xs cursor-pointer"
            >
              <PlayCircle className="w-3.5 h-3.5 text-[#FDE68A]" />
              <span className="hidden sm:inline">Demo Guide</span>
              <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded font-mono font-normal">
                &lt;5m
              </span>
            </button>

            {/* Subtle Demo Disclosure Label */}
            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#FEF3C7]/60 border border-[#FDE68A] text-[#92400E] text-[11px] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D97706] animate-pulse" />
              <span>Simulated Escrow &bull; SHA-256 Provenance</span>
            </div>

            {/* Persona Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setPersonaDropdownOpen(!personaDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#E5DFD5] bg-[#FAF7F2] hover:bg-white transition cursor-pointer text-xs"
              >
                <UserCheck className="w-3.5 h-3.5 text-[#264235]" />
                <span className="font-medium text-[#1C1917] truncate max-w-[120px] sm:max-w-none">
                  {currentUser.displayName}
                </span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-mono border ${
                    roleBadgeStyle[currentUser.role]
                  }`}
                >
                  {currentUser.role}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-[#8A837A]" />
              </button>

              {personaDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-64 rounded-xl bg-white border border-[#E5DFD5] shadow-lg py-1.5 z-40 focus:outline-none animate-in fade-in duration-100">
                  <div className="px-3 py-1.5 border-b border-[#EFECE6] text-[11px] text-[#8A837A]">
                    Switch Active Persona:
                  </div>
                  {Object.values(allUsers).map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        setCurrentUser(u);
                        setPersonaDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-[#FAF7F2] transition cursor-pointer ${
                        u.id === currentUser.id ? 'bg-[#FAF7F2]/80 font-bold' : ''
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="text-[#1C1917]">{u.displayName}</span>
                        <span className="text-[10px] text-[#8A837A]">{u.email}</span>
                      </div>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded font-mono border ${
                          roleBadgeStyle[u.role]
                        }`}
                      >
                        {u.role}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-[#E5DFD5] bg-white p-4 space-y-1 shadow-md">
            {navLinks.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                    isActive
                      ? 'bg-[#264235] text-white'
                      : 'text-[#605A53] hover:text-[#1C1917] hover:bg-[#FAF7F2]'
                  }`
                }
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
            <div className="pt-2 border-t border-[#EFECE6]">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/');
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-[#605A53] hover:bg-[#FAF7F2] rounded-lg"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Public Landing &amp; FAQ</span>
              </button>
            </div>
          </div>
        )}

        {/* Page Content View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Demo Guide Modal */}
      <DemoGuideModal
        isOpen={demoGuideOpen}
        onClose={() => setDemoGuideOpen(false)}
      />
    </div>
  );
};
