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
    // Navigation
    dashboard: "Dashboard",
    packages: "Packages",
    portfolio: "Portfolio",
    bookings: "Bookings",
    calendar: "Calendar",
    messages: "Messages",
    reviews: "Reviews",
    profile: "Profile",
    notifications: "Notifications",
    settings: "Settings",
    photographers: "Photographers",
    favorites: "Favorites",
    contracts: "Contracts",
    users: "Users",
    services: "Services",
    categories: "Categories",
    stats: "Statistics",
    issues: "Issues",
    // Common
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    create: "Create",
    search: "Search",
    loading: "Loading...",
    error: "Error",
    success: "Success",
    // Settings
    darkMode: "Dark Mode",
    language: "Language",
    emailNotifications: "Email Notifications",
    pushNotifications: "Push Notifications",
    marketingEmails: "Marketing Emails",
    privacy: "Privacy",
    appearance: "Appearance",
  },
  ar: {
    // Navigation
    dashboard: "لوحة التحكم",
    packages: "الباقات",
    portfolio: "الأعمال",
    bookings: "الحجوزات",
    calendar: "التقويم",
    messages: "الرسائل",
    reviews: "التقييمات",
    profile: "الملف الشخصي",
    notifications: "الإشعارات",
    settings: "الإعدادات",
    photographers: "المصورون",
    favorites: "المفضلة",
    contracts: "العقود",
    users: "المستخدمون",
    services: "الخدمات",
    categories: "الفئات",
    stats: "الإحصائيات",
    issues: "المشاكل",
    // Common
    save: "حفظ",
    cancel: "إلغاء",
    delete: "حذف",
    edit: "تعديل",
    create: "إنشاء",
    search: "بحث",
    loading: "جاري التحميل...",
    error: "خطأ",
    success: "نجح",
    // Settings
    darkMode: "الوضع الداكن",
    language: "اللغة",
    emailNotifications: "إشعارات البريد الإلكتروني",
    pushNotifications: "الإشعارات المنبثقة",
    marketingEmails: "رسائل التسويق",
    privacy: "الخصوصية",
    appearance: "المظهر",
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


