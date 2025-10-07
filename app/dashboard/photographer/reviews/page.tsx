"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Api } from "@/lib/api"

export default function ReviewsPage() {
  const [photographerId, setPhotographerId] = useState<string | null>(null)
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const run = async () => {
      try {
        const me = await Api.get<any>("/auth/me")
        const pid = me?.photographer?.id as string | undefined
        if (!pid) return
        setPhotographerId(pid)
        const res = await Api.get<{ items: any[] }>(`/reviews/photographer/${pid}?page=1&perPage=50`)
        setItems(res.items || [])
      } catch (e: any) {
        setError(e?.message || "Failed to load reviews")
      } finally {
        setLoading(false)
      }
    }
    setLoading(true)
    run()
  }, [])

  const avg = useMemo(() => {
    if (!items.length) return 0
    return items.reduce((s, r) => s + (r.rating || 0), 0) / items.length
  }, [items])

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reviews</h1>
        <p className="text-muted-foreground">See what clients say about your work</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-2xl font-bold">{avg.toFixed(1)}</p>
            <p className="text-sm text-muted-foreground">Average rating</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-2xl font-bold">{items.length}</p>
            <p className="text-sm text-muted-foreground">Total reviews</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Client Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Loading…</div>
          ) : error ? (
            <div className="text-sm text-red-600">{error}</div>
          ) : items.length > 0 ? (
            <div className="space-y-3">
              {items.map((r) => (
                <div key={r.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{r.reviewer?.name || "Client"}</div>
                    <Badge variant="secondary">{r.rating} ★</Badge>
                  </div>
                  {r.text && <div className="text-sm text-muted-foreground mt-2">{r.text}</div>}
                  <div className="text-xs text-muted-foreground mt-1">{new Date(r.createdAt).toLocaleString()}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-muted-foreground">No reviews yet.</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
