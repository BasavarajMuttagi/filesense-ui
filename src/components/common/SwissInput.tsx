import React from "react";

interface TiimoInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  sublabel?: string;
  error?: string;
  helperText?: string;
}

export type SwissInputProps = TiimoInputProps;

export const TiimoInput: React.FC<TiimoInputProps> = ({
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
              className="text-xs font-medium text-[#161613]"
            >
              {label}
            </label>
          )}
          {sublabel && (
            <span className="text-[11px] text-[#16161375]">
              {sublabel}
            </span>
          )}
        </div>
      )}
      <input
        id={inputId}
        className={`w-full px-4 py-2.5 text-sm bg-white border ${
          error
            ? "border-rose-300 focus:ring-rose-500/20 focus:border-rose-500"
            : "border-[#16161318] focus:border-[#7C5CFC] focus:ring-3 focus:ring-[#E2DAFF]/60"
        } rounded-2xl text-[#161613] placeholder:text-[#16161360] focus:outline-none transition-all ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-rose-600">{error}</span>}
      {!error && helperText && (
        <span className="text-xs text-[#16161375]">{helperText}</span>
      )}
    </div>
  );
};

export const SwissInput = TiimoInput;

interface TiimoTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  sublabel?: string;
  error?: string;
  helperText?: string;
}

export type SwissTextareaProps = TiimoTextareaProps;

export const TiimoTextarea: React.FC<TiimoTextareaProps> = ({
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
              className="text-xs font-medium text-[#161613]"
            >
              {label}
            </label>
          )}
          {sublabel && (
            <span className="text-[11px] text-[#16161375]">
              {sublabel}
            </span>
          )}
        </div>
      )}
      <textarea
        id={inputId}
        rows={rows}
        className={`w-full px-4 py-2.5 text-sm bg-white border ${
          error
            ? "border-rose-300 focus:ring-rose-500/20 focus:border-rose-500"
            : "border-[#16161318] focus:border-[#7C5CFC] focus:ring-3 focus:ring-[#E2DAFF]/60"
        } rounded-2xl text-[#161613] placeholder:text-[#16161360] focus:outline-none transition-all resize-y ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-rose-600">{error}</span>}
      {!error && helperText && (
        <span className="text-xs text-[#16161375]">{helperText}</span>
      )}
    </div>
  );
};

export const SwissTextarea = TiimoTextarea;
