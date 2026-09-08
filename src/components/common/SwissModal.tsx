import React, { useEffect } from "react";
import { X } from "lucide-react";

interface TiimoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl";
}

export type SwissModalProps = TiimoModalProps;

export const TiimoModal: React.FC<TiimoModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  children,
  footer,
  maxWidth = "md",
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  let widthClass = "max-w-md";
  if (maxWidth === "sm") widthClass = "max-w-sm";
  if (maxWidth === "lg") widthClass = "max-w-xl";
  if (maxWidth === "xl") widthClass = "max-w-2xl";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#161613]/40 backdrop-blur-xs animate-in fade-in duration-150 font-sans">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        className={`relative z-10 w-full ${widthClass} bg-white border border-[#16161315] rounded-3xl shadow-xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150`}
      >
        {/* Modal Header */}
        <div className="px-6 py-4.5 border-b border-[#16161310] flex items-center justify-between bg-white">
          <div className="flex items-center gap-3 min-w-0">
            {icon && (
              <div className="size-9 rounded-2xl bg-[#E2DAFF] text-[#3D2785] flex items-center justify-center shrink-0 border border-[#D5CBFF]">
                {icon}
              </div>
            )}
            <div className="flex flex-col min-w-0">
              <h3 className="text-base font-serif font-medium tracking-tight text-[#161613] truncate">
                {title}
              </h3>
              {subtitle && (
                <p className="text-xs text-[#16161375] truncate">{subtitle}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="size-8 flex items-center justify-center rounded-full text-[#16161375] hover:text-[#161613] hover:bg-[#1616130a] transition-colors cursor-pointer shrink-0"
            aria-label="Close modal"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto max-h-[75vh]">{children}</div>

        {/* Modal Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-[#16161310] bg-[#FAF9F6]/80 flex items-center justify-end gap-2.5">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export const SwissModal = TiimoModal;
