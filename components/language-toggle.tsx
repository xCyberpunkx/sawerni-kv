"use client"

import { Button } from "@/components/ui/button"
import { Globe } from "lucide-react"

export function LanguageToggle() {
  return (
    <Button variant="ghost" size="sm" className="gap-2" aria-label="Language">
      <Globe className="h-4 w-4" />
      English
    </Button>
  )
}
