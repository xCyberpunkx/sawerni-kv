"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, Eye, EyeOff, AlertCircle } from "lucide-react"
import { mockAuth } from "@/lib/auth"

const algerianStates = [
  "Algiers",
  "Oran",
  "Constantine",
  "Annaba",
  "Batna",
  "Setif",
  "Sidi Bel Abbes",
  "Biskra",
  "Tlemcen",
  "Bejaia",
  "Tizi Ouzou",
  "Ouargla",
  "Bechar",
  "M'sila",
  "Chlef",
]

const serviceTypes = [
  "Wedding Photography",
  "Event Photography",
  "Portrait Photography",
  "Children Photography",
  "Commercial Photography",
  "Nature Photography",
  "Photojournalism",
  "Product Photography",
]

interface ValidationErrors {
  name?: string
  email?: string
  phone?: string
  password?: string
  confirmPassword?: string
  state?: string
  serviceType?: string
}

export default function SignupPage() {
  const searchParams = useSearchParams()
  const [userType, setUserType] = useState<"client" | "photographer">("client")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
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
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const router = useRouter()

  useEffect(() => {
    const role = searchParams?.get("role")
    if (role === "photographer") {
      setUserType("photographer")
    }
  }, [searchParams])

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[0-9]{10}$/
    return phoneRegex.test(phone)
  }

  const validateName = (name: string): boolean => {
    return name.trim().length >= 2 && /^[a-zA-Z\s]+$/.test(name)
  }

  const validatePassword = (password: string): boolean => {
    return password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password)
  }

  const validateField = (field: string, value: string): string | undefined => {
    switch (field) {
      case "name":
        if (!value.trim()) return "Name is required"
        if (value.trim().length < 2) return "Name must be at least 2 characters"
        if (!/^[a-zA-Z\s]+$/.test(value)) return "Name can only contain letters and spaces"
        break
      case "email":
        if (!value.trim()) return "Email is required"
        if (!validateEmail(value)) return "Please enter a valid email address"
        break
      case "phone":
        if (!value.trim()) return "Phone number is required"
        if (!/^[0-9]+$/.test(value)) return "Phone number can only contain digits"
        if (value.length !== 10) return "Phone number must be exactly 10 digits"
        break
      case "password":
        if (!value) return "Password is required"
        if (value.length < 8) return "Password must be at least 8 characters"
        if (!/[A-Z]/.test(value)) return "Password must contain at least one uppercase letter"
        if (!/[a-z]/.test(value)) return "Password must contain at least one lowercase letter"
        if (!/[0-9]/.test(value)) return "Password must contain at least one number"
        break
      case "confirmPassword":
        if (!value) return "Please confirm your password"
        if (value !== formData.password) return "Passwords do not match"
        break
      case "state":
        if (!value) return "Please select your location"
        break
      case "serviceType":
        if (userType === "photographer" && !value) return "Please select a service type"
        break
    }
    return undefined
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    
    if (touched[field]) {
      const error = validateField(field, value)
      setValidationErrors((prev) => ({
        ...prev,
        [field]: error,
      }))
    }

    if (field === "password" && touched["confirmPassword"] && formData.confirmPassword) {
      const confirmError = validateField("confirmPassword", formData.confirmPassword)
      setValidationErrors((prev) => ({
        ...prev,
        confirmPassword: confirmError,
      }))
    }
  }

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    const error = validateField(field, formData[field as keyof typeof formData])
    setValidationErrors((prev) => ({
      ...prev,
      [field]: error,
    }))
  }

  const validateAllFields = (): boolean => {
    const errors: ValidationErrors = {}
    let isValid = true

    const fieldsToValidate = ["name", "email", "phone", "password", "confirmPassword", "state"]
    if (userType === "photographer") {
      fieldsToValidate.push("serviceType")
    }

    fieldsToValidate.forEach((field) => {
      const error = validateField(field, formData[field as keyof typeof formData])
      if (error) {
        errors[field as keyof ValidationErrors] = error
        isValid = false
      }
    })

    setValidationErrors(errors)
    setTouched(
      fieldsToValidate.reduce((acc, field) => ({ ...acc, [field]: true }), {})
    )

    return isValid
  }

  const handleGoogleSignup = async () => {
    setLoading(true)
    setError("")
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      router.push("/dashboard/client")
    } catch (err) {
      setError("Google signup failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setLoading(true)
    setError("")

    if (!validateAllFields()) {
      setLoading(false)
      setError("Please fix all validation errors before submitting")
      return
    }

    try {
      const result = await mockAuth.signup({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: userType,
        state: formData.state,
      })

      if (result.success) {
        setSuccess(true)
        setTimeout(() => {
          router.push("/login")
        }, 2000)
      } else {
        setError(result.error || "Account creation failed. Please try again.")
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl p-12 shadow-2xl border border-slate-700 text-center max-w-md animate-scale-in">
          <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6 animate-bounce" />
          <h2 className="text-3xl font-bold mb-4 text-white">Account Created Successfully!</h2>
          <p className="text-white/70 mb-4">A confirmation email has been sent to your inbox</p>
          <p className="text-sm text-white/50">Redirecting to login page...</p>
        </div>
      </div>
    )
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
            <h1 className="text-7xl font-bold mb-4 font-space-grotesk text-[#2F3D7F] drop-shadow-sm">Sign Up</h1>
            <p className="text-lg text-[#2F3D7F]/70">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-blue-600 hover:text-blue-700 hover:underline font-semibold transition-colors"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>

        <div className="relative animate-fade-in-up animate-delay-200">
          <div className="bg-gradient-to-br from-[#2F3D7F] via-[#3A467C] to-[#1E2749] rounded-3xl p-8 md:p-12 shadow-2xl max-h-[85vh] overflow-y-auto backdrop-blur-xl border border-white/10">
            <div className="mb-8 text-center">
              <h2 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">Join us !</h2>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Tabs
              value={userType}
              onValueChange={(value) => setUserType(value as "client" | "photographer")}
              className="mb-6"
            >
              <TabsList className="grid w-full grid-cols-2 bg-white/10">
                <TabsTrigger value="client" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  Client
                </TabsTrigger>
                <TabsTrigger
                  value="photographer"
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  Photographer
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="space-y-4">
              <div className="space-y-2 relative group">
                <div className="absolute -left-16 top-1/2 w-16 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-blue-400 hidden md:block transition-all duration-300 group-hover:via-blue-300 group-hover:to-blue-300"></div>
                <div className="absolute -left-20 top-1/2 w-3 h-3 bg-blue-400 rounded-full hidden md:block transform -translate-y-1/2 shadow-lg shadow-blue-400/50 group-hover:scale-125 transition-transform duration-300"></div>
                <Label htmlFor="name" className="text-blue-300 font-semibold text-sm">
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  onBlur={() => handleBlur("name")}
                  className={`bg-white border-0 text-white placeholder:text-slate-400 rounded-full pl-4 pr-4 h-14 shadow-lg transition-all duration-300 hover:shadow-xl focus:shadow-2xl focus:scale-[1.02] ${
                    validationErrors.name && touched.name ? "ring-2 ring-red-500" : ""
                  }`}
                  required
                />
                {validationErrors.name && touched.name && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {validationErrors.name}
                  </p>
                )}
              </div>

              <div className="space-y-2 relative group">
                <div className="absolute -left-16 top-1/2 w-16 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-blue-400 hidden md:block transition-all duration-300 group-hover:via-blue-300 group-hover:to-blue-300"></div>
                <div className="absolute -left-20 top-1/2 w-3 h-3 bg-blue-400 rounded-full hidden md:block transform -translate-y-1/2 shadow-lg shadow-blue-400/50 group-hover:scale-125 transition-transform duration-300"></div>
                <Label htmlFor="phone" className="text-blue-300 font-semibold text-sm">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="10 digits (e.g., 0555123456)"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  onBlur={() => handleBlur("phone")}
                  maxLength={10}
                  className={`bg-white border-0 text-white placeholder:text-slate-400 rounded-full pl-4 pr-4 h-14 shadow-lg transition-all duration-300 hover:shadow-xl focus:shadow-2xl focus:scale-[1.02] ${
                    validationErrors.phone && touched.phone ? "ring-2 ring-red-500" : ""
                  }`}
                  required
                />
                {validationErrors.phone && touched.phone && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {validationErrors.phone}
                  </p>
                )}
              </div>

              <div className="space-y-2 relative group">
                <div className="absolute -left-16 top-1/2 w-16 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-blue-400 hidden md:block transition-all duration-300 group-hover:via-blue-300 group-hover:to-blue-300"></div>
                <div className="absolute -left-20 top-1/2 w-3 h-3 bg-blue-400 rounded-full hidden md:block transform -translate-y-1/2 shadow-lg shadow-blue-400/50 group-hover:scale-125 transition-transform duration-300"></div>
                <Label htmlFor="email" className="text-blue-300 font-semibold text-sm">
                  E-mail
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  onBlur={() => handleBlur("email")}
                  className={`bg-white border-0 text-white placeholder:text-slate-400 rounded-full pl-4 pr-4 h-14 shadow-lg transition-all duration-300 hover:shadow-xl focus:shadow-2xl focus:scale-[1.02] ${
                    validationErrors.email && touched.email ? "ring-2 ring-red-500" : ""
                  }`}
                  required
                />
                {validationErrors.email && touched.email && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {validationErrors.email}
                  </p>
                )}
              </div>

              <div className="space-y-2 relative group">
                <div className="absolute -left-16 top-1/2 w-16 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-blue-400 hidden md:block transition-all duration-300 group-hover:via-blue-300 group-hover:to-blue-300"></div>
                <div className="absolute -left-20 top-1/2 w-3 h-3 bg-blue-400 rounded-full hidden md:block transform -translate-y-1/2 shadow-lg shadow-blue-400/50 group-hover:scale-125 transition-transform duration-300"></div>
                <Label htmlFor="state" className="text-blue-300 font-semibold text-sm">
                  Location
                </Label>
                <Select 
                  value={formData.state} 
                  onValueChange={(value) => {
                    handleInputChange("state", value)
                    handleBlur("state")
                  }}
                >
                  <SelectTrigger className={`bg-white border-0 text-white rounded-full pl-4 pr-4 h-14 shadow-lg transition-all duration-300 hover:shadow-xl focus:shadow-2xl focus:scale-[1.02] ${
                    validationErrors.state && touched.state ? "ring-2 ring-red-500" : ""
                  }`}>
                    <SelectValue placeholder="Select your location" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200">
                    {algerianStates.map((state) => (
                      <SelectItem key={state} value={state} className="text-white">
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {validationErrors.state && touched.state && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {validationErrors.state}
                  </p>
                )}
              </div>

              <div className="space-y-2 relative group">
                <div className="absolute -left-16 top-1/2 w-16 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-blue-400 hidden md:block transition-all duration-300 group-hover:via-blue-300 group-hover:to-blue-300"></div>
                <div className="absolute -left-20 top-1/2 w-3 h-3 bg-blue-400 rounded-full hidden md:block transform -translate-y-1/2 shadow-lg shadow-blue-400/50 group-hover:scale-125 transition-transform duration-300"></div>
                <Label htmlFor="password" className="text-blue-300 font-semibold text-sm">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    onBlur={() => handleBlur("password")}
                    className={`bg-white border-0 text-black placeholder:text-slate-400 rounded-full pl-4 pr-12 h-14 shadow-lg transition-all duration-300 hover:shadow-xl focus:shadow-2xl focus:scale-[1.02] ${
                      validationErrors.password && touched.password ? "ring-2 ring-red-500" : ""
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-black hover:text-blue-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {validationErrors.password && touched.password && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {validationErrors.password}
                  </p>
                )}
                {!validationErrors.password && touched.password && (
                  <p className="text-blue-300 text-xs mt-1">
                    Password strength: {formData.password.length >= 8 ? "Good" : "Weak"}
                  </p>
                )}
              </div>

              <div className="space-y-2 relative group">
                <div className="absolute -left-16 top-1/2 w-16 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-blue-400 hidden md:block transition-all duration-300 group-hover:via-blue-300 group-hover:to-blue-300"></div>
                <div className="absolute -left-20 top-1/2 w-3 h-3 bg-blue-400 rounded-full hidden md:block transform -translate-y-1/2 shadow-lg shadow-blue-400/50 group-hover:scale-125 transition-transform duration-300"></div>
                <Label htmlFor="confirmPassword" className="text-blue-300 font-semibold text-sm">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    onBlur={() => handleBlur("confirmPassword")}
                    className={`bg-white border-0 text-black placeholder:text-slate-400 rounded-full pl-4 pr-12 h-14 shadow-lg transition-all duration-300 hover:shadow-xl focus:shadow-2xl focus:scale-[1.02] ${
                      validationErrors.confirmPassword && touched.confirmPassword ? "ring-2 ring-red-500" : ""
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-blue-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {validationErrors.confirmPassword && touched.confirmPassword && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {validationErrors.confirmPassword}
                  </p>
                )}
              </div>

              <Button
                type="button"
                onClick={handleSubmit}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-full h-14 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] border-2 border-blue-400/30"
                disabled={loading}
              >
                {loading ? "Creating account..." : "Sign Up"}
              </Button>
            </div>

            <div className="mt-8 space-y-4">
              <p className="text-center text-sm text-white/60">Or sign up with</p>
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  onClick={handleGoogleSignup}
                  disabled={loading}
                  className="bg-white hover:bg-white/90 border-0 rounded-lg shadow-lg h-12 transition-all duration-300 hover:scale-105 px-6 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
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
                  <span className="text-gray-700 font-medium">
                    {loading ? "Signing up..." : "Google"}
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}