import React from 'react';
import { History, ShieldCheck, CreditCard, Upload, FileText, Scale } from 'lucide-react';
import { ActivityEvent, ActivityEventType } from '../types/fairwork';

interface ActivityLogProps {
  events: ActivityEvent[];
}

export const ActivityLog: React.FC<ActivityLogProps> = ({ events }) => {
  const getEventIcon = (type: ActivityEventType) => {
    switch (type) {
      case 'AGREEMENT_ACCEPTED':
      case 'AGREEMENT_PROPOSED':
      case 'AGREEMENT_VERSIONED':
        return <FileText className="w-3.5 h-3.5 text-indigo-500" />;
      case 'DELIVERY_SUBMITTED':
        return <Upload className="w-3.5 h-3.5 text-purple-500" />;
      case 'REVIEW_SUBMITTED':
        return <ShieldCheck className="w-3.5 h-3.5 text-teal-500" />;
      case 'MILESTONE_FUNDED':
      case 'PAYMENT_RELEASED':
        return <CreditCard className="w-3.5 h-3.5 text-emerald-500" />;
      case 'DISPUTE_OPENED':
      case 'DISPUTE_RESOLVED':
      case 'SETTLEMENT_PROPOSED':
      case 'SETTLEMENT_ACCEPTED':
      case 'EVIDENCE_ADDED':
        return <Scale className="w-3.5 h-3.5 text-rose-500" />;
      default:
        return <History className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
        <History className="w-5 h-5 text-indigo-500" />
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">
          Verifiable Activity &amp; Audit Trail
        </h3>
        <span className="text-xs text-slate-400 ml-auto">
          {events.length} Recorded Events
        </span>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
        {events.length === 0 ? (
          <div className="text-xs text-slate-400 text-center py-6">
            No activity events recorded yet.
          </div>
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs flex items-start gap-3"
            >
              <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shrink-0 mt-0.5">
                {getEventIcon(event.eventType)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {event.eventType.replace(/_/g, ' ')}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                <p className="text-slate-600 dark:text-slate-300 mb-1">
                  {event.details}
                </p>

                <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-400 font-mono">
                  <span>Actor: {event.actorRole} ({event.actorId})</span>
                  {event.transactionReference && (
                    <span className="text-indigo-600 dark:text-indigo-400">
                      Tx: {event.transactionReference}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
