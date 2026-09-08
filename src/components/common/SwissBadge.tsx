import React from "react";

export type TiimoBadgeVariant =
  | "default"
  | "purple"
  | "cobalt"
  | "blue"
  | "cyan"
  | "mint"
  | "processed"
  | "yellow"
  | "processing"
  | "peach"
  | "error"
  | "mono"
  | "dark";

export type SwissBadgeVariant = TiimoBadgeVariant;

interface TiimoBadgeProps {
  children: React.ReactNode;
  variant?: TiimoBadgeVariant;
  pulse?: boolean;
  className?: string;
  size?: "sm" | "md";
}

export type SwissBadgeProps = TiimoBadgeProps;

export const TiimoBadge: React.FC<TiimoBadgeProps> = ({
  children,
  variant = "default",
  pulse = false,
  className = "",
  size = "md",
}) => {
  let colorStyles = "bg-[#F4F1EA] text-[#161613] border-[#E8E5DF]";

  switch (variant) {
    case "purple":
    case "cobalt":
      colorStyles = "bg-[#E2DAFF] text-[#3D2785] border-[#D5CBFF]";
      break;
    case "blue":
    case "cyan":
      colorStyles = "bg-[#E7EBFF] text-[#1E3A8A] border-[#C3CEFF]";
      break;
    case "mint":
    case "processed":
      colorStyles = "bg-[#D8F3E5] text-[#065F46] border-[#B7EBD0]";
      break;
    case "yellow":
    case "processing":
      colorStyles = "bg-[#FFF0B3] text-[#735A00] border-[#FFE58F]";
      break;
    case "peach":
    case "error":
      colorStyles = "bg-[#FFEFEA] text-[#B91C1C] border-[#FFD3C4]";
      break;
    case "mono":
    case "dark":
      colorStyles = "bg-[#161613] text-white border-[#161613]";
      break;
    default:
      colorStyles = "bg-[#F4F1EA] text-[#161613] border-[#E8E5DF]";
      break;
  }

  const sizeStyles =
    size === "sm"
      ? "px-2 py-0.5 text-[10px]"
      : "px-2.5 py-0.5 text-[11px]";

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-sans font-medium rounded-full border transition-colors ${sizeStyles} ${colorStyles} ${className}`}
    >
      {pulse && (
        <span className="relative flex size-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75" />
          <span className="relative inline-flex rounded-full size-1.5 bg-current" />
        </span>
      )}
      {children}
    </span>
  );
};

export const SwissBadge = TiimoBadge;
