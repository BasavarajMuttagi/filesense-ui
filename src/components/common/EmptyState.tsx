import React from "react";
import { FolderPlus } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  code?: string;
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
      className={`border border-dashed border-slate-300 p-8 flex flex-col items-center justify-center text-center bg-white/50 ${className}`}
    >
      <div className="w-10 h-10 border border-slate-300 bg-white flex items-center justify-center text-slate-700 mb-3.5">
        {icon || <FolderPlus className="w-5 h-5 text-slate-500" />}
      </div>
      <h4 className="text-sm font-bold tracking-tight text-slate-900 mb-1">
        {title}
      </h4>
      <p className="text-xs text-slate-500 max-w-sm mb-4 leading-relaxed font-sans">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
};
