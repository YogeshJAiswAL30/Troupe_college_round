import {
  Agreement,
  Delivery,
  Dispute,
  Milestone,
  PaymentRecord,
  Project,
  Review,
  UserProfile,
  ActivityEvent,
} from '../types/fairwork';

export const mockUsers: Record<string, UserProfile> = {
  client_01: {
    id: 'client_01',
    displayName: 'Nexus Ventures (Alice)',
    role: 'CLIENT',
    verificationStatus: 'ID_VERIFIED',
    email: 'alice@nexusventures.io',
    bio: 'Fintech and Web3 venture studio commissioning high-assurance digital products.',
    reputationScore: 98,
    createdAt: '2026-01-10T09:00:00Z',
  },
  freelancer_01: {
    id: 'freelancer_01',
    displayName: 'Bob Martinez',
    role: 'FREELANCER',
    verificationStatus: 'VERIFIED_PRO',
    email: 'bob@martinez.tech',
    skills: ['TypeScript', 'React 19', 'Full-Stack Engineering', 'UI/UX Design', 'Three.js / WebGL'],
    reputationScore: 99,
    createdAt: '2026-01-12T14:30:00Z',
  },
  arbitrator_01: {
    id: 'arbitrator_01',
    displayName: 'Claire Justice, Esq.',
    role: 'ARBITRATOR',
    verificationStatus: 'VERIFIED_PRO',
    email: 'claire@fairwork-arbitration.org',
    reputationScore: 100,
    createdAt: '2026-01-01T00:00:00Z',
  },
};

// -------------------------------------------------------------
// 3 COHERENT SAMPLE PROJECTS (All in INR for clean financial tally)
// Project A: E-commerce Website Platform — ₹30,000 (4 milestones: ₹5k, ₹12k, ₹8k, ₹5k)
// Project B: Brand Identity & Design System — ₹12,000 (2 milestones: ₹5k released, ₹7k revised & submitted)
// Project C: Portfolio Website with 3D Graphics — ₹18,000 (2 milestones: ₹6k released, ₹12k disputed)
// -------------------------------------------------------------

export const initialProjects: Project[] = [
  // PROJECT A
  {
    id: 'prj_ecom',
    title: 'E-commerce Website Platform',
    description: 'Modern full-stack e-commerce store with verifiable milestone escrow, responsive UI, catalog browsing, cart checkout, and payment webhook integration.',
    clientId: 'client_01',
    freelancerId: 'freelancer_01',
    currency: 'INR',
    totalBudgetMinor: 3000000, // ₹30,000.00 (3,000,000 minor units)
    startDate: '2026-02-01',
    targetCompletionDate: '2026-04-30',
    status: 'ACTIVE',
    activeAgreementId: 'agr_ecom_v2',
    createdAt: '2026-02-01T09:00:00Z',
    updatedAt: '2026-02-28T16:00:00Z',
  },
  // PROJECT B
  {
    id: 'prj_brand',
    title: 'Brand Identity & Design System',
    description: 'Comprehensive corporate visual identity including brand strategy, typography system, component design guidelines, and logo lockups with client revision cycle.',
    clientId: 'client_01',
    freelancerId: 'freelancer_01',
    currency: 'INR',
    totalBudgetMinor: 1200000, // ₹12,000.00 (1,200,000 minor units)
    startDate: '2026-02-05',
    targetCompletionDate: '2026-03-25',
    status: 'ACTIVE',
    activeAgreementId: 'agr_brand_v1',
    createdAt: '2026-02-05T10:00:00Z',
    updatedAt: '2026-02-27T14:00:00Z',
  },
  // PROJECT C
  {
    id: 'prj_portfolio',
    title: 'Portfolio Website with 3D Graphics',
    description: 'Interactive flagship portfolio website featuring custom WebGL shaders, responsive canvas viewports, and performance-optimized 3D asset pipeline.',
    clientId: 'client_01',
    freelancerId: 'freelancer_01',
    currency: 'INR',
    totalBudgetMinor: 1800000, // ₹18,000.00 (1,800,000 minor units)
    startDate: '2026-01-20',
    targetCompletionDate: '2026-04-10',
    status: 'ACTIVE',
    activeAgreementId: 'agr_portfolio_v1',
    createdAt: '2026-01-20T11:00:00Z',
    updatedAt: '2026-02-26T17:00:00Z',
  },
];

// -------------------------------------------------------------
// AGREEMENTS
// -------------------------------------------------------------

