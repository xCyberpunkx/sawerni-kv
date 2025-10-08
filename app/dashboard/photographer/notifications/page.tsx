"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Api, getAccessToken } from "@/lib/api"
import { mockAuth } from "@/lib/auth"
import { Bell, BellOff, CheckCircle2, Filter, RefreshCw, Trash2 } from "lucide-react"
import { connectSocket } from "@/lib/socket"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

interface Notification {
  id: string
  type: string
  title: string
  message: string
  createdAt: string
  readAt: string | null
  metadata?: Record<string, any>
  priority?: "low" | "medium" | "high"
}

type FilterType = "all" | "unread" | "read"
type PriorityFilter = "all" | "low" | "medium" | "high"

export default function NotificationsPage() {
  const [user, setUser] = useState<any>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState("")
  const [filter, setFilter] = useState<FilterType>("all")
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("all")
  const [markingAsRead, setMarkingAsRead] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)

  // Initialize client-side state after hydration
  useEffect(() => {
    setIsClient(true)
    setUser(mockAuth.getCurrentUser())
  }, [])

  const loadNotifications = async (showRefresh = false) => {
    if (showRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }
    setError("")
    try {
      const res = await Api.get<{ items: Notification[]; meta?: any }>("/notifications/me?page=1&perPage=50")
      setNotifications(res.items || [])
    } catch (e: any) {
      const errorMessage = e?.message || "Failed to load notifications"
      setError(errorMessage)
      if (isClient) {
        toast.error(errorMessage)
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    if (isClient) {
      loadNotifications()
    }
  }, [isClient])

  useEffect(() => {
    if (!isClient) return
    
    const token = getAccessToken()
    if (!token) return
    
    const socket = connectSocket(token, {
      onNotification: (notification: Notification) => {
        setNotifications(prev => [notification, ...prev])
        if (isClient) {
          toast.info("New notification received", {
            description: notification.title,
            action: {
              label: "View",
              onClick: () => {
                // Scroll to the new notification
                document.getElementById(`notification-${notification.id}`)?.scrollIntoView({
                  behavior: "smooth"
                })
              }
            }
          })
        }
      },
    })

    return () => {
      // socket?.disconnect()
    }
  }, [isClient])

  const markAsRead = async (id: string) => {
    if (!isClient) return
    
    setMarkingAsRead(id)
    const previousNotifications = [...notifications]
    
    // Optimistic update
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, readAt: new Date().toISOString() } : n)
    )
    
    try {
      await Api.patch(`/notifications/${id}/read`)
      toast.success("Notification marked as read")
    } catch (e: any) {
      setNotifications(previousNotifications)
      const errorMessage = e?.message || "Failed to mark as read"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setMarkingAsRead(null)
    }
  }

  const markAllAsRead = async () => {
    if (!isClient) return
    
    const unreadNotifications = notifications.filter(n => !n.readAt)
    if (unreadNotifications.length === 0) return

    const previousNotifications = [...notifications]
    
    // Optimistic update
    setNotifications(prev => 
      prev.map(n => ({ ...n, readAt: n.readAt || new Date().toISOString() }))
    )
    
    try {
      await Api.patch("/notifications/read-all")
      toast.success(`Marked ${unreadNotifications.length} notifications as read`)
    } catch (e: any) {
      setNotifications(previousNotifications)
      const errorMessage = e?.message || "Failed to mark all as read"
      setError(errorMessage)
      toast.error(errorMessage)
    }
  }

  const deleteNotification = async (id: string) => {
    if (!isClient) return
    
    const previousNotifications = [...notifications]
    
    // Optimistic update
    setNotifications(prev => prev.filter(n => n.id !== id))
    
    try {
      await Api.delete(`/notifications/${id}`)
      toast.success("Notification deleted")
    } catch (e: any) {
      setNotifications(previousNotifications)
      const errorMessage = e?.message || "Failed to delete notification"
      setError(errorMessage)
      toast.error(errorMessage)
    }
  }

  const clearAllRead = async () => {
    if (!isClient) return
    
    const readNotifications = notifications.filter(n => n.readAt)
    if (readNotifications.length === 0) return

    const previousNotifications = [...notifications]
    
    // Optimistic update
    setNotifications(prev => prev.filter(n => !n.readAt))
    
    try {
      await Api.delete("/notifications/read")
      toast.success(`Cleared ${readNotifications.length} read notifications`)
    } catch (e: any) {
      setNotifications(previousNotifications)
      const errorMessage = e?.message || "Failed to clear read notifications"
      setError(errorMessage)
      toast.error(errorMessage)
    }
  }

  // Filter notifications based on current filters
  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = 
      filter === "all" || 
      (filter === "unread" && !notification.readAt) || 
      (filter === "read" && notification.readAt)
    
    const matchesPriority = 
      priorityFilter === "all" || 
      notification.priority === priorityFilter

    return matchesFilter && matchesPriority
  })

  const unreadCount = notifications.filter(n => !n.readAt).length
  const readCount = notifications.filter(n => n.readAt).length

  const getPriorityBadge = (priority: string = "medium") => {
    if (!isClient) {
      return <Badge variant="secondary">medium</Badge>
    }
    
    const variants = {
      low: "bg-blue-100 text-blue-800 hover:bg-blue-100",
      medium: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
      high: "bg-red-100 text-red-800 hover:bg-red-100"
    }
    
    return (
      <Badge variant="secondary" className={variants[priority as keyof typeof variants]}>
        {priority}
      </Badge>
    )
  }

  const getNotificationIcon = (type: string) => {
    const icons: Record<string, string> = {
      info: "💡",
      success: "✅",
      warning: "⚠️",
      error: "❌",
      system: "⚙️",
      user: "👤",
      default: "🔔"
    }
    
    return icons[type] || icons.default
  }

  // Show loading state during initial hydration
  if (!isClient) {
    return (
      <div className="p-6 space-y-6 max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-20" />
          </div>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <BellOff className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
            <p className="text-muted-foreground">Please sign in to view your notifications.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bell className="h-8 w-8" />
            Notifications
          </h1>
          <p className="text-muted-foreground mt-1">
            Stay up to date with your activity and updates
            {unreadCount > 0 && (
              <span className="ml-2 text-sm font-medium text-primary">
                ({unreadCount} unread)
              </span>
            )}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadNotifications(true)}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-2 py-1.5 text-sm font-semibold">Status</div>
              {(["all", "unread", "read"] as FilterType[]).map((f) => (
                <DropdownMenuItem
                  key={f}
                  onClick={() => setFilter(f)}
                  className={filter === f ? "bg-accent" : ""}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                  {f === "unread" && unreadCount > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {unreadCount}
                    </Badge>
                  )}
                </DropdownMenuItem>
              ))}
              
              <DropdownMenuSeparator />
              
              <div className="px-2 py-1.5 text-sm font-semibold">Priority</div>
              {(["all", "high", "medium", "low"] as PriorityFilter[]).map((p) => (
                <DropdownMenuItem
                  key={p}
                  onClick={() => setPriorityFilter(p)}
                  className={priorityFilter === p ? "bg-accent" : ""}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)} Priority
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-wrap items-center gap-2 justify-between">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterType)}>
          <TabsList>
            <TabsTrigger value="all">
              All <Badge variant="secondary" className="ml-2">{notifications.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="unread">
              Unread <Badge variant="secondary" className="ml-2">{unreadCount}</Badge>
            </TabsTrigger>
            <TabsTrigger value="read">
              Read <Badge variant="secondary" className="ml-2">{readCount}</Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Mark all as read
            </Button>
          )}
          {readCount > 0 && (
            <Button variant="outline" size="sm" onClick={clearAllRead}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear read
            </Button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <span>Your Notifications</span>
            <div className="text-sm font-normal text-muted-foreground">
              Showing {filteredNotifications.length} of {notifications.length}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-3 p-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <div className="text-sm text-red-600 mb-4">{error}</div>
              <Button onClick={() => loadNotifications()} variant="outline">
                Try Again
              </Button>
            </div>
          ) : filteredNotifications.length > 0 ? (
            <div className="divide-y">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  id={`notification-${notification.id}`}
                  className={`p-4 flex items-start gap-4 transition-colors hover:bg-muted/50 ${
                    !notification.readAt ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
                  }`}
                >
                  <div className="text-2xl mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm">
                          {notification.title || notification.type}
                        </h3>
                        {getPriorityBadge(notification.priority)}
                      </div>
                      <div className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                        {new Date(notification.createdAt).toLocaleString()}
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2">
                      {notification.message}
                    </p>
                    
                    {notification.metadata && (
                      <div className="text-xs text-muted-foreground">
                        {Object.entries(notification.metadata).map(([key, value]) => (
                          <span key={key} className="inline-block mr-3">
                            <strong>{key}:</strong> {String(value)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!notification.readAt ? (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => markAsRead(notification.id)}
                        disabled={markingAsRead === notification.id}
                      >
                        {markingAsRead === notification.id ? (
                          <RefreshCw className="h-3 w-3 animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-3 w-3" />
                        )}
                        Mark read
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground flex items-center">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Read
                      </span>
                    )}
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteNotification(notification.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <BellOff className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">No notifications found</h3>
              <p className="text-muted-foreground mb-4">
                {filter !== "all" || priorityFilter !== "all" 
                  ? "Try changing your filters to see more notifications." 
                  : "You're all caught up! New notifications will appear here."}
              </p>
              {(filter !== "all" || priorityFilter !== "all") && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setFilter("all")
                    setPriorityFilter("all")
                  }}
                >
                  Clear filters
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}