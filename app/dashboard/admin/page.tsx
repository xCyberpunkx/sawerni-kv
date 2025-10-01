"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  Camera,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowRight,
  BarChart3,
} from "lucide-react"
import { mockAuth } from "@/lib/auth"
import { Api } from "@/lib/api"
import Link from "next/link"

export default function AdminDashboard() {
  const [user, setUser] = useState(mockAuth.getCurrentUser())
  const [stats, setStats] = useState<any | null>(null)
  const [recentUsers, setRecentUsers] = useState<any[]>([])
  const [recentBookings, setRecentBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [pendingReviewsCount, setPendingReviewsCount] = useState(0)

  useEffect(() => {
    const unsubscribe = mockAuth.onAuthChange(setUser)
    return unsubscribe
  }, [])

  useEffect(() => {
    const run = async () => {
      setLoading(true)
      setError("")
      try {
        const [overview, bookingsTs] = await Promise.all([
          Api.get<any>("/admin/stats/overview"),
          Api.get<any>("/admin/stats/bookings-timeseries?days=7"),
        ])
        setStats(overview)
        const usersRes = await Api.get<any>("/admin/users?page=1&perPage=5")
        setRecentUsers(usersRes.items || [])
        const bookingsRes = await Api.get<any>("/admin/stats/bookings-timeseries?days=1")
        setRecentBookings([])
        const pendingReviews = await Api.get<{ items: any[]; meta?: any }>("/admin/reviews?status=PENDING&page=1&perPage=1")
        setPendingReviewsCount(pendingReviews?.meta?.total || (pendingReviews.items?.length || 0))
      } catch (e: any) {
        setError(e?.message || "Failed to load admin data")
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [])

  const totalUsers = stats?.totals?.users ?? 0
  const totalPhotographers = stats?.totals?.photographers ?? 0
  const totalBookings = stats?.totals?.bookings ?? 0
  const pendingBookings = stats?.bookingsByState?.requested ?? 0
  const completedBookings = stats?.bookingsByState?.completed ?? 0
  const totalRevenue = (stats?.totals?.revenueCents ?? 0) / 100

  

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin dashboard</h1>
          <p className="text-muted-foreground">Overview of the Sawerni platform</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/admin/users">
            <Button variant="outline" className="gap-2 bg-transparent">
              <Users className="h-4 w-4" />
              Manage users
            </Button>
          </Link>
          <Link href="/dashboard/admin/stats">
            <Button className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Detailed statistics
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalUsers}</p>
                <p className="text-sm text-muted-foreground">Total users</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Camera className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalPhotographers}</p>
                <p className="text-sm text-muted-foreground">Photographers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalBookings}</p>
                <p className="text-sm text-muted-foreground">Total bookings</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalRevenue.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total revenue (DA)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingBookings}</p>
                <p className="text-sm text-muted-foreground">Pending bookings</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedBookings}</p>
                <p className="text-sm text-muted-foreground">Completed bookings</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingReviewsCount}</p>
                <p className="text-sm text-muted-foreground">Issues requiring attention</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl">New users</CardTitle>
            <Link href="/dashboard/admin/users">
              <Button variant="ghost" size="sm" className="gap-2">
                View all
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentUsers.map((user) => (
              <div key={user.id} className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium">{user.name.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{user.name}</p>
                  <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                </div>
                <div className="text-right">
                  <Badge variant={user.role === "photographer" ? "secondary" : "outline"}>
                    {user.role === "photographer" ? "Photographer" : "Client"}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(user.createdAt || user.joinedDate || Date.now()).toLocaleDateString("en-US")}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Bookings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl">Recent bookings</CardTitle>
            <Button variant="ghost" size="sm" className="gap-2">
              View all
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentBookings.map((booking) => (
              <div key={booking.id} className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium">Booking #{booking.id}</p>
                  <p className="text-sm text-muted-foreground truncate">{booking.location}</p>
                </div>
                <div className="text-right">
                  <Badge
                    variant={
                      booking.status === "confirmed"
                        ? "default"
                        : booking.status === "pending"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {booking.status}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">{booking.totalAmount.toLocaleString()} DA</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Platform Health */}
      <Card>
          <CardHeader>
            <CardTitle className="text-xl">Platform health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-4 border rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <span className="text-lg font-bold">98.5%</span>
              </div>
              <p className="text-sm text-muted-foreground">Uptime</p>
              <p className="text-xs text-green-600 mt-1">Excellent</p>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Users className="h-5 w-5 text-primary" />
                <span className="text-lg font-bold">156</span>
              </div>
              <p className="text-sm text-muted-foreground">Active users</p>
              <p className="text-xs text-green-600 mt-1">+12% since yesterday</p>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Calendar className="h-5 w-5 text-accent" />
                <span className="text-lg font-bold">89</span>
              </div>
              <p className="text-sm text-muted-foreground">Bookings today</p>
              <p className="text-xs text-green-600 mt-1">+8% since yesterday</p>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-lg font-bold">4.8</span>
              </div>
              <p className="text-sm text-muted-foreground">Average rating</p>
              <p className="text-xs text-green-600 mt-1">Excellent</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
