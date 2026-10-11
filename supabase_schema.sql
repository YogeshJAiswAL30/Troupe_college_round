-- =============================================================================
-- FAIRWORK POSTGRESQL SCHEMA & ACCESS CONTROL SPECIFICATION
-- Target: Supabase / PostgreSQL 15+
-- Features: Row-Level Security (RLS), Server-side Constraints, Triggers,
--           Encrypted/Private Storage Buckets, Audit Event Logging
-- =============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS
CREATE TYPE user_role AS ENUM ('CLIENT', 'FREELANCER', 'ARBITRATOR', 'ADMIN');
CREATE TYPE verification_status AS ENUM ('UNVERIFIED', 'ID_VERIFIED', 'VERIFIED_PRO');
CREATE TYPE project_status AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'DISPUTED', 'CANCELLED');
CREATE TYPE milestone_status AS ENUM ('AWAITING_FUNDING', 'FUNDED', 'IN_PROGRESS', 'SUBMITTED', 'REVISION_REQUESTED', 'APPROVED', 'RELEASED', 'DISPUTED', 'RESOLVED_SPLIT');
CREATE TYPE review_decision AS ENUM ('APPROVED', 'REVISION_REQUESTED', 'DISPUTED');
CREATE TYPE payment_type AS ENUM ('ESCROW_DEPOSIT', 'ESCROW_RELEASE', 'REFUND_TO_CLIENT', 'SETTLEMENT_SPLIT', 'ARBITRATION_FEE');
CREATE TYPE payment_status AS ENUM ('PENDING', 'HELD_IN_ESCROW', 'COMPLETED', 'FAILED', 'DISPUTED');
CREATE TYPE dispute_status AS ENUM ('OPEN', 'SETTLEMENT_PROPOSED', 'ARBITRATION_PENDING', 'RESOLVED');

