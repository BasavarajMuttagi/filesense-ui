import React from "react";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = "", ...props }) => {
  return (
    <div
      className={`rounded-md animate-shimmer bg-slate-100 ${className}`}
      {...props}
    />
  );
};

export const ResponseSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col gap-2.5 py-2 font-sans w-full max-w-xl">
      {/* Status indicator */}
      <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
        <div className="size-2 rounded-full bg-[#0052FF] animate-ping" />
        <span className="text-slate-600 font-medium">Searching corpus &amp; synthesizing...</span>
      </div>

      {/* Subtle compact placeholder line */}
      <div className="flex items-center gap-2 pt-0.5">
        <Skeleton className="h-3 w-44 rounded" />
        <Skeleton className="h-3 w-24 rounded" />
      </div>
    </div>
  );
};

export const DocumentListSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <div className="space-y-1.5 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-2.5 rounded-lg border border-slate-200/80 bg-white flex items-center justify-between gap-2.5 shadow-2xs"
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Skeleton className="size-7 rounded-md shrink-0" />
            <div className="flex flex-col gap-1.5 flex-1 min-w-0">
              <Skeleton className="h-3 w-3/4 max-w-[140px]" />
              <Skeleton className="h-2.5 w-1/2 max-w-[80px]" />
            </div>
          </div>
          <Skeleton className="size-3.5 rounded-full shrink-0" />
        </div>
      ))}
    </div>
  );
};

export const SidebarNavSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="space-y-1 px-1 py-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-2 px-2 py-1.5 rounded-md"
        >
          <Skeleton className="size-3.5 rounded shrink-0" />
          <Skeleton className="h-3 flex-1 max-w-[120px]" />
        </div>
      ))}
    </div>
  );
};
