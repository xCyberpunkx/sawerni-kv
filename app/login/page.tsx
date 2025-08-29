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
import { Camera, Mail, Lock, Eye, EyeOff } from "lucide-react"
import { mockAuth } from "@/lib/auth"
import { demoCredentials } from "@/lib/demo-data"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const result = await mockAuth.login(email, password)
      if (result.success && result.user) {
        // Redirect based on user role
        switch (result.user.role) {
          case "client":
            router.push("/dashboard/client")
            break
          case "photographer":
            router.push("/dashboard/photographer")
            break
          case "admin":
            router.push("/dashboard/admin")
            break
          default:
            router.push("/")
        }
      } else {
        setError(result.error || "حدث خطأ في تسجيل الدخول")
      }
    } catch (err) {
      setError("حدث خطأ غير متوقع")
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = async (role: "client" | "photographer" | "admin") => {
    const credentials = demoCredentials[role]
    setEmail(credentials.email)
    setPassword(credentials.password)

    // Auto-submit after setting credentials
    setTimeout(async () => {
      setLoading(true)
      const result = await mockAuth.login(credentials.email, credentials.password)
      if (result.success && result.user) {
        switch (result.user.role) {
          case "client":
            router.push("/dashboard/client")
            break
          case "photographer":
            router.push("/dashboard/photographer")
            break
          case "admin":
            router.push("/dashboard/admin")
            break
        }
      }
      setLoading(false)
    }, 100)
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
          <h1 className="text-2xl font-bold mb-2">أهلاً بعودتك!</h1>
          <p className="text-muted-foreground">Nice to see you again!</p>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-center">تسجيل الدخول</CardTitle>
            <CardDescription className="text-center">أدخل بياناتك للوصول إلى حسابك</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Demo Login Buttons */}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground text-center">تسجيل دخول تجريبي:</p>
              <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" size="sm" onClick={() => handleDemoLogin("client")} disabled={loading}>
                  عميل
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDemoLogin("photographer")} disabled={loading}>
                  مصور
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDemoLogin("admin")} disabled={loading}>
                  مدير
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">أو</span>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">كلمة المرور</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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

              <div className="flex items-center justify-between">
                <Link href="#" className="text-sm text-primary hover:underline">
                  نسيت كلمة المرور؟
                </Link>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
              </Button>
            </form>

            {/* Social Login */}
            <div className="space-y-2">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">أو سجل دخولك بـ</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" size="sm" disabled>
                  Google
                </Button>
                <Button variant="outline" size="sm" disabled>
                  Facebook
                </Button>
                <Button variant="outline" size="sm" disabled>
                  Apple
                </Button>
              </div>
            </div>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">ليس لديك حساب؟ </span>
              <Link href="/signup" className="text-primary hover:underline">
                إنشاء حساب جديد
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