export const initialAgreements: Agreement[] = [
  // Project A - v1 (Archived)
  {
    id: 'agr_ecom_v1',
    projectId: 'prj_ecom',
    versionNumber: 1,
    structuredTerms: {
      scopeSummary: 'Design and build modern E-commerce website with responsive design, basic product catalog, cart, and payment checkout.',
      deliverablesSummary: 'Figma prototypes, Next.js frontend repository, Express/Node API backend, and basic deployment guide.',
      intellectualPropertyClause: 'ON_PAYMENT',
      confidentiality: true,
      governingLaw: 'Commercial Arbitration Rules',
      customClauses: [
        {
          title: 'Acceptance Verification',
          content: 'Every milestone must be independently verified against agreed acceptance criteria before funds release.',
        },
        {
          title: 'Escrow Requirement',
          content: 'Freelancer shall not begin work on any milestone until funds are verified in escrow.',
        },
      ],
    },
    proposedBy: 'client_01',
    acceptedBy: {
      client_01: {
        acceptedAt: '2026-02-01T09:15:00Z',
        signatureHash: 'sig_client01_ecom_v1_00a1',
      },
      freelancer_01: {
        acceptedAt: '2026-02-01T09:45:00Z',
        signatureHash: 'sig_free01_ecom_v1_88b2',
      },
    },
    isActive: false, // Superseded by v2
    agreementHash: 'e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6',
    createdAt: '2026-02-01T09:15:00Z',
  },
  // Project A - v2 (Current Active Version)
  {
    id: 'agr_ecom_v2',
    projectId: 'prj_ecom',
    versionNumber: 2,
    structuredTerms: {
      scopeSummary: 'Design and build modern E-commerce website with responsive design, product catalog, instant search filtering, cart state persistence, and automated payment webhook reconciliation.',
      deliverablesSummary: 'Figma interactive component library, Next.js production frontend (Lighthouse >= 90), Node.js idempotent payment API, and Docker CI/CD deployment runbook.',
      intellectualPropertyClause: 'ON_PAYMENT',
      confidentiality: true,
      governingLaw: 'Commercial Arbitration Rules',
      customClauses: [
        {
          title: 'Acceptance Verification',
          content: 'Every milestone must be independently verified against agreed acceptance criteria before funds release.',
        },
        {
          title: 'Escrow Requirement',
          content: 'Freelancer shall not begin work on any milestone until funds are verified in escrow.',
        },
        {
          title: 'Performance & Lighthouse SLA',
          content: 'Frontend deliverable must attain a minimum Google Lighthouse performance score of 90 on mobile & desktop before milestone sign-off.',
        },
        {
          title: 'Review Window & Revision Limits',
          content: 'Client agrees to review submitted deliverables within 5 calendar days. Up to 2 standard revisions included per milestone before formal amendment.',
        },
      ],
    },
    proposedBy: 'client_01',
    acceptedBy: {
      client_01: {
        acceptedAt: '2026-02-12T10:00:00Z',
        signatureHash: 'sig_client01_ecom_v2_f81c',
      },
      freelancer_01: {
        acceptedAt: '2026-02-12T10:30:00Z',
        signatureHash: 'sig_free01_ecom_v2_93d4',
      },
    },
    isActive: true,
    agreementHash: '3a7c9d1e2f4b5a6c8e0d1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c',
    createdAt: '2026-02-12T10:00:00Z',
  },

  // Project B - Brand Identity Agreement
  {
    id: 'agr_brand_v1',
    projectId: 'prj_brand',
    versionNumber: 1,
    structuredTerms: {
      scopeSummary: 'Develop complete corporate brand identity system, vector assets, and typography design tokens.',
      deliverablesSummary: 'Vector logo pack (SVG, PDF, EPS), brand guideline book (PDF), design token system in JSON/CSS.',
      intellectualPropertyClause: 'ON_PAYMENT',
      confidentiality: true,
      governingLaw: 'Commercial Arbitration Rules',
      customClauses: [
        {
          title: 'Included Revision Rounds',
          content: 'Up to 2 iterative revision cycles are guaranteed per milestone upon structured client feedback.',
        },
        {
          title: 'Font Licensing',
          content: 'All selected brand typography must utilize open-source Google Fonts or include commercial web license specifications.',
        },
      ],
    },
    proposedBy: 'client_01',
    acceptedBy: {
      client_01: { acceptedAt: '2026-02-05T10:30:00Z', signatureHash: 'sig_client01_brand_v1' },
      freelancer_01: { acceptedAt: '2026-02-05T11:00:00Z', signatureHash: 'sig_free01_brand_v1' },
    },
    isActive: true,
    agreementHash: '8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c',
    createdAt: '2026-02-05T10:30:00Z',
  },

  // Project C - 3D Portfolio Agreement
  {
    id: 'agr_portfolio_v1',
    projectId: 'prj_portfolio',
    versionNumber: 1,
    structuredTerms: {
      scopeSummary: 'Interactive WebGL 3D portfolio website with real-time shader effects and cross-device performance optimization.',
      deliverablesSummary: 'Design wireframes, Three.js custom shaders, production React/Vite source code, and performance benchmark audit.',
      intellectualPropertyClause: 'ON_PAYMENT',
      confidentiality: false,
      governingLaw: 'Commercial Arbitration Rules',
      customClauses: [
        {
          title: 'Target Frame Rate SLA',
          content: '3D WebGL scenes must achieve consistent >= 60 FPS on standard modern desktop devices and >= 30 FPS on iOS Safari.',
        },
        {
          title: 'Formal Dispute Redress',
          content: 'Unresolved technical disagreements must follow the Fairwork multi-tiered dispute resolution protocol.',
        },
      ],
    },
    proposedBy: 'client_01',
    acceptedBy: {
      client_01: { acceptedAt: '2026-01-20T11:30:00Z', signatureHash: 'sig_client01_port_v1' },
      freelancer_01: { acceptedAt: '2026-01-20T12:00:00Z', signatureHash: 'sig_free01_port_v1' },
    },
    isActive: true,
    agreementHash: '4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3e',
    createdAt: '2026-01-20T11:30:00Z',
  },
];

// -------------------------------------------------------------
// MILESTONES
// -------------------------------------------------------------

