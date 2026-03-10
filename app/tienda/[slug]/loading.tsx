export default function ProductLoading() {
  return (
    <div className="container mx-auto max-w-7xl px-6 py-10">
      <div className="h-4 w-32 animate-pulse rounded bg-muted mb-6" />
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div className="aspect-square animate-pulse rounded-2xl bg-muted" />
        <div className="space-y-4">
          <div className="h-4 w-24 animate-pulse rounded bg-muted" />
          <div className="h-8 w-3/4 animate-pulse rounded bg-muted" />
          <div className="h-20 w-full animate-pulse rounded-2xl bg-muted" />
          <div className="h-32 w-full animate-pulse rounded-2xl bg-muted" />
          <div className="h-12 w-full animate-pulse rounded-xl bg-muted" />
        </div>
      </div>
    </div>
  )
}
