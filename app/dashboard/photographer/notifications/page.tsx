"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Api, getAccessToken } from "@/lib/api"
import { mockAuth } from "@/lib/auth"
import { Bell } from "lucide-react"
import { connectSocket } from "@/lib/socket"

export default function NotificationsPage() {
  const user = mockAuth.getCurrentUser()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const load = async () => {
    setLoading(true)
    setError("")
    try {
      const res = await Api.get<{ items: any[]; meta?: any }>("/notifications/me?page=1&perPage=50")
      setItems(res.items || [])
    } catch (e: any) {
      setError(e?.message || "Failed to load notifications")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    const token = getAccessToken()
    if (!token) return
    connectSocket(token, {
      onNotification: (notif) => setItems((prev) => [notif, ...prev]),
    })
  }, [])

  const markAsRead = async (id: string) => {
    const prev = items
    setItems((old) => old.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n)))
    try {
      await Api.patch(`/notifications/${id}/read`)
    } catch (e: any) {
      setItems(prev)
      setError(e?.message || "Failed to mark as read")
    }
  }

  if (!user) return <div className="p-6">Authentication required.</div>

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Notifications</h1>
        <p className="text-muted-foreground">Stay up to date with your activity</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" /> Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Loading…</div>
          ) : error ? (
            <div className="text-sm text-red-600">{error}</div>
          ) : items.length > 0 ? (
            <div className="space-y-2">
              {items.map((n) => (
                <div key={n.id} className="p-4 border rounded-lg flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">{n.type || "Notification"}</div>
                    <div className="text-xs text-muted-foreground mt-1">{new Date(n.createdAt).toLocaleString()}</div>
                  </div>
                  {!n.readAt ? (
                    <Button size="sm" variant="outline" className="bg-transparent" onClick={() => markAsRead(n.id)}>
                      Mark as read
                    </Button>
                  ) : (
                    <span className="text-xs text-muted-foreground">Read</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-muted-foreground">No notifications.</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


