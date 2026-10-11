import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Lock,
  FileText,
  CreditCard,
  Scale,
  Fingerprint,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';

export const HowItWorksPage: React.FC = () => {
  const navigate = useNavigate();

  const rules = [
    {
      num: 'Rule 1',
      title: 'Milestone amounts must add up exactly to project budget',
      desc: 'All milestone allocations are checked against the project total budget before locking. Under-allocation or over-allocation is rejected.',
    },
    {
      num: 'Rule 2',
      title: 'A milestone cannot be approved before a delivery is submitted',
      desc: 'The client cannot trigger an approval state transition without an existing, verifiable delivery record from the freelancer.',
    },
    {
      num: 'Rule 3',
      title: 'A released milestone cannot be released twice',
      desc: 'Once escrow funds are paid out, the milestone state enters a terminal released status. Subsequent release attempts throw invariant errors.',
    },
    {
      num: 'Rule 4',
      title: 'A disputed milestone cannot use ordinary release',
      desc: 'When a dispute is raised, unilateral payment release is locked immediately. Only mutual settlement or arbitrator resolution can release funds.',
    },
    {
      num: 'Rule 5',
      title: 'Only the correct participant can perform each action',
      desc: 'Role authorization ensures clients cannot submit deliverables and freelancers cannot release escrow funds to themselves.',
    },
    {
      num: 'Rule 6',
      title: 'Agreement becomes active only after required parties accept it',
      desc: 'The agreement requires dual digital signatures from both the client and freelancer before work begins.',
    },
    {
      num: 'Rule 7',
      title: 'Changes to accepted terms create a new version requiring renewed acceptance',
      desc: 'Modifying terms automatically increments the agreement version and resets the counterparty’s signature, preventing unconsented scope changes.',
    },
    {
      num: 'Rule 8',
      title: 'Integer minor units for decimal-safe money calculations',
      desc: 'Financial values are stored in cents to completely prevent floating-point rounding errors and desynchronization.',
    },
    {
      num: 'Rule 9',
      title: 'Derive totals from a single source of truth',
      desc: 'Escrow balances, released funds, and pending allocations are calculated dynamically from milestone states, never stored in duplicate counters.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8F5EE] text-[#1C1917] selection:bg-[#264235] selection:text-white pb-20">
      {/* Header */}
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between border-b border-[#E5DFD5]">
        <div className="flex items-center gap-3">
          <div
            onClick={() => navigate('/')}
            className="w-9 h-9 rounded-xl bg-[#264235] flex items-center justify-center text-white shadow-xs cursor-pointer"
          >
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span
              onClick={() => navigate('/')}
              className="font-bold text-lg tracking-tight text-[#1C1917] cursor-pointer"
            >
              Fairwork
            </span>
            <span className="block text-[10px] text-[#8A837A] font-semibold tracking-wider">
              HOW IT WORKS &bull; ARCHITECTURE SPEC
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
            onClick={() => navigate('/')}
          >
            Back to Home
          </Button>
          <Button
            variant="primary"
            size="sm"
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            onClick={() => navigate('/app')}
          >
            Launch Demo
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-[#264235] block mb-1">
            Verifiable Architecture
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1C1917] mb-4">
            How Fairwork Guarantees Fairness
          </h1>
          <p className="text-sm text-[#605A53] max-w-xl mx-auto leading-relaxed">
            Fairwork is designed around 5 interconnected relationships and 9 strict state machine invariants. Neither party is assumed automatically right.
          </p>
        </div>

        {/* 5 Core Relationships */}
        <section className="mb-14">
          <h2 className="text-lg font-bold text-[#1C1917] mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#264235]" />
            The 5 Core Relationships
          </h2>

          <div className="space-y-3">
            <Card>
              <CardContent className="p-4 flex items-start gap-3 text-xs">
                <FileText className="w-5 h-5 text-[#264235] shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-[#1C1917] mb-0.5">
                    1. The Accepted Agreement &amp; Its Version
                  </h3>
                  <p className="text-[#605A53]">
                    The agreement defines intellectual property clauses, scope summaries, and milestone criteria. A SHA-256 fingerprint seals every version.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 flex items-start gap-3 text-xs">
                <Lock className="w-5 h-5 text-[#264235] shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-[#1C1917] mb-0.5">
                    2. The Milestone &amp; Acceptance Criteria
                  </h3>
                  <p className="text-[#605A53]">
                    Milestones specify verifiable criteria checklist items and review windows. Client deposits escrow before work begins.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 flex items-start gap-3 text-xs">
                <Fingerprint className="w-5 h-5 text-[#264235] shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-[#1C1917] mb-0.5">
                    3. The Submitted Deliverable &amp; Revision History
                  </h3>
                  <p className="text-[#605A53]">
                    Deliverables record revision numbers, release notes, and file hashes. Proves submission timestamp and content integrity.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 flex items-start gap-3 text-xs">
                <Scale className="w-5 h-5 text-[#264235] shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-[#1C1917] mb-0.5">
                    4. The Review or Dispute Decision
                  </h3>
                  <p className="text-[#605A53]">
                    Clients verify items against original criteria. Clients can approve, request revisions within policy, or initiate dispute.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 flex items-start gap-3 text-xs">
                <CreditCard className="w-5 h-5 text-[#264235] shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-[#1C1917] mb-0.5">
                    5. The Resulting Payment Action &amp; Transaction Record
                  </h3>
                  <p className="text-[#605A53]">
                    Escrow payouts are recorded into an immutable transaction ledger. Cannot be released twice.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 9 Invariant Rules */}
        <section className="mb-14">
          <h2 className="text-lg font-bold text-[#1C1917] mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#264235]" />
            The 9 System Rules &amp; Invariants (100% Tested)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {rules.map((rule) => (
              <div
                key={rule.num}
                className="p-4 rounded-xl bg-white border border-[#E5DFD5] text-xs shadow-xs"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono font-bold text-[#264235] text-[11px]">
                    {rule.num}
                  </span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#285C42]" />
                </div>
                <h3 className="font-bold text-[#1C1917] mb-1">{rule.title}</h3>
                <p className="text-[#605A53] leading-relaxed">{rule.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA to App */}
        <div className="p-8 rounded-3xl bg-white border border-[#E5DFD5] text-center shadow-xs">
          <h3 className="text-lg font-bold text-[#1C1917] mb-2">
            Ready to inspect the live state engine?
          </h3>
          <p className="text-xs text-[#605A53] max-w-md mx-auto mb-6">
            Launch the interactive prototype to test persona switching, escrow deposits, deliverable hashes, and dispute settlements.
          </p>
          <Button
            variant="primary"
            size="md"
            rightIcon={<ArrowRight className="w-4 h-4" />}
            onClick={() => navigate('/app')}
          >
            Launch Fairwork Sandbox
          </Button>
        </div>
      </main>
    </div>
  );
};
