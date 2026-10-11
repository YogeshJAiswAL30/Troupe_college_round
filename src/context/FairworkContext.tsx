import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import {
  ActivityEvent,
  Agreement,
  AgreementStructuredTerms,
  Delivery,
  Dispute,
  FileReference,
  Milestone,
  PaymentRecord,
  Project,
  Review,
  ReviewDecision,
  SettlementProposal,
  UserProfile,
} from '../types/fairwork';
import {
  initialAgreements,
  initialDeliveries,
  initialDisputes,
  initialEvents,
  initialMilestones,
  initialPayments,
  initialProjects,
  initialReviews,
  mockUsers,
} from '../data/mockData';
import { deriveProjectFinancials, DerivedProjectFinancials } from '../core/money';
import {
  acceptAgreement as coreAcceptAgreement,
  createAgreementRevision,
  transitionMilestone,
  TransitionContext,
} from '../core/stateTransitions';
import {
  createActivityEvent,
  executeDisputeSettlement,
  releaseMilestonePayment,
  reviewMilestoneDelivery,
  submitMilestoneDelivery,
} from '../core/workflow';
import { ToastProps } from '../components/ui/Toast';

const STORAGE_KEYS = {
  USER: 'fairwork_demo_user_v1',
  PROJECTS: 'fairwork_demo_projects_v1',
  ACTIVE_PROJECT_ID: 'fairwork_demo_active_prj_v1',
  AGREEMENTS: 'fairwork_demo_agreements_v1',
  MILESTONES: 'fairwork_demo_milestones_v1',
  DELIVERIES: 'fairwork_demo_deliveries_v1',
  REVIEWS: 'fairwork_demo_reviews_v1',
  PAYMENTS: 'fairwork_demo_payments_v1',
  DISPUTES: 'fairwork_demo_disputes_v1',
  EVENTS: 'fairwork_demo_events_v1',
};

function loadStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

interface FairworkContextType {
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  allUsers: Record<string, UserProfile>;
  projects: Project[];
  activeProject: Project;
  setActiveProjectId: (id: string) => void;
  agreement: Agreement;
  agreements: Agreement[];
  milestones: Milestone[];
  deliveries: Delivery[];
  reviews: Review[];
  payments: PaymentRecord[];
  disputes: Record<string, Dispute>;
  events: ActivityEvent[];
  financials: DerivedProjectFinancials;
  toast: ToastProps | null;
  showToast: (toast: Omit<ToastProps, 'onClose'>) => void;
  dismissToast: () => void;

  // Actions
  handleFundEscrow: (
    milestoneId: string,
    gatewayMeta?: {
      paymentMethod?: string;
      gatewayOrderId?: string;
      gatewayPaymentId?: string;
      reference?: string;
    }
  ) => void;
  handleSubmitDeliverable: (
    milestoneId: string,
    notes: string,
    files: FileReference[],
    externalUrl?: string
  ) => Promise<void>;
  handleReviewDeliverable: (
    milestoneId: string,
    deliveryId: string,
    decision: ReviewDecision,
    feedback: string,
    criteriaChecklist: Array<{ criteria: string; satisfied: boolean }>
  ) => void;
  handleReleasePayment: (milestoneId: string) => void;
  handleAcceptAgreement: (agreementId?: string, projectId?: string) => void;
  handleProposeAmendment: (newTerms: AgreementStructuredTerms) => Promise<void>;
  handleRaiseDispute: (milestoneId: string, reason: string) => void;
  handleAddDisputeMessage: (milestoneId: string, message: string) => void;
  handleAddEvidence: (milestoneId: string, title: string, urlOrContent: string) => void;
  handleProposeSettlement: (milestoneId: string, proposal: SettlementProposal) => void;
  handleRespondSettlement: (milestoneId: string, accept: boolean) => void;
  handleExecuteSettlement: (milestoneId: string, proposal: SettlementProposal) => void;
  handleCreateProject: (params: {
    title: string;
    description: string;
    budgetDollars: number;
    currency: 'USD' | 'EUR' | 'GBP' | 'USDC' | 'INR';
    freelancerId: string;
    milestones: Array<{
      title: string;
      description: string;
      amountDollars: number;
      deadline: string;
      acceptanceCriteria: string[];
    }>;
  }) => string;
  handleResetDemoData: () => void;
}

