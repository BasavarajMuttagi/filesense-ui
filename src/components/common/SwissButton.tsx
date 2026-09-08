import React from "react";
import { Loader2 } from "lucide-react";

export type TiimoButtonVariant = "primary" | "brand" | "cobalt" | "pastel" | "outline" | "ghost" | "danger";
export type TiimoButtonSize = "sm" | "md" | "lg";

export type SwissButtonVariant = TiimoButtonVariant;
export type SwissButtonSize = TiimoButtonSize;

interface TiimoButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: TiimoButtonVariant;
  size?: TiimoButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
}

export const TiimoButton: React.FC<TiimoButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  className = "",
  disabled,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-sans font-medium transition-all duration-150 select-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed rounded-full active:scale-[0.97]";

  let sizeStyles = "px-4.5 py-2 text-xs gap-2";
  if (size === "sm") sizeStyles = "px-3 py-1.5 text-[11px] gap-1.5";
  if (size === "lg") sizeStyles = "px-6 py-2.5 text-sm gap-2.5";

  let variantStyles = "";
  switch (variant) {
    case "primary":
      variantStyles =
        "bg-[#161613] text-white hover:bg-[#2A2A25] shadow-xs";
      break;
    case "brand":
    case "cobalt":
      variantStyles =
        "bg-[#7C5CFC] text-white hover:bg-[#6C4AEF] shadow-xs";
      break;
    case "pastel":
      variantStyles =
        "bg-[#E2DAFF] text-[#161613] hover:bg-[#D4C8FF]";
      break;
    case "outline":
      variantStyles =
        "bg-transparent text-[#161613] border border-[#16161325] hover:bg-[#16161308]";
      break;
    case "ghost":
      variantStyles =
        "bg-transparent text-[#161613bf] hover:bg-[#1616130a] hover:text-[#161613]";
      break;
    case "danger":
      variantStyles =
        "bg-[#FFEFEA] text-[#DC2626] border border-[#FFD3C4] hover:bg-[#FFE5DC]";
      break;
  }

  return (
    <button
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      {children}
    </button>
  );
};

export const SwissButton = TiimoButton;