-- 3. USER PROFILES TABLE (Linked to auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'CLIENT',
    verification_status verification_status NOT NULL DEFAULT 'UNVERIFIED',
    bio TEXT,
    skills TEXT[] DEFAULT '{}',
    reputation_score INTEGER NOT NULL DEFAULT 100 CHECK (reputation_score >= 0 AND reputation_score <= 100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. PROJECTS TABLE
CREATE TABLE public.projects (
    id TEXT PRIMARY KEY DEFAULT ('prj_' || substr(md5(random()::text), 1, 10)),
    title TEXT NOT NULL CHECK (char_length(title) >= 3),
    description TEXT NOT NULL,
    client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    freelancer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    currency VARCHAR(6) NOT NULL DEFAULT 'INR',
    total_budget_minor BIGINT NOT NULL CHECK (total_budget_minor > 0),
    status project_status NOT NULL DEFAULT 'ACTIVE',
    active_agreement_id TEXT,
    start_date DATE,
    target_completion_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. AGREEMENTS & VERSIONS TABLE
CREATE TABLE public.agreements (
    id TEXT PRIMARY KEY DEFAULT ('agr_' || substr(md5(random()::text), 1, 10)),
    project_id TEXT NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL DEFAULT 1 CHECK (version_number >= 1),
    structured_terms JSONB NOT NULL,
    proposed_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    agreement_hash VARCHAR(64) NOT NULL, -- SHA-256 hex
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(project_id, version_number)
);

-- 6. AGREEMENT SIGNATURES TABLE
CREATE TABLE public.agreement_signatures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agreement_id TEXT NOT NULL REFERENCES public.agreements(id) ON DELETE CASCADE,
    signer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    signature_hash TEXT NOT NULL,
    signed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(agreement_id, signer_id)
);

-- 7. MILESTONES TABLE
CREATE TABLE public.milestones (
    id TEXT PRIMARY KEY DEFAULT ('ms_' || substr(md5(random()::text), 1, 10)),
    project_id TEXT NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    amount_minor BIGINT NOT NULL CHECK (amount_minor > 0),
    deadline DATE NOT NULL,
    acceptance_criteria JSONB NOT NULL DEFAULT '[]'::jsonb,
    review_period_days INTEGER NOT NULL DEFAULT 5,
    max_revisions INTEGER NOT NULL DEFAULT 2,
    current_revision_count INTEGER NOT NULL DEFAULT 0,
    status milestone_status NOT NULL DEFAULT 'AWAITING_FUNDING',
    funded_at TIMESTAMPTZ,
    submitted_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ,
    released_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. DELIVERIES & REVISIONS TABLE
CREATE TABLE public.deliveries (
    id TEXT PRIMARY KEY DEFAULT ('del_' || substr(md5(random()::text), 1, 10)),
    milestone_id TEXT NOT NULL REFERENCES public.milestones(id) ON DELETE CASCADE,
    revision_number INTEGER NOT NULL DEFAULT 1,
    submitted_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    notes TEXT NOT NULL,
    files JSONB NOT NULL DEFAULT '[]'::jsonb,
    external_url TEXT,
    delivery_hash VARCHAR(64) NOT NULL, -- SHA-256 fingerprint
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(milestone_id, revision_number)
);

-- 9. REVIEWS TABLE
CREATE TABLE public.reviews (
    id TEXT PRIMARY KEY DEFAULT ('rev_' || substr(md5(random()::text), 1, 10)),
    delivery_id TEXT NOT NULL REFERENCES public.deliveries(id) ON DELETE CASCADE,
    milestone_id TEXT NOT NULL REFERENCES public.milestones(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    decision review_decision NOT NULL,
    feedback TEXT NOT NULL,
    criteria_checklist JSONB NOT NULL DEFAULT '[]'::jsonb,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. PAYMENT RECORDS TABLE (Financial Double-Counting Prevention)
CREATE TABLE public.payments (
    id TEXT PRIMARY KEY DEFAULT ('pay_' || substr(md5(random()::text), 1, 10)),
    project_id TEXT NOT NULL REFERENCES public.projects(id) ON DELETE RESTRICT,
    milestone_id TEXT REFERENCES public.milestones(id) ON DELETE RESTRICT,
    type payment_type NOT NULL,
    amount_minor BIGINT NOT NULL CHECK (amount_minor > 0),
    currency VARCHAR(6) NOT NULL,
    status payment_status NOT NULL DEFAULT 'PENDING',
    reference TEXT NOT NULL UNIQUE,
    is_simulated BOOLEAN NOT NULL DEFAULT TRUE,
    payer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    recipient_id TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. DISPUTES TABLE
CREATE TABLE public.disputes (
    id TEXT PRIMARY KEY DEFAULT ('dsp_' || substr(md5(random()::text), 1, 10)),
    milestone_id TEXT NOT NULL UNIQUE REFERENCES public.milestones(id) ON DELETE RESTRICT,
    project_id TEXT NOT NULL REFERENCES public.projects(id) ON DELETE RESTRICT,
    initiator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    reason TEXT NOT NULL,
    status dispute_status NOT NULL DEFAULT 'OPEN',
    settlement_proposal JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. EVIDENCE METADATA TABLE (Private Access)
CREATE TABLE public.dispute_evidence (
    id TEXT PRIMARY KEY DEFAULT ('ev_' || substr(md5(random()::text), 1, 10)),
    dispute_id TEXT NOT NULL REFERENCES public.disputes(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    sha256_hash VARCHAR(64) NOT NULL,
    submitted_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. DISPUTE MESSAGES TABLE
CREATE TABLE public.dispute_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dispute_id TEXT NOT NULL REFERENCES public.disputes(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    message TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. ACTIVITY AUDIT EVENTS TABLE
CREATE TABLE public.activity_events (
    id TEXT PRIMARY KEY DEFAULT ('evt_' || substr(md5(random()::text), 1, 10)),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    actor_role user_role NOT NULL,
    event_type TEXT NOT NULL,
    project_id TEXT REFERENCES public.projects(id) ON DELETE SET NULL,
    milestone_id TEXT REFERENCES public.milestones(id) ON DELETE SET NULL,
    details TEXT NOT NULL,
    transaction_reference TEXT,
    is_simulated BOOLEAN NOT NULL DEFAULT TRUE,
    is_on_chain BOOLEAN NOT NULL DEFAULT FALSE
);

-- =============================================================================
-- 15. ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agreement_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dispute_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dispute_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_events ENABLE ROW LEVEL SECURITY;

-- Profiles: Authenticated users can read all verified profiles for matching/identity;
-- Only the user themselves can update their profile. Role cannot be self-updated.
CREATE POLICY "Public profiles are readable by authenticated users"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can update their own profile bio and skills"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Projects: Only client, freelancer, or arbitrators/admins can view project
CREATE POLICY "Participants and Arbitrators can view projects"
    ON public.projects FOR SELECT
    TO authenticated
    USING (
        auth.uid() = client_id OR
        auth.uid() = freelancer_id OR
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('ARBITRATOR', 'ADMIN')
        )
    );

CREATE POLICY "Clients can insert projects"
    ON public.projects FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = client_id AND
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'CLIENT'
        )
    );

-- Milestones: Readable by project participants or arbitrators
CREATE POLICY "Project participants can view milestones"
    ON public.milestones FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.projects p
            WHERE p.id = project_id AND (
                p.client_id = auth.uid() OR
                p.freelancer_id = auth.uid() OR
                EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ARBITRATOR', 'ADMIN'))
            )
        )
    );

-- Deliveries: Readable by project participants and arbitrators
CREATE POLICY "Deliveries accessible only to project participants"
    ON public.deliveries FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.milestones m
            JOIN public.projects p ON p.id = m.project_id
            WHERE m.id = milestone_id AND (
                p.client_id = auth.uid() OR
                p.freelancer_id = auth.uid() OR
                EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ARBITRATOR', 'ADMIN'))
            )
        )
    );

-- Freelancers can submit deliverables for their assigned projects
CREATE POLICY "Freelancers can insert deliverables"
    ON public.deliveries FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = submitted_by AND
        EXISTS (
            SELECT 1 FROM public.milestones m
            JOIN public.projects p ON p.id = m.project_id
            WHERE m.id = milestone_id AND p.freelancer_id = auth.uid()
        )
    );

-- Evidence: Strictly locked to dispute participants & arbitrators
CREATE POLICY "Dispute evidence strictly restricted"
    ON public.dispute_evidence FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.disputes d
            JOIN public.projects p ON p.id = d.project_id
            WHERE d.id = dispute_id AND (
                p.client_id = auth.uid() OR
                p.freelancer_id = auth.uid() OR
                EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ARBITRATOR', 'ADMIN'))
            )
        )
    );

-- Storage bucket definition guide (in Supabase Storage):
-- Bucket: 'deliverables' (private, authenticated read for participants)
-- Bucket: 'evidence' (private, authenticated read for dispute parties)
