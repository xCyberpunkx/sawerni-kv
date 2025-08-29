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
import { demoUsers, demoBookings } from "@/lib/demo-data"
import Link from "next/link"

export default function AdminDashboard() {
  const [user, setUser] = useState(mockAuth.getCurrentUser())

  useEffect(() => {
    const unsubscribe = mockAuth.onAuthChange(setUser)
    return unsubscribe
  }, [])

  if (!user) {
    return <div>Loading...</div>
  }

  const totalUsers = demoUsers.length
  const totalClients = demoUsers.filter((u) => u.role === "client").length
  const totalPhotographers = demoUsers.filter((u) => u.role === "photographer").length
  const totalBookings = demoBookings.length
  const pendingBookings = demoBookings.filter((b) => b.status === "pending").length
  const completedBookings = demoBookings.filter((b) => b.status === "completed").length
  const totalRevenue = demoBookings.reduce((sum, booking) => sum + booking.totalAmount, 0)

  const recentUsers = demoUsers
    .sort((a, b) => new Date(b.joinedDate).getTime() - new Date(a.joinedDate).getTime())
    .slice(0, 5)

  const recentBookings = demoBookings.slice(0, 5)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">لوحة تحكم المدير</h1>
          <p className="text-muted-foreground">نظرة عامة على منصة Sawerni</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/admin/users">
            <Button variant="outline" className="gap-2 bg-transparent">
              <Users className="h-4 w-4" />
              إدارة المستخدمين
            </Button>
          </Link>
          <Link href="/dashboard/admin/stats">
            <Button className="gap-2">
              <BarChart3 className="h-4 w-4" />
              الإحصائيات التفصيلية
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
                <p className="text-sm text-muted-foreground">إجمالي المستخدمين</p>
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
                <p className="text-sm text-muted-foreground">المصورون</p>
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
                <p className="text-sm text-muted-foreground">إجمالي الحجوزات</p>
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
                <p className="text-sm text-muted-foreground">إجمالي الإيرادات (دج)</p>
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
                <p className="text-sm text-muted-foreground">حجوزات في الانتظار</p>
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
                <p className="text-sm text-muted-foreground">حجوزات مكتملة</p>
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
                <p className="text-2xl font-bold">3</p>
                <p className="text-sm text-muted-foreground">مشاكل تحتاج حل</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl">المستخدمون الجدد</CardTitle>
            <Link href="/dashboard/admin/users">
              <Button variant="ghost" size="sm" className="gap-2">
                عرض الكل
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
                    {user.role === "photographer" ? "مصور" : "عميل"}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(user.joinedDate).toLocaleDateString("ar-DZ")}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Bookings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl">الحجوزات الأخيرة</CardTitle>
            <Button variant="ghost" size="sm" className="gap-2">
              عرض الكل
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
                  <p className="font-medium">حجز #{booking.id}</p>
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
                    {booking.status === "confirmed"
                      ? "مؤكد"
                      : booking.status === "pending"
                        ? "في الانتظار"
                        : booking.status}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">{booking.totalAmount.toLocaleString()} دج</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Platform Health */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">صحة المنصة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-4 border rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <span className="text-lg font-bold">98.5%</span>
              </div>
              <p className="text-sm text-muted-foreground">وقت التشغيل</p>
              <p className="text-xs text-green-600 mt-1">ممتاز</p>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Users className="h-5 w-5 text-primary" />
                <span className="text-lg font-bold">156</span>
              </div>
              <p className="text-sm text-muted-foreground">مستخدمون نشطون</p>
              <p className="text-xs text-green-600 mt-1">+12% من الأمس</p>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Calendar className="h-5 w-5 text-accent" />
                <span className="text-lg font-bold">89</span>
              </div>
              <p className="text-sm text-muted-foreground">حجوزات اليوم</p>
              <p className="text-xs text-green-600 mt-1">+8% من الأمس</p>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-lg font-bold">4.8</span>
              </div>
              <p className="text-sm text-muted-foreground">متوسط التقييم</p>
              <p className="text-xs text-green-600 mt-1">ممتاز</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
