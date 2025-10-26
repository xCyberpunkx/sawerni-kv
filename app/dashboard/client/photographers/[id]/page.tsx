"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Star, MapPin, Phone, Mail, Camera, Heart, ArrowLeft, MessageCircle, Award, Calendar, Clock, ChevronLeft, ChevronRight, ImageIcon } from "lucide-react"
import { Api } from "@/lib/api"
import { usePhotographerPackages, usePhotographerGallery, usePhotographerCalendar, useToggleFavorite } from "@/lib/hooks"
import Link from "next/link"

interface Photographer {
  id: string
  verified: boolean
  ratingAvg?: number
  ratingCount?: number
  completedBookings?: number
  bio?: string
  phone?: string
  email?: string
  state?: {
    name: string
  }
  services?: Array<{
    name: string
  }>
  tags?: string[]
  user?: {
    name: string
  }
}

interface Review {
  id: string
  rating: number
  text: string
  createdAt: string
}

interface PackageImage {
  id?: string
  packageId?: string
  url: string
  meta?: any
  createdAt?: string
  order: number
}

interface Package {
  id: string
  title: string
  description: string
  priceCents: number
  images?: PackageImage[]
}

interface GalleryImage {
  url: string
}

interface CalendarEvent {
  id: string
  title?: string
  type?: string
  startAt: string
  endAt: string
}