export const initialMilestones: Milestone[] = [
  // Project A: E-commerce Website (Total ₹30,000 = 3,000,000 minor units)
  // 1. UI/UX Design — ₹5,000 (RELEASED)
  {
    id: 'ms_ecom_01',
    projectId: 'prj_ecom',
    title: 'UI/UX Design',
    description: 'Complete Figma wireframes, component library, and responsive design systems for desktop and mobile.',
    amountMinor: 500000, // ₹5,000.00
    deadline: '2026-02-15',
    acceptanceCriteria: [
      'Complete desktop and mobile responsive Figma component designs',
      'Design tokens for colors, typography, spacing, and buttons',
      'Interactive prototype walkthrough and design system guide',
    ],
    reviewPeriodDays: 5,
    revisionPolicy: { maxRevisions: 2, reviewPeriodDays: 5, gracePeriodDays: 2 },
    currentRevisionCount: 1,
    status: 'RELEASED', // Fully approved and funds released!
    fundedAt: '2026-02-02T10:00:00Z',
    submittedAt: '2026-02-10T14:00:00Z',
    approvedAt: '2026-02-12T11:00:00Z',
    releasedAt: '2026-02-12T11:30:00Z',
    createdAt: '2026-02-01T09:30:00Z',
    updatedAt: '2026-02-12T11:30:00Z',
  },
  // 2. Frontend Development — ₹12,000 (SUBMITTED, FUNDED)
  {
    id: 'ms_ecom_02',
    projectId: 'prj_ecom',
    title: 'Frontend Development',
    description: 'Responsive Next.js web application with product catalog browsing, search filters, and shopping cart state.',
    amountMinor: 1200000, // ₹12,000.00
    deadline: '2026-03-05',
    acceptanceCriteria: [
      'Responsive product grid and search filtering with instant state update',
      'Persistent shopping cart with quantity adjustments and coupon input',
      'Client-side performance Lighthouse score >= 90',
    ],
    reviewPeriodDays: 5,
    revisionPolicy: { maxRevisions: 2, reviewPeriodDays: 5, gracePeriodDays: 2 },
    currentRevisionCount: 1,
    status: 'SUBMITTED', // Funded and submitted! Ready for client review
    fundedAt: '2026-02-13T10:00:00Z',
    submittedAt: '2026-02-28T16:00:00Z',
    createdAt: '2026-02-01T09:30:00Z',
    updatedAt: '2026-02-28T16:00:00Z',
  },
  // 3. Backend Integration — ₹8,000 (FUNDED, IN PROGRESS)
  {
    id: 'ms_ecom_03',
    projectId: 'prj_ecom',
    title: 'Backend Integration',
    description: 'REST API, inventory management, user authentication, and payment gateway webhook receiver.',
    amountMinor: 800000, // ₹8,000.00
    deadline: '2026-03-25',
    acceptanceCriteria: [
      'Secure payment gateway checkout session creation and webhook signature validation',
      'Database idempotency for order fulfillment and stock reservation',
      'API test suite with integration tests passing 100%',
    ],
    reviewPeriodDays: 5,
    revisionPolicy: { maxRevisions: 2, reviewPeriodDays: 5, gracePeriodDays: 2 },
    currentRevisionCount: 0,
    status: 'FUNDED', // Escrow funded, freelancer working on it
    fundedAt: '2026-02-13T10:00:00Z',
    createdAt: '2026-02-01T09:30:00Z',
    updatedAt: '2026-02-13T10:00:00Z',
  },
  // 4. Final Delivery — ₹5,000 (AWAITING_FUNDING)
  {
    id: 'ms_ecom_04',
    projectId: 'prj_ecom',
    title: 'Final Delivery',
    description: 'Production deployment, end-to-end user acceptance testing, SSL setup, and admin training handover.',
    amountMinor: 500000, // ₹5,000.00
    deadline: '2026-04-15',
    acceptanceCriteria: [
      'Production deployment on cloud infrastructure with SSL and automated CI/CD',
      'Full test suite pass report and zero high-severity vulnerabilities',
      'Comprehensive admin documentation and maintenance runbook',
    ],
    reviewPeriodDays: 5,
    revisionPolicy: { maxRevisions: 2, reviewPeriodDays: 5, gracePeriodDays: 2 },
    currentRevisionCount: 0,
    status: 'AWAITING_FUNDING', // Unfunded upcoming milestone
    createdAt: '2026-02-01T09:30:00Z',
    updatedAt: '2026-02-01T09:30:00Z',
  },

  // Project B: Brand Identity (Total ₹12,000 = 1,200,000 minor units)
  // 1. Brand Strategy & Core Concepts — ₹5,000 (RELEASED)
  {
    id: 'ms_brand_01',
    projectId: 'prj_brand',
    title: 'Brand Strategy & Visual Direction',
    description: 'Moodboards, color palette discovery, typography pairings, and initial three creative directions.',
    amountMinor: 500000, // ₹5,000.00
    deadline: '2026-02-14',
    acceptanceCriteria: [
      'Comprehensive brand strategy deck with competitive audit',
      'Three distinct visual directions with palette & font pairings',
      'Stakeholder alignment workshop summary',
    ],
    reviewPeriodDays: 5,
    revisionPolicy: { maxRevisions: 2, reviewPeriodDays: 5, gracePeriodDays: 2 },
    currentRevisionCount: 1,
    status: 'RELEASED', // Fully approved and funds released!
    fundedAt: '2026-02-06T09:00:00Z',
    submittedAt: '2026-02-13T15:00:00Z',
    approvedAt: '2026-02-14T11:00:00Z',
    releasedAt: '2026-02-14T11:30:00Z',
    createdAt: '2026-02-05T10:15:00Z',
    updatedAt: '2026-02-14T11:30:00Z',
  },
  // 2. Logo & Visual Identity System — ₹7,000 (SUBMITTED revision #2 awaiting review after revision request on revision #1)
  {
    id: 'ms_brand_02',
    projectId: 'prj_brand',
    title: 'Logo & Visual Identity System',
    description: 'Final vector logo lockups, stationery templates, responsive brand assets, and digital design guidelines.',
    amountMinor: 700000, // ₹7,000.00
    deadline: '2026-03-10',
    acceptanceCriteria: [
      'Primary, secondary, and monochrome logo assets in SVG, EPS, and high-res PNG',
      'Minimum clear-space and size rules documentation',
      'Brand guideline book including dark/light mode token definitions',
    ],
    reviewPeriodDays: 5,
    revisionPolicy: { maxRevisions: 2, reviewPeriodDays: 5, gracePeriodDays: 2 },
    currentRevisionCount: 2,
    status: 'SUBMITTED', // Client requested revision on Rev 1; Bob submitted Rev 2; now awaiting review!
    fundedAt: '2026-02-15T10:00:00Z',
    submittedAt: '2026-02-27T14:00:00Z',
    createdAt: '2026-02-05T10:15:00Z',
    updatedAt: '2026-02-27T14:00:00Z',
  },

  // Project C: Portfolio Website (Total ₹18,000 = 1,800,000 minor units)
  // 1. Design & Information Architecture — ₹6,000 (RELEASED)
  {
    id: 'ms_port_01',
    projectId: 'prj_portfolio',
    title: 'Design & Information Architecture',
    description: 'Wireframes, content layout, interactive page transitions flow, and typography hierarchy.',
    amountMinor: 600000, // ₹6,000.00
    deadline: '2026-02-05',
    acceptanceCriteria: [
      'High-fidelity mockups for desktop and mobile viewports',
      'Information architecture map for projects showcase',
      'Client review and formal approval sign-off',
    ],
    reviewPeriodDays: 5,
    revisionPolicy: { maxRevisions: 2, reviewPeriodDays: 5, gracePeriodDays: 2 },
    currentRevisionCount: 1,
    status: 'RELEASED', // Fully approved and funds released!
    fundedAt: '2026-01-21T10:00:00Z',
    submittedAt: '2026-02-04T12:00:00Z',
    approvedAt: '2026-02-05T09:00:00Z',
    releasedAt: '2026-02-05T09:30:00Z',
    createdAt: '2026-01-20T11:45:00Z',
    updatedAt: '2026-02-05T09:30:00Z',
  },
  // 2. Interactive 3D WebGL Portfolio — ₹12,000 (DISPUTED, settlement proposed, locked)
  {
    id: 'ms_port_02',
    projectId: 'prj_portfolio',
    title: 'Interactive 3D WebGL Engine',
    description: 'Custom WebGL shaders, Three.js 3D scene rendering, dynamic lighting, and particle effects.',
    amountMinor: 1200000, // ₹12,000.00
    deadline: '2026-03-15',
    acceptanceCriteria: [
      'Consistent frame rate >= 60 FPS on desktop and >= 30 FPS on iOS mobile Safari',
      'Zero WebGL memory leaks during scene transitions',
      'Fallback canvas rendering for low-power devices',
    ],
    reviewPeriodDays: 5,
    revisionPolicy: { maxRevisions: 2, reviewPeriodDays: 5, gracePeriodDays: 2 },
    currentRevisionCount: 1,
    status: 'DISPUTED', // Active dispute open! Locked from ordinary release
    fundedAt: '2026-02-06T10:00:00Z',
    submittedAt: '2026-02-20T16:00:00Z',
    createdAt: '2026-01-20T11:45:00Z',
    updatedAt: '2026-02-24T10:00:00Z',
  },
];

