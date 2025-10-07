"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"

type Locale = "en" | "ar"

interface I18nContextValue {
  locale: Locale
  setLocale: (l: Locale) => void
  t: (key: string, fallback?: string) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

const STORAGE_KEY = "sawerni_locale"

const MESSAGES: Record<Locale, Record<string, string>> = {
  en: {
    dashboard: "Dashboard",
    packages: "Packages",
    portfolio: "Portfolio",
    bookings: "Bookings",
    calendar: "Calendar",
    messages: "Messages",
    reviews: "Reviews",
    profile: "Profile",
    notifications: "Notifications",
  },
  ar: {
    dashboard: "لوحة التحكم",
    packages: "الباقات",
    portfolio: "الأعمال",
    bookings: "الحجوزات",
    calendar: "التقويم",
    messages: "الرسائل",
    reviews: "التقييمات",
    profile: "الملف الشخصي",
    notifications: "الإشعارات",
  },
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en")

  useEffect(() => {
    const stored = typeof window !== "undefined" ? (localStorage.getItem(STORAGE_KEY) as Locale | null) : null
    if (stored === "en" || stored === "ar") setLocaleState(stored)
  }, [])

  const setLocale = (l: Locale) => {
    setLocaleState(l)
    if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, l)
    // set html dir
    if (typeof document !== "undefined") document.documentElement.dir = l === "ar" ? "rtl" : "ltr"
  }

  const t = (key: string, fallback?: string) => MESSAGES[locale][key] || fallback || key

  const value = useMemo(() => ({ locale, setLocale, t }), [locale])
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error("I18nProvider missing")
  return ctx
}


