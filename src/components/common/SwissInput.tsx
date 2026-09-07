import React from "react";

interface SwissInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  sublabel?: string;
  error?: string;
  helperText?: string;
}

export const SwissInput: React.FC<SwissInputProps> = ({
  label,
  sublabel,
  error,
  helperText,
  className = "",
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className="w-full flex flex-col gap-1.5 font-sans">
      {(label || sublabel) && (
        <div className="flex items-center justify-between">
          {label && (
            <label
              htmlFor={inputId}
              className="text-xs font-semibold text-slate-800"
            >
              {label}
            </label>
          )}
          {sublabel && (
            <span className="text-[11px] font-mono text-slate-600">
              {sublabel}
            </span>
          )}
        </div>
      )}
      <input
        id={inputId}
        className={`w-full px-3 py-2 text-sm bg-white border ${
          error
            ? "border-rose-300 focus:ring-rose-500/20 focus:border-rose-500"
            : "border-slate-200 focus:border-[#0052FF] focus:ring-2 focus:ring-[#0052FF]/15"
        } rounded-lg text-slate-900 placeholder:text-slate-600 focus:outline-none transition-all ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-rose-600">{error}</span>}
      {!error && helperText && (
        <span className="text-xs text-slate-600">{helperText}</span>
      )}
    </div>
  );
};

interface SwissTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  sublabel?: string;
  error?: string;
  helperText?: string;
}

export const SwissTextarea: React.FC<SwissTextareaProps> = ({
  label,
  sublabel,
  error,
  helperText,
  className = "",
  id,
  rows = 3,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className="w-full flex flex-col gap-1.5 font-sans">
      {(label || sublabel) && (
        <div className="flex items-center justify-between">
          {label && (
            <label
              htmlFor={inputId}
              className="text-xs font-semibold text-slate-800"
            >
              {label}
            </label>
          )}
          {sublabel && (
            <span className="text-[11px] font-mono text-slate-600">
              {sublabel}
            </span>
          )}
        </div>
      )}
      <textarea
        id={inputId}
        rows={rows}
        className={`w-full px-3 py-2 text-sm bg-white border ${
          error
            ? "border-rose-300 focus:ring-rose-500/20 focus:border-rose-500"
            : "border-slate-200 focus:border-[#0052FF] focus:ring-2 focus:ring-[#0052FF]/15"
        } rounded-lg text-slate-900 placeholder:text-slate-600 focus:outline-none transition-all resize-y ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-rose-600">{error}</span>}
      {!error && helperText && (
        <span className="text-xs text-slate-600">{helperText}</span>
      )}
    </div>
  );
};
