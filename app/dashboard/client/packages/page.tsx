"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Api } from "@/lib/api"
import type { PaginatedResponse } from "@/lib/api-types"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { 
  Camera, 
  Calendar, 
  Clock, 
  Search, 
  Star, 
  MapPin, 
  Zap, 
  Heart, 
  Share2, 
  ArrowUpDown,
  Grid3X3,
  List,
  Eye,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  X,
  Check,
  Package as PackageIcon
} from "lucide-react"

type PackageImage = {
  id: string
  packageId?: string
  url: string
  meta?: any
  createdAt?: string
  order: number
}

type PackageWithPhotographer = {
  id: string
  photographerId: string
  title: string
  description: string
  priceCents: number
  category?: string
  duration?: string
  features?: string[]
  createdAt: string
  updatedAt?: string
  photographer?: {
    id: string
    user?: { name: string }
    state?: { name: string }
    rating?: number
    reviewCount?: number
  }
  images: PackageImage[]
}

type SortOption = "price-low" | "price-high" | "rating" | "popular" | "newest"

export default function ClientPackagesPage() {
  const router = useRouter()
  const [packages, setPackages] = useState<PackageWithPhotographer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [query, setQuery] = useState("")
  const [sortBy, setSortBy] = useState<SortOption>("popular")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [notification, setNotification] = useState<{message: string; type: 'success' | 'error'} | null>(null)
  const [imageIndices, setImageIndices] = useState<Record<string, number>>({})

  const [selectedPackage, setSelectedPackage] = useState<PackageWithPhotographer | null>(null)
  const [viewPackage, setViewPackage] = useState<PackageWithPhotographer | null>(null)
  const [startDate, setStartDate] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endDate, setEndDate] = useState("")
  const [endTime, setEndTime] = useState("")
  const [bookingLoading, setBookingLoading] = useState(false)
  const [showBookingDialog, setShowBookingDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [viewImageIndex, setViewImageIndex] = useState(0)

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }

  useEffect(() => {
    const run = async () => {
      setLoading(true)
      setError("")
      try {
        const res = await Api.get<PaginatedResponse<PackageWithPhotographer>>("/packages?page=1&perPage=50")
        const packagesWithRatings = (res.items || []).map(pkg => ({
          ...pkg,
          photographer: pkg.photographer ? {
            ...pkg.photographer,
            rating: Math.random() * 2 + 3,
            reviewCount: Math.floor(Math.random() * 100) + 10
          } : undefined,
          images: (pkg.images || []).sort((a, b) => a.order - b.order)
        }))
        setPackages(packagesWithRatings)
        
        const indices: Record<string, number> = {}
        packagesWithRatings.forEach((pkg: PackageWithPhotographer) => {
          indices[pkg.id] = 0
        })
        setImageIndices(indices)
      } catch (e: any) {
        setError(e?.message || "Failed to load packages")
        showNotification("Failed to load packages. Please try again later.", "error")
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [])

  const nextImage = (packageId: string, imageCount: number) => {
    setImageIndices(prev => ({
      ...prev,
      [packageId]: (prev[packageId] + 1) % imageCount
    }))
  }

  const prevImage = (packageId: string, imageCount: number) => {
    setImageIndices(prev => ({
      ...prev,
      [packageId]: (prev[packageId] - 1 + imageCount) % imageCount
    }))
  }

  const filteredAndSorted = useMemo(() => {
    let filtered = packages.filter((pkg) => {
      const matchesSearch = query.trim() === "" || 
        pkg.title?.toLowerCase().includes(query.toLowerCase()) ||
        pkg.description?.toLowerCase().includes(query.toLowerCase()) ||
        pkg.photographer?.user?.name?.toLowerCase().includes(query.toLowerCase())
      return matchesSearch
    })

    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.priceCents - b.priceCents)
        break
      case "price-high":
        filtered.sort((a, b) => b.priceCents - a.priceCents)
        break
      case "rating":
        filtered.sort((a, b) => (b.photographer?.rating || 0) - (a.photographer?.rating || 0))
        break
      case "newest":
        filtered.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
        break
    }

    return filtered
  }, [packages, query, sortBy])

  const handleBookNow = async () => {
    const pkg = selectedPackage
    if (!pkg || !pkg.photographerId || !startDate || !startTime || !endDate || !endTime) return

    setBookingLoading(true)
    try {
      const startDateTime = new Date(`${startDate}T${startTime}`)
      const endDateTime = new Date(`${endDate}T${endTime}`)

      if (endDateTime <= startDateTime) {
        showNotification("End date/time must be after start date/time", "error")
        setBookingLoading(false)
        return
      }

      if (startDateTime <= new Date()) {
        showNotification("Please select a future start date and time", "error")
        setBookingLoading(false)
        return
      }

      await Api.post("/bookings", {
        photographerId: pkg.photographerId,
        packageId: pkg.id,
        startAt: startDateTime.toISOString(),
        endAt: endDateTime.toISOString(),
        location: {
          address: pkg.photographer?.state?.name ? `${pkg.photographer.state.name}, Algeria` : "Algeria",
          lat: 36.75,
          lon: 3.06,
        },
      })

      setShowBookingDialog(false)
      setSelectedPackage(null)
      setStartDate("")
      setStartTime("")
      setEndDate("")
      setEndTime("")
      
      showNotification("🎉 Booking confirmed! Your photography session has been scheduled successfully.")
      
      setTimeout(() => {
        router.push("/dashboard/client/bookings")
      }, 1500)
    } catch (e) {
      console.error("Booking failed:", e)
      showNotification("Booking failed. Please try again or contact support.", "error")
    } finally {
      setBookingLoading(false)
    }
  }

  const toggleFavorite = (packageId: string) => {
    const newFavorites = new Set(favorites)
    if (newFavorites.has(packageId)) {
      newFavorites.delete(packageId)
      showNotification("Removed from favorites")
    } else {
      newFavorites.add(packageId)
      showNotification("Added to favorites! ❤️")
    }
    setFavorites(newFavorites)
  }

  const sharePackage = (pkg: PackageWithPhotographer) => {
    if (navigator.share) {
      navigator.share({
        title: pkg.title,
        text: pkg.description,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      showNotification("Package link copied to clipboard! 🔗")
    }
  }

  const PackageSkeleton = () => (
    <Card className="border-2">
      <Skeleton className="h-48 w-full rounded-t-lg" />
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
        <Skeleton className="h-6 w-5/6" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  )

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-2xl border-2 transition-all duration-300 backdrop-blur-sm ${
          notification.type === 'success' 
            ? 'bg-green-50/95 border-green-300 text-green-800' 
            : 'bg-red-50/95 border-red-300 text-red-800'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full animate-pulse ${
              notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
            }`} />
            <span className="font-medium">{notification.message}</span>
            <button 
              onClick={() => setNotification(null)}
              className="ml-4 hover:opacity-70 transition-opacity"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground">
          Discover Photography Packages
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Find the perfect photographer and package for your special moments. 
          From weddings to corporate events, we have you covered.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search packages, photographers, or categories..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 pr-4"
            />
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
              <SelectTrigger className="w-[180px]">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex border rounded-lg">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="px-3"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="px-3"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
          {Array.from({ length: 6 }).map((_, i) => (
            <PackageSkeleton key={i} />
          ))}
        </div>
      )}

      {error && (
        <Card className="p-8 text-center">
          <div className="text-red-600 text-lg font-semibold mb-2">Error Loading Packages</div>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </Card>
      )}

      {!loading && !error && (
        <div className={`gap-6 ${viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "flex flex-col"}`}>
          {filteredAndSorted.map((pkg) => (
            <Card 
              key={pkg.id} 
              className={`border-2 hover:border-primary/50 transition-all duration-300 group relative overflow-hidden hover:shadow-xl ${
                viewMode === "list" ? "flex" : ""
              }`}
            >
              <div className={`relative ${viewMode === "list" ? "w-80" : "w-full"} h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden`}>
                {pkg.images && pkg.images.length > 0 ? (
                  <>
                    <img 
                      src={pkg.images[imageIndices[pkg.id] || 0]?.url} 
                      alt={pkg.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    
                    {pkg.images.length > 1 && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white opacity-0 group-hover:opacity-100 transition-all rounded-full"
                          onClick={(e) => {
                            e.stopPropagation()
                            prevImage(pkg.id, pkg.images.length)
                          }}
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white opacity-0 group-hover:opacity-100 transition-all rounded-full"
                          onClick={(e) => {
                            e.stopPropagation()
                            nextImage(pkg.id, pkg.images.length)
                          }}
                        >
                          <ChevronRight className="h-5 w-5" />
                        </Button>
                        
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full">
                          {pkg.images.map((_, idx) => (
                            <div
                              key={idx}
                              className={`h-1.5 rounded-full transition-all duration-300 ${
                                idx === (imageIndices[pkg.id] || 0)
                                  ? "w-6 bg-white"
                                  : "w-1.5 bg-white/60"
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
                    <ImageIcon className="h-16 w-16 text-gray-400" />
                  </div>
                )}
                
                <div className="absolute top-3 right-3 flex gap-2 z-10">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="bg-white/95 backdrop-blur-sm hover:bg-white hover:scale-110 transition-all duration-200 rounded-full shadow-lg"
                    onClick={(e) => {
                      e.stopPropagation()
                      sharePackage(pkg)
                    }}
                  >
                    <Share2 className="h-4 w-4 text-blue-600" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`backdrop-blur-sm hover:scale-110 transition-all duration-200 rounded-full shadow-lg ${
                      favorites.has(pkg.id) 
                        ? "bg-red-50/95 hover:bg-red-100" 
                        : "bg-white/95 hover:bg-white"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleFavorite(pkg.id)
                    }}
                  >
                    <Heart 
                      className={`h-4 w-4 transition-all duration-200 ${
                        favorites.has(pkg.id) 
                          ? "fill-red-500 text-red-500 scale-110" 
                          : "text-gray-600"
                      }`} 
                    />
                  </Button>
                </div>
              </div>

              <CardContent className={`p-6 space-y-4 ${viewMode === "list" ? "flex-1 flex flex-col" : ""}`}>
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {(pkg.photographer?.user?.name || "P").charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold truncate">{pkg.photographer?.user?.name || "Photographer"}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{pkg.photographer?.state?.name || "Algeria"}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs font-medium">
                        {pkg.photographer?.rating?.toFixed(1) || "4.5"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({pkg.photographer?.reviewCount || 0})
                      </span>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="hover:bg-primary hover:text-white transition-all duration-200 border-2"
                    onClick={() => {
                      setViewPackage(pkg)
                      setViewImageIndex(0)
                      setShowViewDialog(true)
                    }}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-xl mb-1 flex-1">{pkg.title}</h3>
                    {pkg.category && (
                      <Badge variant="secondary" className="ml-2 shrink-0 bg-primary/10 text-primary">
                        {pkg.category}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-3">
                    {pkg.description}
                  </p>

                  {pkg.features && pkg.features.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {pkg.features.slice(0, 3).map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-xs">
                          <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <span className="text-3xl font-bold text-primary">
                      {(pkg.priceCents / 100).toLocaleString()} DA
                    </span>
                    {pkg.duration && (
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <Clock className="h-3 w-3" />
                        {pkg.duration}
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    className="shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    onClick={() => {
                      setSelectedPackage(pkg)
                      setShowBookingDialog(true)
                    }}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Book Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && filteredAndSorted.length === 0 && (
        <Card className="text-center p-12">
          <div className="max-w-md mx-auto space-y-4">
            <Search className="h-12 w-12 text-muted-foreground mx-auto" />
            <div>
              <h3 className="text-lg font-semibold mb-2">No packages found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search criteria to find what you're looking for.
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setQuery("")}
            >
              Clear search
            </Button>
          </div>
        </Card>
      )}

      {/* Package Details Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <PackageIcon className="h-6 w-6 text-primary" />
              Package Details
            </DialogTitle>
          </DialogHeader>
          {viewPackage && (
            <div className="space-y-6">
              {/* Image Gallery */}
              {viewPackage.images && viewPackage.images.length > 0 && (
                <div className="relative h-80 bg-gray-100 rounded-xl overflow-hidden">
                  <img 
                    src={viewPackage.images[viewImageIndex]?.url} 
                    alt={viewPackage.title}
                    className="w-full h-full object-cover"
                  />
                  {viewPackage.images.length > 1 && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full"
                        onClick={() => setViewImageIndex((viewImageIndex - 1 + viewPackage.images.length) % viewPackage.images.length)}
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full"
                        onClick={() => setViewImageIndex((viewImageIndex + 1) % viewPackage.images.length)}
                      >
                        <ChevronRight className="h-6 w-6" />
                      </Button>
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full text-white text-sm">
                        {viewImageIndex + 1} / {viewPackage.images.length}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Package Info */}
              <div className="space-y-4">
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-2xl">{viewPackage.title}</h3>
                    {viewPackage.category && (
                      <Badge className="bg-primary/10 text-primary">
                        {viewPackage.category}
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    {viewPackage.description}
                  </p>
                </div>

                {/* Photographer Info */}
                <Card className="p-4 bg-muted/30">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-14 w-14 ring-2 ring-primary/30">
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback className="bg-primary/20 text-primary font-bold text-lg">
                        {(viewPackage.photographer?.user?.name || "P").charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-bold text-lg">{viewPackage.photographer?.user?.name || "Photographer"}</p>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          <span>{viewPackage.photographer?.state?.name || "Algeria"}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold text-foreground">
                            {viewPackage.photographer?.rating?.toFixed(1) || "4.5"}
                          </span>
                          <span>({viewPackage.photographer?.reviewCount || 0} reviews)</span>
                        </div>
                      </div>
                    </div>
                    <Link href={`/dashboard/client/photographers/${viewPackage.photographerId}`}>
                      <Button variant="outline" size="sm">
                        View Profile
                      </Button>
                    </Link>
                  </div>
                </Card>

                {/* Features */}
                {viewPackage.features && viewPackage.features.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                      <Zap className="h-5 w-5 text-primary" />
                      What's Included
                    </h4>
                    <div className="grid md:grid-cols-2 gap-2">
                      {viewPackage.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm bg-green-50 border border-green-200 rounded-lg p-2">
                          <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <span className="text-green-900">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Price & Duration */}
                <div className="flex items-center justify-between p-4 bg-primary/5 rounded-xl border-2 border-primary/20">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Package Price</p>
                    <p className="text-4xl font-bold text-primary">
                      {(viewPackage.priceCents / 100).toLocaleString()} DA
                    </p>
                  </div>
                  {viewPackage.duration && (
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground mb-1">Duration</p>
                      <div className="flex items-center gap-2 text-lg font-semibold">
                        <Clock className="h-5 w-5 text-primary" />
                        {viewPackage.duration}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <Button 
                    className="flex-1 shadow-lg"
                    onClick={() => {
                      setSelectedPackage(viewPackage)
                      setShowViewDialog(false)
                      setShowBookingDialog(true)
                    }}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Book This Package
                  </Button>
                  <Button
                    variant="outline"
                    className="border-2"
                    onClick={() => sharePackage(viewPackage)}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  <Button
                    variant="outline"
                    className={`border-2 ${
                      favorites.has(viewPackage.id) 
                        ? "border-red-300 bg-red-50 hover:bg-red-100" 
                        : ""
                    }`}
                    onClick={() => toggleFavorite(viewPackage.id)}
                  >
                    <Heart 
                      className={`h-4 w-4 ${
                        favorites.has(viewPackage.id) 
                          ? "fill-red-500 text-red-500" 
                          : ""
                      }`} 
                    />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Enhanced Booking Dialog */}
      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Calendar className="h-6 w-6 text-primary" />
              Complete Your Booking
            </DialogTitle>
          </DialogHeader>
          {selectedPackage && (
            <div className="space-y-6">
              {/* Package Preview with Image */}
              <Card className="overflow-hidden">
                <div className="flex gap-4">
                  {selectedPackage.images && selectedPackage.images.length > 0 ? (
                    <div className="w-32 h-32 flex-shrink-0">
                      <img 
                        src={selectedPackage.images[0]?.url} 
                        alt={selectedPackage.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-32 h-32 flex-shrink-0 bg-primary/10 flex items-center justify-center">
                      <PackageIcon className="h-12 w-12 text-primary/40" />
                    </div>
                  )}
                  
                  <div className="flex-1 p-4">
                    <h4 className="font-bold text-lg mb-1">{selectedPackage.title}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {selectedPackage.description}
                    </p>
                    
                    <div className="space-y-1.5 text-sm">
                      <div className="flex items-center gap-2">
                        <Camera className="h-4 w-4 text-primary" />
                        <span className="font-medium">{selectedPackage.photographer?.user?.name || "Photographer"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span>{selectedPackage.photographer?.state?.name || "Algeria"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">
                          {selectedPackage.photographer?.rating?.toFixed(1) || "4.5"}
                        </span>
                        <span className="text-muted-foreground">
                          ({selectedPackage.photographer?.reviewCount || 0} reviews)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-primary/5 p-4 border-t">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Total Price</p>
                      <p className="text-2xl font-bold text-primary">
                        {(selectedPackage.priceCents / 100).toLocaleString()} DA
                      </p>
                    </div>
                    {selectedPackage.duration && (
                      <Badge className="bg-primary/20 text-primary text-sm px-3 py-1">
                        <Clock className="h-3 w-3 mr-1 inline" />
                        {selectedPackage.duration}
                      </Badge>
                    )}
                  </div>
                </div>
              </Card>

              {/* Features Preview */}
              {selectedPackage.features && selectedPackage.features.length > 0 && (
                <Card className="p-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    Package Includes
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedPackage.features.slice(0, 4).map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  {selectedPackage.features.length > 4 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      + {selectedPackage.features.length - 4} more features
                    </p>
                  )}
                </Card>
              )}

              {/* Date & Time Selection */}
              <div className="space-y-4">
                <div className="space-y-3">
                  <h4 className="font-semibold text-base flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Session Start
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="start-date" className="text-sm font-medium">Date</Label>
                      <Input 
                        id="start-date" 
                        type="date" 
                        value={startDate} 
                        onChange={(e) => setStartDate(e.target.value)} 
                        min={new Date().toISOString().split("T")[0]} 
                        className="text-sm" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="start-time" className="text-sm font-medium">Time</Label>
                      <Input 
                        id="start-time" 
                        type="time" 
                        value={startTime} 
                        onChange={(e) => setStartTime(e.target.value)} 
                        className="text-sm" 
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-base flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Session End
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="end-date" className="text-sm font-medium">Date</Label>
                      <Input 
                        id="end-date" 
                        type="date" 
                        value={endDate} 
                        onChange={(e) => setEndDate(e.target.value)} 
                        min={new Date().toISOString().split("T")[0]} 
                        className="text-sm" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end-time" className="text-sm font-medium">Time</Label>
                      <Input 
                        id="end-time" 
                        type="time" 
                        value={endTime} 
                        onChange={(e) => setEndTime(e.target.value)} 
                        className="text-sm" 
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Booking Summary */}
              <Card className="p-4 bg-blue-50 border-blue-200">
                <h4 className="font-semibold mb-2 text-blue-900">Booking Summary</h4>
                <div className="space-y-1 text-sm text-blue-800">
                  {startDate && startTime && (
                    <p>• Start: {new Date(`${startDate}T${startTime}`).toLocaleString('en-US', { 
                      dateStyle: 'medium', 
                      timeStyle: 'short' 
                    })}</p>
                  )}
                  {endDate && endTime && (
                    <p>• End: {new Date(`${endDate}T${endTime}`).toLocaleString('en-US', { 
                      dateStyle: 'medium', 
                      timeStyle: 'short' 
                    })}</p>
                  )}
                  <p className="font-semibold pt-2 border-t border-blue-300">
                    Total: {(selectedPackage.priceCents / 100).toLocaleString()} DA
                  </p>
                </div>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button 
                  className="flex-1 shadow-lg hover:shadow-xl transition-all duration-300 text-base py-6" 
                  onClick={handleBookNow} 
                  disabled={bookingLoading || !startDate || !startTime || !endDate || !endTime}
                >
                  {bookingLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Check className="h-5 w-5 mr-2" />
                      Confirm Booking
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-2 hover:bg-secondary transition-all duration-300 text-base py-6"
                  onClick={() => {
                    setShowBookingDialog(false)
                    setStartDate("")
                    setStartTime("")
                    setEndDate("")
                    setEndTime("")
                  }}
                  disabled={bookingLoading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}