import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderGit2,
  Lock,
  Clock,
  CheckCircle2,
  AlertTriangle,
  DollarSign,
  Upload,
  ArrowRight,
  ShieldCheck,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { useFairwork } from '../../context/FairworkContext';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { StatusBadge } from '../ui/StatusBadge';
import { EmptyState } from '../ui/EmptyState';
import { formatMoney } from '../../core/money';

export const FreelancerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentUser,
    projects,
    milestones,
    deliveries,
    reviews,
    allUsers,
    setActiveProjectId,
  } = useFairwork();

  // Projects assigned to this freelancer
  const freelancerProjects = projects.filter((p) => p.freelancerId === currentUser.id);

  // All milestones for assigned projects
  const freelancerMilestones = milestones.filter((m) =>
    freelancerProjects.some((p) => p.id === m.projectId)
  );

  // 1. Metric: Active Projects
  const activeProjectsCount = freelancerProjects.filter((p) => p.status === 'ACTIVE').length;

  // 2. Metric: Pending Payments in Escrow (Funded or In Review)
  const pendingPaymentsMinor = freelancerMilestones
    .filter((m) => m.status === 'FUNDED' || m.status === 'SUBMITTED' || m.status === 'REVISION_REQUESTED')
    .reduce((sum, m) => sum + m.amountMinor, 0);

  // 3. Metric: Released Payments (Paid to date)
  const releasedPaymentsMinor = freelancerMilestones
    .filter((m) => m.status === 'RELEASED')
    .reduce((sum, m) => sum + m.amountMinor, 0);

  // 4. Metric: Submitted Deliverables count
  const submittedDeliveriesCount = deliveries.filter((d) => d.submittedBy === currentUser.id).length;

  // 5. Work in progress: milestones currently funded and ready for delivery
  const workInProgressMilestones = freelancerMilestones.filter((m) => m.status === 'FUNDED');

  // Critical Protection Feature: Milestones that have NOT been funded yet
  const unfundedMilestones = freelancerMilestones.filter((m) => m.status === 'AWAITING_FUNDING');

  // Deliveries awaiting client review
  const inReviewMilestones = freelancerMilestones.filter((m) => m.status === 'SUBMITTED');

  // Revisions requested
  const revisionRequestedMilestones = freelancerMilestones.filter((m) => m.status === 'REVISION_REQUESTED');

  // Upcoming deadlines
  const upcomingDeadlines = freelancerMilestones
    .filter((m) => m.status === 'FUNDED' || m.status === 'AWAITING_FUNDING')
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 4);

  // Recent reviews / client feedback on freelancer's deliveries
  const freelancerReviews = reviews
    .filter((r) => {
      const del = deliveries.find((d) => d.id === r.deliveryId);
      return del?.submittedBy === currentUser.id;
    })
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* 1. Header with Freelancer Greeting & Reputation */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E5DFD5]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider bg-[#EBF4EE] text-[#285C42] border border-[#C2DEC9] px-2 py-0.5 rounded-full">
              Freelancer Workspace
            </span>
            <span className="text-xs text-[#8A837A] font-medium">
              Reputation: {currentUser.reputationScore}/100 &bull; Verified Pro
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1C1917]">
            Welcome back, {currentUser.displayName}
          </h1>
          <p className="text-xs text-[#605A53] mt-0.5">
            Deliver verifiable work, inspect escrow backing, and get paid with cryptographic provenance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/app/agreements')}
          >
            Review Agreements &rarr;
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/app/payments')}
          >
            Payment History
          </Button>
        </div>
      </div>

      {/* 2. CRITICAL FREELANCER PROTECTION BANNER: Unfunded Milestone Warning */}
      {unfundedMilestones.length > 0 && (
        <div className="p-4 rounded-xl border border-[#FDE68A] bg-[#FEF3C7]/60 shadow-xs flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-[#B45309] shrink-0 mt-0.5" />
          <div className="flex-1 text-xs space-y-1">
            <div className="font-bold text-[#92400E] text-sm flex items-center gap-2">
              <span>Freelancer Advisory: {unfundedMilestones.length} Milestone(s) Awaiting Escrow Funding</span>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 bg-[#FEF3C7] border border-[#FDE68A] rounded">
                Protective Guardrail
              </span>
            </div>
            <p className="text-[#92400E] leading-relaxed">
              <strong>Do not start work on unfunded milestones!</strong> Fairwork guarantees payout only for milestones backed by verified escrow deposits. Request your client to fund escrow before submitting billable hours.
            </p>
            <div className="pt-2 flex flex-wrap gap-2">
              {unfundedMilestones.map((m) => {
                const proj = freelancerProjects.find((p) => p.id === m.projectId);
                return (
                  <div
                    key={m.id}
                    className="px-2.5 py-1 rounded-md bg-white border border-[#FDE68A] text-[11px] text-[#92400E] font-medium flex items-center gap-1.5"
                  >
                    <span>{proj?.title}:</span>
                    <span className="font-bold">{m.title}</span>
                    <span className="font-mono font-bold text-[#1C1917]">
                      ({formatMoney(m.amountMinor, proj?.currency || 'USD')})
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 3. Five Freelancer Metrics */}
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
            {freelancerProjects.length} total contracts
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E5DFD5] shadow-xs">
          <div className="text-[11px] font-semibold text-[#8A837A] uppercase tracking-wide mb-1 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-[#B45309]" />
            Escrow Backed <span className="text-[9px] lowercase font-normal">(sim)</span>
          </div>
          <div className="text-2xl font-bold text-[#B45309]">
            {formatMoney(pendingPaymentsMinor, 'USD')}
          </div>
          <div className="text-[11px] text-[#605A53] mt-0.5">
            Guaranteed in escrow
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E5DFD5] shadow-xs">
          <div className="text-[11px] font-semibold text-[#8A837A] uppercase tracking-wide mb-1 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#285C42]" />
            Released Payments
          </div>
          <div className="text-2xl font-bold text-[#285C42]">
            {formatMoney(releasedPaymentsMinor, 'USD')}
          </div>
          <div className="text-[11px] text-[#605A53] mt-0.5">
            Paid to your wallet
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E5DFD5] shadow-xs">
          <div className="text-[11px] font-semibold text-[#8A837A] uppercase tracking-wide mb-1 flex items-center gap-1.5">
            <Upload className="w-3.5 h-3.5 text-[#264235]" />
            Deliverables
          </div>
          <div className="text-2xl font-bold text-[#1C1917]">
            {submittedDeliveriesCount}
          </div>
          <div className="text-[11px] text-[#605A53] mt-0.5">
            SHA-256 fingerprinted
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E5DFD5] shadow-xs col-span-2 lg:col-span-1">
          <div className="text-[11px] font-semibold text-[#8A837A] uppercase tracking-wide mb-1 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#D97706]" />
            In Review
          </div>
          <div className="text-2xl font-bold text-[#D97706]">
            {inReviewMilestones.length}
          </div>
          <div className="text-[11px] text-[#605A53] mt-0.5">
            Awaiting client sign-off
          </div>
        </div>
      </div>

      {/* 4. Active Work in Progress: Funded Milestones with Ready-to-Submit Action */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Work in Progress (Funded) */}
        <Card className="border-[#C2DEC9] bg-[#EBF4EE]/20">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold text-[#285C42] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#285C42]" />
                Work In Progress &bull; Escrow Secured ({workInProgressMilestones.length})
              </CardTitle>
              <p className="text-xs text-[#605A53] mt-0.5">
                Funds are verified in escrow. Safe to develop and submit deliverable.
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {workInProgressMilestones.length === 0 ? (
              <div className="p-4 text-center text-xs text-[#8A837A] bg-white rounded-lg border border-[#E5DFD5]">
                No funded milestones waiting on your submission.
              </div>
            ) : (
              workInProgressMilestones.map((m) => {
                const proj = freelancerProjects.find((p) => p.id === m.projectId);
                return (
                  <div
                    key={m.id}
                    className="p-3.5 rounded-lg bg-white border border-[#C2DEC9] flex items-center justify-between gap-3 shadow-xs"
                  >
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-[#264235] bg-[#FAF7F2] border border-[#E5DFD5] px-1.5 py-0.5 rounded">
                        {proj?.title}
                      </span>
                      <h4 className="text-xs font-bold text-[#1C1917] truncate mt-1">
                        {m.title}
                      </h4>
                      <p className="text-[11px] text-[#605A53] truncate">
                        Deadline: {m.deadline} &bull; {m.acceptanceCriteria.length} acceptance criteria
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-mono font-bold text-[#1C1917]">
                        {formatMoney(m.amountMinor, proj?.currency || 'USD')}
                      </span>
                      <Button
                        variant="primary"
                        size="sm"
                        leftIcon={<Upload className="w-3 h-3" />}
                        onClick={() => {
                          if (proj) setActiveProjectId(proj.id);
                          navigate(`/app/projects/${m.projectId}`);
                        }}
                      >
                        Submit &rarr;
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Deliveries in Review & Revisions */}
        <Card className="border-[#E5DFD5]">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#D97706]" />
                Deliveries Awaiting Client Review ({inReviewMilestones.length + revisionRequestedMilestones.length})
              </CardTitle>
              <p className="text-xs text-[#605A53] mt-0.5">
                Submitted with immutable SHA-256 evidence. Client review window active.
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {inReviewMilestones.length === 0 && revisionRequestedMilestones.length === 0 ? (
              <div className="p-4 text-center text-xs text-[#8A837A] bg-[#FAF7F2] rounded-lg border border-[#E5DFD5]">
                No deliverables currently pending client inspection.
              </div>
            ) : (
              <>
                {revisionRequestedMilestones.map((m) => {
                  const proj = freelancerProjects.find((p) => p.id === m.projectId);
                  return (
                    <div
                      key={m.id}
                      className="p-3 rounded-lg bg-[#FEF3C7]/40 border border-[#FDE68A] flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-[#92400E] block">
                          Revision Requested &bull; {proj?.title}
                        </span>
                        <span className="font-bold text-[#1C1917] block truncate">
                          {m.title}
                        </span>
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          if (proj) setActiveProjectId(proj.id);
                          navigate(`/app/projects/${m.projectId}`);
                        }}
                      >
                        Revise &rarr;
                      </Button>
                    </div>
                  );
                })}

                {inReviewMilestones.map((m) => {
                  const proj = freelancerProjects.find((p) => p.id === m.projectId);
                  return (
                    <div
                      key={m.id}
                      className="p-3 rounded-lg bg-[#FAF7F2] border border-[#E5DFD5] flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-[#8A837A] block">
                          In Client Review &bull; {proj?.title}
                        </span>
                        <span className="font-semibold text-[#1C1917] block truncate">
                          {m.title}
                        </span>
                      </div>
                      <span className="text-xs font-mono font-bold text-[#1C1917]">
                        {formatMoney(m.amountMinor, proj?.currency || 'USD')}
                      </span>
                    </div>
                  );
                })}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 5. Assigned Projects Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b border-[#EFECE6] pb-3">
          <div>
            <CardTitle>Assigned Projects</CardTitle>
            <p className="text-xs text-[#605A53] mt-0.5">
              Review current milestones, funding states, and deadlines
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
          {freelancerProjects.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={<FolderGit2 className="w-8 h-8 text-[#8A837A]" />}
                title="No Assigned Projects"
                description="You do not have any active project contracts assigned to your account yet."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF7F2] text-[#8A837A] border-b border-[#E5DFD5]">
                  <tr>
                    <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[10px]">Project</th>
                    <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[10px]">Client</th>
                    <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[10px]">Current Milestone</th>
                    <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[10px]">Amount</th>
                    <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[10px]">Funding Status</th>
                    <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[10px]">Deadline</th>
                    <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[10px] text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFECE6]">
                  {freelancerProjects.map((project) => {
                    const projMilestones = milestones.filter((m) => m.projectId === project.id);
                    const currentMilestone = projMilestones.find((m) => m.status !== 'RELEASED') || projMilestones[0];
                    const client = allUsers[project.clientId];
                    const isFunded = currentMilestone?.status === 'FUNDED';

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
                            {client?.displayName || 'Client'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-[#1C1917] block truncate max-w-[160px]">
                            {currentMilestone?.title}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-[#1C1917]">
                          {formatMoney(currentMilestone?.amountMinor || 0, project.currency)}
                        </td>
                        <td className="py-3 px-4">
                          {currentMilestone && <StatusBadge status={currentMilestone.status} size="sm" />}
                        </td>
                        <td className="py-3 px-4 text-[#605A53]">
                          {currentMilestone?.deadline}
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

      {/* 6. Client Feedback & Payment Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Client Review Feedback */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-[#264235]" />
              Verified Client Feedback
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3 text-xs">
            {freelancerReviews.length === 0 ? (
              <p className="text-xs text-[#8A837A] py-2">No reviews recorded yet.</p>
            ) : (
              freelancerReviews.map((rev) => (
                <div key={rev.id} className="p-3 rounded-lg bg-[#FAF7F2] border border-[#E5DFD5] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#1C1917] capitalize">
                      Decision: {rev.decision.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[10px] text-[#8A837A]">
                      {new Date(rev.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-[#605A53] italic">"{rev.feedback}"</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Cryptographic Assurance & Integrity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#285C42]" />
              Cryptographic Delivery Integrity
            </CardTitle>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#EBF4EE] text-[#285C42] border border-[#C2DEC9]">
              SHA-256 AUDIT
            </span>
          </CardHeader>
          <CardContent className="p-4 space-y-3 text-xs">
            <p className="text-[#605A53] leading-relaxed">
              Every deliverable submitted by your account computes a client-side SHA-256 fingerprint before upload. This guarantees your original work cannot be tampered with or retroactively disputed.
            </p>
            <div className="p-3 rounded-lg bg-[#FAF7F2] border border-[#E5DFD5] space-y-1 text-[11px]">
              <div className="text-[#605A53]">
                Total verified uploads: <strong>{submittedDeliveriesCount}</strong>
              </div>
              <div className="text-[#605A53]">
                Total payouts collected: <strong>{formatMoney(releasedPaymentsMinor, 'USD')}</strong>
              </div>
            </div>
            <div className="flex justify-end pt-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/app/activity')}
              >
                Inspect Activity Log &rarr;
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
