import React, { useState } from 'react';
import {
  History,
  FileText,
  CreditCard,
  Upload,
  ShieldCheck,
  Scale,
  FolderGit2,
  CheckCircle2,
  Search,
  ExternalLink,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useFairwork } from '../../context/FairworkContext';
import { Card } from '../../components/ui/Card';
import { ActivityEventType } from '../../types/fairwork';

type FilterCategory = 'ALL' | 'AGREEMENT' | 'DELIVERY' | 'PAYMENT' | 'DISPUTE';

export const ActivityPage: React.FC = () => {
  const { events, projects, milestones } = useFairwork();
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('ALL');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Project map for quick lookup
  const projectMap = React.useMemo(() => {
    return new Map(projects.map((p) => [p.id, p]));
  }, [projects]);

  const milestoneMap = React.useMemo(() => {
    return new Map(milestones.map((m) => [m.id, m]));
  }, [milestones]);

  const filteredEvents = events.filter((e) => {
    // 1. Filter by category
    if (filterCategory === 'AGREEMENT') {
      if (!e.eventType.includes('AGREEMENT') && e.eventType !== 'PROJECT_CREATED') return false;
    } else if (filterCategory === 'DELIVERY') {
      if (!e.eventType.includes('DELIVERY') && !e.eventType.includes('REVIEW') && e.eventType !== 'MILESTONE_APPROVED' && e.eventType !== 'WORK_STARTED') return false;
    } else if (filterCategory === 'PAYMENT') {
      if (!e.eventType.includes('PAYMENT') && !e.eventType.includes('FUNDED')) return false;
    } else if (filterCategory === 'DISPUTE') {
      if (!e.eventType.includes('DISPUTE') && !e.eventType.includes('EVIDENCE') && !e.eventType.includes('SETTLEMENT')) return false;
    }

    // 2. Filter by project
    if (selectedProjectId !== 'ALL' && e.projectId !== selectedProjectId) {
      return false;
    }

    // 3. Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchDetails = e.details.toLowerCase().includes(q);
      const matchType = e.eventType.toLowerCase().includes(q);
      const matchActor = (e.actorId || '').toLowerCase().includes(q) || (e.actorRole || '').toLowerCase().includes(q);
      const matchRef = (e.transactionReference || '').toLowerCase().includes(q);
      if (!matchDetails && !matchType && !matchActor && !matchRef) return false;
    }

    return true;
  });

  const getEventIcon = (type: ActivityEventType) => {
    if (type.includes('AGREEMENT') || type === 'PROJECT_CREATED') {
      return <FileText className="w-4 h-4 text-[#264235]" />;
    }
    if (type.includes('DELIVERY') || type === 'WORK_STARTED') {
      return <Upload className="w-4 h-4 text-[#B45309]" />;
    }
    if (type.includes('REVIEW') || type === 'MILESTONE_APPROVED') {
      return <ShieldCheck className="w-4 h-4 text-[#285C42]" />;
    }
    if (type.includes('PAYMENT') || type.includes('FUNDED')) {
      return <CreditCard className="w-4 h-4 text-[#1E429F]" />;
    }
    if (type.includes('DISPUTE') || type.includes('EVIDENCE') || type.includes('SETTLEMENT')) {
      return <Scale className="w-4 h-4 text-[#991B1B]" />;
    }
    return <History className="w-4 h-4 text-[#8A837A]" />;
  };

  const getEventCategoryTag = (type: ActivityEventType): { label: string; color: string } => {
    if (type.includes('AGREEMENT') || type === 'PROJECT_CREATED') {
      return { label: 'AGREEMENT', color: 'bg-[#EBF4EE] text-[#285C42] border-[#C2DEC9]' };
    }
    if (type.includes('DELIVERY') || type === 'WORK_STARTED') {
      return { label: 'DELIVERY', color: 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]' };
    }
    if (type.includes('REVIEW') || type === 'MILESTONE_APPROVED') {
      return { label: 'REVIEW', color: 'bg-[#E8F0FE] text-[#1E429F] border-[#D0E1FD]' };
    }
    if (type.includes('PAYMENT') || type.includes('FUNDED')) {
      return { label: 'PAYMENT', color: 'bg-[#F0FDF4] text-[#166534] border-[#BBF7D0]' };
    }
    if (type.includes('DISPUTE') || type.includes('EVIDENCE') || type.includes('SETTLEMENT')) {
      return { label: 'DISPUTE', color: 'bg-[#FEE2E2] text-[#991B1B] border-[#FECACA]' };
    }
    return { label: 'AUDIT', color: 'bg-[#FAF7F2] text-[#605A53] border-[#E5DFD5]' };
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Title & Provenance Disclosure */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#E5DFD5]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold tracking-tight text-[#1C1917]">
              Activity &amp; Audit Trail
            </h1>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#EBF4EE] text-[#285C42] border border-[#C2DEC9]">
              {events.length} Recorded Events
            </span>
          </div>
          <p className="text-xs text-[#605A53]">
            Tamper-evident, timestamped ledger of every project creation, agreement signature, escrow deposit, proof delivery, review decision, and dispute settlement.
          </p>
        </div>

        {/* Verification Legend */}
        <div className="flex items-center gap-2 text-xs bg-white p-2 rounded-xl border border-[#E5DFD5] shrink-0">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#FEF3C7]/70 border border-[#FDE68A] text-[#92400E] text-[10px] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" />
            <span>Simulated Prototype Record</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#EBF4EE] border border-[#C2DEC9] text-[#285C42] text-[10px] font-medium">
            <CheckCircle2 className="w-3 h-3 text-[#285C42]" />
            <span>SHA-256 Provenance Verified</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#FAF7F2] p-3 rounded-2xl border border-[#E5DFD5]">
        {/* Category Tabs */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#E5DFD5] text-xs overflow-x-auto">
          {(
            [
              { id: 'ALL', label: 'All Activity' },
              { id: 'AGREEMENT', label: 'Agreements' },
              { id: 'DELIVERY', label: 'Deliveries' },
              { id: 'PAYMENT', label: 'Payments' },
              { id: 'DISPUTE', label: 'Disputes' },
            ] as const
          ).map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer whitespace-nowrap ${
                filterCategory === cat.id
                  ? 'bg-[#264235] text-white shadow-xs'
                  : 'text-[#605A53] hover:text-[#1C1917]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Project Selector & Search */}
        <div className="flex items-center gap-2">
          {/* Project Dropdown */}
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-[#E5DFD5] bg-white text-xs text-[#1C1917] font-medium focus:outline-none focus:border-[#264235] cursor-pointer"
          >
            <option value="ALL">All Projects ({projects.length})</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#8A837A] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search details, actor, ref..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl border border-[#E5DFD5] bg-white text-xs text-[#1C1917] placeholder-[#8A837A] focus:outline-none focus:border-[#264235] w-48 sm:w-56"
            />
          </div>
        </div>
      </div>

      {/* Events Timeline */}
      {filteredEvents.length === 0 ? (
        <Card className="p-12 text-center text-[#8A837A]">
          <History className="w-10 h-10 mx-auto text-[#D6CEBF] mb-3" />
          <h3 className="text-sm font-bold text-[#1C1917] mb-1">No matching activity events</h3>
          <p className="text-xs">Try selecting another filter or clearing the search term.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredEvents.map((evt) => {
            const prj = evt.projectId ? projectMap.get(evt.projectId) : undefined;
            const ms = evt.milestoneId ? milestoneMap.get(evt.milestoneId) : undefined;
            const tag = getEventCategoryTag(evt.eventType);

            return (
              <Card key={evt.id} className="p-4 flex items-start gap-3 text-xs hover:border-[#D6CEBF] transition bg-white">
                {/* Event Icon Badge */}
                <div className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E5DFD5] shrink-0 mt-0.5">
                  {getEventIcon(evt.eventType)}
                </div>

                {/* Event Body */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${tag.color}`}>
                        {tag.label}
                      </span>
                      <span className="font-bold text-[#1C1917] text-sm tracking-tight">
                        {evt.eventType.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Provenance Badge */}
                      {evt.isOnChain ? (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#EBF4EE] text-[#285C42] border border-[#C2DEC9] font-semibold">
                          ON-CHAIN VERIFIED
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FEF3C7]/80 text-[#92400E] border border-[#FDE68A] font-semibold">
                          SIMULATED
                        </span>
                      )}

                      <span className="text-[11px] text-[#8A837A] font-mono">
                        {new Date(evt.timestamp).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Event Details Text */}
                  <p className="text-[#292524] mb-3 leading-relaxed text-xs">
                    {evt.details}
                  </p>

                  {/* Context Metadata Footer */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-[#605A53] pt-2.5 border-t border-[#EFECE6] bg-[#FAF7F2]/50 -mx-4 -mb-4 px-4 py-2 rounded-b-xl">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#8A837A]">Actor:</span>
                      <span className="font-semibold text-[#1C1917]">
                        {evt.actorRole}
                      </span>
                      <span className="font-mono text-[10px] text-[#8A837A]">
                        ({evt.actorId})
                      </span>
                    </div>

                    {prj && (
                      <div className="flex items-center gap-1.5">
                        <FolderGit2 className="w-3 h-3 text-[#8A837A]" />
                        <span className="text-[#8A837A]">Project:</span>
                        <span className="font-medium text-[#1C1917] max-w-[200px] truncate" title={prj.title}>
                          {prj.title}
                        </span>
                      </div>
                    )}

                    {ms && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[#8A837A]">Milestone:</span>
                        <span className="font-medium text-[#1C1917] truncate max-w-[180px]" title={ms.title}>
                          {ms.title}
                        </span>
                      </div>
                    )}

                    {evt.transactionReference && (
                      <div className="flex items-center gap-1.5 ml-auto">
                        <span className="text-[#8A837A]">Ref:</span>
                        <code className="text-[10px] font-mono px-1.5 py-0.5 bg-white border border-[#E5DFD5] rounded text-[#264235] font-bold">
                          {evt.transactionReference}
                        </code>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
