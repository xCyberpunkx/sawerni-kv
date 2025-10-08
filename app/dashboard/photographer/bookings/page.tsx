"use client"
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Calendar, MapPin, Clock, Phone, Mail, Check, X, Eye, User, Camera, DollarSign, AlertCircle } from "lucide-react"
import { Api } from "@/lib/api"
import { mockAuth } from "@/lib/auth"
import { connectSocket } from "@/lib/socket"

export default function BookingsPage() {
  const user = mockAuth.getCurrentUser()
  const [photographerBookings, setPhotographerBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [selectedBooking, setSelectedBooking] = useState<any>(null)

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
  const cancelledBookings = photographerBookings.filter((booking) => 
    booking.state === "cancelled_by_photographer" || booking.state === "cancelled_by_client"
  )

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

  const handleCompleteBooking = async (bookingId: string) => {
    try {
      await Api.patch(`/bookings/${bookingId}/state`, { toState: "completed", reason: "Session completed" })
      setPhotographerBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, state: "completed" } : b)))
    } catch (e: any) {
      setError(e?.message || "Failed to complete booking")
    }
  }

  const getStatusColor = (state: string) => {
    switch (state) {
      case "requested": return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "confirmed": return "bg-blue-100 text-blue-800 border-blue-200"
      case "completed": return "bg-green-100 text-green-800 border-green-200"
      case "cancelled_by_photographer":
      case "cancelled_by_client": return "bg-red-100 text-red-800 border-red-200"
      case "in_progress": return "bg-purple-100 text-purple-800 border-purple-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const formatStatusText = (state: string) => {
    return state.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }

  const BookingCard = ({ booking, showActions = false }: { booking: any; showActions?: boolean }) => (
    <Card className="hover:shadow-md transition-shadow border-l-4 border-l-primary">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-14 w-14 border-2 border-muted">
            <AvatarImage src={booking.client?.avatar || "/placeholder.svg"} />
            <AvatarFallback>
              {booking.client?.firstName?.charAt(0) || 'C'}
              {booking.client?.lastName?.charAt(0) || 'L'}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg">Booking #{booking.id.slice(-6)}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {booking.client?.firstName} {booking.client?.lastName}
                  </p>
                  {booking.client?.rating && (
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium">{booking.client.rating}</span>
                      <span className="text-yellow-500">★</span>
                    </div>
                  )}
                </div>
              </div>
              <Badge className={`${getStatusColor(booking.state)} border`}>
                {formatStatusText(booking.state)}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <span className="font-medium">{new Date(booking.startAt).toLocaleDateString("en-US")}</span>
                  <span className="text-muted-foreground ml-1">
                    {new Date(booking.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="truncate">{booking.location?.address || "Location not specified"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{Math.max(0, (new Date(booking.endAt).getTime() - new Date(booking.startAt).getTime()) / 3600000)} hours</span>
              </div>
              <div className="flex items-center gap-2 font-medium text-primary">
                <DollarSign className="h-4 w-4" />
                <span>{(booking.priceCents / 100).toLocaleString()} DA</span>
              </div>
            </div>

            {booking.serviceType && (
              <div className="flex items-center gap-2 text-sm">
                <Camera className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Service:</span>
                <span>{booking.serviceType}</span>
              </div>
            )}

            {booking.notes && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium mb-1">Client Notes:</p>
                <p className="text-sm">{booking.notes}</p>
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
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
              ) : booking.state === "confirmed" ? (
                <Button size="sm" onClick={() => handleCompleteBooking(booking.id)} className="gap-2 bg-green-600 hover:bg-green-700">
                  <Check className="h-4 w-4" />
                  Mark Complete
                </Button>
              ) : null}
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="gap-2 bg-transparent">
                    <Eye className="h-4 w-4" />
                    View details
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Booking details #{booking.id}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">Client Name</p>
                        <p className="text-sm text-muted-foreground">
                          {booking.client?.firstName} {booking.client?.lastName}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Date & Time</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(booking.startAt).toLocaleDateString("en-US")} at{" "}
                          {new Date(booking.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Duration</p>
                        <p className="text-sm text-muted-foreground">
                          {Math.max(0, (new Date(booking.endAt).getTime() - new Date(booking.startAt).getTime()) / 3600000)} hours
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Location</p>
                        <p className="text-sm text-muted-foreground">{booking.location?.address || "Not specified"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Amount</p>
                        <p className="text-sm text-muted-foreground font-semibold">
                          {(booking.priceCents / 100).toLocaleString()} DA
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Status</p>
                        <Badge className={`${getStatusColor(booking.state)} border`}>
                          {formatStatusText(booking.state)}
                        </Badge>
                      </div>
                      {booking.serviceType && (
                        <div className="col-span-2">
                          <p className="text-sm font-medium">Service Type</p>
                          <p className="text-sm text-muted-foreground">{booking.serviceType}</p>
                        </div>
                      )}
                    </div>
                    {booking.notes && (
                      <div>
                        <p className="text-sm font-medium mb-2">Client Notes</p>
                        <p className="text-sm text-muted-foreground p-3 bg-muted rounded-lg">{booking.notes}</p>
                      </div>
                    )}
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline" className="gap-2">
                        <Phone className="h-4 w-4" />
                        Call Client
                      </Button>
                      <Button size="sm" variant="outline" className="gap-2">
                        <Mail className="h-4 w-4" />
                        Email Client
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading bookings...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Manage Bookings</h1>
        <p className="text-muted-foreground">Track and manage all your photography bookings</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

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
              <div className="p-2 bg-blue-100 rounded-lg">
                <Check className="h-6 w-6 text-blue-600" />
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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending">Pending ({pendingBookings.length})</TabsTrigger>
          <TabsTrigger value="confirmed">Confirmed ({confirmedBookings.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedBookings.length})</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled ({cancelledBookings.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingBookings.length > 0 ? (
            pendingBookings.map((booking) => <BookingCard key={booking.id} booking={booking} showActions={true} />)
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No pending bookings</h3>
                <p className="text-muted-foreground">New booking requests will appear here</p>
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
                <p className="text-muted-foreground">Accepted bookings will appear here</p>
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
                <p className="text-muted-foreground">Completed sessions will appear here</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="cancelled" className="space-y-4">
          {cancelledBookings.length > 0 ? (
            cancelledBookings.map((booking) => <BookingCard key={booking.id} booking={booking} />)
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <X className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No cancelled bookings</h3>
                <p className="text-muted-foreground">Cancelled bookings will appear here</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}