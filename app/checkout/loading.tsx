export default function CheckoutLoading() {
  return (
    <div className="container mx-auto max-w-7xl px-6 py-10">
      <div className="h-8 w-40 animate-pulse rounded-lg bg-muted mb-8" />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_400px]">
        <div className="space-y-6">
          <div className="h-64 animate-pulse rounded-2xl bg-muted" />
          <div className="h-48 animate-pulse rounded-2xl bg-muted" />
        </div>
        <div className="h-80 animate-pulse rounded-2xl bg-muted" />
      </div>
    </div>
  )
}
