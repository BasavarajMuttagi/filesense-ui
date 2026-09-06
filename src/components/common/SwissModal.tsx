import React, { useEffect } from "react";
import { X } from "lucide-react";

interface SwissModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl";
}

export const SwissModal: React.FC<SwissModalProps> = ({
  isOpen,
  onClose,
  title,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        className={`relative z-10 w-full ${widthClass} bg-white border border-slate-900 swiss-shadow flex flex-col`}
      >
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <h3 className="text-sm font-bold tracking-tight text-slate-900">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 overflow-y-auto max-h-[80vh]">{children}</div>

        {/* Modal Footer */}
        {footer && (
          <div className="px-5 py-3 border-t border-slate-200 bg-slate-50/50 flex items-center justify-end gap-2.5">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