export default function PhotographerProfilePage() {
  const params = useParams()
  const router = useRouter()
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null)
  const [isFavorite, setIsFavorite] = useState(false)
  const [photographer, setPhotographer] = useState<Photographer | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [bookingLoading, setBookingLoading] = useState(false)
  const [startDate, setStartDate] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endDate, setEndDate] = useState("")
  const [endTime, setEndTime] = useState("")
  const [packageImageIndices, setPackageImageIndices] = useState<Record<string, number>>({})
  const [showBookingDialog, setShowBookingDialog] = useState(false)
  
  const id = params.id as string
  const toggleFav = useToggleFavorite()
  const { data: packages = [] } = usePhotographerPackages(id)
  const { data: gallery = [] } = usePhotographerGallery(id)
  const { data: calendar } = usePhotographerCalendar(id)

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return
      
      try {
        const [photographerData, reviewsData] = await Promise.all([
          Api.get<Photographer>(`/photographers/${id}`),
          Api.get<{ items: Review[] }>(`/reviews/photographer/${id}?page=1&perPage=12`)
        ])
        setPhotographer(photographerData)
        setReviews(reviewsData.items || [])
      } catch (e: any) {
        setError(e?.message || "Failed to load photographer")
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [id])

  useEffect(() => {
    // Initialize image indices for packages
    const indices: Record<string, number> = {}
    packages.forEach((pkg: Package) => {
      indices[pkg.id] = 0
    })
    setPackageImageIndices(indices)
  }, [packages])

  const handleToggleFavorite = async () => {
    const nextState = !isFavorite
    setIsFavorite(nextState)
    try {
      await toggleFav.mutateAsync({ photographerId: id, isFav: nextState })
    } catch {
      setIsFavorite(!nextState)
    }
  }

  const nextPackageImage = (pkgId: string, imageCount: number) => {
    setPackageImageIndices(prev => ({
      ...prev,
      [pkgId]: ((prev[pkgId] || 0) + 1) % imageCount
    }))
  }

  const prevPackageImage = (pkgId: string, imageCount: number) => {
    setPackageImageIndices(prev => ({
      ...prev,
      [pkgId]: ((prev[pkgId] || 0) - 1 + imageCount) % imageCount
    }))
  }

  const handleBookNow = async () => {
    if (!photographer || !selectedPackage || !startDate || !startTime || !endDate || !endTime) return
    
    setBookingLoading(true)
    try {
      const startDateTime = new Date(`${startDate}T${startTime}`)
      const endDateTime = new Date(`${endDate}T${endTime}`)
      
      if (endDateTime <= startDateTime) {
        alert("End date/time must be after start date/time")
        setBookingLoading(false)
        return
      }
      
      if (startDateTime <= new Date()) {
        alert("Please select a future start date and time")
        setBookingLoading(false)
        return
      }
      
      const start = startDateTime.toISOString()
      const end = endDateTime.toISOString()
      
      await Api.post("/bookings", {
        photographerId: id,
        packageId: selectedPackage.id,
        startAt: start,
        endAt: end,
        location: { 
          address: photographer.state?.name ? `${photographer.state.name}, Algeria` : "Algeria", 
          lat: 36.75, 
          lon: 3.06 
        },
      })
      
      setShowBookingDialog(false)
      setSelectedPackage(null)
      setStartDate("")
      setStartTime("")
      setEndDate("")
      setEndTime("")
      
      alert("Booking confirmed successfully!")
    } catch (error) {
      console.error("Booking failed:", error)
      alert("Booking failed. Please try again.")
    } finally {
      setBookingLoading(false)
    }
  }

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  if (error || !photographer) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Photographer Not Found</h2>
          <p className="text-muted-foreground mb-4">The photographer you're looking for doesn't exist</p>
          <Link href="/dashboard/client/photographers">
            <Button>Back to Photographers</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="hover:bg-secondary transition-all duration-300"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex-1" />
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggleFavorite}
          className="gap-2 hover:bg-secondary transition-all duration-300"
        >
          <Heart
            className={`h-4 w-4 transition-all duration-300 ${isFavorite ? "fill-red-500 text-red-500" : ""}`}
          />
          {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
        </Button>
      </div>

      <Card className="shadow-xl border-0 bg-gradient-to-r from-card to-secondary/10">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-shrink-0">
              <Avatar className="h-40 w-40 ring-4 ring-primary/20 shadow-2xl">
                <AvatarImage src={"/professional-algerian-businessman-headshot.png"} alt={photographer.user?.name || "Photographer"} />
                <AvatarFallback className="text-3xl bg-primary text-primary-foreground font-bold">
                  {photographer.user?.name?.charAt(0) || "P"}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="flex-1 space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <h1 className="text-4xl font-bold">{photographer.user?.name || "Unknown Photographer"}</h1>
                  <Badge
                    variant={photographer.verified ? "default" : "secondary"}
                    className={`${photographer.verified ? "bg-primary text-primary-foreground" : ""} text-sm px-3 py-1`}
                  >
                    {photographer.verified ? "Verified" : "Unverified"}
                  </Badge>
                </div>

                <div className="flex items-center gap-6 text-muted-foreground mb-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    <span className="font-medium">{photographer.state?.name || "Location not specified"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Camera className="h-5 w-5" />
                    <span className="font-medium">{photographer.services?.[0]?.name || "Photography"}</span>
                  </div>
                </div>

                <div className="flex items-center gap-6 mb-4">
                  <div className="flex items-center gap-2">
                    <Star className="h-6 w-6 fill-accent text-accent" />
                    <span className="font-bold text-lg">{photographer.ratingAvg ?? 0}</span>
                    <span className="text-muted-foreground">({photographer.ratingCount ?? 0} reviews)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    <span className="text-sm text-muted-foreground font-medium">
                      {photographer.completedBookings ?? 0} completed sessions
                    </span>
                  </div>
                </div>

                <p className="text-muted-foreground text-lg leading-relaxed">{photographer.bio || "No biography available."}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {(photographer.tags || []).map((specialty: string) => (
                  <Badge key={specialty} variant="outline" className="bg-primary/5 border-primary/20 text-primary">
                    {specialty}
                  </Badge>
                ))}
              </div>

              <div className="flex gap-3">
                <Button
                  size="lg"
                  className="gap-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <MessageCircle className="h-5 w-5" />
                  Send Message
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="gap-2 border-2 hover:bg-secondary transition-all duration-300 bg-transparent"
                >
                  <Phone className="h-5 w-5" />
                  {photographer.phone || "No phone"}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="shadow-lg border-0">
            <CardHeader className="pb-6">
              <CardTitle className="text-2xl">Available Packages</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {(packages as Package[] || []).map((pkg: Package) => {
                const images = pkg.images || []
                const currentIdx = packageImageIndices[pkg.id] || 0

                return (
                  <Card
                    key={pkg.id}
                    className="border-2 hover:border-primary/50 transition-all duration-300 shadow-lg hover:shadow-xl overflow-hidden"
                  >
                    {images.length > 0 && (
                      <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden group">
                        <img 
                          src={images[currentIdx].url} 
                          alt={pkg.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        
                        {images.length > 1 && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation()
                                prevPackageImage(pkg.id, images.length)
                              }}
                            >
                              <ChevronLeft className="h-5 w-5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation()
                                nextPackageImage(pkg.id, images.length)
                              }}
                            >
                              <ChevronRight className="h-5 w-5" />
                            </Button>
                            
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                              {images.map((_, idx) => (
                                <div
                                  key={idx}
                                  className={`h-1.5 rounded-full transition-all duration-300 ${
                                    idx === currentIdx
                                      ? "w-6 bg-white"
                                      : "w-1.5 bg-white/50"
                                  }`}
                                />
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    )}
                    
                    {images.length === 0 && (
                      <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <ImageIcon className="h-16 w-16 text-gray-400" />
                      </div>
                    )}

                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-bold text-xl mb-2">{pkg.title}</h3>
                          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{pkg.description}</p>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-3xl font-bold text-primary">{(pkg.priceCents/100).toLocaleString()} DA</span>
                        </div>

                        <Dialog open={showBookingDialog && selectedPackage?.id === pkg.id} onOpenChange={setShowBookingDialog}>
                          <DialogTrigger asChild>
                            <Button
                              className="w-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                              onClick={() => setSelectedPackage(pkg)}
                            >
                              Book Now
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle className="text-xl">Confirm Booking</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-6">
                              <div className="p-4 bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl">
                                <h4 className="font-bold text-lg">{selectedPackage?.title}</h4>
                                <p className="text-sm text-muted-foreground">{selectedPackage?.description}</p>
                                <p className="text-2xl font-bold text-primary mt-2">
                                  {selectedPackage && (selectedPackage.priceCents/100).toLocaleString()} DA
                                </p>
                              </div>
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
                                        min={new Date().toISOString().split('T')[0]}
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
                                        min={new Date().toISOString().split('T')[0]}
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
                              
                              <div className="flex gap-3">
                                <Button 
                                  className="flex-1 shadow-lg hover:shadow-xl transition-all duration-300"
                                  onClick={handleBookNow}
                                  disabled={bookingLoading || !startDate || !startTime || !endDate || !endTime}
                                >
                                  {bookingLoading ? "Booking..." : "Continue Booking"}
                                </Button>
                                <Button
                                  variant="outline"
                                  className="flex-1 border-2 hover:bg-secondary transition-all duration-300 bg-transparent"
                                  onClick={() => {
                                    setShowBookingDialog(false)
                                    setSelectedPackage(null)
                                    setStartDate("")
                                    setStartTime("")
                                    setEndDate("")
                                    setEndTime("")
                                  }}
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
                )
              })}
              {(!packages || (packages as Package[] || []).length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No packages available.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0">
            <CardHeader className="pb-6">
              <CardTitle className="text-2xl flex items-center gap-2">
                <Star className="h-6 w-6 text-accent" />
                Reviews & Testimonials
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <div key={review.id} className="border-b pb-6 last:border-b-0">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-5 w-5 ${
                              i < review.rating ? "fill-accent text-accent" : "text-muted-foreground"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground font-medium">
                        {new Date(review.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">{review.text}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Star className="h-16 w-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-semibold mb-2">No reviews yet</p>
                  <p>Be the first to book and leave a review!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="shadow-lg border-0">
            <CardHeader className="pb-6">
              <CardTitle className="text-2xl flex items-center gap-2">
                <Camera className="h-6 w-6 text-primary" />
                Portfolio Gallery
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {(gallery as GalleryImage[] || []).map((img: GalleryImage, index: number) => (
                  <div
                    key={index}
                    className="aspect-square bg-muted rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <img
                      src={img.url || `/portfolio-${(index % 3) + 1}.png`}
                      alt={`Portfolio ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-500 cursor-pointer"
                    />
                  </div>
                ))}
                {(gallery as GalleryImage[] || []).length === 0 && (
                  <div className="col-span-2 text-center py-12 text-muted-foreground">
                    <Camera className="h-16 w-16 mx-auto mb-4 opacity-30" />
                    <p className="text-lg font-semibold mb-2">No portfolio images</p>
                    <p>This photographer hasn't uploaded any portfolio images yet.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0">
            <CardHeader className="pb-6">
              <CardTitle className="text-xl">Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                {((calendar as { items: CalendarEvent[] })?.items || []).map((ev: CalendarEvent) => (
                  <div key={`${ev.id}-${ev.startAt}`} className="flex items-center justify-between p-2 border rounded-md">
                    <span className="font-medium">{ev.title || ev.type || "Event"}</span>
                    <span className="text-muted-foreground text-xs">
                      {new Date(ev.startAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
                {!((calendar as { items: CalendarEvent[] })?.items || []).length && (
                  <div className="text-muted-foreground">No events in the selected range.</div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0">
            <CardHeader className="pb-6">
              <CardTitle className="text-xl">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/30 transition-colors">
                <Phone className="h-5 w-5 text-primary" />
                <span className="font-medium">{photographer.phone || "Not provided"}</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/30 transition-colors">
                <Mail className="h-5 w-5 text-primary" />
                <span className="font-medium">{photographer.email || "Not provided"}</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/30 transition-colors">
                <MapPin className="h-5 w-5 text-primary" />
                <span className="font-medium">{photographer.state?.name || "Location not specified"}, Algeria</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}