"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Camera, 
  Calendar,
  Download,
  Loader2,
  Star
} from "lucide-react"
import { Api } from "@/lib/api"
import { toast } from "sonner"

interface RevenueData {
  month: string
  revenueCents: number
}

interface BookingTimeSeriesData {
  date: string
  count: number
}

interface TopPhotographer {
  id: string
  user: {
    id: string
    name: string
    email: string
  }
  ratingAvg: number
  ratingCount: number
  bookingCount: number
  revenueCents: number
}

interface StatsOverview {
  totals: {
    users: number
    photographers: number
    bookings: number
    bookingsLast7: number
    reviews: number
    pendingReviews: number
    revenueCents: number
  }
  bookingsByState: {
    requested: number
    confirmed: number
    completed: number
    cancelled: number
  }
}

export default function StatsPage() {
  const [overview, setOverview] = useState<StatsOverview | null>(null)
  const [revenueData, setRevenueData] = useState<RevenueData[]>([])
  const [bookingTimeSeries, setBookingTimeSeries] = useState<BookingTimeSeriesData[]>([])
  const [topPhotographers, setTopPhotographers] = useState<TopPhotographer[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [revenueMonths, setRevenueMonths] = useState("6")
  const [bookingDays, setBookingDays] = useState("30")
  const [topLimit, setTopLimit] = useState("10")

  const loadAllStats = async () => {
    setLoading(true)
    setError("")
    try {
      const [overviewRes, revenueRes, bookingsRes, topRes] = await Promise.all([
        Api.get<StatsOverview>("/admin/stats/overview"),
        Api.get<{ result: RevenueData[] }>(`/admin/stats/revenue-by-month?months=${revenueMonths}`),
        Api.get<{ series: BookingTimeSeriesData[] }>(`/admin/stats/bookings-timeseries?days=${bookingDays}`),
        Api.get<{ items: TopPhotographer[] }>(`/admin/stats/top-photographers?limit=${topLimit}`)
      ])

      setOverview(overviewRes)
      setRevenueData(revenueRes.result || [])
      setBookingTimeSeries(bookingsRes.series || [])
      setTopPhotographers(topRes.items || [])
    } catch (err: any) {
      setError(err?.message || "Failed to load statistics")
      console.error("Failed to load statistics:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAllStats()
  }, [revenueMonths, bookingDays, topLimit])

  const exportData = async (type: string) => {
    try {
      let data: any
      let filename: string

      switch (type) {
        case 'revenue':
          data = revenueData
          filename = `revenue-report-${new Date().toISOString().split('T')[0]}.json`
          break
        case 'bookings':
          data = bookingTimeSeries
          filename = `bookings-report-${new Date().toISOString().split('T')[0]}.json`
          break
        case 'photographers':
          data = topPhotographers
          filename = `top-photographers-${new Date().toISOString().split('T')[0]}.json`
          break
        default:
          data = overview
          filename = `overview-report-${new Date().toISOString().split('T')[0]}.json`
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      toast.success(`${type} data exported successfully`)
    } catch (err) {
      toast.error("Failed to export data")
    }
  }

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0,
    }).format(cents / 100)
  }

  const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) return 0
    return ((current - previous) / previous) * 100
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Advanced Statistics</h1>
          <p className="text-muted-foreground">Detailed analytics and performance metrics</p>
        </div>
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading statistics...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Advanced Statistics</h1>
          <p className="text-muted-foreground">Detailed analytics and performance metrics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportData('overview')} className="gap-2">
            <Download className="h-4 w-4" />
            Export Overview
          </Button>
          <Button onClick={loadAllStats} className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg">
          <p>{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadAllStats}
            className="mt-2"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Overview Stats */}
      {overview && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{overview.totals.users}</p>
                  <p className="text-sm text-muted-foreground">Total Users</p>
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
                  <p className="text-2xl font-bold">{overview.totals.photographers}</p>
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
                  <p className="text-2xl font-bold">{overview.totals.bookings}</p>
                  <p className="text-sm text-muted-foreground">Total Bookings</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3 text-green-600" />
                    <span className="text-xs text-green-600">
                      +{overview.totals.bookingsLast7} this week
                    </span>
                  </div>
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
                  <p className="text-2xl font-bold">
                    {formatCurrency(overview.totals.revenueCents)}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Booking States */}
      {overview && (
        <Card>
          <CardHeader>
            <CardTitle>Booking Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {overview.bookingsByState.requested}
                </div>
                <p className="text-sm text-muted-foreground">Requested</p>
                <Badge variant="secondary" className="mt-1">Pending</Badge>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {overview.bookingsByState.confirmed}
                </div>
                <p className="text-sm text-muted-foreground">Confirmed</p>
                <Badge variant="default" className="mt-1">Active</Badge>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-emerald-600">
                  {overview.bookingsByState.completed}
                </div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <Badge variant="outline" className="mt-1 border-emerald-300 text-emerald-600">Done</Badge>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {overview.bookingsByState.cancelled}
                </div>
                <p className="text-sm text-muted-foreground">Cancelled</p>
                <Badge variant="destructive" className="mt-1">Cancelled</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="revenue" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="revenue">Revenue Analysis</TabsTrigger>
          <TabsTrigger value="bookings">Booking Trends</TabsTrigger>
          <TabsTrigger value="photographers">Top Performers</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Revenue by Month</h3>
            <div className="flex gap-2">
              <Select value={revenueMonths} onValueChange={setRevenueMonths}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 months</SelectItem>
                  <SelectItem value="6">6 months</SelectItem>
                  <SelectItem value="12">12 months</SelectItem>
                  <SelectItem value="24">24 months</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={() => exportData('revenue')} size="sm">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <Card>
            <CardContent className="p-6">
              {revenueData.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 bg-primary/5 rounded-lg">
                      <div className="text-2xl font-bold text-primary">
                        {formatCurrency(revenueData.reduce((sum, item) => sum + item.revenueCents, 0))}
                      </div>
                      <p className="text-sm text-muted-foreground">Total Revenue</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(Math.max(...revenueData.map(item => item.revenueCents)))}
                      </div>
                      <p className="text-sm text-muted-foreground">Best Month</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {formatCurrency(revenueData.reduce((sum, item) => sum + item.revenueCents, 0) / revenueData.length)}
                      </div>
                      <p className="text-sm text-muted-foreground">Average</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {revenueData.map((item, index) => (
                      <div key={item.month} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{new Date(item.month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{formatCurrency(item.revenueCents)}</p>
                          {index > 0 && (
                            <div className="flex items-center gap-1">
                              {item.revenueCents > revenueData[index - 1].revenueCents ? (
                                <TrendingUp className="h-3 w-3 text-green-600" />
                              ) : (
                                <TrendingDown className="h-3 w-3 text-red-600" />
                              )}
                              <span className={`text-xs ${
                                item.revenueCents > revenueData[index - 1].revenueCents 
                                  ? 'text-green-600' 
                                  : 'text-red-600'
                              }`}>
                                {Math.abs(calculatePercentageChange(item.revenueCents, revenueData[index - 1].revenueCents)).toFixed(1)}%
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No revenue data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookings" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Booking Trends</h3>
            <div className="flex gap-2">
              <Select value={bookingDays} onValueChange={setBookingDays}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                  <SelectItem value="180">180 days</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={() => exportData('bookings')} size="sm">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <Card>
            <CardContent className="p-6">
              {bookingTimeSeries.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 bg-primary/5 rounded-lg">
                      <div className="text-2xl font-bold text-primary">
                        {bookingTimeSeries.reduce((sum, item) => sum + item.count, 0)}
                      </div>
                      <p className="text-sm text-muted-foreground">Total Bookings</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {Math.max(...bookingTimeSeries.map(item => item.count))}
                      </div>
                      <p className="text-sm text-muted-foreground">Peak Day</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {(bookingTimeSeries.reduce((sum, item) => sum + item.count, 0) / bookingTimeSeries.length).toFixed(1)}
                      </div>
                      <p className="text-sm text-muted-foreground">Daily Average</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {bookingTimeSeries.slice().reverse().map((item) => (
                      <div key={item.date} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{new Date(item.date).toLocaleDateString('en-US')}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{item.count} bookings</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No booking data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="photographers" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Top Performing Photographers</h3>
            <div className="flex gap-2">
              <Select value={topLimit} onValueChange={setTopLimit}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">Top 5</SelectItem>
                  <SelectItem value="10">Top 10</SelectItem>
                  <SelectItem value="20">Top 20</SelectItem>
                  <SelectItem value="50">Top 50</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={() => exportData('photographers')} size="sm">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <Card>
            <CardContent className="p-6">
              {topPhotographers.length > 0 ? (
                <div className="space-y-4">
                  {topPhotographers.map((photographer, index) => (
                    <div key={photographer.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full">
                        <span className="text-sm font-bold text-primary">#{index + 1}</span>
                      </div>
                      
                      <Avatar className="h-12 w-12">
                        <AvatarImage src="/placeholder.svg" alt={photographer.user.name} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {photographer.user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium truncate">{photographer.user.name}</h4>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm text-muted-foreground">
                              {photographer.ratingAvg.toFixed(1)} ({photographer.ratingCount})
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{photographer.user.email}</p>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(photographer.revenueCents)}</p>
                        <p className="text-sm text-muted-foreground">{photographer.bookingCount} bookings</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No photographer data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
