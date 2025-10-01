"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Star, MapPin, Phone, Mail, Camera, Heart, ArrowLeft, MessageCircle, CheckCircle, Award } from "lucide-react"
import { Api } from "@/lib/api"
import Link from "next/link"

export default function PhotographerProfilePage() {
  const params = useParams()
  const router = useRouter()
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null)
  const [isFavorite, setIsFavorite] = useState(false)
  const [photographer, setPhotographer] = useState<any | null>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const run = async () => {
      const id = params.id as string
      try {
        const p = await Api.get<any>(`/photographers/${id}`)
        setPhotographer(p)
        const r = await Api.get<any>(`/reviews/photographer/${id}?page=1&perPage=12`)
        setReviews(r.items || [])
      } catch (e: any) {
        setError(e?.message || "Failed to load photographer")
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [params.id])

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
      <div className="flex items-center gap-4 animate-fade-in-up">
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
          onClick={() => setIsFavorite(!isFavorite)}
          className="gap-2 hover:bg-secondary transition-all duration-300"
        >
          <Heart
            className={`h-4 w-4 transition-all duration-300 ${isFavorite ? "fill-red-500 text-red-500 animate-pulse" : ""}`}
          />
          {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
        </Button>
      </div>

      <Card className="shadow-xl border-0 bg-gradient-to-r from-card to-secondary/10 animate-fade-in-up animate-delay-100">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-shrink-0">
              <Avatar className="h-40 w-40 ring-4 ring-primary/20 shadow-2xl animate-glow">
                <AvatarImage src={"/professional-algerian-businessman-headshot.png"} />
                <AvatarFallback className="text-3xl bg-primary text-primary-foreground font-bold">
                  {photographer.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="flex-1 space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <h1 className="text-4xl font-bold">{photographer.user?.name}</h1>
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
                    <span className="font-medium">{photographer.state?.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Camera className="h-5 w-5" />
                    <span className="font-medium">{photographer.services?.[0]?.name}</span>
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
                      {photographer.completedBookings} completed sessions
                    </span>
                  </div>
                </div>

                <p className="text-muted-foreground text-lg leading-relaxed">{photographer.bio}</p>
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
                  {photographer.phone}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="shadow-lg border-0 animate-fade-in-up animate-delay-200">
            <CardHeader className="pb-6">
              <CardTitle className="text-2xl flex items-center gap-2">
                <Camera className="h-6 w-6 text-primary" />
                Portfolio Gallery
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {(photographer.portfolios?.[0]?.images || []).map((img: any, index: number) => (
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
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 animate-fade-in-up animate-delay-300">
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
          <Card className="shadow-lg border-0 animate-fade-in-up animate-delay-400">
            <CardHeader className="pb-6">
              <CardTitle className="text-2xl">Available Packages</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {photographer.packages.map((pkg) => (
                <Card
                  key={pkg.id}
                  className="border-2 hover:border-primary/50 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-bold text-xl mb-2">{pkg.name}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{pkg.description}</p>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-3xl font-bold text-primary">{pkg.price.toLocaleString()} DA</span>
                        <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
                          {pkg.duration}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        {pkg.includes.map((item, index) => (
                          <div key={index} className="flex items-center gap-3 text-sm">
                            <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            className="w-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                            onClick={() => setSelectedPackage(pkg.id)}
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
                              <h4 className="font-bold text-lg">{pkg.name}</h4>
                              <p className="text-sm text-muted-foreground">{pkg.description}</p>
                              <p className="text-2xl font-bold text-primary mt-2">{pkg.price.toLocaleString()} DA</p>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              You'll be redirected to complete your booking and payment.
                            </p>
                            <div className="flex gap-3">
                              <Button className="flex-1 shadow-lg hover:shadow-xl transition-all duration-300">
                                Continue Booking
                              </Button>
                              <Button
                                variant="outline"
                                className="flex-1 border-2 hover:bg-secondary transition-all duration-300 bg-transparent"
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
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 animate-fade-in-up animate-delay-500">
            <CardHeader className="pb-6">
              <CardTitle className="text-xl">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/30 transition-colors">
                <Phone className="h-5 w-5 text-primary" />
                <span className="font-medium">{photographer.phone}</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/30 transition-colors">
                <Mail className="h-5 w-5 text-primary" />
                <span className="font-medium">{photographer.email}</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/30 transition-colors">
                <MapPin className="h-5 w-5 text-primary" />
                <span className="font-medium">{photographer.state}, Algeria</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
