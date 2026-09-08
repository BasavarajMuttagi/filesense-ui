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
      className={`border-2 border-dashed border-[#16161318] rounded-3xl p-8 flex flex-col items-center justify-center text-center bg-white/60 font-sans ${className}`}
    >
      <div className="size-12 rounded-2xl bg-[#E2DAFF] text-[#7C5CFC] flex items-center justify-center mb-3.5 shadow-2xs">
        {icon || <FolderPlus className="size-5" />}
      </div>
      <h4 className="font-serif text-base font-bold text-[#161613] mb-1.5">
        {title}
      </h4>
      <p className="text-xs text-[#16161399] max-w-sm mb-5 leading-relaxed">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
};
