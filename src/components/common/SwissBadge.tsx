import React from "react";

export type SwissBadgeVariant =
  | "default"
  | "vermilion"
  | "processing"
  | "processed"
  | "error"
  | "created"
  | "mono";

interface SwissBadgeProps {
  children: React.ReactNode;
  variant?: SwissBadgeVariant;
  pulse?: boolean;
  className?: string;
}

export const SwissBadge: React.FC<SwissBadgeProps> = ({
  children,
  variant = "default",
  pulse = false,
  className = "",
}) => {
  let colorStyles = "bg-slate-100 text-slate-800 border-slate-300";

  switch (variant) {
    case "vermilion":
      colorStyles = "bg-rose-50 text-[#E11D48] border-[#E11D48]/40";
      break;
    case "processing":
      colorStyles = "bg-amber-50 text-amber-900 border-amber-300";
      break;
    case "processed":
      colorStyles = "bg-emerald-50 text-emerald-900 border-emerald-300";
      break;
    case "error":
      colorStyles = "bg-red-50 text-red-900 border-red-300";
      break;
    case "created":
      colorStyles = "bg-blue-50 text-blue-900 border-blue-300";
      break;
    case "mono":
      colorStyles = "bg-white text-slate-900 border-slate-300 font-mono";
      break;
    default:
      colorStyles = "bg-slate-100 text-slate-800 border-slate-200";
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-mono font-medium tracking-wider uppercase border ${colorStyles} ${className}`}
    >
      {pulse && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-current"></span>
        </span>
      )}
      {children}
    </span>
  );
};