// -------------------------------------------------------------
// DELIVERIES
// -------------------------------------------------------------

export const initialDeliveries: Delivery[] = [
  // Project A - ms_ecom_01 (UI/UX Design)
  {
    id: 'del_ecom_01_r1',
    milestoneId: 'ms_ecom_01',
    revisionNumber: 1,
    submittedBy: 'freelancer_01',
    notes: 'Completed full high-fidelity Figma components, mobile responsive artboards, interactive design tokens, and prototype links.',
    files: [
      {
        name: 'ecommerce_figma_design_system_v1.zip',
        url: 'https://storage.fairwork.sim/del_ecom_01/design_system.zip',
        sizeBytes: 12450000,
        mimeType: 'application/zip',
        sha256Hash: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b',
        isSimulated: true,
      },
    ],
    externalUrl: 'https://figma.com/@fairwork/ecommerce-prototype',
    timestamp: '2026-02-10T14:00:00Z',
    deliveryHash: 'b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2',
  },
  // Project A - ms_ecom_02 (Frontend Development)
  {
    id: 'del_ecom_02_r1',
    milestoneId: 'ms_ecom_02',
    revisionNumber: 1,
    submittedBy: 'freelancer_01',
    notes: 'Next.js frontend catalog implementation complete with instant search filters, cart drawer, and responsive layout across all screen breakpoints.',
    files: [
      {
        name: 'frontend_ecom_nextjs_src.tar.gz',
        url: 'https://storage.fairwork.sim/del_ecom_02/nextjs_src.tar.gz',
        sizeBytes: 4890000,
        mimeType: 'application/gzip',
        sha256Hash: 'c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3',
        isSimulated: true,
      },
    ],
    externalUrl: 'https://github.com/fairwork-demo/ecom-frontend',
    timestamp: '2026-02-28T16:00:00Z',
    deliveryHash: 'd3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4',
  },

  // Project B - ms_brand_01 (Strategy)
  {
    id: 'del_brand_01_r1',
    milestoneId: 'ms_brand_01',
    revisionNumber: 1,
    submittedBy: 'freelancer_01',
    notes: 'Brand discovery presentation with competitive analysis, typographic pairings, and moodboards.',
    files: [
      {
        name: 'brand_strategy_presentation.pdf',
        url: 'https://storage.fairwork.sim/del_brand_01/strategy.pdf',
        sizeBytes: 5200000,
        mimeType: 'application/pdf',
        sha256Hash: 'e1d2c3b4a5f6e7d8c9b0a1f2e3d4c5b6a7f8e9d0c1b2a3f4e5d6c7b8a9f0e1d2',
        isSimulated: true,
      },
    ],
    timestamp: '2026-02-13T15:00:00Z',
    deliveryHash: '5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d',
  },
  // Project B - ms_brand_02 - Revision 1 (Original design submitted)
  {
    id: 'del_brand_02_r1',
    milestoneId: 'ms_brand_02',
    revisionNumber: 1,
    submittedBy: 'freelancer_01',
    notes: 'Initial logo lockups with bold geometric typography and vibrant neon accents.',
    files: [
      {
        name: 'brand_identity_v1_draft.zip',
        url: 'https://storage.fairwork.sim/del_brand_02/v1_draft.zip',
        sizeBytes: 7400000,
        mimeType: 'application/zip',
        sha256Hash: 'a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3',
        isSimulated: true,
      },
    ],
    timestamp: '2026-02-22T11:00:00Z',
    deliveryHash: '6f5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e',
  },
  // Project B - ms_brand_02 - Revision 2 (Revised delivery submitted following client request)
  {
    id: 'del_brand_02_r2',
    milestoneId: 'ms_brand_02',
    revisionNumber: 2,
    submittedBy: 'freelancer_01',
    notes: 'Revised delivery incorporating client feedback: refined warm corporate palette (deep olive + cream), increased contrast, and added compact monochrome icon variants.',
    files: [
      {
        name: 'brand_identity_v2_revised.zip',
        url: 'https://storage.fairwork.sim/del_brand_02/v2_revised.zip',
        sizeBytes: 8900000,
        mimeType: 'application/zip',
        sha256Hash: '7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d',
        isSimulated: true,
      },
    ],
    timestamp: '2026-02-27T14:00:00Z',
    deliveryHash: '8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b',
  },

  // Project C - ms_port_01 (Design & IA)
  {
    id: 'del_port_01_r1',
    milestoneId: 'ms_port_01',
    revisionNumber: 1,
    submittedBy: 'freelancer_01',
    notes: 'Responsive wireframes, page structure diagrams, and typography hierarchy.',
    files: [
      {
        name: 'portfolio_ia_wireframes.pdf',
        url: 'https://storage.fairwork.sim/del_port_01/wireframes.pdf',
        sizeBytes: 3100000,
        mimeType: 'application/pdf',
        sha256Hash: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
        isSimulated: true,
      },
    ],
    timestamp: '2026-02-04T12:00:00Z',
    deliveryHash: '9c8b7a6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b',
  },
  // Project C - ms_port_02 (3D WebGL Engine)
  {
    id: 'del_port_02_r1',
    milestoneId: 'ms_port_02',
    revisionNumber: 1,
    submittedBy: 'freelancer_01',
    notes: 'Custom WebGL shaders, Three.js 3D scene engine, dynamic lighting, and particle effects.',
    files: [
      {
        name: 'webgl_3d_engine_src.tar.gz',
        url: 'https://storage.fairwork.sim/del_port_02/webgl_src.tar.gz',
        sizeBytes: 6700000,
        mimeType: 'application/gzip',
        sha256Hash: '3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b',
        isSimulated: true,
      },
    ],
    timestamp: '2026-02-20T16:00:00Z',
    deliveryHash: '2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c',
  },
];

