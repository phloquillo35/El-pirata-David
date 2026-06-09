export default function ProductsLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="h-8 w-48 bg-muted rounded animate-pulse mb-8" />
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="h-10 flex-1 bg-muted rounded animate-pulse" />
        <div className="h-10 w-48 bg-muted rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card text-card-foreground shadow">
            <div className="aspect-[4/3] bg-muted animate-pulse rounded-t-xl" />
            <div className="p-6 pt-4 space-y-3">
              <div className="h-4 w-20 bg-muted rounded animate-pulse" />
              <div className="h-5 w-3/4 bg-muted rounded animate-pulse" />
              <div className="h-6 w-1/3 bg-muted rounded animate-pulse" />
              <div className="h-4 w-1/4 bg-muted rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
