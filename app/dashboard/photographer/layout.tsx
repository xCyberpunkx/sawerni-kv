import type React from "react"
import { PhotographerSidebar } from "@/components/photographer-sidebar"

export default function PhotographerDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background flex">
      <PhotographerSidebar />
      <main className="flex-1 md:mr-80">{children}</main>
    </div>
  )
}