// -------------------------------------------------------------
// REVIEWS
// -------------------------------------------------------------

export const initialReviews: Review[] = [
  // Project A - ms_ecom_01 (Approved)
  {
    id: 'rev_ecom_01',
    deliveryId: 'del_ecom_01_r1',
    milestoneId: 'ms_ecom_01',
    reviewer: 'client_01',
    decision: 'APPROVED',
    feedback: 'Approved without reservations. Wireframes and Figma component tokens match our design system perfectly.',
    criteriaChecklist: [
      { criteria: 'Complete desktop and mobile responsive Figma component designs', satisfied: true },
      { criteria: 'Design tokens for colors, typography, spacing, and buttons', satisfied: true },
      { criteria: 'Interactive prototype walkthrough and design system guide', satisfied: true },
    ],
    timestamp: '2026-02-12T11:00:00Z',
  },

  // Project B - ms_brand_01 (Approved)
  {
    id: 'rev_brand_01',
    deliveryId: 'del_brand_01_r1',
    milestoneId: 'ms_brand_01',
    reviewer: 'client_01',
    decision: 'APPROVED',
    feedback: 'Direction #2 is clear and compelling. Moving forward to final vector assets.',
    criteriaChecklist: [
      { criteria: 'Comprehensive brand strategy deck with competitive audit', satisfied: true },
      { criteria: 'Three distinct visual directions with palette & font pairings', satisfied: true },
      { criteria: 'Stakeholder alignment workshop summary', satisfied: true },
    ],
    timestamp: '2026-02-14T11:00:00Z',
  },
  // Project B - ms_brand_02 (Revision Requested on Rev 1)
  {
    id: 'rev_brand_02_r1',
    deliveryId: 'del_brand_02_r1',
    milestoneId: 'ms_brand_02',
    reviewer: 'client_01',
    decision: 'REVISION_REQUESTED',
    feedback: 'The neon color scheme conflicts with our premium positioning. Please refine to a warm cream and olive aesthetic with readable dark text and monochrome icon variants.',
    criteriaChecklist: [
      { criteria: 'Primary, secondary, and monochrome logo assets in SVG, EPS, and high-res PNG', satisfied: false },
      { criteria: 'Minimum clear-space and size rules documentation', satisfied: true },
      { criteria: 'Brand guideline book including dark/light mode token definitions', satisfied: false },
    ],
    timestamp: '2026-02-24T10:00:00Z',
  },

  // Project C - ms_port_01 (Approved)
  {
    id: 'rev_port_01',
    deliveryId: 'del_port_01_r1',
    milestoneId: 'ms_port_01',
    reviewer: 'client_01',
    decision: 'APPROVED',
    feedback: 'Information architecture and layout wireframes verified and signed off.',
    criteriaChecklist: [
      { criteria: 'High-fidelity mockups for desktop and mobile viewports', satisfied: true },
      { criteria: 'Information architecture map for projects showcase', satisfied: true },
      { criteria: 'Client review and formal approval sign-off', satisfied: true },
    ],
    timestamp: '2026-02-05T09:00:00Z',
  },
  // Project C - ms_port_02 (Disputed)
  {
    id: 'rev_port_02',
    deliveryId: 'del_port_02_r1',
    milestoneId: 'ms_port_02',
    reviewer: 'client_01',
    decision: 'DISPUTED',
    feedback: 'Target frame rate SLA failed: The 3D scene drops to 14 FPS on iPhone mobile Safari and generates excessive GPU thermal throttling. Scope criterion #1 is breached.',
    criteriaChecklist: [
      { criteria: 'Consistent frame rate >= 60 FPS on desktop and >= 30 FPS on iOS mobile Safari', satisfied: false },
      { criteria: 'Zero WebGL memory leaks during scene transitions', satisfied: true },
      { criteria: 'Fallback canvas rendering for low-power devices', satisfied: false },
    ],
    timestamp: '2026-02-23T14:00:00Z',
  },
];

