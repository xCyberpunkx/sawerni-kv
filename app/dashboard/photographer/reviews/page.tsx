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

"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Api } from "@/lib/api"
import { mockAuth } from "@/lib/auth"

interface ReviewItem {
  id: string
  rating: number
  text?: string
  status: "PENDING" | "APPROVED" | "REJECTED"
  createdAt: string
  reviewer?: { id: string; name?: string }
}

export default function PhotographerReviewsPage() {
  const user = mockAuth.getCurrentUser()
  const [photographerId, setPhotographerId] = useState<string | null>(null)
  const [items, setItems] = useState<ReviewItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [page, setPage] = useState(1)
  const perPage = 12
  const [total, setTotal] = useState(0)

  useEffect(() => {
    const run = async () => {
      try {
        const me = await Api.get<any>("/auth/me")
        const pid = me?.photographer?.id as string | undefined
        if (!pid) return
        setPhotographerId(pid)
      } catch (e: any) {
        setError(e?.message || "Failed to load user")
      }
    }
    run()
  }, [])

  const load = async (p = page) => {
    if (!photographerId) return
    setLoading(true)
    setError("")
    try {
      const res = await Api.get<{ items: ReviewItem[]; meta?: { total: number } }>(
        `/reviews/photographer/${photographerId}?page=${p}&perPage=${perPage}`,
      )
      setItems(res.items || [])
      setTotal(res.meta?.total || 0)
    } catch (e: any) {
      setError(e?.message || "Failed to load reviews")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photographerId])

  if (!user) {
    return <div className="p-6">Authentication required.</div>
  }

  const pages = Math.max(1, Math.ceil(total / perPage))

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reviews</h1>
        <p className="text-muted-foreground">See what clients say about your work</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Latest Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Loading…</div>
          ) : error ? (
            <div className="text-sm text-red-600">{error}</div>
          ) : items.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((r) => (
                <div key={r.id} className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-semibold">{r.rating.toFixed(1)} ⭐</div>
                    <Badge variant="outline">{r.status}</Badge>
                  </div>
                  {r.text && <p className="text-sm text-muted-foreground">{r.text}</p>}
                  <div className="text-xs text-muted-foreground">
                    {r.reviewer?.name || "Anonymous"} • {new Date(r.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-muted-foreground">No reviews yet.</div>
          )}

          {pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <Button
                variant="outline"
                className="bg-transparent"
                disabled={page <= 1}
                onClick={async () => {
                  const p = Math.max(1, page - 1)
                  setPage(p)
                  await load(p)
                }}
              >
                Prev
              </Button>
              <div className="text-sm">
                Page {page} of {pages}
              </div>
              <Button
                variant="outline"
                className="bg-transparent"
                disabled={page >= pages}
                onClick={async () => {
                  const p = Math.min(pages, page + 1)
                  setPage(p)
                  await load(p)
                }}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


