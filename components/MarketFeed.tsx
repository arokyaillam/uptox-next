'use client'
import { useEffect } from 'react'
import { useFeedStore } from '@/lib/store'

export default function MarketFeed({ sseUrl }: { sseUrl: string }) {
  const { feedData, updateFeed, setConnected, reset } = useFeedStore()

  useEffect(() => {
    const es = new EventSource(sseUrl)
    es.onopen = () => setConnected(true)
    es.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data)
        if (msg.feeds) {
          const patch: Record<string, any> = {}
          msg.feeds.forEach((f: any) => (patch[f.instrumentKey] = f))
          updateFeed(patch)
        }
      } catch {}
    }
    es.onerror = () => {
      reset()
      es.close()
    }
    return () => es.close()
  }, [sseUrl, setConnected, updateFeed, reset])

  return (
    <div className="grid gap-3">
      {Object.entries(feedData).map(([key, d]: any) => (
        <div key={key} className="border rounded p-3 bg-card">
          <div className="font-semibold">{key}</div>
          <div className="text-sm text-muted-foreground">LTP ₹{d.ltpc}</div>
        </div>
      ))}
    </div>
  )
}
