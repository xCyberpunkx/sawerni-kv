"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Globe } from "lucide-react"

export function LanguageToggle() {
  const [language, setLanguage] = useState<"ar" | "en">("ar")

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "ar" ? "en" : "ar"))
  }

  return (
    <Button variant="ghost" size="sm" onClick={toggleLanguage} className="gap-2">
      <Globe className="h-4 w-4" />
      {language === "ar" ? "English" : "العربية"}
    </Button>
  )
}
