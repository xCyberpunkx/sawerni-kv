"use client"

import { useEffect } from "react"
import { useNotifications, useMarkNotificationRead } from "@/lib/hooks"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell } from "lucide-react"
import { getAccessToken } from "@/lib/api"
import { connectSocket } from "@/lib/socket"
import { Skeleton } from "@/components/ui/skeleton"

export default function NotificationsPage() {
  const { data, isLoading, error, refetch } = useNotifications(1, 50)
  const markRead = useMarkNotificationRead()

  useEffect(() => {
    const token = getAccessToken()
    if (!token) return
    connectSocket(token, {
      onNotification: () => refetch(),
      onNotificationRead: () => refetch(),
    })
  }, [refetch])

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">Latest updates across your account</p>
        </div>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-8 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {error && <div className="text-red-600 text-sm">{(error as any)?.message || "Failed to load"}</div>}

      <div className="space-y-3">
        {!isLoading && (data?.items || []).length === 0 && !error && (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="max-w-md mx-auto space-y-2">
                <Bell className="h-10 w-10 mx-auto text-muted-foreground opacity-60" />
                <h3 className="text-lg font-semibold">No notifications</h3>
                <p className="text-sm text-muted-foreground">You're all caught up for now.</p>
              </div>
            </CardContent>
          </Card>
        )}
        {(data?.items || []).map((n) => (
          <Card key={n.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" /> {n.type}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {new Date(n.createdAt).toLocaleString()}
              </div>
              <div className="flex items-center gap-2">
                {!n.readAt ? (
                  <Button size="sm" variant="outline" onClick={() => markRead.mutate(n.id)} disabled={markRead.isPending}>
                    Mark read
                  </Button>
                ) : (
                  <Badge variant="secondary">Read</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}


