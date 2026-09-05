import React from "react";
import { Loader2 } from "lucide-react";

export type SwissButtonVariant = "primary" | "vermilion" | "outline" | "ghost" | "danger";
export type SwissButtonSize = "sm" | "md" | "lg";

interface SwissButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: SwissButtonVariant;
  size?: SwissButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
}

export const SwissButton: React.FC<SwissButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  className = "",
  disabled,
  ...props
}) => {
  let baseStyles =
    "inline-flex items-center justify-center font-mono uppercase tracking-wider font-semibold transition-all duration-150 select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border";

  let sizeStyles = "px-3.5 py-1.5 text-xs gap-2";
  if (size === "sm") sizeStyles = "px-2.5 py-1 text-[11px] gap-1.5";
  if (size === "lg") sizeStyles = "px-5 py-2.5 text-sm gap-2.5";

  let variantStyles = "";
  switch (variant) {
    case "primary":
      variantStyles =
        "bg-[#0F172A] text-white border-[#0F172A] hover:bg-black hover:border-black active:translate-y-[1px]";
      break;
    case "vermilion":
      variantStyles =
        "bg-[#E11D48] text-white border-[#E11D48] hover:bg-[#BE123C] hover:border-[#BE123C] active:translate-y-[1px]";
      break;
    case "outline":
      variantStyles =
        "bg-white text-slate-800 border-slate-300 hover:bg-slate-50 hover:border-slate-800 active:translate-y-[1px]";
      break;
    case "ghost":
      variantStyles =
        "bg-transparent text-slate-700 border-transparent hover:bg-slate-100 hover:text-slate-900";
      break;
    case "danger":
      variantStyles =
        "bg-white text-red-700 border-red-300 hover:bg-red-50 hover:border-red-600 active:translate-y-[1px]";
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
