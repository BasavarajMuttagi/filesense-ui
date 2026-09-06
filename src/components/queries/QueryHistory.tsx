import React from "react";
import type { QueryRecord } from "../../types";
import { SwissModal } from "../common/SwissModal";
import { SwissButton } from "../common/SwissButton";
import { EmptyState } from "../common/EmptyState";
import { History, MessageSquare, Clock, ArrowRight } from "lucide-react";

interface QueryHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  queries: QueryRecord[];
  onSelectQuery: (query: QueryRecord) => void;
  loading?: boolean;
}

export const QueryHistory: React.FC<QueryHistoryProps> = ({
  isOpen,
  onClose,
  queries,
  onSelectQuery,
  loading = false,
}) => {
  const formatDate = (raw: string | number) => {
    try {
      const d = typeof raw === "number" ? new Date(raw * 1000) : new Date(raw);
      return d.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return String(raw);
    }
  };

  return (
    <SwissModal
      isOpen={isOpen}
      onClose={onClose}
      title="Query History"
      maxWidth="lg"
      footer={
        <SwissButton variant="outline" size="sm" onClick={onClose}>
          Close
        </SwissButton>
      }
    >
      <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto">
        {loading ? (
          <div className="p-6 text-center text-xs font-mono text-slate-500">
            FETCHING QUERY LOGS...
          </div>
        ) : queries.length === 0 ? (
          <EmptyState
            title="No Query History"
            description="You haven't executed any semantic queries in this workspace yet."
            code="LOGS_EMPTY"
            icon={<History className="w-5 h-5 text-slate-500" />}
          />
        ) : (
          <div className="divide-y divide-slate-100 border border-slate-200">
            {queries.map((q) => (
              <div
                key={q.id}
                onClick={() => {
                  onSelectQuery(q);
                  onClose();
                }}
                className="p-3 bg-white hover:bg-slate-50 transition-colors cursor-pointer group flex items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <MessageSquare className="w-3.5 h-3.5 text-[#E11D48] shrink-0" />
                    <h4 className="text-xs font-bold text-slate-900 truncate font-sans group-hover:text-[#E11D48] transition-colors">
                      {q.question}
                    </h4>
                  </div>
                  {q.answer && (
                    <p className="text-[11px] text-slate-500 line-clamp-1 font-sans">
                      {q.answer}
                    </p>
                  )}
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 mt-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatDate(q.createdAt)}</span>
                  </div>
                </div>

                <div className="text-slate-400 group-hover:text-slate-900 transition-colors shrink-0">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </SwissModal>
  );
};
