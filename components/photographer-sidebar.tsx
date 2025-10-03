"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  LayoutDashboard,
  Package,
  Camera,
  Calendar,
  MessageCircle,
  Star,
  User,
  LogOut,
  Bell,
  Menu,
  X,
} from "lucide-react"
import { mockAuth } from "@/lib/auth"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Dashboard", href: "/dashboard/photographer", icon: LayoutDashboard },
  { name: "Packages", href: "/dashboard/photographer/packages", icon: Package },
  { name: "Portfolio", href: "/dashboard/photographer/portfolio", icon: Camera },
  { name: "Bookings", href: "/dashboard/photographer/bookings", icon: Calendar, badge: 2 },
  { name: "Calendar", href: "/dashboard/photographer/calendar", icon: Calendar },
  { name: "Messages", href: "/dashboard/photographer/messages", icon: MessageCircle, badge: 5 },
  { name: "Reviews", href: "/dashboard/photographer/reviews", icon: Star },
  { name: "Profile", href: "/dashboard/photographer/profile", icon: User },
]

interface PhotographerSidebarProps {
  className?: string
}

export function PhotographerSidebar({ className }: PhotographerSidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const pathname = usePathname()
  const [user, setUser] = useState(mockAuth.getCurrentUser())

  useEffect(() => {
    if (!user) {
      mockAuth.loadCurrentUser().then(setUser)
    }
    const unsub = mockAuth.onAuthChange(setUser)
    return unsub
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleLogout = () => {
    mockAuth.logout()
    window.location.href = "/"
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-card">
      <div className="p-6 border-b border-border bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="h-14 w-14 ring-2 ring-primary/20">
              <AvatarImage src={user?.avatar || "/placeholder.svg"} />
              <AvatarFallback className="bg-primary text-primary-foreground text-lg font-semibold">
                {user?.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary rounded-full border-2 border-background"></div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-lg font-semibold truncate">{user?.name}</p>
            <p className="text-sm text-muted-foreground truncate">{user?.serviceType}</p>
            <div className="flex items-center gap-1 mt-1">
              <Star className="h-4 w-4 fill-accent text-accent" />
              <span className="text-sm font-semibold text-accent">4.8</span>
              <Badge variant="secondary" className="ml-2 text-xs bg-accent/10 text-accent">
                Pro
              </Badge>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="hover:bg-primary/10">
            <Bell className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="p-4 border-b border-border bg-secondary/20">
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="p-3 bg-primary/10 rounded-xl hover:bg-primary/15 transition-colors">
            <div className="text-2xl font-bold text-primary">45</div>
            <div className="text-xs text-muted-foreground font-medium">Completed</div>
          </div>
          <div className="p-3 bg-accent/10 rounded-xl hover:bg-accent/15 transition-colors">
            <div className="text-2xl font-bold text-accent">4.8</div>
            <div className="text-xs text-muted-foreground font-medium">Rating</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link key={item.name} href={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 h-12 transition-all duration-200 hover:scale-105",
                  isActive && "bg-primary/10 text-primary hover:bg-primary/15 shadow-sm",
                  !isActive && "hover:bg-secondary/50",
                )}
                onClick={() => setIsMobileOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                <span className="flex-1 text-left font-medium">{item.name}</span>
                {item.badge && <Badge className="bg-accent text-accent-foreground animate-pulse">{item.badge}</Badge>}
              </Button>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-border bg-muted/30">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 h-12 hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          <span className="flex-1 text-left font-medium">Sign Out</span>
        </Button>
      </div>
    </div>
  )

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="md:hidden fixed top-4 left-4 z-50 bg-background/80 backdrop-blur-sm shadow-lg"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile Sidebar */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-background/80 backdrop-blur-sm animate-fade-in-up">
          <div className="fixed left-0 top-0 h-full w-80 bg-background border-r shadow-xl animate-slide-in-left">
            <SidebarContent />
          </div>
        </div>
      )}

      <div className={cn("hidden md:flex flex-col w-80 bg-card border-r border-border shadow-sm", className)}>
        <SidebarContent />
      </div>
    </>
  )
}
