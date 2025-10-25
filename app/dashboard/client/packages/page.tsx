"use client"

import { useEffect, useMemo, useState } from "react"
import { Api } from "@/lib/api"
import type { PaginatedResponse, PackageModel, PhotographerModel } from "@/lib/api-types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
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
  Eye
} from "lucide-react"

type PackageWithPhotographer = PackageModel & { 
  photographer?: PhotographerModel & {
    rating?: number;
    reviewCount?: number;
  }
}

type SortOption = "price-low" | "price-high" | "rating" | "popular" | "newest"

export default function ClientPackagesPage() {
  const [packages, setPackages] = useState<PackageWithPhotographer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [query, setQuery] = useState("")
  const [sortBy, setSortBy] = useState<SortOption>("popular")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [recentlyViewed, setRecentlyViewed] = useState<Set<string>>(new Set())
  const [notification, setNotification] = useState<{message: string; type: 'success' | 'error'} | null>(null)

  // Booking dialog state
  const [selectedPackage, setSelectedPackage] = useState<PackageWithPhotographer | null>(null)
  const [startDate, setStartDate] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endDate, setEndDate] = useState("")
  const [endTime, setEndTime] = useState("")
  const [bookingLoading, setBookingLoading] = useState(false)
  const [showBookingDialog, setShowBookingDialog] = useState(false)

  // Show notification
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
        // Add mock ratings for demonstration
        const packagesWithRatings = (res.items || []).map(pkg => ({
          ...pkg,
          photographer: pkg.photographer ? {
            ...pkg.photographer,
            rating: Math.random() * 2 + 3, // Random rating between 3-5
            reviewCount: Math.floor(Math.random() * 100) + 10
          } : undefined
        }))
        setPackages(packagesWithRatings)
      } catch (e: any) {
        setError(e?.message || "Failed to load packages")
        showNotification("Failed to load packages. Please try again later.", "error")
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [])

  // Filter and sort packages
  const filteredAndSorted = useMemo(() => {
    let filtered = packages.filter((pkg) => {
      const matchesSearch = query.trim() === "" || 
        pkg.title?.toLowerCase().includes(query.toLowerCase()) ||
        pkg.description?.toLowerCase().includes(query.toLowerCase()) ||
        pkg.photographer?.user?.name?.toLowerCase().includes(query.toLowerCase())

      return matchesSearch
    })

    // Sort packages
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
      case "popular":
      default:
        // Default sorting - could be based on views, bookings, etc.
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

      const start = startDateTime.toISOString()
      const end = endDateTime.toISOString()

      await Api.post("/bookings", {
        photographerId: pkg.photographerId,
        packageId: pkg.id,
        startAt: start,
        endAt: end,
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
      showNotification("Package removed from your favorites")
    } else {
      newFavorites.add(packageId)
      showNotification("Package saved to your favorites!")
    }
    setFavorites(newFavorites)
  }

  const addToRecentlyViewed = (packageId: string) => {
    const newRecentlyViewed = new Set(recentlyViewed)
    newRecentlyViewed.add(packageId)
    setRecentlyViewed(newRecentlyViewed)
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
      showNotification("Package link copied to clipboard")
    }
  }

  // Skeleton loader
  const PackageSkeleton = () => (
    <Card className="border-2">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-6 w-5/6" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-24" />
        </div>
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  )

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Custom Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border transition-all duration-300 ${
          notification.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
            }`} />
            <span className="font-medium">{notification.message}</span>
            <button 
              onClick={() => setNotification(null)}
              className="ml-4 hover:opacity-70"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          Discover Photography Packages
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Find the perfect photographer and package for your special moments. 
          From weddings to corporate events, we have you covered.
        </p>
      </div>

      {/* Search and Controls */}
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

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center p-4">
          <div className="text-2xl font-bold text-primary">{filteredAndSorted.length}</div>
          <div className="text-sm text-muted-foreground">Total Packages</div>
        </Card>
        <Card className="text-center p-4">
          <div className="text-2xl font-bold text-green-600">
            {Array.from(new Set(filteredAndSorted.map(p => p.photographerId))).length}
          </div>
          <div className="text-sm text-muted-foreground">Photographers</div>
        </Card>
        <Card className="text-center p-4">
          <div className="text-2xl font-bold text-purple-600">
            {favorites.size}
          </div>
          <div className="text-sm text-muted-foreground">Favorites</div>
        </Card>
        <Card className="text-center p-4">
          <div className="text-2xl font-bold text-orange-600">
            {recentlyViewed.size}
          </div>
          <div className="text-sm text-muted-foreground">Recently Viewed</div>
        </Card>
      </div>

      {/* Results */}
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
              className={`border-2 hover:border-primary/50 transition-all duration-300 group relative overflow-hidden ${
                viewMode === "list" ? "flex" : ""
              }`}
            >
              {/* Favorite Button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm"
                onClick={() => toggleFavorite(pkg.id!)}
              >
                <Heart 
                  className={`h-4 w-4 ${
                    favorites.has(pkg.id!) ? "fill-red-500 text-red-500" : ""
                  }`} 
                />
              </Button>

              {/* Share Button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-3 right-12 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm"
                onClick={() => sharePackage(pkg)}
              >
                <Share2 className="h-4 w-4" />
              </Button>

              <CardContent className={`p-6 space-y-4 ${viewMode === "list" ? "flex-1 flex flex-col" : ""}`}>
                {/* Photographer Info */}
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
                  <Link href={`/dashboard/client/photographers/${pkg.photographerId}`}>
                    <Button variant="ghost" size="sm" className="hover:bg-secondary">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </Link>
                </div>

                {/* Package Details */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-xl mb-1 flex-1">{pkg.title}</h3>
                    {pkg.category && (
                      <Badge variant="secondary" className="ml-2 shrink-0">
                        {pkg.category}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-3">
                    {pkg.description}
                  </p>

                  {/* Features */}
                  {pkg.features && pkg.features.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {pkg.features.slice(0, 3).map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-xs">
                          <Zap className="h-3 w-3 text-green-500" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Price and Action */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <span className="text-3xl font-bold text-primary">
                      {(pkg.priceCents / 100).toLocaleString()} DA
                    </span>
                    {pkg.duration && (
                      <div className="text-xs text-muted-foreground">
                        {pkg.duration} session
                      </div>
                    )}
                  </div>
                  
                  <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
                    <DialogTrigger asChild>
                      <Button 
                        className="shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                        onClick={() => {
                          setSelectedPackage(pkg)
                          addToRecentlyViewed(pkg.id!)
                        }}
                      >
                        Book Now
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="text-xl">Confirm Booking</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-6">
                        {/* Package Summary */}
                        <div className="p-4 bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl">
                          <h4 className="font-bold text-lg">{selectedPackage?.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{selectedPackage?.description}</p>
                          <p className="text-2xl font-bold text-primary mt-2">
                            {selectedPackage && (selectedPackage.priceCents / 100).toLocaleString()} DA
                          </p>
                          <div className="mt-3 space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <Camera className="h-4 w-4" />
                              <span>{selectedPackage?.photographer?.user?.name || "Photographer"}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="h-4 w-4" />
                              <span>{selectedPackage?.photographer?.state?.name || "Algeria"}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span>
                                {selectedPackage?.photographer?.rating?.toFixed(1) || "4.5"} 
                                ({selectedPackage?.photographer?.reviewCount || 0} reviews)
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Booking Form */}
                        <div className="space-y-4">
                          <div className="space-y-3">
                            <h4 className="font-semibold text-sm text-primary flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              Start Date & Time
                            </h4>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-2">
                                <Label htmlFor="start-date" className="text-xs font-medium">
                                  Date
                                </Label>
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
                                <Label htmlFor="start-time" className="text-xs font-medium">
                                  Time
                                </Label>
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
                            <h4 className="font-semibold text-sm text-primary flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              End Date & Time
                            </h4>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-2">
                                <Label htmlFor="end-date" className="text-xs font-medium">
                                  Date
                                </Label>
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
                                <Label htmlFor="end-time" className="text-xs font-medium">
                                  Time
                                </Label>
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

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                          <Button 
                            className="flex-1 shadow-lg hover:shadow-xl transition-all duration-300" 
                            onClick={handleBookNow} 
                            disabled={bookingLoading || !startDate || !startTime || !endDate || !endTime}
                          >
                            {bookingLoading ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                Booking...
                              </>
                            ) : (
                              "Continue Booking"
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            className="flex-1 border-2 hover:bg-secondary transition-all duration-300 bg-transparent"
                            onClick={() => setShowBookingDialog(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
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
              onClick={() => {
                setQuery("")
              }}
            >
              Clear search
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}