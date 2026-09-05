import { Skeleton } from '@/components/ui/skeleton';

export function SigninSkeleton() {
  return (
    <main
      className="min-h-screen md:h-screen w-full flex flex-col md:flex-row bg-background overflow-hidden"
      aria-busy="true"
    >
      {/* Hero skeleton */}
      <div className="hidden md:flex md:w-5/12 lg:w-7/12 flex-col justify-start p-xl pt-4xl bg-surface-subtle">
        <Skeleton className="h-10 w-3/4 max-w-md rounded-md mb-md" />
        <Skeleton className="h-6 w-1/2 max-w-sm rounded-md mb-xl" />
        <div className="mt-auto w-full h-80 rounded-lg bg-surface/50 animate-pulse" />
      </div>

      {/* Form skeleton */}
      <div className="w-full md:w-7/12 lg:w-5/12 flex flex-col justify-center items-center p-md md:p-lg lg:p-xl">
        <div className="w-full max-w-md mx-auto space-y-md">
          {/* Logo & title skeleton */}
          <div className="space-y-sm mb-md">
            <div className="flex items-center gap-sm">
              <Skeleton className="h-8 w-32 rounded-md" />
            </div>
            <Skeleton className="h-8 w-48 rounded-md" />
            <Skeleton className="h-4 w-64 rounded-md" />
          </div>

          {/* Inputs skeleton */}
          <div className="space-y-sm">
            <div className="space-y-xs">
              <Skeleton className="h-4 w-16 rounded-xs" />
              <Skeleton className="h-control-lg w-full rounded-md" />
            </div>
            <div className="space-y-xs">
              <Skeleton className="h-4 w-20 rounded-xs" />
              <Skeleton className="h-control-lg w-full rounded-md" />
            </div>
          </div>

          {/* Button skeleton */}
          <Skeleton className="h-control-lg w-full rounded-md mt-md" />

          {/* Divider */}
          <div className="py-xs">
            <Skeleton className="h-3 w-full rounded-xs" />
          </div>

          {/* Google button skeleton */}
          <Skeleton className="h-control-lg w-full rounded-md" />

          {/* Footer skeleton */}
          <div className="flex justify-center pt-sm">
            <Skeleton className="h-4 w-48 rounded-xs" />
          </div>
        </div>
      </div>
    </main>
  );
}
