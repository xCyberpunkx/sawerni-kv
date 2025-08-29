"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Camera, Mail, Lock, User, MapPin, Briefcase, Eye, EyeOff, CheckCircle } from "lucide-react"
import { mockAuth } from "@/lib/auth"

const algerianStates = [
  "الجزائر العاصمة",
  "وهران",
  "قسنطينة",
  "عنابة",
  "باتنة",
  "سطيف",
  "سيدي بلعباس",
  "بسكرة",
  "تلمسان",
  "بجاية",
  "تيزي وزو",
  "ورقلة",
  "بشار",
  "المسيلة",
  "الشلف",
]

const serviceTypes = [
  "تصوير الأعراس",
  "تصوير المناسبات",
  "التصوير الشخصي",
  "تصوير الأطفال",
  "التصوير التجاري",
  "تصوير الطبيعة",
  "التصوير الصحفي",
  "تصوير المنتجات",
]

export default function SignupPage() {
  const [userType, setUserType] = useState<"client" | "photographer">("client")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    state: "",
    serviceType: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("كلمات المرور غير متطابقة")
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل")
      setLoading(false)
      return
    }

    try {
      const result = await mockAuth.signup({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: userType,
        state: formData.state,
        serviceType: userType === "photographer" ? formData.serviceType : undefined,
      })

      if (result.success) {
        setSuccess(true)
        setTimeout(() => {
          router.push("/login")
        }, 2000)
      } else {
        setError(result.error || "حدث خطأ في إنشاء الحساب")
      }
    } catch (err) {
      setError("حدث خطأ غير متوقع")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg border-0">
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">تم إنشاء الحساب بنجاح!</h2>
            <p className="text-muted-foreground mb-4">تم إرسال رسالة تأكيد إلى بريدك الإلكتروني</p>
            <p className="text-sm text-muted-foreground">سيتم توجيهك إلى صفحة تسجيل الدخول...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <Camera className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-primary">Sawerni</span>
          </Link>
          <h1 className="text-2xl font-bold mb-2">انضم إلى Sawerni</h1>
          <p className="text-muted-foreground">أنشئ حسابك واستمتع بخدماتنا</p>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-center">إنشاء حساب جديد</CardTitle>
            <CardDescription className="text-center">اختر نوع الحساب وأدخل بياناتك</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Tabs
              value={userType}
              onValueChange={(value) => setUserType(value as "client" | "photographer")}
              className="mb-6"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="client">عميل</TabsTrigger>
                <TabsTrigger value="photographer">مصور</TabsTrigger>
              </TabsList>

              <TabsContent value="client" className="mt-4">
                <p className="text-sm text-muted-foreground text-center">ابحث عن أفضل المصورين واحجز جلسات التصوير</p>
              </TabsContent>

              <TabsContent value="photographer" className="mt-4">
                <p className="text-sm text-muted-foreground text-center">
                  انضم إلى شبكة المصورين المحترفين وزد من عملائك
                </p>
              </TabsContent>
            </Tabs>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">الاسم الكامل</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="أدخل اسمك الكامل"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">الولاية</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
                  <Select value={formData.state} onValueChange={(value) => handleInputChange("state", value)}>
                    <SelectTrigger className="pl-10">
                      <SelectValue placeholder="اختر ولايتك" />
                    </SelectTrigger>
                    <SelectContent>
                      {algerianStates.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {userType === "photographer" && (
                <div className="space-y-2">
                  <Label htmlFor="serviceType">نوع الخدمة</Label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
                    <Select
                      value={formData.serviceType}
                      onValueChange={(value) => handleInputChange("serviceType", value)}
                    >
                      <SelectTrigger className="pl-10">
                        <SelectValue placeholder="اختر تخصصك" />
                      </SelectTrigger>
                      <SelectContent>
                        {serviceTypes.map((service) => (
                          <SelectItem key={service} value={service}>
                            {service}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">كلمة المرور</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "جاري إنشاء الحساب..." : "إنشاء الحساب"}
              </Button>
            </form>

            <div className="text-center text-sm mt-4">
              <span className="text-muted-foreground">لديك حساب بالفعل؟ </span>
              <Link href="/login" className="text-primary hover:underline">
                تسجيل الدخول
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
