import React from "react";
import { Loader2 } from "lucide-react";

export type SwissButtonVariant = "cobalt" | "primary" | "outline" | "ghost" | "danger";
export type SwissButtonSize = "sm" | "md" | "lg";

interface SwissButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: SwissButtonVariant;
  size?: SwissButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
}

export const SwissButton: React.FC<SwissButtonProps> = ({
  children,
  variant = "cobalt",
  size = "md",
  loading = false,
  icon,
  className = "",
  disabled,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-sans font-semibold transition-all duration-150 select-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed border rounded-lg active:scale-[0.98]";

  let sizeStyles = "px-3.5 py-1.5 text-xs gap-2";
  if (size === "sm") sizeStyles = "px-2.5 py-1 text-[11px] gap-1.5";
  if (size === "lg") sizeStyles = "px-5 py-2.5 text-sm gap-2.5";

  let variantStyles = "";
  switch (variant) {
    case "cobalt":
      variantStyles =
        "bg-[#0052FF] text-white border-[#0052FF] hover:bg-[#0045D8] hover:border-[#0045D8] shadow-xs";
      break;
    case "primary":
      variantStyles =
        "bg-slate-900 text-white border-slate-900 hover:bg-slate-800 hover:border-slate-800 shadow-xs";
      break;
    case "outline":
      variantStyles =
        "bg-white text-slate-800 border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-2xs";
      break;
    case "ghost":
      variantStyles =
        "bg-transparent text-slate-600 border-transparent hover:bg-slate-100 hover:text-slate-900";
      break;
    case "danger":
      variantStyles =
        "bg-white text-rose-600 border-rose-200 hover:bg-rose-50 hover:border-rose-300 shadow-2xs";
      break;
  }

  return (
    <button
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      {children}
    </button>
  );
};
