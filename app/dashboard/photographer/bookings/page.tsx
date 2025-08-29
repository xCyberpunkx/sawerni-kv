"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Calendar, MapPin, Clock, Phone, Mail, Check, X, Eye } from "lucide-react"
import { demoBookings } from "@/lib/demo-data"
import { mockAuth } from "@/lib/auth"

export default function BookingsPage() {
  const user = mockAuth.getCurrentUser()
  const photographerBookings = demoBookings.filter((booking) => booking.photographerId === user?.id)

  const pendingBookings = photographerBookings.filter((booking) => booking.status === "pending")
  const confirmedBookings = photographerBookings.filter((booking) => booking.status === "confirmed")
  const completedBookings = photographerBookings.filter((booking) => booking.status === "completed")

  const handleAcceptBooking = (bookingId: string) => {
    // In a real app, this would update the booking status
    console.log("Accepting booking:", bookingId)
  }

  const handleRejectBooking = (bookingId: string) => {
    // In a real app, this would update the booking status
    console.log("Rejecting booking:", bookingId)
  }

  const BookingCard = ({ booking, showActions = false }: { booking: any; showActions?: boolean }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src="/placeholder.svg" />
            <AvatarFallback>عميل</AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg">حجز #{booking.id}</h3>
                <p className="text-sm text-muted-foreground">عميل جديد</p>
              </div>
              <Badge
                variant={
                  booking.status === "confirmed" ? "default" : booking.status === "pending" ? "secondary" : "outline"
                }
              >
                {booking.status === "confirmed"
                  ? "مؤكد"
                  : booking.status === "pending"
                    ? "في الانتظار"
                    : booking.status === "completed"
                      ? "مكتمل"
                      : booking.status}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{new Date(booking.date).toLocaleDateString("ar-DZ")}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="truncate">{booking.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>8 ساعات</span>
              </div>
              <div className="flex items-center gap-2 font-medium text-primary">
                <span>{booking.totalAmount.toLocaleString()} دج</span>
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
                    قبول
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRejectBooking(booking.id)}
                    className="gap-2 bg-transparent"
                  >
                    <X className="h-4 w-4" />
                    رفض
                  </Button>
                </>
              ) : (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" className="gap-2 bg-transparent">
                      <Eye className="h-4 w-4" />
                      عرض التفاصيل
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>تفاصيل الحجز #{booking.id}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium">التاريخ</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(booking.date).toLocaleDateString("ar-DZ")}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">المكان</p>
                          <p className="text-sm text-muted-foreground">{booking.location}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">المبلغ</p>
                          <p className="text-sm text-muted-foreground">{booking.totalAmount.toLocaleString()} دج</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">الحالة</p>
                          <Badge variant="outline">{booking.status}</Badge>
                        </div>
                      </div>
                      {booking.notes && (
                        <div>
                          <p className="text-sm font-medium mb-2">ملاحظات</p>
                          <p className="text-sm text-muted-foreground p-3 bg-muted rounded-lg">{booking.notes}</p>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              )}
              <Button size="sm" variant="ghost" className="gap-2">
                <Phone className="h-4 w-4" />
                اتصال
              </Button>
              <Button size="sm" variant="ghost" className="gap-2">
                <Mail className="h-4 w-4" />
                رسالة
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
        <h1 className="text-3xl font-bold">إدارة الحجوزات</h1>
        <p className="text-muted-foreground">تابع وأدر جميع حجوزاتك</p>
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
                <p className="text-sm text-muted-foreground">في الانتظار</p>
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
                <p className="text-sm text-muted-foreground">مؤكدة</p>
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
                <p className="text-sm text-muted-foreground">مكتملة</p>
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
                <p className="text-sm text-muted-foreground">إجمالي الحجوزات</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bookings Tabs */}
      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">في الانتظار ({pendingBookings.length})</TabsTrigger>
          <TabsTrigger value="confirmed">مؤكدة ({confirmedBookings.length})</TabsTrigger>
          <TabsTrigger value="completed">مكتملة ({completedBookings.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingBookings.length > 0 ? (
            pendingBookings.map((booking) => <BookingCard key={booking.id} booking={booking} showActions={true} />)
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">لا توجد حجوزات في الانتظار</h3>
                <p className="text-muted-foreground">ستظهر الحجوزات الجديدة هنا</p>
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
                <h3 className="text-lg font-semibold mb-2">لا توجد حجوزات مؤكدة</h3>
                <p className="text-muted-foreground">ستظهر الحجوزات المؤكدة هنا</p>
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
                <h3 className="text-lg font-semibold mb-2">لا توجد حجوزات مكتملة</h3>
                <p className="text-muted-foreground">ستظهر الحجوزات المكتملة هنا</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
