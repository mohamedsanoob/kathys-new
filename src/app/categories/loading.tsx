// Shown by Next.js while the async categories page awaits its server query.
export default function Loading() {
  return (
    <div className="p-4 md:w-[92%] md:m-auto">
      <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="aspect-square bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    </div>
  );
}
