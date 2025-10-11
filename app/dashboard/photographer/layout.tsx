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
      <main className="w-full">{children}</main>
    </div>
  )
}
