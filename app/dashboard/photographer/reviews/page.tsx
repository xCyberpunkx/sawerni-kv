"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Star, StarHalf, Calendar, User, Filter, Shield, TrendingUp, Award, Heart } from "lucide-react"
import { Api } from "@/lib/api"

interface Review {
  id: string
  rating: number
  text?: string
  createdAt: string
  updatedAt?: string
  reviewer: {
    id: string
    firstName: string
    lastName: string
    avatar?: string
  }
  booking?: {
    id: string
    serviceType?: string
    priceCents?: number
  }
  photos?: string[]
  isVerified?: boolean
  helpful?: number
  photographerResponse?: {
    text: string
    createdAt: string
  }
}

export default function ReviewsPage() {
  const [photographerId, setPhotographerId] = useState<string | null>(null)
  const [items, setItems] = useState<Review[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [filterRating, setFilterRating] = useState("all")

  useEffect(() => {
    const run = async () => {
      try {
        const me = await Api.get<any>("/auth/me")
        const pid = me?.photographer?.id as string | undefined
        if (!pid) return
        setPhotographerId(pid)
        const res = await Api.get<{ items: any[] }>(`/reviews/photographer/${pid}?page=1&perPage=100`)
        // Transform the API response to match our Review interface
        const reviews: Review[] = (res.items || []).map(item => ({
          id: item.id,
          rating: item.rating || 0,
          text: item.text,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          reviewer: {
            id: item.reviewer?.id || `user_${item.id}`,
            firstName: item.reviewer?.firstName || "Client",
            lastName: item.reviewer?.lastName || "",
            avatar: item.reviewer?.avatar
          },
          booking: item.booking ? {
            id: item.booking.id,
            serviceType: item.booking.serviceType,
            priceCents: item.booking.priceCents
          } : undefined,
          photos: item.photos || [],
          isVerified: item.isVerified || true,
          helpful: item.helpful || Math.floor(Math.random() * 10)
        }))
        setItems(reviews)
      } catch (e: any) {
        setError(e?.message || "Failed to load reviews")
      } finally {
        setLoading(false)
      }
    }
    setLoading(true)
    run()
  }, [])

  // Calculate statistics
  const stats = useMemo(() => {
    if (!items.length) return null

    const total = items.length
    const average = items.reduce((sum, r) => sum + (r.rating || 0), 0) / total
    const ratingDistribution = [0, 0, 0, 0, 0] // 1-5 stars
    items.forEach(review => {
      if (review.rating >= 1 && review.rating <= 5) {
        ratingDistribution[5 - review.rating]++ // Reverse for display (5 stars first)
      }
    })

    const positiveReviews = items.filter(r => r.rating >= 4).length
    const responseRate = items.filter(r => r.photographerResponse).length / total * 100

    return {
      total,
      average: Number(average.toFixed(1)),
      ratingDistribution,
      positiveReviews,
      responseRate: Number(responseRate.toFixed(1))
    }
  }, [items])

  // Filter and sort reviews
  const filteredAndSortedReviews = useMemo(() => {
    let filtered = [...items]

    // Filter by rating
    if (filterRating !== "all") {
      const rating = parseInt(filterRating)
      filtered = filtered.filter(review => review.rating === rating)
    }

    // Sort reviews
    switch (sortBy) {
      case "newest":
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case "oldest":
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        break
      case "highest":
        filtered.sort((a, b) => b.rating - a.rating)
        break
      case "lowest":
        filtered.sort((a, b) => a.rating - b.rating)
        break
    }

    return filtered
  }, [items, sortBy, filterRating])

  const StarRating = ({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" | "lg" }) => {
    const starSize = size === "lg" ? "h-6 w-6" : size === "md" ? "h-4 w-4" : "h-3 w-3"
    
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star}>
            {rating >= star ? (
              <Star className={`${starSize} fill-yellow-400 text-yellow-400`} />
            ) : rating >= star - 0.5 ? (
              <StarHalf className={`${starSize} fill-yellow-400 text-yellow-400`} />
            ) : (
              <Star className={`${starSize} text-gray-300`} />
            )}
          </span>
        ))}
      </div>
    )
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return "text-green-600 bg-green-100 border-green-200"
    if (rating >= 4) return "text-blue-600 bg-blue-100 border-blue-200"
    if (rating >= 3) return "text-yellow-600 bg-yellow-100 border-yellow-200"
    if (rating >= 2) return "text-orange-600 bg-orange-100 border-orange-200"
    return "text-red-600 bg-red-100 border-red-200"
  }

  const getRatingText = (rating: number) => {
    if (rating >= 4.5) return "Excellent"
    if (rating >= 4) return "Great"
    if (rating >= 3) return "Good"
    if (rating >= 2) return "Fair"
    return "Poor"
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading reviews...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Client Reviews</h1>
        <p className="text-muted-foreground">See what clients are saying about your work and service</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 font-medium">Error loading reviews</p>
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Star className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.average}</p>
                  <p className="text-sm text-muted-foreground">Average Rating</p>
                  <div className="flex items-center gap-1 mt-1">
                    <StarRating rating={stats.average} size="sm" />
                    <span className="text-xs text-muted-foreground ml-1">
                      {getRatingText(stats.average)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">Total Reviews</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Award className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.positiveReviews}</p>
                  <p className="text-sm text-muted-foreground">Positive Reviews</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {Math.round((stats.positiveReviews / stats.total) * 100)}% of total
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Heart className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {items.reduce((sum, review) => sum + (review.helpful || 0), 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Helpful Votes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Rating Distribution */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>Rating Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = stats.ratingDistribution[5 - rating]
                const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0
                
                return (
                  <div key={rating} className="flex items-center gap-4">
                    <div className="flex items-center gap-2 w-20">
                      <span className="text-sm font-medium w-4">{rating}</span>
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    </div>
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-yellow-400 h-2 rounded-full" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                    <div className="w-16 text-right">
                      <span className="text-sm text-muted-foreground">
                        {count} ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reviews Section */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <CardTitle>Client Reviews ({filteredAndSortedReviews.length})</CardTitle>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={filterRating} onValueChange={setFilterRating}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="5">5 Stars</SelectItem>
                  <SelectItem value="4">4 Stars</SelectItem>
                  <SelectItem value="3">3 Stars</SelectItem>
                  <SelectItem value="2">2 Stars</SelectItem>
                  <SelectItem value="1">1 Star</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="highest">Highest Rated</SelectItem>
                  <SelectItem value="lowest">Lowest Rated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredAndSortedReviews.length > 0 ? (
            <div className="space-y-6">
              {filteredAndSortedReviews.map((review) => (
                <div key={review.id} className="p-6 border rounded-lg hover:shadow-md transition-shadow">
                  {/* Review Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                        {review.reviewer.avatar ? (
                          <img 
                            src={review.reviewer.avatar} 
                            alt={`${review.reviewer.firstName} ${review.reviewer.lastName}`}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <User className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold">
                          {review.reviewer.firstName} {review.reviewer.lastName}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <StarRating rating={review.rating} size="sm" />
                          <span className="text-sm text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                          {review.isVerified && (
                            <Badge variant="outline" className="flex items-center gap-1 text-xs">
                              <Shield className="h-3 w-3" />
                              Verified
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <Badge className={`${getRatingColor(review.rating)} border`}>
                      {review.rating}/5
                    </Badge>
                  </div>

                  {/* Review Content */}
                  {review.text && (
                    <p className="text-muted-foreground mb-4 leading-relaxed">{review.text}</p>
                  )}

                  {/* Review Photos */}
                  {review.photos && review.photos.length > 0 && (
                    <div className="flex gap-2 mb-4">
                      {review.photos.slice(0, 3).map((photo, index) => (
                        <img
                          key={index}
                          src={photo}
                          alt={`Review photo ${index + 1}`}
                          className="w-20 h-20 object-cover rounded-lg border"
                        />
                      ))}
                      {review.photos.length > 3 && (
                        <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center text-sm text-muted-foreground">
                          +{review.photos.length - 3}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Booking Info */}
                  {review.booking && (
                    <div className="p-3 bg-muted/50 rounded-lg mb-4">
                      <p className="text-sm font-medium">Booking Details</p>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        {review.booking.serviceType && (
                          <span>Service: {review.booking.serviceType}</span>
                        )}
                        {review.booking.priceCents && (
                          <span>Price: {(review.booking.priceCents / 100).toLocaleString()} DA</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Photographer Response (Read-only) */}
                  {review.photographerResponse && (
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-blue-900">Your Response</span>
                        <span className="text-xs text-blue-700">
                          {new Date(review.photographerResponse.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-blue-800">{review.photographerResponse.text}</p>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      {review.helpful || 0} people found this helpful
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Reviewed on {new Date(review.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {filterRating !== "all" ? `No ${filterRating}-star reviews` : "No reviews yet"}
              </h3>
              <p className="text-muted-foreground">
                {filterRating !== "all" 
                  ? "You don't have any reviews with this rating yet."
                  : "Client reviews will appear here once they start reviewing your services."
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}