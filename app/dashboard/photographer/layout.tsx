import type React from "react"
import { PhotographerSidebar } from "@/components/photographer-sidebar"
import { mockAuth } from "@/lib/auth"

export default function PhotographerDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = mockAuth.getCurrentUser()
  const role = (user?.role || "").toString().toUpperCase()

  if (!user) {
    return <div className="p-6">Authentication required.</div>
  }

  if (role !== "PHOTOGRAPHER") {
    return <div className="p-6">Forbidden: photographer access only.</div>
  }
  return (
    <div className="min-h-screen bg-background flex">
      <PhotographerSidebar />
      <main className="flex-1 md:mr-80">{children}</main>
    </div>
  )
}
