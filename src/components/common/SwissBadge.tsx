import React from "react";

export type SwissBadgeVariant =
  | "default"
  | "cobalt"
  | "cyan"
  | "processed"
  | "processing"
  | "error"
  | "mono";

interface SwissBadgeProps {
  children: React.ReactNode;
  variant?: SwissBadgeVariant;
  pulse?: boolean;
  className?: string;
  size?: "sm" | "md";
}

export const SwissBadge: React.FC<SwissBadgeProps> = ({
  children,
  variant = "default",
  pulse = false,
  className = "",
  size = "md",
}) => {
  let colorStyles = "bg-slate-100 text-slate-700 border-slate-200";

  switch (variant) {
    case "cobalt":
      colorStyles = "bg-blue-50 text-[#0052FF] border-blue-200/90";
      break;
    case "cyan":
      colorStyles = "bg-sky-50 text-sky-700 border-sky-200/90";
      break;
    case "processed":
      colorStyles = "bg-emerald-50 text-emerald-700 border-emerald-200/90";
      break;
    case "processing":
      colorStyles = "bg-amber-50 text-amber-700 border-amber-200/90";
      break;
    case "error":
      colorStyles = "bg-rose-50 text-rose-700 border-rose-200/90";
      break;
    case "mono":
      colorStyles = "bg-slate-900 text-white border-slate-900 font-mono";
      break;
    default:
      colorStyles = "bg-slate-100 text-slate-700 border-slate-200";
      break;
  }

  const sizeStyles =
    size === "sm"
      ? "px-1.5 py-0.5 text-[10px]"
      : "px-2 py-0.5 text-[11px]";

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono font-medium tracking-wide uppercase border rounded-md transition-colors ${sizeStyles} ${colorStyles} ${className}`}
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
