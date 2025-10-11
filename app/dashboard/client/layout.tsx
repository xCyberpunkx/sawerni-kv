import type React from "react"
import { ClientSidebar } from "@/components/client-sidebar"

export default function ClientDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background flex">
      <ClientSidebar />
      <main className="w-full">{children}</main>
    </div>
  )
}
