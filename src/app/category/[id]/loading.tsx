// Shown by Next.js while the async category page awaits its server queries.
export default function Loading() {
  return (
    <div className="flex flex-col max-w-[1290px] mx-auto md:mt-[1rem] p-1 animate-pulse">
      <div className="mb-3 px-2 mt-3 md:px-0">
        <div className="h-8 w-24 bg-gray-200 rounded-lg" />
      </div>
      <div className="flex flex-col md:flex-row">
        <div className="hidden md:block w-full md:w-1/4 pr-6 space-y-6">
          <div className="h-24 bg-gray-100 rounded" />
          <div className="h-24 bg-gray-100 rounded" />
        </div>
        <div className="flex-1 space-y-4 px-2 md:px-0">
          <div className="h-6 w-48 bg-gray-100 rounded" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-gray-100 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
