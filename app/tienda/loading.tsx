export default function TiendaLoading() {
  return (
    <div className="container mx-auto max-w-7xl px-6 py-10">
      <div className="h-8 w-48 animate-pulse rounded-lg bg-muted mb-6" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="aspect-square animate-pulse rounded-2xl bg-muted" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  )
}
