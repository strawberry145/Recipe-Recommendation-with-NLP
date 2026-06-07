/**
 * LoadingState Component
 * Cute skeleton cards with playful shimmer
 */

import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles } from "lucide-react";

interface LoadingStateProps {
  count?: number;
}

const LoadingState = ({ count = 6 }: LoadingStateProps) => {
  return (
    <div className="space-y-6">
      {/* Loading Header */}
      <div className="flex items-center justify-center gap-3">
        <Sparkles className="w-6 h-6 text-primary animate-sparkle" />
        <p className="text-lg font-semibold text-muted-foreground">
          Finding delicious recipes for you...
        </p>
        <Sparkles className="w-6 h-6 text-primary animate-sparkle" style={{ animationDelay: '0.5s' }} />
      </div>

      {/* Skeleton Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: count }).map((_, i) => (
          <div 
            key={i} 
            className="rounded-3xl border-2 border-border/30 bg-card overflow-hidden shadow-sm"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            {/* Image Skeleton */}
            <div className="h-48 skeleton-shimmer" />
            
            {/* Content Skeleton */}
            <div className="p-5 space-y-4">
              <Skeleton className="h-6 w-4/5 rounded-full" />
              <div className="flex gap-1">
                {[...Array(5)].map((_, j) => (
                  <Skeleton key={j} className="h-4 w-4 rounded-full" />
                ))}
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-8 w-24 rounded-full" />
                <Skeleton className="h-8 w-24 rounded-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-1/3 rounded-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-14 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoadingState;
