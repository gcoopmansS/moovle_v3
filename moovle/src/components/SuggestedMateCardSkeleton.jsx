export default function SuggestedMateCardSkeleton() {
  return (
    <div className="flex flex-col items-center justify-between p-3 bg-white rounded-xl border border-gray-100 shadow-sm max-w-[150px] w-full h-full min-h-[200px] animate-pulse">
      <div className="flex flex-col items-center w-full">
        {/* Avatar skeleton */}
        <div className="w-10 h-10 bg-gray-300 rounded-full mb-2 shadow" />

        {/* Name and location skeleton */}
        <div className="text-center w-full">
          <div className="h-4 bg-gray-300 rounded w-20 mx-auto" />
          <div className="h-3 bg-gray-200 rounded w-14 mx-auto mt-1" />
        </div>

        {/* Tags skeleton */}
        <div className="flex flex-wrap gap-1 justify-center mt-2 mb-1 w-full">
          <div className="h-4 bg-gray-200 rounded-full w-10" />
          <div className="h-4 bg-gray-200 rounded-full w-8" />
        </div>
      </div>

      {/* Button skeleton */}
      <div className="w-full mt-2">
        <div className="h-6 bg-gray-200 rounded-lg w-full" />
      </div>
    </div>
  );
}
