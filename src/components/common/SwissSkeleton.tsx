import React from "react";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = "", ...props }) => {
  return (
    <div
      className={`rounded-2xl animate-shimmer bg-[#F3EFFF] ${className}`}
      {...props}
    />
  );
};

export const ResponseSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col gap-3 py-3 font-sans w-full max-w-xl bg-white/80 backdrop-blur-sm p-4 rounded-3xl border border-[#16161312]">
      {/* Status indicator with Tiimo Purple ping */}
      <div className="flex items-center gap-2 text-xs text-[#161613bf] font-medium">
        <div className="relative flex size-2.5 items-center justify-center">
          <div className="size-2 rounded-full bg-[#7C5CFC] animate-ping absolute" />
          <div className="size-2 rounded-full bg-[#7C5CFC]" />
        </div>
        <span className="font-sans">Synthesizing with verified sources...</span>
      </div>

      {/* Subtle compact placeholder line */}
      <div className="flex items-center gap-2 pt-0.5">
        <Skeleton className="h-3 w-40 rounded-full" />
        <Skeleton className="h-3 w-20 rounded-full" />
      </div>
    </div>
  );
};

export const DocumentListSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <div className="space-y-2 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-3 rounded-2xl border border-[#16161310] bg-white flex items-center justify-between gap-3 shadow-2xs"
        >
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <Skeleton className="size-8 rounded-xl shrink-0" />
            <div className="flex flex-col gap-1.5 flex-1 min-w-0">
              <Skeleton className="h-3 w-3/4 max-w-[140px] rounded-full" />
              <Skeleton className="h-2.5 w-1/2 max-w-[80px] rounded-full" />
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
    <div className="space-y-1.5 px-1 py-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/40 border border-[#16161308]"
        >
          <Skeleton className="size-4 rounded-md shrink-0" />
          <Skeleton className="h-3 flex-1 max-w-[120px] rounded-full" />
        </div>
      ))}
    </div>
  );
};

export const ChatThreadSkeleton: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto w-full flex flex-col gap-8 py-2">
      {/* Turn 1: User question + Grounded sources + Assistant markdown response */}
      <div className="flex flex-col gap-4">
        {/* User Question Bubble (Obsidian pill) */}
        <div className="flex justify-end w-full">
          <div className="max-w-[75%] sm:max-w-[60%] w-full flex justify-end">
            <Skeleton className="h-11 w-64 rounded-3xl rounded-tr-xs bg-[#16161318]" />
          </div>
        </div>

        {/* Assistant Response Card */}
        <div className="bg-white rounded-3xl border border-[#16161312] p-6 shadow-xs flex flex-col gap-4">
          {/* Grounded Citation Chips */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-7 w-28 rounded-full" />
            <Skeleton className="h-7 w-32 rounded-full" />
            <Skeleton className="h-7 w-24 rounded-full" />
          </div>

          {/* Assistant Response Paragraphs */}
          <div className="flex flex-col gap-2.5 pt-1">
            <Skeleton className="h-4 w-full rounded-full" />
            <Skeleton className="h-4 w-[92%] rounded-full" />
            <Skeleton className="h-4 w-[78%] rounded-full" />
            <Skeleton className="h-4 w-[85%] rounded-full" />
          </div>
        </div>
      </div>

      {/* Turn 2: Follow-up Turn */}
      <div className="flex flex-col gap-4 pt-4 border-t border-[#16161310]">
        {/* User Question Bubble */}
        <div className="flex justify-end w-full">
          <div className="max-w-[75%] sm:max-w-[50%] w-full flex justify-end">
            <Skeleton className="h-11 w-48 rounded-3xl rounded-tr-xs bg-[#16161318]" />
          </div>
        </div>

        {/* Assistant Response Card */}
        <div className="bg-white rounded-3xl border border-[#16161312] p-6 shadow-xs flex flex-col gap-4">
          {/* Grounded Citation Chips */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-7 w-36 rounded-full" />
            <Skeleton className="h-7 w-28 rounded-full" />
          </div>

          {/* Assistant Response Paragraphs */}
          <div className="flex flex-col gap-2.5 pt-1">
            <Skeleton className="h-4 w-full rounded-full" />
            <Skeleton className="h-4 w-[88%] rounded-full" />
            <Skeleton className="h-4 w-[68%] rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Aliases for unified Tiimo design system
export const TiimoSkeleton = Skeleton;
