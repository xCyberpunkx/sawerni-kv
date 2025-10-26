"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  LayoutDashboard,
  Users,
  Settings as SettingsIcon,
  Tags,
  BarChart3,
  AlertTriangle,
  LogOut,
  Bell,
  Menu,
  X,
  Shield,
  Cog,
  Sliders,
} from "lucide-react"
import { mockAuth } from "@/lib/auth"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Dashboard", href: "/dashboard/admin", icon: LayoutDashboard },
  { name: "Users", href: "/dashboard/admin/users", icon: Users },
  { name: "Services", href: "/dashboard/admin/services", icon: Sliders },
  { name: "Categories", href: "/dashboard/admin/categories", icon: Tags },
  { name: "Stats", href: "/dashboard/admin/stats", icon: BarChart3 },
  { name: "Issues", href: "/dashboard/admin/issues", icon: AlertTriangle, badge: 3 },
  { name: "Settings", href: "/dashboard/admin/settings", icon: Cog },
]

interface AdminSidebarProps {
  className?: string
}

export function AdminSidebar({ className }: AdminSidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const pathname = usePathname()
  const user = mockAuth.getCurrentUser()

  const handleLogout = () => {
    mockAuth.logout()
    window.location.href = "/"
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* User Profile */}
      <Link href="/dashboard/admin/settings">
        <div className="p-6 border-b cursor-pointer hover:bg-secondary/30 transition-colors">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user?.avatar || "/placeholder.svg"} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {user?.name?.charAt(0) || "A"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <div className="flex items-center gap-1 mt-1">
                <Shield className="h-3 w-3 text-primary" />
                <span className="text-xs text-muted-foreground">Administrator</span>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={(e) => e.preventDefault()}>
              <Bell className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Link>

      {/* Quick Stats */}
      <div className="p-4 border-b">
            <div className="grid grid-cols-2 gap-3 text-center">
          <div className="p-2 bg-primary/5 rounded-lg">
            <div className="text-lg font-bold text-primary">156</div>
                <div className="text-xs text-muted-foreground">Active users</div>
          </div>
          <div className="p-2 bg-accent/5 rounded-lg">
            <div className="text-lg font-bold text-accent">89</div>
                <div className="text-xs text-muted-foreground">Bookings today</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link key={item.name} href={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 h-12",
                  isActive && "bg-primary/10 text-primary hover:bg-primary/15",
                )}
                onClick={() => setIsMobileOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                <span className="flex-1 text-right">{item.name}</span>
                {item.badge && (
                  <Badge variant="secondary" className="bg-destructive text-destructive-foreground">
                    {item.badge}
                  </Badge>
                )}
              </Button>
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t">
        <Button variant="ghost" className="w-full justify-start gap-3 h-12" onClick={handleLogout}>
          <LogOut className="h-5 w-5" />
          <span className="flex-1 text-right">Log out</span>
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        className="md:hidden fixed top-4 right-4 z-50"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile Sidebar */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-background/80 backdrop-blur-sm">
          <div className="fixed right-0 top-0 h-full w-80 bg-background border-l shadow-lg">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className={cn("hidden md:flex flex-col w-80 bg-sidebar border-l", className)}>
        <SidebarContent />
      </div>
    </>
  )
}