// -------------------------------------------------------------
// PAYMENTS
// -------------------------------------------------------------

export const initialPayments: PaymentRecord[] = [
  // Project A Payments
  {
    id: 'pay_dep_ecom_01',
    projectId: 'prj_ecom',
    milestoneId: 'ms_ecom_01',
    type: 'ESCROW_DEPOSIT',
    amountMinor: 500000, // ₹5,000.00
    currency: 'INR',
    status: 'COMPLETED',
    reference: 'sim_tx_dep_ecom_9124',
    isSimulated: true,
    payerId: 'client_01',
    recipientId: 'escrow_smart_contract_vault',
    timestamp: '2026-02-02T10:00:00Z',
  },
  {
    id: 'pay_rel_ecom_01',
    projectId: 'prj_ecom',
    milestoneId: 'ms_ecom_01',
    type: 'ESCROW_RELEASE',
    amountMinor: 500000, // ₹5,000.00
    currency: 'INR',
    status: 'COMPLETED',
    reference: 'sim_tx_rel_ecom_4812',
    isSimulated: true,
    payerId: 'client_01',
    recipientId: 'freelancer_01',
    timestamp: '2026-02-12T11:30:00Z',
  },
  {
    id: 'pay_dep_ecom_02',
    projectId: 'prj_ecom',
    milestoneId: 'ms_ecom_02',
    type: 'ESCROW_DEPOSIT',
    amountMinor: 1200000, // ₹12,000.00
    currency: 'INR',
    status: 'COMPLETED',
    reference: 'sim_tx_dep_ecom_8371',
    isSimulated: true,
    payerId: 'client_01',
    recipientId: 'escrow_smart_contract_vault',
    timestamp: '2026-02-13T10:00:00Z',
  },
  {
    id: 'pay_dep_ecom_03',
    projectId: 'prj_ecom',
    milestoneId: 'ms_ecom_03',
    type: 'ESCROW_DEPOSIT',
    amountMinor: 800000, // ₹8,000.00
    currency: 'INR',
    status: 'COMPLETED',
    reference: 'sim_tx_dep_ecom_7204',
    isSimulated: true,
    payerId: 'client_01',
    recipientId: 'escrow_smart_contract_vault',
    timestamp: '2026-02-13T10:00:00Z',
  },

  // Project B Payments
  {
    id: 'pay_dep_brand_01',
    projectId: 'prj_brand',
    milestoneId: 'ms_brand_01',
    type: 'ESCROW_DEPOSIT',
    amountMinor: 500000, // ₹5,000.00
    currency: 'INR',
    status: 'COMPLETED',
    reference: 'sim_tx_dep_brand_501',
    isSimulated: true,
    payerId: 'client_01',
    recipientId: 'escrow_smart_contract_vault',
    timestamp: '2026-02-06T09:00:00Z',
  },
  {
    id: 'pay_rel_brand_01',
    projectId: 'prj_brand',
    milestoneId: 'ms_brand_01',
    type: 'ESCROW_RELEASE',
    amountMinor: 500000, // ₹5,000.00
    currency: 'INR',
    status: 'COMPLETED',
    reference: 'sim_tx_rel_brand_502',
    isSimulated: true,
    payerId: 'client_01',
    recipientId: 'freelancer_01',
    timestamp: '2026-02-14T11:30:00Z',
  },
  {
    id: 'pay_dep_brand_02',
    projectId: 'prj_brand',
    milestoneId: 'ms_brand_02',
    type: 'ESCROW_DEPOSIT',
    amountMinor: 700000, // ₹7,000.00
    currency: 'INR',
    status: 'COMPLETED',
    reference: 'sim_tx_dep_brand_701',
    isSimulated: true,
    payerId: 'client_01',
    recipientId: 'escrow_smart_contract_vault',
    timestamp: '2026-02-15T10:00:00Z',
  },

  // Project C Payments
  {
    id: 'pay_dep_port_01',
    projectId: 'prj_portfolio',
    milestoneId: 'ms_port_01',
    type: 'ESCROW_DEPOSIT',
    amountMinor: 600000, // ₹6,000.00
    currency: 'INR',
    status: 'COMPLETED',
    reference: 'sim_tx_dep_port_601',
    isSimulated: true,
    payerId: 'client_01',
    recipientId: 'escrow_smart_contract_vault',
    timestamp: '2026-01-21T10:00:00Z',
  },
  {
    id: 'pay_rel_port_01',
    projectId: 'prj_portfolio',
    milestoneId: 'ms_port_01',
    type: 'ESCROW_RELEASE',
    amountMinor: 600000, // ₹6,000.00
    currency: 'INR',
    status: 'COMPLETED',
    reference: 'sim_tx_rel_port_602',
    isSimulated: true,
    payerId: 'client_01',
    recipientId: 'freelancer_01',
    timestamp: '2026-02-05T09:30:00Z',
  },
  {
    id: 'pay_dep_port_02',
    projectId: 'prj_portfolio',
    milestoneId: 'ms_port_02',
    type: 'ESCROW_DEPOSIT',
    amountMinor: 1200000, // ₹12,000.00 (Escrowed and currently locked in dispute)
    currency: 'INR',
    status: 'COMPLETED',
    reference: 'sim_tx_dep_port_1201',
    isSimulated: true,
    payerId: 'client_01',
    recipientId: 'escrow_smart_contract_vault',
    timestamp: '2026-02-06T10:00:00Z',
  },
];

// -------------------------------------------------------------
// DISPUTES
// -------------------------------------------------------------

