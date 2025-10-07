import { Button } from '@/components/ui/button'
import MarketFeed from '@/components/MarketFeed'

export default async function Dashboard() {
  // Normally fetch authorized SSE URL via server action or API
  const sseUrl = '' // placeholder
  return (
    <main className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Market Feed</h1>
        <Button variant="default">Connect</Button>
      </div>
      {sseUrl && <MarketFeed sseUrl={sseUrl} />}
    </main>
  )
}
