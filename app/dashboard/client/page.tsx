"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Camera, Calendar, MessageCircle, Star, Clock, MapPin, ArrowRight, Award } from "lucide-react"
import { mockAuth } from "@/lib/auth"
import { Api } from "@/lib/api"
import Link from "next/link"

export default function ClientDashboard() {
  const [user, setUser] = useState(mockAuth.getCurrentUser())
  const [bookings, setBookings] = useState<any[]>([])
  const [featured, setFeatured] = useState<any[]>([])
  const [conversationsCount, setConversationsCount] = useState(0)
  const [pendingReviewsCount, setPendingReviewsCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!user) {
      mockAuth.loadCurrentUser().then((u) => u && setUser(u))
    }
    const unsubscribe = mockAuth.onAuthChange(setUser)
    return unsubscribe
  }, [])

  useEffect(() => {
    const run = async () => {
      if (!user) return
      setLoading(true)
      setError("")
      try {
        const [bk, conv, photogs, reviewsMe] = await Promise.all([
          Api.get<{ items: any[] }>("/bookings/me?page=1&perPage=50"),
          Api.get<{ items: any[]; meta?: any }>("/conversations?page=1&perPage=20"),
          Api.get<{ items: any[] }>("/photographers?sort=rating_desc&page=1&perPage=3"),
          Api.get<{ items: any[] }>("/reviews/me?page=1&perPage=50"),
        ])
        setBookings(bk.items || [])
        setConversationsCount(conv.items?.length || 0)
        setFeatured(photogs.items || [])
        const pending = (reviewsMe.items || []).filter((r: any) => (r.status || "").toUpperCase() === "PENDING").length
        setPendingReviewsCount(pending)
      } catch (e: any) {
        setError(e?.message || "Failed to load dashboard data")
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [user])

  const userBookings = bookings
  const upcomingBookings = userBookings.filter(
    (booking) => booking.state === "confirmed" && new Date(booking.startAt) > new Date(),
  )

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h1 className="text-4xl font-bold text-balance mb-2">Welcome back, {user?.name}</h1>
          <p className="text-xl text-muted-foreground">Here's what's happening with your photography projects</p>
        </div>
        <Link href="/dashboard/client/photographers">
          <Button
            size="lg"
            className="gap-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <Camera className="h-5 w-5" />
            Find Photographers
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in-up animate-delay-100">
        <Card className="shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-0 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-xl">
                <Calendar className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="text-3xl font-bold text-primary">{userBookings.length}</p>
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
                <p className="text-3xl font-bold text-accent">{upcomingBookings.length}</p>
                <p className="text-sm text-muted-foreground font-medium">Upcoming Sessions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-0 bg-gradient-to-br from-primary/5 to-secondary/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-xl">
                <MessageCircle className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="text-3xl font-bold text-primary">{conversationsCount}</p>
                <p className="text-sm text-muted-foreground font-medium">New Messages</p>
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
                <p className="text-3xl font-bold text-accent">{pendingReviewsCount}</p>
                <p className="text-sm text-muted-foreground font-medium">Pending Reviews</p>
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
              Upcoming Sessions
            </CardTitle>
            <Link href="/dashboard/client/bookings">
              <Button variant="ghost" size="sm" className="gap-2 hover:bg-primary/10">
                View All
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingBookings.length > 0 ? (
              upcomingBookings.slice(0, 3).map((booking) => {
                const photographerName = booking.photographer?.user?.name || "Photographer"
                const dateStr = new Date(booking.startAt).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
                return (
                  <div
                    key={booking.id}
                    className="flex items-center gap-4 p-4 border rounded-xl hover:shadow-md transition-all duration-200 hover:bg-secondary/30"
                  >
                    <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                      <AvatarImage src={"/placeholder.svg"} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {photographerName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-lg truncate">{photographerName}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{dateStr}</span>
                      </div>
                    </div>
                    <Badge className="bg-primary text-primary-foreground">Confirmed</Badge>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <h3 className="text-lg font-semibold mb-2">No upcoming sessions</h3>
                <p className="mb-4">Ready to capture some amazing moments?</p>
                <Link href="/dashboard/client/photographers">
                  <Button className="shadow-lg hover:shadow-xl transition-all duration-300">
                    Book Your First Session
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
            <Link href="/dashboard/client/messages">
              <Button variant="ghost" size="sm" className="gap-2 hover:bg-primary/10">
                View All
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Replace with conversations preview when messages UI is integrated */}
            {conversationsCount > 0 ? (
              userBookings.slice(0, 3).map((booking) => {
                const title = booking.photographer?.user?.name || "Photographer"
                const ts = new Date(booking.createdAt).toLocaleDateString("en-US")
                return (
                  <div
                    key={booking.id}
                    className="flex items-start gap-4 p-4 border rounded-xl hover:shadow-md transition-all duration-200 hover:bg-secondary/30"
                  >
                    <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                      <AvatarImage src={"/placeholder.svg"} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {title.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{title}</p>
                      <p className="text-sm text-muted-foreground truncate">Recent activity</p>
                      <p className="text-xs text-muted-foreground mt-1">{ts}</p>
                    </div>
                    <div className="w-3 h-3 bg-accent rounded-full animate-pulse"></div>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <h3 className="text-lg font-semibold mb-2">No messages yet</h3>
                <p>Start a conversation with a photographer</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg border-0 animate-fade-in-up animate-delay-400">
        <CardHeader className="flex flex-row items-center justify-between pb-6">
          <CardTitle className="text-2xl flex items-center gap-2">
            <Award className="h-6 w-6 text-accent" />
            Featured Photographers
          </CardTitle>
          <Link href="/dashboard/client/photographers">
            <Button variant="ghost" size="sm" className="gap-2 hover:bg-primary/10">
              Browse All
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.slice(0, 3).map((p, index) => (
              <div
                key={p.id}
                className={`border rounded-xl p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-gradient-to-br from-card to-secondary/10 animate-scale-in`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="h-16 w-16 ring-2 ring-primary/20">
                    <AvatarImage src={"/placeholder.svg"} />
                    <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                      {(p.user?.name || "P").charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-lg truncate">{p.user?.name}</p>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{p.state?.name}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-accent text-accent" />
                    <span className="text-sm font-semibold">{p.ratingAvg ?? 0}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">({p.ratingCount ?? 0} reviews)</span>
                  <Badge variant="secondary" className="ml-auto bg-accent/10 text-accent">
                    Featured
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{p.bio}</p>
                <Link href={`/dashboard/client/photographers/${p.id}`}>
                  <Button className="w-full shadow-lg hover:shadow-xl transition-all duration-300">
                    View Portfolio
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