export const initialDisputes: Record<string, Dispute> = {
  ms_port_02: {
    id: 'dsp_port_02',
    milestoneId: 'ms_port_02',
    projectId: 'prj_portfolio',
    initiatorId: 'client_01',
    reason: 'Target frame rate SLA breached: 3D WebGL shader scene drops to 14 FPS on mobile iOS Safari with severe thermal throttling. Client requested shader optimization or proportional discount before release.',
    evidenceReferences: [
      {
        id: 'ev_port_01',
        title: 'Safari iOS Performance & Frame Drop Trace',
        urlOrContent: 'https://storage.fairwork.sim/disputes/dsp_port_02/safari_fps_trace.json',
        sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        submittedBy: 'client_01',
        timestamp: '2026-02-23T15:00:00Z',
      },
      {
        id: 'ev_port_02',
        title: 'Desktop Chrome 60 FPS Benchmark Log',
        urlOrContent: 'https://storage.fairwork.sim/disputes/dsp_port_02/desktop_benchmark.log',
        sha256Hash: 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2',
        submittedBy: 'freelancer_01',
        timestamp: '2026-02-24T11:00:00Z',
      },
    ],
    responses: [
      {
        id: 'msg_port_01',
        authorId: 'freelancer_01',
        message: 'The WebGL shaders achieve consistent 60 FPS on desktop Chrome, Firefox, and macOS Safari. The mobile drop is caused by lack of WebGL 2.0 float-texture precision on certain older iOS devices. I can simplify the fragment shader passes or agree to a 25% scope adjustment.',
        timestamp: '2026-02-24T11:30:00Z',
      },
      {
        id: 'msg_port_02',
        authorId: 'client_01',
        message: 'We appreciate the explanation. If you can provide a stable 30 FPS mobile fallback or accept ₹9,000 payment for the desktop work and refund ₹3,000, we would be willing to settle amicably.',
        timestamp: '2026-02-24T16:00:00Z',
      },
    ],
    settlementProposal: {
      proposedBy: 'client_01',
      freelancerAmountMinor: 900000, // ₹9,000.00 (75%)
      clientRefundMinor: 300000,      // ₹3,000.00 (25%)
      proposalNotes: 'Client receives ₹3,000.00 refund; Freelancer receives ₹9,000.00 for the desktop 3D assets and base scene.',
      acceptedByClient: true,
      acceptedByFreelancer: false, // Awaiting Bob Martinez confirmation
    },
    status: 'SETTLEMENT_PROPOSED',
    createdAt: '2026-02-23T14:30:00Z',
  },
};

// -------------------------------------------------------------
// CHRONOLOGICAL ACTIVITY EVENTS (Complete lifecycle for all 3 projects)
// -------------------------------------------------------------

