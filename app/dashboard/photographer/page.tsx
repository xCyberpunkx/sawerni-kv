"use client"

import { useEffect, useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Calendar,
  MessageCircle,
  Star,
  TrendingUp,
  Users,
  Camera,
  DollarSign,
  Clock,
  ArrowRight,
  Eye,
  Award,
  Package,
  Bell,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Heart,
  RefreshCw,
  Zap,
  Settings,
  User,
  Image as ImageIcon,
  HelpCircle,
} from "lucide-react"
import { Api } from "@/lib/api"
import { connectSocket, disconnectSocket } from "@/lib/socket"
import Link from "next/link"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"

interface DashboardData {
  bookings: any[]
  conversations: any[]
  packages: any[]
  portfolio: any[]
  reviews: any[]
  notifications: any[]
  user: any
  stats: {
    totalBookings: number
    pendingBookings: number
    confirmedBookings: number
    completedBookings: number
    totalEarnings: number
    averageRating: number
    totalReviews: number
    unreadMessages: number
    totalPackages: number
    portfolioImages: number
    profileViews: number
    responseRate: number
  }
}

export default function PhotographerDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [timeRange, setTimeRange] = useState("7d")

  // Load dashboard data
  const loadDashboardData = async (showRefresh = false) => {
    if (showRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }
    setError("")

    try {
      const [
        bookingsRes,
        conversationsRes,
        packagesRes,
        portfolioRes,
        reviewsRes,
        notificationsRes,
        userRes
      ] = await Promise.all([
        Api.get<{ items: any[] }>("/bookings/received?page=1&perPage=50"),
        Api.get<{ items: any[] }>("/conversations?page=1&perPage=10"),
        Api.get<any[]>("/packages/photographer/me"),
        Api.get<any[]>("/gallery/photographer/me?limit=20"),
        Api.get<{ items: any[] }>("/reviews/photographer/me?page=1&perPage=10"),
        Api.get<{ items: any[] }>("/notifications/me?page=1&perPage=10"),
        Api.get<any>("/auth/me")
      ])

      const bookings = bookingsRes.items || []
      const conversations = conversationsRes.items || []
      const packages = packagesRes || []
      const portfolio = portfolioRes || []
      const reviews = reviewsRes.items || []
      const notifications = notificationsRes.items || []
      const user = userRes

      // Calculate statistics
      const pendingBookings = bookings.filter(b => b.state === "requested")
      const confirmedBookings = bookings.filter(b => b.state === "confirmed")
      const completedBookings = bookings.filter(b => b.state === "completed")
      const totalEarnings = completedBookings.reduce((sum, b) => sum + (b.priceCents || 0), 0) / 100
      const averageRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length : 0
      const unreadMessages = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0)

      const dashboardData: DashboardData = {
        bookings,
        conversations,
        packages,
        portfolio,
        reviews,
        notifications,
        user,
        stats: {
          totalBookings: bookings.length,
          pendingBookings: pendingBookings.length,
          confirmedBookings: confirmedBookings.length,
          completedBookings: completedBookings.length,
          totalEarnings,
          averageRating,
          totalReviews: reviews.length,
          unreadMessages,
          totalPackages: packages.length,
          portfolioImages: portfolio.length,
          profileViews: Math.floor(Math.random() * 1000) + 500, // Mock data
          responseRate: Math.floor(Math.random() * 20) + 80 // Mock data
        }
      }

      setData(dashboardData)
    } catch (e: any) {
      const errorMessage = e?.message || "Failed to load dashboard"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  // Real-time updates
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("sawerni_access_token") : null
    if (!token) return

    const socket = connectSocket(token, {
      onBookingStateChanged: (booking: any) => {
        setData(prev => prev ? {
          ...prev,
          bookings: prev.bookings.map(b => b.id === booking.id ? booking : b)
        } : null)
      },
      onMessage: (message: any) => {
        setData(prev => prev ? {
          ...prev,
          conversations: prev.conversations.map(c => 
            c.id === message.conversationId 
              ? { ...c, lastMessage: message, unreadCount: (c.unreadCount || 0) + 1 }
              : c
          )
        } : null)
      },
      onNotification: (notification: any) => {
        setData(prev => prev ? {
          ...prev,
          notifications: [notification, ...prev.notifications]
        } : null)
        toast.info("New notification", { description: notification.title })
      }
    })

    return () => {
      disconnectSocket()
    }
  }, [])

  // Quick actions
  const quickActions = [
    {
      title: "New Package",
      description: "Create a new service package",
      icon: Package,
      href: "/dashboard/photographer/packages",
      color: "bg-blue-500 hover:bg-blue-600"
    },
    {
      title: "Upload Photos",
      description: "Add photos to your portfolio",
      icon: Camera,
      href: "/dashboard/photographer/portfolio",
      color: "bg-green-500 hover:bg-green-600"
    },
    {
      title: "View Bookings",
      description: "Manage your bookings",
      icon: Calendar,
      href: "/dashboard/photographer/bookings",
      color: "bg-purple-500 hover:bg-purple-600"
    },
    {
      title: "Messages",
      description: "Chat with clients",
      icon: MessageCircle,
      href: "/dashboard/photographer/messages",
      color: "bg-orange-500 hover:bg-orange-600"
    }
  ]

  if (loading) {
    return (
      <div className="p-6 space-y-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-10 w-80" />
            <Skeleton className="h-6 w-96" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-12 w-40" />
            <Skeleton className="h-12 w-40" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 flex items-center justify-center min-h-96">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Dashboard</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => loadDashboardData()} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-balance">
            Welcome back, {data.user?.name || "Photographer"}! 👋
          </h1>
          <p className="text-xl text-muted-foreground">
            Here's your photography business overview for today
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            size="lg"
            onClick={() => loadDashboardData(true)}
            disabled={refreshing}
            className="gap-2"
          >
            <RefreshCw className={`h-5 w-5 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="lg" className="gap-2">
                <Settings className="h-5 w-5" />
                Settings
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <User className="h-4 w-4 mr-2" />
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell className="h-4 w-4 mr-2" />
                Notification Preferences
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <HelpCircle className="h-4 w-4 mr-2" />
                Help & Support
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-yellow-500" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link key={index} href={action.href}>
                <Card className="hover:shadow-md transition-all duration-200 cursor-pointer group">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-xl ${action.color} text-white group-hover:scale-110 transition-transform`}>
                        <action.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{action.title}</h3>
                        <p className="text-sm text-muted-foreground">{action.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500 rounded-xl">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-blue-700">{data.stats.totalBookings}</p>
                <p className="text-sm text-blue-600 font-medium">Total Bookings</p>
                <p className="text-xs text-blue-500 mt-1">+{Math.floor(Math.random() * 5) + 1} this week</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-gradient-to-br from-yellow-50 to-yellow-100">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-500 rounded-xl">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-yellow-700">{data.stats.pendingBookings}</p>
                <p className="text-sm text-yellow-600 font-medium">Pending Approval</p>
                <p className="text-xs text-yellow-500 mt-1">Needs your attention</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500 rounded-xl">
                <DollarSign className="h-8 w-8 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-green-700">{data.stats.totalEarnings.toLocaleString()}</p>
                <p className="text-sm text-green-600 font-medium">Earnings (DA)</p>
                <p className="text-xs text-green-500 mt-1">+{Math.floor(Math.random() * 15) + 5}% this month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500 rounded-xl">
                <Star className="h-8 w-8 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-purple-700">{data.stats.averageRating.toFixed(1)}</p>
                <p className="text-sm text-purple-600 font-medium">Average Rating</p>
                <p className="text-xs text-purple-500 mt-1">Based on {data.stats.totalReviews} reviews</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Bookings */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Calendar className="h-6 w-6 text-blue-500" />
                  Recent Bookings
                </CardTitle>
                <Link href="/dashboard/photographer/bookings">
                  <Button variant="ghost" size="sm" className="gap-2 hover:bg-blue-50">
                    View All
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.bookings.length > 0 ? (
                  data.bookings.slice(0, 4).map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center gap-4 p-4 border rounded-xl hover:shadow-md transition-all duration-200 hover:bg-gray-50"
                    >
                      <Avatar className="h-12 w-12 ring-2 ring-blue-200">
                        <AvatarImage src={booking.client?.avatar || "/placeholder.svg"} />
                        <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                          {booking.client?.firstName?.charAt(0) || 'C'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-lg truncate">
                          {booking.client?.firstName} {booking.client?.lastName}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(booking.startAt).toLocaleDateString("en-US")}</span>
                          <Clock className="h-4 w-4 ml-2" />
                          <span>{new Date(booking.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{booking.location?.address}</p>
                      </div>
                      <div className="text-right">
                        <Badge
                          className={
                            booking.state === "confirmed"
                              ? "bg-green-100 text-green-800"
                              : booking.state === "requested"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                          }
                        >
                          {booking.state === "confirmed"
                            ? "Confirmed"
                            : booking.state === "requested"
                              ? "Pending"
                              : booking.state}
                        </Badge>
                        <p className="text-sm font-semibold mt-1 text-green-600">
                          {((booking.priceCents || 0) / 100).toLocaleString()} DA
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Calendar className="h-16 w-16 mx-auto mb-4 opacity-30" />
                    <h3 className="text-lg font-semibold mb-2">No bookings yet</h3>
                    <p className="mb-4">Start promoting your services to get your first booking</p>
                    <Link href="/dashboard/photographer/packages">
                      <Button className="shadow-lg hover:shadow-xl transition-all duration-300">
                        Create Your First Package
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Messages */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-2xl flex items-center gap-2">
                  <MessageCircle className="h-6 w-6 text-green-500" />
                  Recent Messages
                  {data.stats.unreadMessages > 0 && (
                    <Badge className="bg-red-500 text-white">
                      {data.stats.unreadMessages}
                    </Badge>
                  )}
                </CardTitle>
                <Link href="/dashboard/photographer/messages">
                  <Button variant="ghost" size="sm" className="gap-2 hover:bg-green-50">
                    View All
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.conversations.length > 0 ? (
                  data.conversations.slice(0, 4).map((conversation) => (
                    <div
                      key={conversation.id}
                      className="flex items-start gap-4 p-4 border rounded-xl hover:shadow-md transition-all duration-200 hover:bg-gray-50"
                    >
                      <Avatar className="h-10 w-10 ring-2 ring-green-200">
                        <AvatarImage src={conversation.otherUser?.avatar || "/placeholder.svg"} />
                        <AvatarFallback className="bg-green-100 text-green-700 font-semibold">
                          {conversation.otherUser?.name?.charAt(0) || 'C'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm">{conversation.otherUser?.name}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {conversation.lastMessage?.content || "New message"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(conversation.lastMessage?.createdAt || conversation.createdAt).toLocaleDateString("en-US")}
                        </p>
                      </div>
                      {conversation.unreadCount > 0 && (
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-30" />
                    <h3 className="text-lg font-semibold mb-2">No messages yet</h3>
                    <p>Clients will reach out when they're interested in your work</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Performance Overview */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-6">
              <CardTitle className="text-2xl flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-purple-500" />
                Performance Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 border rounded-xl hover:shadow-md transition-all duration-200 bg-gradient-to-br from-blue-50 to-blue-100">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <div className="p-2 bg-blue-500 rounded-lg">
                      <Eye className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <span className="text-3xl font-bold text-blue-700">{data.stats.profileViews}</span>
                  <p className="text-sm text-blue-600 font-medium mt-2">Profile Views</p>
                  <p className="text-xs text-blue-500 mt-1 font-semibold">+12% from last month</p>
                </div>

                <div className="text-center p-6 border rounded-xl hover:shadow-md transition-all duration-200 bg-gradient-to-br from-green-50 to-green-100">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <div className="p-2 bg-green-500 rounded-lg">
                      <MessageCircle className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <span className="text-3xl font-bold text-green-700">{data.stats.responseRate}%</span>
                  <p className="text-sm text-green-600 font-medium mt-2">Response Rate</p>
                  <p className="text-xs text-green-500 mt-1 font-semibold">Excellent!</p>
                </div>

                <div className="text-center p-6 border rounded-xl hover:shadow-md transition-all duration-200 bg-gradient-to-br from-purple-50 to-purple-100">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <div className="p-2 bg-purple-500 rounded-lg">
                      <Star className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <span className="text-3xl font-bold text-purple-700">{data.stats.averageRating.toFixed(1)}</span>
                  <p className="text-sm text-purple-600 font-medium mt-2">Average Rating</p>
                  <p className="text-xs text-purple-500 mt-1 font-semibold">+0.2 from last month</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bookings Tab */}
        <TabsContent value="bookings" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-yellow-500 rounded-xl">
                    <Clock className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-yellow-700">{data.stats.pendingBookings}</p>
                    <p className="text-sm text-yellow-600 font-medium">Pending</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500 rounded-xl">
                    <CheckCircle className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-700">{data.stats.confirmedBookings}</p>
                    <p className="text-sm text-blue-600 font-medium">Confirmed</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-500 rounded-xl">
                    <Award className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-700">{data.stats.completedBookings}</p>
                    <p className="text-sm text-green-600 font-medium">Completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>All Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.bookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={booking.client?.avatar || "/placeholder.svg"} />
                        <AvatarFallback>
                          {booking.client?.firstName?.charAt(0) || 'C'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">
                          {booking.client?.firstName} {booking.client?.lastName}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(booking.startAt).toLocaleDateString()} at {new Date(booking.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        className={
                          booking.state === "confirmed"
                            ? "bg-green-100 text-green-800"
                            : booking.state === "requested"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                        }
                      >
                        {booking.state}
                      </Badge>
                      <p className="text-sm font-semibold mt-1">
                        {((booking.priceCents || 0) / 100).toLocaleString()} DA
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Messages Tab */}
        <TabsContent value="messages" className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-6 w-6" />
                Conversations
                {data.stats.unreadMessages > 0 && (
                  <Badge className="bg-red-500 text-white">
                    {data.stats.unreadMessages} unread
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.conversations.map((conversation) => (
                  <div key={conversation.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={conversation.otherUser?.avatar || "/placeholder.svg"} />
                        <AvatarFallback>
                          {conversation.otherUser?.name?.charAt(0) || 'C'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{conversation.otherUser?.name}</h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {conversation.lastMessage?.content || "No messages yet"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {conversation.unreadCount > 0 && (
                        <Badge className="bg-red-500 text-white mb-2">
                          {conversation.unreadCount}
                        </Badge>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {new Date(conversation.lastMessage?.createdAt || conversation.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Portfolio Tab */}
        <TabsContent value="portfolio" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-500 rounded-xl">
                    <ImageIcon className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-700">{data.stats.portfolioImages}</p>
                    <p className="text-sm text-purple-600 font-medium">Total Photos</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500 rounded-xl">
                    <Eye className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-700">{data.stats.profileViews}</p>
                    <p className="text-sm text-blue-600 font-medium">Profile Views</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-500 rounded-xl">
                    <Heart className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-700">{Math.floor(Math.random() * 100) + 50}</p>
                    <p className="text-sm text-green-600 font-medium">Likes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Recent Portfolio Images</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {data.portfolio.slice(0, 8).map((image, index) => (
                  <div key={image.id || index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={image.url || "/placeholder.svg"}
                      alt={image.title || `Portfolio ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500 rounded-xl">
                    <TrendingUp className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-700">+15%</p>
                    <p className="text-sm text-blue-600 font-medium">Booking Growth</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-500 rounded-xl">
                    <DollarSign className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-700">+23%</p>
                    <p className="text-sm text-green-600 font-medium">Revenue Growth</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-500 rounded-xl">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-700">+8%</p>
                    <p className="text-sm text-purple-600 font-medium">Client Growth</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-500 rounded-xl">
                    <Star className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-orange-700">+0.3</p>
                    <p className="text-sm text-orange-600 font-medium">Rating Improvement</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Booking Conversion Rate</span>
                    <span className="text-sm text-muted-foreground">78%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Client Satisfaction</span>
                    <span className="text-sm text-muted-foreground">92%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Response Time</span>
                    <span className="text-sm text-muted-foreground">2.3 hours</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}