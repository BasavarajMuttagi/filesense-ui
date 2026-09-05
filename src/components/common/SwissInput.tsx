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
    <div className="w-full flex flex-col gap-1.5">
      {(label || sublabel) && (
        <div className="flex items-center justify-between">
          {label && (
            <label
              htmlFor={inputId}
              className="text-[11px] font-mono font-medium uppercase tracking-wider text-slate-700"
            >
              {label}
            </label>
          )}
          {sublabel && (
            <span className="text-[10px] font-mono text-slate-600 uppercase">
              {sublabel}
            </span>
          )}
        </div>
      )}
      <input
        id={inputId}
        className={`w-full px-3 py-2 text-sm bg-white border ${
          error ? "border-red-500 focus:ring-red-500" : "border-slate-300 focus:border-slate-900"
        } rounded-none text-slate-900 placeholder:text-slate-600 focus:outline-none focus:ring-1 transition-colors ${className}`}
        {...props}
      />
      {error && <span className="text-[11px] font-mono text-red-600">{error}</span>}
      {!error && helperText && (
        <span className="text-[11px] font-mono text-slate-600">{helperText}</span>
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
    <div className="w-full flex flex-col gap-1.5">
      {(label || sublabel) && (
        <div className="flex items-center justify-between">
          {label && (
            <label
              htmlFor={inputId}
              className="text-[11px] font-mono font-medium uppercase tracking-wider text-slate-700"
            >
              {label}
            </label>
          )}
          {sublabel && (
            <span className="text-[10px] font-mono text-slate-600 uppercase">
              {sublabel}
            </span>
          )}
        </div>
      )}
      <textarea
        id={inputId}
        rows={rows}
        className={`w-full px-3 py-2 text-sm bg-white border ${
          error ? "border-red-500 focus:ring-red-500" : "border-slate-300 focus:border-slate-900"
        } rounded-none text-slate-900 placeholder:text-slate-600 focus:outline-none focus:ring-1 transition-colors resize-y ${className}`}
        {...props}
      />
      {error && <span className="text-[11px] font-mono text-red-600">{error}</span>}
      {!error && helperText && (
        <span className="text-[11px] font-mono text-slate-600">{helperText}</span>
      )}
    </div>
  );
};
