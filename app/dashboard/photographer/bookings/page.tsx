"use client"
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Calendar, MapPin, Clock, Phone, Mail, Check, X, Eye } from "lucide-react"
import { Api } from "@/lib/api"
import { mockAuth } from "@/lib/auth"
import { connectSocket } from "@/lib/socket"

export default function BookingsPage() {
  const user = mockAuth.getCurrentUser()
  const [photographerBookings, setPhotographerBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const run = async () => {
      setLoading(true)
      setError("")
      try {
        const data = await Api.get<{ items: any[] }>("/bookings/received?page=1&perPage=50")
        setPhotographerBookings(data.items || [])
      } catch (e: any) {
        setError(e?.message || "Failed to load bookings")
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [])

  useEffect(() => {
    // realtime booking state changes
    const token = typeof window !== "undefined" ? localStorage.getItem("sawerni_access_token") : null
    if (!token) return
    connectSocket(token, {
      onBookingStateChanged: (booking: any) => {
        setPhotographerBookings((prev) => prev.map((b) => (b.id === booking.id ? booking : b)))
      },
    })
  }, [])

  const pendingBookings = photographerBookings.filter((booking) => booking.state === "requested")
  const confirmedBookings = photographerBookings.filter((booking) => booking.state === "confirmed")
  const completedBookings = photographerBookings.filter((booking) => booking.state === "completed")

  const handleAcceptBooking = async (bookingId: string) => {
    const booking = photographerBookings.find((b) => b.id === bookingId)
    if (!booking || booking.state !== "requested") return
    try {
      await Api.patch(`/bookings/${bookingId}/state`, { toState: "confirmed", reason: "Photographer accepted" })
      setPhotographerBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, state: "confirmed" } : b)))
    } catch (e: any) {
      setError(e?.message || "Failed to accept booking")
    }
  }

  const handleRejectBooking = async (bookingId: string) => {
    const booking = photographerBookings.find((b) => b.id === bookingId)
    if (!booking || (booking.state !== "requested" && booking.state !== "confirmed" && booking.state !== "in_progress")) return
    try {
      await Api.patch(`/bookings/${bookingId}/state`, { toState: "cancelled_by_photographer", reason: "Not available" })
      setPhotographerBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, state: "cancelled_by_photographer" } : b)))
    } catch (e: any) {
      setError(e?.message || "Failed to reject booking")
    }
  }

  const BookingCard = ({ booking, showActions = false }: { booking: any; showActions?: boolean }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src="/placeholder.svg" />
            <AvatarFallback>Client</AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg">Booking #{booking.id}</h3>
                <p className="text-sm text-muted-foreground">New client</p>
              </div>
              <Badge
                variant={
                  booking.state === "confirmed" ? "default" : booking.state === "requested" ? "secondary" : "outline"
                }
              >
                {booking.state}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{new Date(booking.startAt).toLocaleDateString("en-US")}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="truncate">{booking.location?.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{Math.max(0, (new Date(booking.endAt).getTime() - new Date(booking.startAt).getTime()) / 3600000)} hours</span>
              </div>
              <div className="flex items-center gap-2 font-medium text-primary">
                <span>{(booking.priceCents / 100).toLocaleString()} DA</span>
              </div>
            </div>

            {booking.notes && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm">{booking.notes}</p>
              </div>
            )}

            <div className="flex items-center gap-2">
              {showActions ? (
                <>
                  <Button size="sm" onClick={() => handleAcceptBooking(booking.id)} className="gap-2">
                    <Check className="h-4 w-4" />
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRejectBooking(booking.id)}
                    className="gap-2 bg-transparent"
                  >
                    <X className="h-4 w-4" />
                    Reject
                  </Button>
                </>
              ) : (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" className="gap-2 bg-transparent">
                      <Eye className="h-4 w-4" />
                      View details
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Booking details #{booking.id}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium">Date</p>
                          <p className="text-sm text-muted-foreground">{new Date(booking.startAt).toLocaleDateString("en-US")}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Location</p>
                          <p className="text-sm text-muted-foreground">{booking.location?.address}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Amount</p>
                          <p className="text-sm text-muted-foreground">{(booking.priceCents / 100).toLocaleString()} DA</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Status</p>
                          <Badge variant="outline">{booking.state}</Badge>
                        </div>
                      </div>
                      {booking.notes && (
                        <div>
                          <p className="text-sm font-medium mb-2">Notes</p>
                          <p className="text-sm text-muted-foreground p-3 bg-muted rounded-lg">{booking.notes}</p>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              )}
              <Button size="sm" variant="ghost" className="gap-2">
                <Phone className="h-4 w-4" />
                Call
              </Button>
              <Button size="sm" variant="ghost" className="gap-2">
                <Mail className="h-4 w-4" />
                Message
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Manage bookings</h1>
        <p className="text-muted-foreground">Track and manage all your bookings</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingBookings.length}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Check className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{confirmedBookings.length}</p>
                <p className="text-sm text-muted-foreground">Confirmed</p>
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
                <p className="text-2xl font-bold">{completedBookings.length}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Calendar className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">{photographerBookings.length}</p>
                <p className="text-sm text-muted-foreground">Total bookings</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bookings Tabs */}
      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">Pending ({pendingBookings.length})</TabsTrigger>
          <TabsTrigger value="confirmed">Confirmed ({confirmedBookings.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedBookings.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingBookings.length > 0 ? (
            pendingBookings.map((booking) => <BookingCard key={booking.id} booking={booking} showActions={true} />)
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No pending bookings</h3>
                <p className="text-muted-foreground">New bookings will show up here</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="confirmed" className="space-y-4">
          {confirmedBookings.length > 0 ? (
            confirmedBookings.map((booking) => <BookingCard key={booking.id} booking={booking} />)
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Check className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No confirmed bookings</h3>
                <p className="text-muted-foreground">Confirmed bookings will show up here</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedBookings.length > 0 ? (
            completedBookings.map((booking) => <BookingCard key={booking.id} booking={booking} />)
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No completed bookings</h3>
                <p className="text-muted-foreground">Completed bookings will show up here</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
