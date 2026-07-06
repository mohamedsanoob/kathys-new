// Shown by Next.js while the async product page awaits its server queries.
export default function Loading() {
  return (
    <div className="flex flex-col gap-8 md:gap-16 max-w-[1290px] m-auto animate-pulse">
      <div className="w-[90%] md:w-full m-auto mt-4 md:mt-6">
        <div className="h-9 w-24 bg-gray-200 rounded-md" />
        <div className="h-4 w-48 bg-gray-100 rounded mt-3" />
      </div>
      <div className="flex flex-col md:flex-row gap-10">
        <div className="w-full md:w-1/2 h-[300px] md:h-[500px] bg-gray-100 rounded-lg" />
        <div className="w-full md:w-1/2 space-y-4">
          <div className="h-6 w-3/4 bg-gray-200 rounded" />
          <div className="h-4 w-1/2 bg-gray-100 rounded" />
          <div className="h-10 w-40 bg-gray-200 rounded-md" />
        </div>
      </div>
    </div>
  );
}
