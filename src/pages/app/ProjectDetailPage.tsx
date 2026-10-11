import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Lock,
  Edit3,
  Layers,
  Upload,
  CreditCard,
  Scale,
  History,
  AlertTriangle,
  FolderGit2,
  Calendar,
  DollarSign,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { useFairwork } from '../../context/FairworkContext';
import { Button } from '../../components/ui/Button';
import { Tabs, TabItem } from '../../components/ui/Tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { ProgressBar } from '../../components/ui/Progress';
import { EmptyState } from '../../components/ui/EmptyState';
import { MilestoneCard } from '../../components/MilestoneCard';
import { DeliverableModal } from '../../components/DeliverableModal';
import { ReviewModal } from '../../components/ReviewModal';
import { DisputeModal } from '../../components/DisputeModal';
import { AmendmentModal } from '../../components/AmendmentModal';
import { MilestoneDetailModal } from '../../components/MilestoneDetailModal';
import { Milestone, Delivery } from '../../types/fairwork';
import { formatMoney } from '../../core/money';
import { GatewayCheckoutModal } from '../../components/payment/GatewayCheckoutModal';

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    projects,
    activeProject,
    agreements,
    agreement: defaultAgreement,
    milestones,
    deliveries,
    reviews,
    payments,
    events,
    disputes,
    allUsers,
    currentUser,
    handleFundEscrow,
    handleSubmitDeliverable,
    handleReviewDeliverable,
    handleReleasePayment,
    handleAcceptAgreement,
    handleProposeAmendment,
    handleRaiseDispute,
    handleProposeSettlement,
    handleExecuteSettlement,
  } = useFairwork();

  const [activeTab, setActiveTab] = useState<string>('overview');

  // Selected project
  const project = projects.find((p) => p.id === id) || activeProject;
  const projectAgreement =
    (project.activeAgreementId && agreements.find((a) => a.id === project.activeAgreementId)) ||
    agreements.find((a) => a.projectId === project.id && a.isActive) ||
    agreements.find((a) => a.projectId === project.id) ||
    defaultAgreement;

  const projectMilestones = milestones.filter((m) => m.projectId === project.id);
  const projectDeliveries = deliveries.filter((d) =>
    projectMilestones.some((m) => m.id === d.milestoneId)
  );
  const projectReviews = reviews.filter((r) =>
    projectMilestones.some((m) => m.id === r.milestoneId)
  );
  const projectPayments = payments.filter((p) => p.projectId === project.id);
  const projectEvents = events.filter((e) => e.projectId === project.id);
  const projectDisputes = Object.values(disputes).filter((dsp) => dsp.projectId === project.id);

  // Modals state
  const [activeFundingMilestone, setActiveFundingMilestone] = useState<Milestone | null>(null);
  const [activeDeliverableMilestone, setActiveDeliverableMilestone] = useState<Milestone | null>(null);
  const [activeReviewData, setActiveReviewData] = useState<{ milestone: Milestone; delivery: Delivery } | null>(null);
  const [activeDisputeMilestone, setActiveDisputeMilestone] = useState<Milestone | null>(null);
  const [selectedMilestoneForDetail, setSelectedMilestoneForDetail] = useState<Milestone | null>(null);
  const [isAmendmentOpen, setIsAmendmentOpen] = useState(false);

  const client = allUsers[project.clientId];
  const freelancer = allUsers[project.freelancerId];
  const clientAccepted = Boolean(projectAgreement.acceptedBy[project.clientId]);
  const freelancerAccepted = Boolean(projectAgreement.acceptedBy[project.freelancerId]);
  const isParticipant = currentUser.id === project.clientId || currentUser.id === project.freelancerId;
  const userHasAccepted = Boolean(projectAgreement.acceptedBy[currentUser.id]);

  // Derived progress and funding statistics
  const completedMilestones = projectMilestones.filter((m) => m.status === 'RELEASED');
  const completionPercent = projectMilestones.length > 0
    ? Math.round((completedMilestones.length / projectMilestones.length) * 100)
    : 0;

  const totalFundedMinor = projectMilestones
    .filter((m) => m.status === 'FUNDED' || m.status === 'SUBMITTED' || m.status === 'REVISION_REQUESTED')
    .reduce((sum, m) => sum + m.amountMinor, 0);

  const totalReleasedMinor = completedMilestones.reduce((sum, m) => sum + m.amountMinor, 0);
  const totalDisputedMinor = projectMilestones
    .filter((m) => m.status === 'DISPUTED')
    .reduce((sum, m) => sum + m.amountMinor, 0);

  const currentMilestone = projectMilestones.find((m) => m.status !== 'RELEASED') || projectMilestones[0];

  // 7 Distinct Workspace Tabs
  const workspaceTabs: TabItem[] = [
    { id: 'overview', label: 'Overview', icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'milestones', label: 'Milestones', badge: projectMilestones.length, icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
    { id: 'deliverables', label: 'Deliverables', badge: projectDeliveries.length, icon: <Upload className="w-3.5 h-3.5" /> },
    { id: 'agreement', label: 'Agreement', icon: <FileText className="w-3.5 h-3.5" /> },
    { id: 'payments', label: 'Payments & Escrow', badge: projectPayments.length, icon: <CreditCard className="w-3.5 h-3.5" /> },
    { id: 'activity', label: 'Activity Audit', badge: projectEvents.length, icon: <History className="w-3.5 h-3.5" /> },
    { id: 'disputes', label: 'Disputes', badge: projectDisputes.length > 0 ? projectDisputes.length : undefined, icon: <Scale className="w-3.5 h-3.5" /> },
  ];

  // Access Control: Only Client, Freelancer, Arbitrators, or Admins can view project details
  const hasAccess = isParticipant || currentUser.role === 'ARBITRATOR' || currentUser.role === 'ADMIN';

  if (!hasAccess) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 rounded-2xl bg-white border border-[#FECACA] shadow-sm text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-[#FEF2F2] text-[#991B1B] flex items-center justify-center mx-auto">
          <Scale className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-[#1C1917]">
            Unauthorized Project Access (RLS Blocked)
          </h2>
          <p className="text-xs text-[#605A53] mt-1.5 leading-relaxed">
            Under Row-Level Security rules, project workspaces and private contract deliverables are strictly restricted to assigned participants ({client?.displayName} &amp; {freelancer?.displayName}) and certified neutral arbitrators.
          </p>
        </div>
        <div className="pt-2">
          <Button variant="primary" size="sm" onClick={() => navigate('/app/projects')}>
            Return to Authorized Projects
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* 1. PROJECT WORKSPACE HEADER */}
      <div className="p-6 rounded-2xl bg-white border border-[#E5DFD5] shadow-xs space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
                onClick={() => navigate('/app/projects')}
                className="p-1 px-2 text-[#8A837A] hover:text-[#1C1917]"
              >
                Projects
              </Button>
              <span className="text-[#D8D0C3]">&bull;</span>
              <StatusBadge status={project.status} size="sm" />
              <span className="text-xs font-mono font-bold text-[#8A837A]">
                ID: {project.id}
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-[#1C1917]">
              {project.title}
            </h1>
            <p className="text-xs text-[#605A53] mt-1 max-w-3xl leading-relaxed">
              {project.description}
            </p>
          </div>

          {/* Context-Appropriate Header Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {isParticipant && !userHasAccepted && (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<ShieldCheck className="w-3.5 h-3.5" />}
                onClick={() => handleAcceptAgreement(projectAgreement.id, project.id)}
              >
                Sign Agreement v{projectAgreement.versionNumber}
              </Button>
            )}

            {isParticipant && (
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                onClick={() => setIsAmendmentOpen(true)}
              >
                Amend Terms (Rule 7)
              </Button>
            )}
          </div>
        </div>

        {/* Metadata & Key Metrics Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-3 border-t border-[#EFECE6] text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-[#8A837A] block">Total Budget</span>
            <span className="font-mono font-bold text-sm text-[#1C1917]">
              {formatMoney(project.totalBudgetMinor, project.currency)}
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-[#8A837A] block">Progress</span>
            <div className="flex items-center gap-2 mt-0.5">
              <ProgressBar value={completionPercent} className="w-16" />
              <span className="font-bold text-[#1C1917]">{completionPercent}%</span>
            </div>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-[#8A837A] block">Client</span>
            <span className="font-semibold text-[#1C1917] block truncate">
              {client?.displayName || 'Client'}
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-[#8A837A] block">Freelancer</span>
            <span className="font-semibold text-[#1C1917] block truncate">
              {freelancer?.displayName || 'Freelancer'}
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-[#8A837A] block">Target Completion</span>
            <span className="font-semibold text-[#1C1917]">
              {project.targetCompletionDate || 'Flexible'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. WORKSPACE TABS */}
      <Tabs
        tabs={workspaceTabs}
        activeTab={activeTab}
        onChange={(tabId) => setActiveTab(tabId)}
      />

      {/* 3. TAB CONTENT */}

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Funding Summary & Progress Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-xl bg-white border border-[#E5DFD5]">
              <div className="text-[11px] font-semibold text-[#8A837A] uppercase tracking-wide mb-1 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-[#264235]" />
                Contract Budget
              </div>
              <div className="text-xl font-bold font-mono text-[#1C1917]">
                {formatMoney(project.totalBudgetMinor, project.currency)}
              </div>
              <div className="text-[11px] text-[#605A53] mt-0.5">Rule 1 balanced (100%)</div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-[#E5DFD5]">
              <div className="text-[11px] font-semibold text-[#8A837A] uppercase tracking-wide mb-1 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#B45309]" />
                In Escrow <span className="text-[9px] lowercase font-normal">(sim)</span>
              </div>
              <div className="text-xl font-bold font-mono text-[#B45309]">
                {formatMoney(totalFundedMinor, project.currency)}
              </div>
              <div className="text-[11px] text-[#605A53] mt-0.5">Locked &amp; backed</div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-[#E5DFD5]">
              <div className="text-[11px] font-semibold text-[#8A837A] uppercase tracking-wide mb-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#285C42]" />
                Released Payouts
              </div>
              <div className="text-xl font-bold font-mono text-[#285C42]">
                {formatMoney(totalReleasedMinor, project.currency)}
              </div>
              <div className="text-[11px] text-[#605A53] mt-0.5">Completed milestones</div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-[#E5DFD5]">
              <div className="text-[11px] font-semibold text-[#8A837A] uppercase tracking-wide mb-1 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-[#991B1B]" />
                In Dispute
              </div>
              <div className="text-xl font-bold font-mono text-[#991B1B]">
                {formatMoney(totalDisputedMinor, project.currency)}
              </div>
              <div className="text-[11px] text-[#605A53] mt-0.5">Ordinary release locked</div>
            </div>
          </div>

          {/* Current Milestone Highlight */}
          {currentMilestone && (
            <Card className="border-[#C2DEC9] bg-[#EBF4EE]/30">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold text-[#285C42] flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#285C42]" />
                    Current Active Milestone
                  </CardTitle>
                  <p className="text-xs text-[#605A53] mt-0.5">
                    The next sequential deliverable required to advance project progress.
                  </p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSelectedMilestoneForDetail(currentMilestone)}
                >
                  Inspect Milestone &rarr;
                </Button>
              </CardHeader>
              <CardContent className="pt-0">
                <MilestoneCard
                  milestone={currentMilestone}
                  project={project}
                  currentUser={currentUser}
                  deliveries={deliveries}
                  reviews={reviews}
                  onFundEscrow={(m) => handleFundEscrow(m.id)}
                  onSubmitDeliverable={(m) => setActiveDeliverableMilestone(m)}
                  onReviewDeliverable={(m, d) => setActiveReviewData({ milestone: m, delivery: d })}
                  onReleasePayment={(m) => handleReleasePayment(m.id)}
                  onOpenDispute={(m) => setActiveDisputeMilestone(m)}
                  onSelectMilestone={(m) => setSelectedMilestoneForDetail(m)}
                />
              </CardContent>
            </Card>
          )}

          {/* Milestone Timeline Summary & Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between border-b border-[#EFECE6] pb-3">
                  <CardTitle className="text-sm font-bold">
                    Milestone Progress ({completedMilestones.length}/{projectMilestones.length} Done)
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveTab('milestones')}
                  >
                    View All &rarr;
                  </Button>
                </CardHeader>
                <CardContent className="p-0 divide-y divide-[#EFECE6]">
                  {projectMilestones.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => setSelectedMilestoneForDetail(m)}
                      className="p-3.5 hover:bg-[#FAF7F2] transition flex items-center justify-between gap-3 cursor-pointer"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <StatusBadge status={m.status} size="sm" />
                          <span className="text-[11px] text-[#8A837A]">
                            Due {m.deadline}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-[#1C1917] truncate">
                          {m.title}
                        </h4>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-mono font-bold text-xs text-[#1C1917]">
                          {formatMoney(m.amountMinor, project.currency)}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-[#8A837A] inline-block ml-1" />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity Log */}
            <div>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between border-b border-[#EFECE6] pb-3">
                  <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                    <History className="w-4 h-4 text-[#8A837A]" />
                    Audit Log
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveTab('activity')}
                  >
                    All &rarr;
                  </Button>
                </CardHeader>
                <CardContent className="p-3 space-y-2.5 text-xs">
                  {projectEvents.length === 0 ? (
                    <p className="text-xs text-[#8A837A] p-2">No activity recorded yet.</p>
                  ) : (
                    projectEvents.slice(0, 5).map((evt) => (
                      <div key={evt.id} className="pb-2 border-b border-[#EFECE6] last:border-0 last:pb-0">
                        <div className="flex items-center justify-between text-[10px] text-[#8A837A] font-mono mb-0.5">
                          <span>{evt.eventType.replace(/_/g, ' ')}</span>
                          <span>{new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-[11px] text-[#1C1917] leading-snug">
                          {evt.details}
                        </p>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MILESTONES (Interactive Timeline & List) */}
      {activeTab === 'milestones' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#1C1917]">
                Milestone Schedule ({projectMilestones.length})
              </h2>
              <p className="text-xs text-[#605A53]">
                Click any milestone to inspect criteria, review history, or trigger state transitions.
              </p>
            </div>

            <span className="text-xs text-[#8A837A]">
              Viewing as: <strong>{currentUser.role}</strong>
            </span>
          </div>

          <div className="space-y-4">
            {projectMilestones.map((milestone) => (
              <MilestoneCard
                key={milestone.id}
                milestone={milestone}
                project={project}
                currentUser={currentUser}
                deliveries={deliveries}
                reviews={reviews}
                onFundEscrow={(m) => setActiveFundingMilestone(m)}
                onSubmitDeliverable={(m) => setActiveDeliverableMilestone(m)}
                onReviewDeliverable={(m, d) => setActiveReviewData({ milestone: m, delivery: d })}
                onReleasePayment={(m) => handleReleasePayment(m.id)}
                onOpenDispute={(m) => setActiveDisputeMilestone(m)}
                onSelectMilestone={(m) => setSelectedMilestoneForDetail(m)}
              />
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: DELIVERABLES */}
      {activeTab === 'deliverables' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#1C1917]">
                Deliverable Submissions ({projectDeliveries.length})
              </h2>
              <p className="text-xs text-[#605A53]">
                Full revision history with SHA-256 integrity fingerprints and attached evidence.
              </p>
            </div>
          </div>

          {projectDeliveries.length === 0 ? (
            <Card className="p-8">
              <EmptyState
                icon={<Upload className="w-8 h-8 text-[#8A837A]" />}
                title="No Deliverables Submitted"
                description="Freelancer submissions will appear here with cryptographic file fingerprints and verification notes."
              />
            </Card>
          ) : (
            <div className="space-y-3">
              {projectDeliveries.map((del) => {
                const milestone = projectMilestones.find((m) => m.id === del.milestoneId);
                const review = projectReviews.find((r) => r.deliveryId === del.id);

                return (
                  <Card key={del.id} className="p-5 space-y-3 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EFECE6] pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#1C1917] text-sm">
                          {milestone?.title}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FAF7F2] border border-[#E5DFD5] text-[#264235] font-bold">
                          Revision #{del.revisionNumber}
                        </span>
                        {review && (
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                              review.decision === 'APPROVED'
                                ? 'bg-[#EBF4EE] text-[#285C42] border-[#C2DEC9]'
                                : 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]'
                            }`}
                          >
                            Review: {review.decision}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-mono text-[#8A837A]">
                        {new Date(del.timestamp).toLocaleString()}
                      </span>
                    </div>

                    <p className="text-[#605A53] italic bg-[#FAF7F2] p-3 rounded-xl border border-[#E5DFD5]">
                      &ldquo;{del.notes}&rdquo;
                    </p>

                    {/* Files */}
                    <div className="space-y-1.5">
                      {del.files.map((file, fIdx) => (
                        <div
                          key={fIdx}
                          className="p-2.5 rounded-lg bg-white border border-[#E5DFD5] flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText className="w-4 h-4 text-[#264235]" />
                            <span className="font-semibold text-[#1C1917] truncate">{file.name}</span>
                            <span className="text-[#8A837A] font-mono text-[10px]">
                              ({(file.sizeBytes / (1024 * 1024)).toFixed(2)} MB)
                            </span>
                          </div>
                          <code className="text-[10px] font-mono text-[#8A837A] shrink-0 ml-2">
                            SHA-256: {file.sha256Hash?.slice(0, 20)}...
                          </code>
                        </div>
                      ))}
                    </div>

                    {del.externalUrl && (
                      <div className="text-[11px] text-[#264235] flex items-center gap-1">
                        <span>External Repository:</span>
                        <a
                          href={del.externalUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="font-bold underline"
                        >
                          {del.externalUrl}
                        </a>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: AGREEMENT */}
      {activeTab === 'agreement' && (
        <div className="space-y-4">
          <Card className="p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EFECE6] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#1C1917]">
                  Verifiable Agreement Specification (v{projectAgreement.versionNumber})
                </h3>
                <p className="text-xs text-[#605A53] mt-0.5">
                  Cryptographically fingerprinted terms binding both parties.
                </p>
              </div>

              <span
                className={`text-xs px-2.5 py-1 rounded font-bold border ${
                  projectAgreement.isActive
                    ? 'bg-[#EBF4EE] text-[#285C42] border-[#C2DEC9]'
                    : 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]'
                }`}
              >
                {projectAgreement.isActive ? 'ACTIVE & BINDING' : 'PENDING COUNTERSIGNATURE'}
              </span>
            </div>

            <div className="space-y-3 text-xs text-[#1C1917]">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#8A837A] block">
                  Scope Summary
                </span>
                <p className="p-3 rounded-lg bg-[#FAF7F2] border border-[#E5DFD5] mt-1">
                  {projectAgreement.structuredTerms.scopeSummary}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-[#FAF7F2] border border-[#E5DFD5]">
                  <span className="text-[10px] uppercase font-bold text-[#8A837A] block">
                    IP Assignment
                  </span>
                  <span className="font-semibold block mt-0.5">
                    {projectAgreement.structuredTerms.intellectualPropertyClause === 'ON_PAYMENT'
                      ? 'Transfers Upon Escrow Release'
                      : projectAgreement.structuredTerms.intellectualPropertyClause}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-[#FAF7F2] border border-[#E5DFD5]">
                  <span className="text-[10px] uppercase font-bold text-[#8A837A] block">
                    Governing Law
                  </span>
                  <span className="font-semibold block mt-0.5">
                    {projectAgreement.structuredTerms.governingLaw || 'Commercial Arbitration Rules'}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-[#8A837A] block">
                  Digital Consent Signatures
                </span>
                <div className="mt-1 space-y-1.5 font-mono text-[11px]">
                  <div className="p-2 rounded bg-white border border-[#E5DFD5] flex justify-between">
                    <span>Client Signature ({project.clientId}):</span>
                    <span className="text-[#285C42] font-semibold">
                      {clientAccepted ? '✓ Recorded & Verified' : 'Pending'}
                    </span>
                  </div>
                  <div className="p-2 rounded bg-white border border-[#E5DFD5] flex justify-between">
                    <span>Freelancer Signature ({project.freelancerId}):</span>
                    <span className="text-[#285C42] font-semibold">
                      {freelancerAccepted ? '✓ Recorded & Verified' : 'Pending'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#FAF7F2] border border-[#E5DFD5] text-[11px] font-mono break-all">
                <span className="text-[#8A837A] block mb-0.5">SHA-256 Agreement Hash:</span>
                <code>{projectAgreement.agreementHash}</code>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 5: PAYMENTS */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#1C1917]">
                Transaction &amp; Escrow Ledger ({projectPayments.length})
              </h2>
              <p className="text-xs text-[#605A53]">
                Simulated on-chain escrow deposits and milestone payment releases.
              </p>
            </div>
          </div>

          {projectPayments.length === 0 ? (
            <Card className="p-8">
              <EmptyState
                icon={<CreditCard className="w-8 h-8 text-[#8A837A]" />}
                title="No Payments Recorded"
                description="Deposits into escrow and payment releases will appear in this immutable ledger."
              />
            </Card>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-[#E5DFD5] bg-white">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF7F2] text-[#8A837A] border-b border-[#E5DFD5]">
                  <tr>
                    <th className="py-3 px-4 uppercase text-[10px]">Type</th>
                    <th className="py-3 px-4 uppercase text-[10px]">Milestone</th>
                    <th className="py-3 px-4 uppercase text-[10px]">Amount</th>
                    <th className="py-3 px-4 uppercase text-[10px]">Status</th>
                    <th className="py-3 px-4 uppercase text-[10px]">Reference</th>
                    <th className="py-3 px-4 uppercase text-[10px]">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFECE6]">
                  {projectPayments.map((p) => {
                    const m = projectMilestones.find((ms) => ms.id === p.milestoneId);
                    return (
                      <tr key={p.id} className="hover:bg-[#FAF7F2]/60">
                        <td className="py-3 px-4 font-bold text-[#1C1917]">
                          {p.type === 'ESCROW_DEPOSIT' ? 'Escrow Deposit' : 'Escrow Release'}
                        </td>
                        <td className="py-3 px-4 text-[#605A53]">
                          {m?.title || p.milestoneId}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-[#1C1917]">
                          {formatMoney(p.amountMinor, p.currency)}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#EBF4EE] text-[#285C42] border border-[#C2DEC9]">
                            {p.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-[#8A837A]">
                          {p.reference}
                        </td>
                        <td className="py-3 px-4 text-[#8A837A]">
                          {new Date(p.timestamp).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 6: ACTIVITY */}
      {activeTab === 'activity' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#1C1917]">
                Activity Audit Trail ({projectEvents.length})
              </h2>
              <p className="text-xs text-[#605A53]">
                Chronological immutable audit log of every state mutation.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {projectEvents.map((evt) => (
              <Card key={evt.id} className="p-3.5 flex items-center justify-between gap-4 text-xs">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-bold text-[#1C1917]">
                      {evt.eventType.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#FAF7F2] border border-[#E5DFD5] text-[#8A837A]">
                      by {evt.actorRole}
                    </span>
                  </div>
                  <p className="text-[#605A53]">{evt.details}</p>
                </div>
                <span className="text-[11px] font-mono text-[#8A837A] shrink-0">
                  {new Date(evt.timestamp).toLocaleString()}
                </span>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: DISPUTES */}
      {activeTab === 'disputes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#1C1917]">
                Structured Dispute Resolutions ({projectDisputes.length})
              </h2>
              <p className="text-xs text-[#605A53]">
                Disputes freeze ordinary releases (Rule 4) and provide structured mutual settlement.
              </p>
            </div>
          </div>

          {projectDisputes.length === 0 ? (
            <Card className="p-8">
              <EmptyState
                icon={<Scale className="w-8 h-8 text-[#8A837A]" />}
                title="Zero Disputes Active"
                description="This contract has maintained 100% positive verification without dispute escalation."
              />
            </Card>
          ) : (
            <div className="space-y-3">
              {projectDisputes.map((dsp) => {
                const milestone = projectMilestones.find((m) => m.id === dsp.milestoneId);
                return (
                  <Card key={dsp.id} className="p-5 border-[#FECACA] bg-[#FEE2E2]/20 space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#991B1B] text-sm">
                        Dispute on {milestone?.title}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#FEE2E2] text-[#991B1B] border border-[#FECACA]">
                        STATUS: {dsp.status}
                      </span>
                    </div>
                    <p className="text-[#1C1917] bg-white p-3 rounded-lg border border-[#FECACA]">
                      <strong>Reason:</strong> {dsp.reason}
                    </p>
                    <div className="flex justify-end pt-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          if (milestone) setActiveDisputeMilestone(milestone);
                        }}
                      >
                        Open Settlement Workspace &rarr;
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MODALS */}
      {activeDeliverableMilestone && (
        <DeliverableModal
          milestone={activeDeliverableMilestone}
          isOpen={Boolean(activeDeliverableMilestone)}
          onClose={() => setActiveDeliverableMilestone(null)}
          onSubmit={async (notes, files, url) => {
            await handleSubmitDeliverable(activeDeliverableMilestone.id, notes, files, url);
          }}
        />
      )}

      {activeReviewData && (
        <ReviewModal
          milestone={activeReviewData.milestone}
          delivery={activeReviewData.delivery}
          isOpen={Boolean(activeReviewData)}
          onClose={() => setActiveReviewData(null)}
          onSubmitReview={(decision, feedback, checklist) => {
            handleReviewDeliverable(
              activeReviewData.milestone.id,
              activeReviewData.delivery.id,
              decision,
              feedback,
              checklist
            );
          }}
        />
      )}

      {activeDisputeMilestone && (
        <DisputeModal
          milestone={activeDisputeMilestone}
          dispute={disputes[activeDisputeMilestone.id]}
          currentUser={currentUser}
          isOpen={Boolean(activeDisputeMilestone)}
          onClose={() => setActiveDisputeMilestone(null)}
          onRaiseDispute={(reason) => {
            handleRaiseDispute(activeDisputeMilestone.id, reason);
          }}
          onProposeSettlement={(proposal) => {
            handleProposeSettlement(activeDisputeMilestone.id, proposal);
          }}
          onExecuteSettlement={(proposal) => {
            handleExecuteSettlement(activeDisputeMilestone.id, proposal);
          }}
        />
      )}

      {selectedMilestoneForDetail && (
        <MilestoneDetailModal
          milestone={selectedMilestoneForDetail}
          project={project}
          agreement={projectAgreement}
          currentUser={currentUser}
          deliveries={deliveries}
          reviews={reviews}
          payments={payments}
          events={events}
          isOpen={Boolean(selectedMilestoneForDetail)}
          onClose={() => setSelectedMilestoneForDetail(null)}
          onFundEscrow={(m: Milestone) => {
            setSelectedMilestoneForDetail(null);
            setActiveFundingMilestone(m);
          }}
          onSubmitDeliverable={(m: Milestone) => setActiveDeliverableMilestone(m)}
          onReviewDeliverable={(m: Milestone, d: Delivery) => setActiveReviewData({ milestone: m, delivery: d })}
          onReleasePayment={(m: Milestone) => handleReleasePayment(m.id)}
          onOpenDispute={(m: Milestone) => setActiveDisputeMilestone(m)}
        />
      )}

      {/* GATEWAY CHECKOUT MODAL (UPI, NET BANKING, DEBIT/CREDIT CARDS, WEB3 TESTNET) */}
      {activeFundingMilestone && (
        <GatewayCheckoutModal
          milestone={activeFundingMilestone}
          project={project}
          onClose={() => setActiveFundingMilestone(null)}
          onSuccess={(meta) => {
            handleFundEscrow(activeFundingMilestone.id, meta);
            setActiveFundingMilestone(null);
          }}
        />
      )}

      <AmendmentModal
        currentAgreement={projectAgreement}
        isOpen={isAmendmentOpen}
        onClose={() => setIsAmendmentOpen(false)}
        onProposeAmendment={handleProposeAmendment}
      />
    </div>
  );
};