export const initialEvents: ActivityEvent[] = [
  // Project C - Dispute Events
  {
    id: 'evt_p02_08',
    timestamp: '2026-02-24T16:30:00Z',
    actorId: 'client_01',
    actorRole: 'CLIENT',
    eventType: 'SETTLEMENT_PROPOSED',
    projectId: 'prj_portfolio',
    milestoneId: 'ms_port_02',
    details: 'Client proposed mutual settlement: ₹9,000.00 to Freelancer, ₹3,000.00 refund to Client.',
    isSimulated: true,
  },
  {
    id: 'evt_p02_07',
    timestamp: '2026-02-24T11:00:00Z',
    actorId: 'freelancer_01',
    actorRole: 'FREELANCER',
    eventType: 'EVIDENCE_ADDED',
    projectId: 'prj_portfolio',
    milestoneId: 'ms_port_02',
    details: 'Freelancer uploaded evidence: Desktop Chrome 60 FPS Benchmark Log with SHA-256 fingerprint.',
    isSimulated: true,
  },
  {
    id: 'evt_p02_06',
    timestamp: '2026-02-23T15:00:00Z',
    actorId: 'client_01',
    actorRole: 'CLIENT',
    eventType: 'EVIDENCE_ADDED',
    projectId: 'prj_portfolio',
    milestoneId: 'ms_port_02',
    details: 'Client submitted evidence: Safari iOS Performance & Frame Drop Trace.',
    isSimulated: true,
  },
  {
    id: 'evt_p02_05',
    timestamp: '2026-02-23T14:30:00Z',
    actorId: 'client_01',
    actorRole: 'CLIENT',
    eventType: 'DISPUTE_OPENED',
    projectId: 'prj_portfolio',
    milestoneId: 'ms_port_02',
    details: 'Dispute opened on Milestone "Interactive 3D WebGL Engine" regarding mobile FPS SLA breach. Ordinary release locked.',
    isSimulated: true,
  },

  // Project B - Revision cycle events
  {
    id: 'evt_b02_05',
    timestamp: '2026-02-27T14:00:00Z',
    actorId: 'freelancer_01',
    actorRole: 'FREELANCER',
    eventType: 'REVISED_DELIVERY_SUBMITTED',
    projectId: 'prj_brand',
    milestoneId: 'ms_brand_02',
    details: 'Revision #2 submitted by Freelancer: Refined warm cream + olive color system, monochrome variants, and contrast guide.',
    isSimulated: true,
  },
  {
    id: 'evt_b02_04',
    timestamp: '2026-02-24T10:00:00Z',
    actorId: 'client_01',
    actorRole: 'CLIENT',
    eventType: 'REVISION_REQUESTED',
    projectId: 'prj_brand',
    milestoneId: 'ms_brand_02',
    details: 'Client requested revision on Milestone "Logo & Visual Identity System": Refine neon colors to warm aesthetic with monochrome icons.',
    isSimulated: true,
  },
  {
    id: 'evt_b02_03',
    timestamp: '2026-02-22T11:00:00Z',
    actorId: 'freelancer_01',
    actorRole: 'FREELANCER',
    eventType: 'DELIVERY_SUBMITTED',
    projectId: 'prj_brand',
    milestoneId: 'ms_brand_02',
    details: 'Initial Revision #1 submitted by Freelancer with draft vector lockups.',
    isSimulated: true,
  },
  {
    id: 'evt_b02_02',
    timestamp: '2026-02-15T10:00:00Z',
    actorId: 'client_01',
    actorRole: 'CLIENT',
    eventType: 'MILESTONE_FUNDED',
    projectId: 'prj_brand',
    milestoneId: 'ms_brand_02',
    details: 'Milestone "Logo & Visual Identity System" funded: ₹7,000.00 deposited into simulated escrow.',
    transactionReference: 'sim_tx_dep_brand_701',
    isSimulated: true,
  },
  {
    id: 'evt_b01_03',
    timestamp: '2026-02-14T11:30:00Z',
    actorId: 'client_01',
    actorRole: 'CLIENT',
    eventType: 'PAYMENT_RELEASED',
    projectId: 'prj_brand',
    milestoneId: 'ms_brand_01',
    details: 'Milestone "Brand Strategy & Visual Direction" payment released: ₹5,000.00 transferred to Bob Martinez.',
    transactionReference: 'sim_tx_rel_brand_502',
    isSimulated: true,
  },
  {
    id: 'evt_b01_02',
    timestamp: '2026-02-14T11:00:00Z',
    actorId: 'client_01',
    actorRole: 'CLIENT',
    eventType: 'MILESTONE_APPROVED',
    projectId: 'prj_brand',
    milestoneId: 'ms_brand_01',
    details: 'Milestone "Brand Strategy & Visual Direction" approved by client.',
    isSimulated: true,
  },

  // Project A - E-commerce Events
  {
    id: 'evt_ecom_07',
    timestamp: '2026-02-28T16:00:00Z',
    actorId: 'freelancer_01',
    actorRole: 'FREELANCER',
    eventType: 'DELIVERY_SUBMITTED',
    projectId: 'prj_ecom',
    milestoneId: 'ms_ecom_02',
    details: 'Deliverable submitted for "Frontend Development" with verified SHA-256 fingerprint (Lighthouse score >= 90).',
    isSimulated: true,
  },
  {
    id: 'evt_ecom_06',
    timestamp: '2026-02-13T10:00:00Z',
    actorId: 'client_01',
    actorRole: 'CLIENT',
    eventType: 'MILESTONE_FUNDED',
    projectId: 'prj_ecom',
    milestoneId: 'ms_ecom_03',
    details: 'Milestone "Backend Integration" funded: ₹8,000.00 deposited into escrow vault.',
    transactionReference: 'sim_tx_dep_ecom_7204',
    isSimulated: true,
  },
  {
    id: 'evt_ecom_05',
    timestamp: '2026-02-13T10:00:00Z',
    actorId: 'client_01',
    actorRole: 'CLIENT',
    eventType: 'MILESTONE_FUNDED',
    projectId: 'prj_ecom',
    milestoneId: 'ms_ecom_02',
    details: 'Milestone "Frontend Development" funded: ₹12,000.00 deposited into escrow vault.',
    transactionReference: 'sim_tx_dep_ecom_8371',
    isSimulated: true,
  },
  {
    id: 'evt_ecom_04',
    timestamp: '2026-02-12T11:30:00Z',
    actorId: 'client_01',
    actorRole: 'CLIENT',
    eventType: 'PAYMENT_RELEASED',
    projectId: 'prj_ecom',
    milestoneId: 'ms_ecom_01',
    details: 'Milestone "UI/UX Design" payment released: ₹5,000.00 transferred to Bob Martinez.',
    transactionReference: 'sim_tx_rel_ecom_4812',
    isSimulated: true,
  },
  {
    id: 'evt_ecom_03',
    timestamp: '2026-02-12T11:00:00Z',
    actorId: 'client_01',
    actorRole: 'CLIENT',
    eventType: 'MILESTONE_APPROVED',
    projectId: 'prj_ecom',
    milestoneId: 'ms_ecom_01',
    details: 'Milestone "UI/UX Design" approved without reservations.',
    isSimulated: true,
  },
  {
    id: 'evt_ecom_02',
    timestamp: '2026-02-12T10:30:00Z',
    actorId: 'freelancer_01',
    actorRole: 'FREELANCER',
    eventType: 'AGREEMENT_ACCEPTED',
    projectId: 'prj_ecom',
    details: 'Agreement v2 accepted and digitally signed by Bob Martinez. SLA terms active.',
    isSimulated: true,
  },
  {
    id: 'evt_ecom_01',
    timestamp: '2026-02-12T10:00:00Z',
    actorId: 'client_01',
    actorRole: 'CLIENT',
    eventType: 'AGREEMENT_VERSIONED',
    projectId: 'prj_ecom',
    details: 'Agreement v2 proposed by Nexus Ventures with Google Lighthouse SLA requirement.',
    isSimulated: true,
  },

  // Base Creation Events
  {
    id: 'evt_init_p01',
    timestamp: '2026-02-05T10:00:00Z',
    actorId: 'client_01',
    actorRole: 'CLIENT',
    eventType: 'PROJECT_CREATED',
    projectId: 'prj_brand',
    details: 'Project "Brand Identity & Design System" created with ₹12,000.00 total budget.',
    isSimulated: true,
  },
  {
    id: 'evt_init_p02',
    timestamp: '2026-01-20T11:00:00Z',
    actorId: 'client_01',
    actorRole: 'CLIENT',
    eventType: 'PROJECT_CREATED',
    projectId: 'prj_portfolio',
    details: 'Project "Portfolio Website with 3D Graphics" created with ₹18,000.00 total budget.',
    isSimulated: true,
  },
  {
    id: 'evt_init_p00',
    timestamp: '2026-02-01T09:00:00Z',
    actorId: 'client_01',
    actorRole: 'CLIENT',
    eventType: 'PROJECT_CREATED',
    projectId: 'prj_ecom',
    details: 'Project "E-commerce Website Platform" created with ₹30,000.00 total budget across 4 milestones.',
    isSimulated: true,
  },
];

export const initialProject: Project = initialProjects[0];
export const initialAgreement: Agreement = initialAgreements[1]; // agr_ecom_v2
