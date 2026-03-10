export default function BlogLoading() {
  return (
    <div className="container mx-auto max-w-7xl px-6 py-10">
      <div className="h-8 w-32 animate-pulse rounded-lg bg-muted mb-8" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="space-y-3 rounded-2xl border border-border bg-card p-4">
            <div className="aspect-video animate-pulse rounded-xl bg-muted" />
            <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-4 w-full animate-pulse rounded bg-muted" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  )
}
