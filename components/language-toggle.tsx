"use client"

import { Button } from "@/components/ui/button"
import { Globe } from "lucide-react"
import { useI18n } from "@/lib/i18n"

export function LanguageToggle() {
  const { locale, setLocale } = useI18n()
  const next = locale === "en" ? "ar" : "en"
  return (
    <Button variant="ghost" size="sm" className="gap-2" aria-label="Language" onClick={() => setLocale(next)}>
      <Globe className="h-4 w-4" />
      {locale === "en" ? "English" : "العربية"}
    </Button>
  )
}