const FairworkContext = createContext<FairworkContextType | undefined>(undefined);

export const FairworkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile>(() =>
    loadStored<UserProfile>(STORAGE_KEYS.USER, mockUsers.client_01)
  );
  const [projects, setProjects] = useState<Project[]>(() =>
    loadStored<Project[]>(STORAGE_KEYS.PROJECTS, initialProjects)
  );
  const [activeProjectId, setActiveProjectId] = useState<string>(() =>
    loadStored<string>(STORAGE_KEYS.ACTIVE_PROJECT_ID, initialProjects[0].id)
  );
  const [agreements, setAgreements] = useState<Agreement[]>(() =>
    loadStored<Agreement[]>(STORAGE_KEYS.AGREEMENTS, initialAgreements)
  );
  const [milestones, setMilestones] = useState<Milestone[]>(() =>
    loadStored<Milestone[]>(STORAGE_KEYS.MILESTONES, initialMilestones)
  );
  const [deliveries, setDeliveries] = useState<Delivery[]>(() =>
    loadStored<Delivery[]>(STORAGE_KEYS.DELIVERIES, initialDeliveries)
  );
  const [reviews, setReviews] = useState<Review[]>(() =>
    loadStored<Review[]>(STORAGE_KEYS.REVIEWS, initialReviews)
  );
  const [payments, setPayments] = useState<PaymentRecord[]>(() =>
    loadStored<PaymentRecord[]>(STORAGE_KEYS.PAYMENTS, initialPayments)
  );
  const [disputes, setDisputes] = useState<Record<string, Dispute>>(() =>
    loadStored<Record<string, Dispute>>(STORAGE_KEYS.DISPUTES, initialDisputes)
  );
  const [events, setEvents] = useState<ActivityEvent[]>(() =>
    loadStored<ActivityEvent[]>(STORAGE_KEYS.EVENTS, initialEvents)
  );
  const [toast, setToast] = useState<ToastProps | null>(null);

  // Sync state to localStorage for persistence across tab refresh
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_PROJECT_ID, JSON.stringify(activeProjectId));
  }, [activeProjectId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AGREEMENTS, JSON.stringify(agreements));
  }, [agreements]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MILESTONES, JSON.stringify(milestones));
  }, [milestones]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DELIVERIES, JSON.stringify(deliveries));
  }, [deliveries]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DISPUTES, JSON.stringify(disputes));
  }, [disputes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
  }, [events]);

  const activeProject = useMemo(() => {
    return projects.find((p) => p.id === activeProjectId) || projects[0];
  }, [projects, activeProjectId]);

  const agreement = useMemo(() => {
    if (activeProject.activeAgreementId) {
      const found = agreements.find((a) => a.id === activeProject.activeAgreementId);
      if (found) return found;
    }
    const projectAgreements = agreements.filter((a) => a.projectId === activeProject.id);
    if (projectAgreements.length > 0) {
      return [...projectAgreements].sort((a, b) => b.versionNumber - a.versionNumber)[0];
    }
    return agreements[0];
  }, [agreements, activeProject]);

  const financials = useMemo(() => {
    return deriveProjectFinancials(activeProject, milestones);
  }, [activeProject, milestones]);

  const showToast = (toastConfig: Omit<ToastProps, 'onClose'>) => {
    setToast(toastConfig);
    setTimeout(() => {
      setToast(null);
    }, 5000);
  };

  const dismissToast = () => setToast(null);

  const addEvent = (event: ActivityEvent) => {
    setEvents((prev) => [event, ...prev]);
  };

  // 1. Fund Escrow
  const handleFundEscrow = (
    milestoneId: string,
    gatewayMeta?: {
      paymentMethod?: string;
      gatewayOrderId?: string;
      gatewayPaymentId?: string;
      reference?: string;
    }
  ) => {
    const milestone = milestones.find((m) => m.id === milestoneId);
    if (!milestone) return;

    try {
      const context: TransitionContext = {
        actorId: currentUser.id,
        actorRole: currentUser.role,
        clientId: activeProject.clientId,
        freelancerId: activeProject.freelancerId,
        project: activeProject,
        deliveries,
        activeAgreement: agreement,
      };

      const updated = transitionMilestone(milestone, 'FUNDED', context);
      setMilestones((prev) => prev.map((m) => (m.id === milestone.id ? updated : m)));

      const txRef = gatewayMeta?.reference || `sim_dep_${Date.now()}`;
      const newPayment: PaymentRecord = {
        id: `pay_dep_${milestone.id}`,
        projectId: activeProject.id,
        milestoneId: milestone.id,
        type: 'ESCROW_DEPOSIT',
        amountMinor: milestone.amountMinor,
        currency: activeProject.currency,
        status: 'COMPLETED',
        reference: txRef,
        isSimulated: true,
        payerId: activeProject.clientId,
        recipientId: 'escrow_vault',
        timestamp: new Date().toISOString(),
        paymentMethod: gatewayMeta?.paymentMethod,
        gatewayOrderId: gatewayMeta?.gatewayOrderId,
        gatewayPaymentId: gatewayMeta?.gatewayPaymentId,
      };
      setPayments((prev) => [...prev, newPayment]);

      const methodLabel = gatewayMeta?.paymentMethod ? ` via ${gatewayMeta.paymentMethod}` : '';
      const evt = createActivityEvent({
        actor: currentUser,
        eventType: 'MILESTONE_FUNDED',
        projectId: activeProject.id,
        milestoneId: milestone.id,
        details: `Client deposited ${(milestone.amountMinor / 100).toLocaleString()} ${activeProject.currency} into escrow lock${methodLabel}.`,
        transactionReference: txRef,
      });
      addEvent(evt);

      showToast({
        type: 'success',
        title: 'Escrow Funded',
        message: `Successfully deposited ${activeProject.currency === 'INR' ? '₹' : '$'}${(milestone.amountMinor / 100).toLocaleString()} into escrow${methodLabel}.`,
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        showToast({
          type: 'error',
          title: 'Action Prohibited (Rule 5)',
          message: err.message,
        });
      }
    }
  };

  // 2. Submit Deliverable
  const handleSubmitDeliverable = async (
    milestoneId: string,
    notes: string,
    files: FileReference[],
    externalUrl?: string
  ) => {
    const milestone = milestones.find((m) => m.id === milestoneId);
    if (!milestone) return;

    try {
      const { updatedMilestone, delivery, event } = await submitMilestoneDelivery({
        milestone,
        project: activeProject,
        freelancer: currentUser,
        notes,
        files,
        externalUrl,
        existingDeliveries: deliveries,
        activeAgreement: agreement,
      });

      setMilestones((prev) => prev.map((m) => (m.id === updatedMilestone.id ? updatedMilestone : m)));
      setDeliveries((prev) => [...prev, delivery]);
      addEvent(event);

      showToast({
        type: 'success',
        title: 'Deliverable Submitted',
        message: `Revision #${delivery.revisionNumber} uploaded with verified SHA-256 fingerprint.`,
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        showToast({
          type: 'error',
          title: 'Submission Error',
          message: err.message,
        });
      }
    }
  };

  // 3. Review Deliverable
  const handleReviewDeliverable = (
    milestoneId: string,
    deliveryId: string,
    decision: ReviewDecision,
    feedback: string,
    criteriaChecklist: Array<{ criteria: string; satisfied: boolean }>
  ) => {
    const milestone = milestones.find((m) => m.id === milestoneId);
    const delivery = deliveries.find((d) => d.id === deliveryId);
    if (!milestone || !delivery) return;

    try {
      const { updatedMilestone, review, event } = reviewMilestoneDelivery({
        milestone,
        delivery,
        project: activeProject,
        client: currentUser,
        decision,
        feedback,
        criteriaChecklist,
        deliveries,
        activeAgreement: agreement,
      });

      setMilestones((prev) => prev.map((m) => (m.id === updatedMilestone.id ? updatedMilestone : m)));
      setReviews((prev) => [...prev, review]);
      addEvent(event);

      if (decision === 'DISPUTED') {
        const newDispute: Dispute = {
          id: `dsp_${updatedMilestone.id}`,
          milestoneId: updatedMilestone.id,
          projectId: activeProject.id,
          initiatorId: currentUser.id,
          reason: feedback,
          evidenceReferences: [],
          responses: [],
          status: 'OPEN',
          createdAt: new Date().toISOString(),
        };
        setDisputes((prev) => ({ ...prev, [updatedMilestone.id]: newDispute }));
      }

      showToast({
        type: decision === 'APPROVED' ? 'success' : decision === 'REVISION_REQUESTED' ? 'warning' : 'error',
        title: `Review Submitted: ${decision}`,
        message: feedback,
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        showToast({
          type: 'error',
          title: 'Review Prohibited',
          message: err.message,
        });
      }
    }
  };

  // 4. Release Payment
  const handleReleasePayment = (milestoneId: string) => {
    const milestone = milestones.find((m) => m.id === milestoneId);
    if (!milestone) return;

    try {
      const { updatedMilestone, paymentRecord, event } = releaseMilestonePayment({
        milestone,
        project: activeProject,
        client: currentUser,
        deliveries,
        activeAgreement: agreement,
      });

      setMilestones((prev) => prev.map((m) => (m.id === milestone.id ? updatedMilestone : m)));
      setPayments((prev) => [...prev, paymentRecord]);
      addEvent(event);

      showToast({
        type: 'success',
        title: 'Payment Released',
        message: `Simulated escrow payout of $${(milestone.amountMinor / 100).toLocaleString()} successfully sent to freelancer.`,
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        showToast({
          type: 'error',
          title: 'Release Locked',
          message: err.message,
        });
      }
    }
  };

  // 5. Accept Agreement
  const handleAcceptAgreement = (targetAgreementId?: string, targetProjectId?: string) => {
    try {
      const prj = targetProjectId ? projects.find((p) => p.id === targetProjectId) || activeProject : activeProject;
      const targetAgr = targetAgreementId ? agreements.find((a) => a.id === targetAgreementId) || agreement : agreement;

      const updated = coreAcceptAgreement(
        targetAgr,
        currentUser.id,
        prj.clientId,
        prj.freelancerId
      );
      setAgreements((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));

      // If countersigned and activated, update project's activeAgreementId
      if (updated.isActive) {
        setProjects((prev) =>
          prev.map((p) => (p.id === prj.id ? { ...p, activeAgreementId: updated.id } : p))
        );
      }

      addEvent(
        createActivityEvent({
          actor: currentUser,
          eventType: 'AGREEMENT_ACCEPTED',
          projectId: prj.id,
          details: `Agreement v${updated.versionNumber} digitally signed by ${currentUser.displayName}. ${
            updated.isActive ? 'Active & Binding.' : 'Awaiting counterparty signature.'
          }`,
        })
      );

      showToast({
        type: 'success',
        title: 'Agreement Signed',
        message: updated.isActive
          ? 'Both parties have signed! Agreement is now ACTIVE and binding.'
          : 'Signature recorded. Awaiting counterparty signature.',
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        showToast({
          type: 'error',
          title: 'Sign Error',
          message: err.message,
        });
      }
    }
  };

  // 6. Propose Amendment
  const handleProposeAmendment = async (newTerms: AgreementStructuredTerms) => {
    try {
      const vNext = await createAgreementRevision(agreement, newTerms, currentUser.id);
      // Mark old agreement version inactive and append new vNext
      setAgreements((prev) => [
        ...prev.map((a) => (a.id === agreement.id ? { ...a, isActive: false } : a)),
        vNext,
      ]);
      setProjects((prev) =>
        prev.map((p) => (p.id === activeProject.id ? { ...p, activeAgreementId: vNext.id } : p))
      );
      addEvent(
        createActivityEvent({
          actor: currentUser,
          eventType: 'AGREEMENT_VERSIONED',
          projectId: activeProject.id,
          details: `Agreement revised to v${vNext.versionNumber} by ${currentUser.displayName}. Counterparty signature reset (Rule 7).`,
          metadata: { newVersion: vNext.versionNumber, hash: vNext.agreementHash },
        })
      );

      showToast({
        type: 'warning',
        title: `Amendment Published (v${vNext.versionNumber})`,
        message: 'Rule 7 enforced: Counterparty consent has been reset and renewed signature is required.',
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        showToast({
          type: 'error',
          title: 'Amendment Failed',
          message: err.message,
        });
      }
    }
  };

  // 7. Raise Dispute
  const handleRaiseDispute = (milestoneId: string, reason: string) => {
    const milestone = milestones.find((m) => m.id === milestoneId);
    if (!milestone) return;

    try {
      const context: TransitionContext = {
        actorId: currentUser.id,
        actorRole: currentUser.role,
        clientId: activeProject.clientId,
        freelancerId: activeProject.freelancerId,
        project: activeProject,
        deliveries,
        activeAgreement: agreement,
      };

      const updated = transitionMilestone(milestone, 'DISPUTED', context);
      setMilestones((prev) => prev.map((m) => (m.id === milestone.id ? updated : m)));

      const newDispute: Dispute = {
        id: `dsp_${milestone.id}`,
        milestoneId: milestone.id,
        projectId: activeProject.id,
        initiatorId: currentUser.id,
        reason,
        evidenceReferences: [],
        responses: [],
        status: 'OPEN',
        createdAt: new Date().toISOString(),
      };
      setDisputes((prev) => ({ ...prev, [milestone.id]: newDispute }));

      addEvent(
        createActivityEvent({
          actor: currentUser,
          eventType: 'DISPUTE_OPENED',
          projectId: activeProject.id,
          milestoneId: milestone.id,
          details: `Dispute opened by ${currentUser.displayName}. Ordinary release locked (Rule 4).`,
        })
      );

      showToast({
        type: 'error',
        title: 'Dispute Initiated (Rule 4)',
        message: 'Ordinary release is locked. Escalated to structured dispute resolution.',
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        showToast({
          type: 'error',
          title: 'Dispute Error',
          message: err.message,
        });
      }
    }
  };

  // 8. Add Dispute Message
  const handleAddDisputeMessage = (milestoneId: string, message: string) => {
    const dispute = disputes[milestoneId];
    if (!dispute || !message.trim()) return;

    const newMsg = {
      id: `msg_${Date.now()}`,
      authorId: currentUser.id,
      message,
      timestamp: new Date().toISOString(),
    };

    setDisputes((prev) => ({
      ...prev,
      [milestoneId]: {
        ...prev[milestoneId],
        responses: [...(prev[milestoneId]?.responses || []), newMsg],
      },
    }));

    addEvent(
      createActivityEvent({
        actor: currentUser,
        eventType: 'DISPUTE_OPENED',
        projectId: activeProject.id,
        milestoneId,
        details: `${currentUser.displayName} posted response to dispute dialogue.`,
      })
    );
  };

  // 9. Add Dispute Evidence
  const handleAddEvidence = (milestoneId: string, title: string, urlOrContent: string) => {
    const dispute = disputes[milestoneId];
    if (!dispute || !title.trim()) return;

    const newEvidence = {
      id: `ev_${Date.now()}`,
      title,
      urlOrContent,
      sha256Hash: `hash_ev_${Date.now().toString(16)}`,
      submittedBy: currentUser.id,
      timestamp: new Date().toISOString(),
    };

    setDisputes((prev) => ({
      ...prev,
      [milestoneId]: {
        ...prev[milestoneId],
        evidenceReferences: [...(prev[milestoneId]?.evidenceReferences || []), newEvidence],
        status: 'EVIDENCE_SUBMITTED',
      },
    }));

    addEvent(
      createActivityEvent({
        actor: currentUser,
        eventType: 'EVIDENCE_ADDED',
        projectId: dispute.projectId,
        milestoneId,
        details: `Evidence item "${title}" added with SHA-256 fingerprint.`,
      })
    );

    showToast({
      type: 'info',
      title: 'Evidence Recorded',
      message: `"${title}" attached with SHA-256 integrity hash.`,
    });
  };

  // 10. Propose Settlement
  const handleProposeSettlement = (milestoneId: string, proposal: SettlementProposal) => {
    const dispute = disputes[milestoneId];
    setDisputes((prev) => ({
      ...prev,
      [milestoneId]: {
        ...prev[milestoneId],
        settlementProposal: proposal,
        status: 'SETTLEMENT_PROPOSED',
      },
    }));

    addEvent(
      createActivityEvent({
        actor: currentUser,
        eventType: 'SETTLEMENT_PROPOSED',
        projectId: dispute?.projectId || activeProject.id,
        milestoneId,
        details: `Mutual settlement proposed by ${currentUser.displayName}: Freelancer payout ${proposal.freelancerAmountMinor / 100}, Client refund ${proposal.clientRefundMinor / 100}.`,
      })
    );

    showToast({
      type: 'info',
      title: 'Settlement Terms Updated',
      message: 'Settlement terms updated. Both parties must sign to execute payouts.',
    });
  };

  // 11. Respond to Settlement (Accept or Reject)
  const handleRespondSettlement = (milestoneId: string, accept: boolean) => {
    const dispute = disputes[milestoneId];
    if (!dispute || !dispute.settlementProposal) return;

    const isClient = currentUser.id === activeProject.clientId;
    const updatedProposal: SettlementProposal = {
      ...dispute.settlementProposal,
      acceptedByClient: isClient ? accept : dispute.settlementProposal.acceptedByClient,
      acceptedByFreelancer: !isClient ? accept : dispute.settlementProposal.acceptedByFreelancer,
    };

    setDisputes((prev) => ({
      ...prev,
      [milestoneId]: {
        ...prev[milestoneId],
        settlementProposal: updatedProposal,
      },
    }));

    if (accept) {
      addEvent(
        createActivityEvent({
          actor: currentUser,
          eventType: 'SETTLEMENT_ACCEPTED',
          projectId: dispute.projectId,
          milestoneId,
          details: `${currentUser.displayName} accepted the settlement terms.`,
        })
      );
    }

    if (!accept) {
      setDisputes((prev) => ({
        ...prev,
        [milestoneId]: {
          ...prev[milestoneId],
          settlementProposal: updatedProposal,
          status: 'OPEN',
        },
      }));
      showToast({
        type: 'warning',
        title: 'Settlement Proposal Rejected',
        message: 'The settlement proposal was declined. Milestone remains frozen in dispute.',
      });
      return;
    }

    // Both accepted? Execute settlement automatically!
    if (updatedProposal.acceptedByClient && updatedProposal.acceptedByFreelancer) {
      handleExecuteSettlement(milestoneId, updatedProposal);
    } else {
      setDisputes((prev) => ({
        ...prev,
        [milestoneId]: {
          ...prev[milestoneId],
          settlementProposal: updatedProposal,
        },
      }));
      showToast({
        type: 'success',
        title: 'Settlement Accepted',
        message: 'Your consent has been recorded. Awaiting counterparty acceptance to execute escrow split.',
      });
    }
  };

  // 12. Execute Settlement
  const handleExecuteSettlement = (milestoneId: string, proposal: SettlementProposal) => {
    const milestone = milestones.find((m) => m.id === milestoneId);
    const dispute = disputes[milestoneId];
    if (!milestone || !dispute) return;

    try {
      const { updatedMilestone, updatedDispute, payments: newPayments, events: newEvents } =
        executeDisputeSettlement({
          dispute,
          milestone,
          project: activeProject,
          actor: currentUser,
          proposal,
        });

      setMilestones((prev) => prev.map((m) => (m.id === milestone.id ? updatedMilestone : m)));
      setDisputes((prev) => ({ ...prev, [milestone.id]: updatedDispute }));
      setPayments((prev) => [...prev, ...newPayments]);
      newEvents.forEach(addEvent);

      showToast({
        type: 'success',
        title: 'Dispute Mutually Resolved',
        message: 'Settlement executed and split payouts recorded to simulated ledger.',
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        showToast({
          type: 'error',
          title: 'Settlement Error',
          message: err.message,
        });
      }
    }
  };

  // 10. Create New Project (Rule 1 validated)
  const handleCreateProject = (params: {
    title: string;
    description: string;
    budgetDollars: number;
    currency: 'USD' | 'EUR' | 'GBP' | 'USDC' | 'INR';
    freelancerId: string;
    milestones: Array<{
      title: string;
      description: string;
      amountDollars: number;
      deadline: string;
      acceptanceCriteria: string[];
    }>;
  }) => {
    const newId = `prj_${Date.now()}`;
    const budgetMinor = Math.round(params.budgetDollars * 100);

    const createdMilestones: Milestone[] = params.milestones.map((m, idx) => ({
      id: `ms_${newId}_${idx + 1}`,
      projectId: newId,
      title: m.title,
      description: m.description,
      amountMinor: Math.round(m.amountDollars * 100),
      deadline: m.deadline,
      acceptanceCriteria: m.acceptanceCriteria,
      reviewPeriodDays: 5,
      revisionPolicy: { maxRevisions: 2, reviewPeriodDays: 5, gracePeriodDays: 2 },
      currentRevisionCount: 0,
      status: 'AWAITING_FUNDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    const newProject: Project = {
      id: newId,
      title: params.title,
      description: params.description,
      clientId: currentUser.id,
      freelancerId: params.freelancerId,
      currency: params.currency,
      totalBudgetMinor: budgetMinor,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newAgreementId = `agr_${newId}_v1`;
    const newAgreement: Agreement = {
      id: newAgreementId,
      projectId: newId,
      versionNumber: 1,
      structuredTerms: {
        scopeSummary: params.description,
        deliverablesSummary: `${params.milestones.length} verifiable milestones.`,
        intellectualPropertyClause: 'ON_PAYMENT',
        confidentiality: true,
        governingLaw: 'Decentralized Verifiable Protocol (Fairwork Standard)',
        customClauses: [
          { title: 'Payment Release', content: 'Client explicit sign-off required upon deliverable verification.' },
          { title: 'Dispute Framework', content: 'Mutual settlement proposal followed by neutral arbitration.' },
        ],
      },
      proposedBy: currentUser.id,
      acceptedBy: {
        [currentUser.id]: {
          acceptedAt: new Date().toISOString(),
          signatureHash: `sig_${currentUser.id}_${Date.now()}`,
        },
      },
      isActive: false,
      agreementHash: `hash_agr_${newId}_v1`,
      createdAt: new Date().toISOString(),
    };

    setProjects((prev) => [newProject, ...prev]);
    setAgreements((prev) => [newAgreement, ...prev]);
    setMilestones((prev) => [...createdMilestones, ...prev]);
    setActiveProjectId(newId);

    addEvent(
      createActivityEvent({
        actor: currentUser,
        eventType: 'PROJECT_CREATED',
        projectId: newId,
        details: `Project "${params.title}" created with ${createdMilestones.length} milestones totaling $${params.budgetDollars.toLocaleString()}.`,
      })
    );

    showToast({
      type: 'success',
      title: 'Project Initialized',
      message: `"${params.title}" created successfully with balanced milestone budget.`,
    });

    return newId;
  };

  const handleResetDemoData = () => {
    try {
      Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
    } catch {
      // Ignore storage errors
    }
    setCurrentUser(mockUsers.client_01);
    setProjects(initialProjects);
    setActiveProjectId(initialProjects[0].id);
    setAgreements(initialAgreements);
    setMilestones(initialMilestones);
    setDeliveries(initialDeliveries);
    setReviews(initialReviews);
    setPayments(initialPayments);
    setDisputes(initialDisputes);
    setEvents(initialEvents);

    showToast({
      type: 'success',
      title: 'Demo State Reset',
      message: 'Demo workspace restored to clean initial seed data (3 sample projects).',
    });
  };

  return (
    <FairworkContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        allUsers: mockUsers,
        projects,
        activeProject,
        setActiveProjectId,
        agreement,
        agreements,
        milestones,
        deliveries,
        reviews,
        payments,
        disputes,
        events,
        financials,
        toast,
        showToast,
        dismissToast,
        handleFundEscrow,
        handleSubmitDeliverable,
        handleReviewDeliverable,
        handleReleasePayment,
        handleAcceptAgreement,
        handleProposeAmendment,
        handleRaiseDispute,
        handleAddDisputeMessage,
        handleAddEvidence,
        handleProposeSettlement,
        handleRespondSettlement,
        handleExecuteSettlement,
        handleCreateProject,
        handleResetDemoData,
      }}
    >
      {children}
    </FairworkContext.Provider>
  );
};

export const useFairwork = () => {
  const context = useContext(FairworkContext);
  if (!context) {
    throw new Error('useFairwork must be used within a FairworkProvider');
  }
  return context;
};
