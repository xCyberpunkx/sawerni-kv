"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
        setError(result.error || "An error occurred during login")
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = async (role: "client" | "photographer" | "admin") => {
    const credentials = demoCredentials[role]
    setEmail(credentials.email)
    setPassword(credentials.password)

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 1440 900">
          <defs>
            <linearGradient id="curveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="100%" stopColor="#f8fafc" stopOpacity="1" />
            </linearGradient>
          </defs>
          <path d="M0 0 L600 0 Q650 450 600 900 L0 900 Z" fill="url(#curveGradient)" className="drop-shadow-2xl" />
          <path d="M580 0 L620 0 Q670 450 620 900 L580 900 Q630 450 580 0 Z" fill="#3b82f6" opacity="0.15" />
        </svg>
      </div>

      <div className="w-full max-w-7xl grid md:grid-cols-2 gap-8 items-center relative z-10">
        <div className="hidden md:flex flex-col items-center justify-center space-y-8 px-12 animate-fade-in-up">
          <div className="w-32 h-32 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-3xl flex items-center justify-center shadow-2xl transform hover:scale-105 transition-transform duration-300 hover:rotate-3">
            <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <div className="text-center">
            <h1 className="text-7xl font-bold mb-4 font-space-grotesk text-[#2F3D7F] drop-shadow-sm">Log In</h1>
            <p className="text-lg text-[#2F3D7F]/70">
              you dont have an account?{" "}
              <Link
                href="/signup"
                className="text-blue-600 hover:text-blue-700 hover:underline font-semibold transition-colors"
              >
                sign in
              </Link>
            </p>
          </div>
        </div>

        <div className="relative animate-fade-in-up animate-delay-200">
          <div className="bg-gradient-to-br from-[#2F3D7F] via-[#3A467C] to-[#1E2749] rounded-3xl p-8 md:p-12 shadow-2xl backdrop-blur-xl border border-white/10">
            <div className="mb-8 text-center">
              <h2 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">Nice to see you again !</h2>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-3 mb-6">
              <p className="text-sm text-white/70 text-center">Quick demo login:</p>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDemoLogin("client")}
                  disabled={loading}
                  className="bg-white/10 border-white/20 hover:bg-white/20 text-white text-xs"
                >
                  Client
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDemoLogin("photographer")}
                  disabled={loading}
                  className="bg-white/10 border-white/20 hover:bg-white/20 text-white text-xs"
                >
                  Photographer
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDemoLogin("admin")}
                  disabled={loading}
                  className="bg-white/10 border-white/20 hover:bg-white/20 text-white text-xs"
                >
                  Admin
                </Button>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2 relative group">
                <div className="absolute -left-16 top-1/2 w-16 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-blue-400 hidden md:block transition-all duration-300 group-hover:via-blue-300 group-hover:to-blue-300"></div>
                <div className="absolute -left-20 top-1/2 w-3 h-3 bg-blue-400 rounded-full hidden md:block transform -translate-y-1/2 shadow-lg shadow-blue-400/50 group-hover:scale-125 transition-transform duration-300"></div>
                <Label htmlFor="email" className="text-blue-300 font-semibold text-sm">
                  User name
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Anfel"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white border-0 text-[#2F3D7F] placeholder:text-slate-400 rounded-full pl-4 pr-4 h-14 shadow-lg text-base transition-all duration-300 hover:shadow-xl focus:shadow-2xl focus:scale-[1.02]"
                  required
                />
              </div>

              <div className="space-y-2 relative group">
                <div className="absolute -left-16 top-1/2 w-16 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-blue-400 hidden md:block transition-all duration-300 group-hover:via-blue-300 group-hover:to-blue-300"></div>
                <div className="absolute -left-20 top-1/2 w-3 h-3 bg-blue-400 rounded-full hidden md:block transform -translate-y-1/2 shadow-lg shadow-blue-400/50 group-hover:scale-125 transition-transform duration-300"></div>
                <Label htmlFor="password" className="text-blue-300 font-semibold text-sm">
                  Password
                </Label>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white border-0 text-[#2F3D7F] placeholder:text-slate-400 rounded-full pl-4 pr-4 h-14 shadow-lg text-base transition-all duration-300 hover:shadow-xl focus:shadow-2xl focus:scale-[1.02]"
                  required
                />
              </div>

              <div className="flex items-center justify-end">
                <Link href="#" className="text-sm text-blue-300 hover:text-blue-200 hover:underline transition-colors">
                  Forgot your password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-full h-14 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] border-2 border-blue-400/30"
                disabled={loading}
              >
                {loading ? "Logging in..." : "LOG IN"}
              </Button>
            </form>

            <div className="mt-8 space-y-4">
              <p className="text-center text-sm text-white/60">Or Log in with your</p>
              <div className="grid grid-cols-3 gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  disabled
                  className="bg-white hover:bg-white/90 border-0 rounded-full shadow-lg h-12 transition-all duration-300 hover:scale-105"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                  </svg>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled
                  className="bg-white hover:bg-white/90 border-0 rounded-full shadow-lg h-12 transition-all duration-300 hover:scale-105"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled
                  className="bg-white hover:bg-white/90 border-0 rounded-full shadow-lg h-12 transition-all duration-300 hover:scale-105"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
