import React from "react";
import { FolderPlus } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  action,
  className = "",
}) => {
  return (
    <div
      className={`border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center bg-slate-50/50 font-sans ${className}`}
    >
      <div className="size-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 mb-3 shadow-2xs">
        {icon || <FolderPlus className="size-5 text-[#0052FF]" />}
      </div>
      <h4 className="text-sm font-bold tracking-tight text-slate-900 mb-1">
        {title}
      </h4>
      <p className="text-xs text-slate-600 max-w-sm mb-4 leading-relaxed">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
};
