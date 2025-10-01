"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
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
} from "lucide-react"
import { mockAuth } from "@/lib/auth"
import { Api } from "@/lib/api"
import Link from "next/link"

export default function PhotographerDashboard() {
  const [user, setUser] = useState(mockAuth.getCurrentUser())
  const [bookings, setBookings] = useState<any[]>([])
  const [recentMessages, setRecentMessages] = useState<any[]>([])
  const [rating, setRating] = useState<number>(0)
  const [unreadCount, setUnreadCount] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const unsubscribe = mockAuth.onAuthChange(setUser)
    return unsubscribe
  }, [])

  useEffect(() => {
    const run = async () => {
      if (!user) return
      setLoading(true)
      setError("")
      try {
        const [bk, conv, me] = await Promise.all([
          Api.get<{ items: any[] }>("/bookings/received?page=1&perPage=50"),
          Api.get<{ items: any[] }>("/conversations?page=1&perPage=5"),
          Api.get<any>("/auth/me"),
        ])
        setBookings(bk.items || [])
        setRecentMessages(conv.items || [])
        setUnreadCount((conv.items || []).reduce((sum: number, c: any) => sum + (c.unreadCount || 0), 0))
        setRating(me?.photographer?.ratingAvg ?? 0)
      } catch (e: any) {
        setError(e?.message || "Failed to load dashboard")
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [user])

  const photographerBookings = bookings
  const pendingBookings = photographerBookings.filter((booking) => booking.state === "requested")
  const confirmedBookings = photographerBookings.filter((booking) => booking.state === "confirmed")
  const totalEarnings = photographerBookings
    .filter((booking) => booking.state === "completed")
    .reduce((sum, booking) => sum + (booking.priceCents || 0), 0) / 100

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h1 className="text-4xl font-bold text-balance mb-2">Welcome back, {user.name}</h1>
          <p className="text-xl text-muted-foreground">Here's how your photography business is performing</p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/photographer/portfolio">
            <Button
              variant="outline"
              size="lg"
              className="gap-2 border-2 hover:bg-secondary transition-all duration-300 bg-transparent"
            >
              <Camera className="h-5 w-5" />
              Manage Portfolio
            </Button>
          </Link>
          <Link href="/dashboard/photographer/packages">
            <Button
              size="lg"
              className="gap-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <TrendingUp className="h-5 w-5" />
              Manage Packages
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in-up animate-delay-100">
        <Card className="shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-0 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-xl">
                <Calendar className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="text-3xl font-bold text-primary">{photographerBookings.length}</p>
                <p className="text-sm text-muted-foreground font-medium">Total Bookings</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-0 bg-gradient-to-br from-accent/5 to-accent/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-accent/10 rounded-xl">
                <Clock className="h-8 w-8 text-accent" />
              </div>
              <div>
                <p className="text-3xl font-bold text-accent">{pendingBookings.length}</p>
                <p className="text-sm text-muted-foreground font-medium">Pending Approval</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-0 bg-gradient-to-br from-primary/5 to-secondary/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-xl">
                <DollarSign className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="text-3xl font-bold text-primary">{totalEarnings.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground font-medium">Earnings (DA)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-0 bg-gradient-to-br from-accent/5 to-secondary/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-accent/10 rounded-xl">
                <Star className="h-8 w-8 text-accent" />
              </div>
              <div>
                <p className="text-3xl font-bold text-accent">{rating.toFixed(1)}</p>
                <p className="text-sm text-muted-foreground font-medium">Average Rating</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="shadow-lg border-0 animate-fade-in-up animate-delay-200">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Calendar className="h-6 w-6 text-primary" />
              Recent Bookings
            </CardTitle>
            <Link href="/dashboard/photographer/bookings">
              <Button variant="ghost" size="sm" className="gap-2 hover:bg-primary/10">
                View All
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {photographerBookings.length > 0 ? (
              photographerBookings.slice(0, 3).map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center gap-4 p-4 border rounded-xl hover:shadow-md transition-all duration-200 hover:bg-secondary/30"
                >
                  <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">C</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-lg truncate">Booking #{booking.id}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(booking.startAt).toLocaleDateString("en-US")}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{booking.location?.address}</p>
                  </div>
                  <div className="text-right">
                    <Badge
                      className={
                        booking.state === "confirmed"
                          ? "bg-primary text-primary-foreground"
                          : booking.state === "requested"
                            ? "bg-accent text-accent-foreground"
                            : "bg-secondary text-secondary-foreground"
                      }
                    >
                      {booking.state === "confirmed"
                        ? "Confirmed"
                        : booking.state === "requested"
                          ? "Pending"
                          : booking.state}
                    </Badge>
                    <p className="text-sm font-semibold mt-1">{((booking.priceCents || 0) / 100).toLocaleString()} DA</p>
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

        <Card className="shadow-lg border-0 animate-fade-in-up animate-delay-300">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-2xl flex items-center gap-2">
              <MessageCircle className="h-6 w-6 text-primary" />
              Recent Messages
            </CardTitle>
            <Link href="/dashboard/photographer/messages">
              <Button variant="ghost" size="sm" className="gap-2 hover:bg-primary/10">
                View All
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentMessages.length > 0 ? (
              recentMessages.map((message) => (
                <div
                  key={message.id}
                  className="flex items-start gap-4 p-4 border rounded-xl hover:shadow-md transition-all duration-200 hover:bg-secondary/30"
                >
                  <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">C</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">Conversation</p>
                    <p className="text-sm text-muted-foreground truncate">{message.lastMessage?.content || "New message"}</p>
                    <p className="text-xs text-muted-foreground mt-1">{new Date(message.lastMessage?.createdAt || message.createdAt).toLocaleDateString("en-US")}</p>
                  </div>
                  <div className="w-3 h-3 bg-accent rounded-full animate-pulse"></div>
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

      <Card className="shadow-lg border-0 animate-fade-in-up animate-delay-400">
        <CardHeader className="pb-6">
          <CardTitle className="text-2xl flex items-center gap-2">
            <Award className="h-6 w-6 text-accent" />
            Performance Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 border rounded-xl hover:shadow-md transition-all duration-200 bg-gradient-to-br from-primary/5 to-secondary/10">
              <div className="flex items-center justify-center gap-2 mb-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Eye className="h-6 w-6 text-primary" />
                </div>
              </div>
              <span className="text-3xl font-bold text-primary">1,234</span>
              <p className="text-sm text-muted-foreground font-medium mt-2">Profile Views</p>
              <p className="text-xs text-primary mt-1 font-semibold">+12% from last month</p>
            </div>

            <div className="text-center p-6 border rounded-xl hover:shadow-md transition-all duration-200 bg-gradient-to-br from-accent/5 to-secondary/10">
              <div className="flex items-center justify-center gap-2 mb-3">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <Users className="h-6 w-6 text-accent" />
                </div>
              </div>
              <span className="text-3xl font-bold text-accent">{unreadCount}</span>
              <p className="text-sm text-muted-foreground font-medium mt-2">Unread Messages</p>
              <p className="text-xs text-accent mt-1 font-semibold">+8% from last month</p>
            </div>

            <div className="text-center p-6 border rounded-xl hover:shadow-md transition-all duration-200 bg-gradient-to-br from-primary/5 to-accent/10">
              <div className="flex items-center justify-center gap-2 mb-3">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <Star className="h-6 w-6 text-accent" />
                </div>
              </div>
              <span className="text-3xl font-bold text-accent">4.8</span>
              <p className="text-sm text-muted-foreground font-medium mt-2">Average Rating</p>
              <p className="text-xs text-accent mt-1 font-semibold">+0.2 from last month</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
