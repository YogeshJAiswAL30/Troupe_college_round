import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderGit2,
  Lock,
  Clock,
  CheckCircle2,
  Plus,
  ShieldCheck,
  ArrowRight,
  AlertTriangle,
  DollarSign,
  ChevronRight,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useFairwork } from '../../context/FairworkContext';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { StatusBadge } from '../ui/StatusBadge';
import { EmptyState } from '../ui/EmptyState';
import { formatMoney } from '../../core/money';

export const ClientDashboard: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentUser,
    projects,
    milestones,
    deliveries,
    allUsers,
    handleFundEscrow,
    setActiveProjectId,
  } = useFairwork();

  const [activeTab, setActiveTab] = useState<'all' | 'needs_funding' | 'in_progress'>('all');

  // Client's projects
  const clientProjects = projects.filter((p) => p.clientId === currentUser.id);

  // Aggregated client metrics across all client projects
  const clientMilestones = milestones.filter((m) =>
    clientProjects.some((p) => p.id === m.projectId)
  );

  const activeProjectsCount = clientProjects.filter((p) => p.status === 'ACTIVE').length;
  const totalBudgetMinor = clientProjects.reduce((sum, p) => sum + p.totalBudgetMinor, 0);

  // Funds currently locked in simulated escrow
  const fundsLockedMinor = clientMilestones
    .filter((m) => m.status === 'FUNDED' || m.status === 'SUBMITTED' || m.status === 'REVISION_REQUESTED')
    .reduce((sum, m) => sum + m.amountMinor, 0);

  // Pending reviews: deliverables submitted awaiting client decision
  const pendingReviews = clientMilestones.filter((m) => m.status === 'SUBMITTED');

  // Completed & released milestones
  const completedMilestones = clientMilestones.filter((m) => m.status === 'RELEASED');

  // Milestones needing funding
  const unfundedMilestones = clientMilestones.filter((m) => m.status === 'AWAITING_FUNDING');

  // Upcoming deadlines across funded / in-progress milestones
  const upcomingDeadlines = clientMilestones
    .filter((m) => m.status === 'FUNDED' || m.status === 'SUBMITTED')
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 4);

  return (
    <div className="space-y-6">
      {/* 1. Greeting, Role, and Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E5DFD5]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#264235] bg-[#E8F0FE] text-[#1E429F] border border-[#D0E1FD] px-2 py-0.5 rounded-full">
              Client Portal
            </span>
            <span className="text-xs text-[#8A837A] font-medium">
              Reputation: {currentUser.reputationScore}/100
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1C1917]">
            Welcome, {currentUser.displayName}
          </h1>
          <p className="text-xs text-[#605A53] mt-0.5">
            Oversee verifiable agreements, fund milestone escrows, and inspect verified deliveries.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => navigate('/app/projects/new')}
          >
            Create Project
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/app/agreements')}
          >
            Agreements &rarr;
          </Button>
        </div>
      </div>

      {/* 2. Five Client Metrics Reconciled with Demo Records */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-xl bg-white border border-[#E5DFD5] shadow-xs">
          <div className="text-[11px] font-semibold text-[#8A837A] uppercase tracking-wide mb-1 flex items-center gap-1.5">
            <FolderGit2 className="w-3.5 h-3.5 text-[#264235]" />
            Active Projects
          </div>
          <div className="text-2xl font-bold text-[#1C1917]">
            {activeProjectsCount}
          </div>
          <div className="text-[11px] text-[#605A53] mt-0.5">
            {clientProjects.length} total contracts
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E5DFD5] shadow-xs">
          <div className="text-[11px] font-semibold text-[#8A837A] uppercase tracking-wide mb-1 flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-[#264235]" />
            Total Budget
          </div>
          <div className="text-2xl font-bold text-[#1C1917]">
            {formatMoney(totalBudgetMinor, 'USD')}
          </div>
          <div className="text-[11px] text-[#605A53] mt-0.5">
            Committed across projects
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E5DFD5] shadow-xs">
          <div className="text-[11px] font-semibold text-[#8A837A] uppercase tracking-wide mb-1 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-[#B45309]" />
            Funds Locked <span className="text-[9px] lowercase font-normal">(sim)</span>
          </div>
          <div className="text-2xl font-bold text-[#B45309]">
            {formatMoney(fundsLockedMinor, 'USD')}
          </div>
          <div className="text-[11px] text-[#605A53] mt-0.5">
            In simulated escrow vault
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E5DFD5] shadow-xs">
          <div className="text-[11px] font-semibold text-[#8A837A] uppercase tracking-wide mb-1 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#D97706]" />
            Pending Reviews
          </div>
          <div className="text-2xl font-bold text-[#D97706]">
            {pendingReviews.length}
          </div>
          <div className="text-[11px] text-[#605A53] mt-0.5">
            Deliverables awaiting decision
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E5DFD5] shadow-xs col-span-2 lg:col-span-1">
          <div className="text-[11px] font-semibold text-[#8A837A] uppercase tracking-wide mb-1 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#285C42]" />
            Completed
          </div>
          <div className="text-2xl font-bold text-[#285C42]">
            {completedMilestones.length}
          </div>
          <div className="text-[11px] text-[#605A53] mt-0.5">
            Milestones approved &amp; paid
          </div>
        </div>
      </div>

      {/* 3. Action Queue: Milestones Awaiting Review & Unfunded Milestones */}
      {(pendingReviews.length > 0 || unfundedMilestones.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Milestones Awaiting Review */}
          {pendingReviews.length > 0 && (
            <Card className="border-[#FDE68A] bg-[#FEF3C7]/20">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold text-[#92400E] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#D97706]" />
                    Milestones Awaiting Your Review ({pendingReviews.length})
                  </CardTitle>
                  <p className="text-xs text-[#605A53] mt-0.5">
                    Freelancer has submitted deliverable. Review against acceptance criteria.
                  </p>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                {pendingReviews.map((m) => {
                  const proj = clientProjects.find((p) => p.id === m.projectId);
                  const delivery = deliveries.find((d) => d.milestoneId === m.id);
                  return (
                    <div
                      key={m.id}
                      className="p-3.5 rounded-lg bg-white border border-[#FDE68A] flex items-center justify-between gap-3 shadow-xs"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[10px] font-bold text-[#264235] bg-[#FAF7F2] border border-[#E5DFD5] px-1.5 py-0.5 rounded">
                            {proj?.title}
                          </span>
                          <span className="text-xs font-bold text-[#1C1917] truncate">
                            {m.title}
                          </span>
                        </div>
                        <p className="text-xs text-[#605A53] truncate">
                          {delivery?.notes || m.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-mono font-bold text-[#1C1917]">
                          {formatMoney(m.amountMinor, proj?.currency || 'USD')}
                        </span>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            if (proj) setActiveProjectId(proj.id);
                            navigate(`/app/projects/${m.projectId}`);
                          }}
                        >
                          Review &rarr;
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Escrow Funding Action Queue */}
          {unfundedMilestones.length > 0 && (
            <Card className="border-[#C2DEC9] bg-[#EBF4EE]/30">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold text-[#285C42] flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-[#264235]" />
                    Milestones Awaiting Escrow Funding ({unfundedMilestones.length})
                  </CardTitle>
                  <p className="text-xs text-[#605A53] mt-0.5">
                    Deposit funds to allow the freelancer to safely begin work.
                  </p>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                {unfundedMilestones.slice(0, 3).map((m) => {
                  const proj = clientProjects.find((p) => p.id === m.projectId);
                  return (
                    <div
                      key={m.id}
                      className="p-3.5 rounded-lg bg-white border border-[#C2DEC9] flex items-center justify-between gap-3 shadow-xs"
                    >
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-[#8A837A] block truncate">
                          {proj?.title}
                        </span>
                        <span className="text-xs font-bold text-[#1C1917] truncate block">
                          {m.title}
                        </span>
                        <span className="text-[11px] text-[#605A53]">
                          Due: {m.deadline}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-mono font-bold text-[#1C1917]">
                          {formatMoney(m.amountMinor, proj?.currency || 'USD')}
                        </span>
                        <Button
                          variant="secondary"
                          size="sm"
                          leftIcon={<Lock className="w-3 h-3 text-[#264235]" />}
                          onClick={() => handleFundEscrow(m.id)}
                        >
                          Deposit Escrow
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* 4. Projects Table / List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b border-[#EFECE6] pb-3">
          <div>
            <CardTitle>Client Projects Overview</CardTitle>
            <p className="text-xs text-[#605A53] mt-0.5">
              Track project budgets, freelancer milestones, and funding status
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/app/projects')}
          >
            All Projects &rarr;
          </Button>
        </CardHeader>

        <CardContent className="p-0">
          {clientProjects.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={<FolderGit2 className="w-8 h-8 text-[#8A837A]" />}
                title="No Projects Yet"
                description="Create your first verifiable project agreement to begin working securely with freelancers."
                actionLabel="Create First Project"
                onAction={() => navigate('/app/projects/new')}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF7F2] text-[#8A837A] border-b border-[#E5DFD5]">
                  <tr>
                    <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[10px]">Project</th>
                    <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[10px]">Freelancer</th>
                    <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[10px]">Total Budget</th>
                    <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[10px]">Milestones</th>
                    <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[10px]">Next Milestone</th>
                    <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[10px]">Status</th>
                    <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[10px] text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFECE6]">
                  {clientProjects.map((project) => {
                    const projMilestones = milestones.filter((m) => m.projectId === project.id);
                    const releasedCount = projMilestones.filter((m) => m.status === 'RELEASED').length;
                    const nextMilestone = projMilestones.find((m) => m.status !== 'RELEASED');
                    const freelancer = allUsers[project.freelancerId];

                    return (
                      <tr key={project.id} className="hover:bg-[#FAF7F2]/60 transition">
                        <td className="py-3 px-4">
                          <span className="font-bold text-[#1C1917] block truncate max-w-[200px]">
                            {project.title}
                          </span>
                          <span className="text-[10px] text-[#8A837A]">
                            ID: {project.id}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium text-[#1C1917]">
                            {freelancer?.displayName || 'Freelancer'}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-[#1C1917]">
                          {formatMoney(project.totalBudgetMinor, project.currency)}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-[#605A53]">
                            {releasedCount} / {projMilestones.length} completed
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {nextMilestone ? (
                            <div>
                              <span className="font-semibold text-[#1C1917] block truncate max-w-[150px]">
                                {nextMilestone.title}
                              </span>
                              <span className="text-[10px] text-[#8A837A]">
                                Due {nextMilestone.deadline}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[#285C42] font-semibold text-[11px]">
                              All Completed
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge status={project.status} size="sm" />
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => {
                              setActiveProjectId(project.id);
                              navigate(`/app/projects/${project.id}`);
                            }}
                            className="text-xs font-semibold text-[#264235] hover:underline cursor-pointer inline-flex items-center gap-1"
                          >
                            View &rarr;
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 5. Bottom Split: Upcoming Deadlines & Funding Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Upcoming Deadlines */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#8A837A]" />
              Upcoming Milestone Deadlines
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2.5">
            {upcomingDeadlines.length === 0 ? (
              <p className="text-xs text-[#8A837A] py-2">No active milestone deadlines pending.</p>
            ) : (
              upcomingDeadlines.map((m) => (
                <div key={m.id} className="flex items-center justify-between text-xs py-1.5 border-b border-[#EFECE6] last:border-0">
                  <div className="min-w-0">
                    <span className="font-semibold text-[#1C1917] block truncate max-w-xs">
                      {m.title}
                    </span>
                    <span className="text-[10px] text-[#8A837A]">
                      Due: {m.deadline}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <StatusBadge status={m.status} size="sm" />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Funding Overview & Escrow Vault Summary */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-[#264235]" />
              Escrow Funding Transparency
            </CardTitle>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]">
              SIMULATED LEDGER
            </span>
          </CardHeader>
          <CardContent className="p-4 space-y-3 text-xs">
            <p className="text-[#605A53] leading-relaxed">
              Fairwork locks funds in escrow prior to freelancer commencement. Funds are only released upon explicit client acceptance or resolved dispute settlement.
            </p>
            <div className="p-3 rounded-lg bg-[#FAF7F2] border border-[#E5DFD5] space-y-1.5">
              <div className="flex justify-between">
                <span className="text-[#605A53]">Total In Escrow:</span>
                <span className="font-mono font-bold text-[#B45309]">
                  {formatMoney(fundsLockedMinor, 'USD')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#605A53]">Total Paid to Date:</span>
                <span className="font-mono font-bold text-[#285C42]">
                  {formatMoney(
                    clientMilestones
                      .filter((m) => m.status === 'RELEASED')
                      .reduce((sum, m) => sum + m.amountMinor, 0),
                    'USD'
                  )}
                </span>
              </div>
            </div>
            <div className="flex justify-end pt-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/app/payments')}
              >
                Inspect Ledger Records &rarr;
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
