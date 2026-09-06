export function ForgotPasswordSkeleton() {
  return (
    <div className="w-full flex-1 flex flex-col md:flex-row items-stretch bg-surface-raised dark:bg-surface animate-pulse">
      <div className="hidden md:block md:w-5/12 lg:w-[58%] xl:w-[60%] min-h-150 lg:min-h-205 bg-surface-subtle" />
      <div className="w-full md:w-7/12 lg:w-[42%] xl:w-[40%] flex flex-col justify-center items-center py-8 px-4 sm:px-8 lg:px-12">
        <div className="w-full max-w-lg space-y-6">
          <div className="h-6 w-28 bg-surface-subtle rounded-md" />
          <div className="h-8 w-60 bg-surface-subtle rounded-md" />
          <div className="h-4 w-72 bg-surface-subtle rounded-md" />
          <div className="h-11 w-full bg-surface-subtle rounded-lg" />
          <div className="h-11 w-full bg-surface-subtle rounded-lg" />
        </div>
      </div>
    </div>
  );
}
