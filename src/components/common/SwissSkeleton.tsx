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
        <span className="text-slate-600 font-medium">Searching documents &amp; synthesizing...</span>
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

export const ChatThreadSkeleton: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto w-full flex flex-col gap-8 py-2">
      {/* Turn 1: User question + Grounded sources + Assistant markdown response */}
      <div className="flex flex-col gap-3.5">
        {/* User Question Bubble */}
        <div className="flex justify-end w-full">
          <div className="max-w-[75%] sm:max-w-[60%] w-full flex justify-end">
            <Skeleton className="h-10 w-64 rounded-2xl rounded-tr-xs" />
          </div>
        </div>

        {/* Grounded Citation Chips */}
        <div className="flex items-center gap-2 pt-0.5">
          <Skeleton className="h-7 w-28 rounded-lg" />
          <Skeleton className="h-7 w-32 rounded-lg" />
          <Skeleton className="h-7 w-24 rounded-lg" />
        </div>

        {/* Assistant Response Paragraphs */}
        <div className="flex flex-col gap-2.5 pt-1">
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-[92%] rounded" />
          <Skeleton className="h-4 w-[78%] rounded" />
          <Skeleton className="h-4 w-[85%] rounded" />
        </div>
      </div>

      {/* Turn 2: Follow-up Turn */}
      <div className="flex flex-col gap-3.5 pt-4 border-t border-slate-100">
        {/* User Question Bubble */}
        <div className="flex justify-end w-full">
          <div className="max-w-[75%] sm:max-w-[50%] w-full flex justify-end">
            <Skeleton className="h-10 w-48 rounded-2xl rounded-tr-xs" />
          </div>
        </div>

        {/* Grounded Citation Chips */}
        <div className="flex items-center gap-2 pt-0.5">
          <Skeleton className="h-7 w-36 rounded-lg" />
          <Skeleton className="h-7 w-28 rounded-lg" />
        </div>

        {/* Assistant Response Paragraphs */}
        <div className="flex flex-col gap-2.5 pt-1">
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-[88%] rounded" />
          <Skeleton className="h-4 w-[68%] rounded" />
        </div>
      </div>
    </div>
  );
};

