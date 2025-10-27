"use client"

import { useReviewsMe } from "@/lib/hooks"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Star, Calendar, User, Camera, MapPin, Filter, Search, Clock } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"

export default function MyReviewsPage() {
  const { data, isLoading, error } = useReviewsMe(1, 50)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [ratingFilter, setRatingFilter] = useState("all")

  // Filter reviews based on search and filters
  const filteredReviews = data?.items?.filter(review => {
    const matchesSearch = 
      review.text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.photographer?.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.bookingId?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || review.status === statusFilter.toUpperCase()
    const matchesRating = ratingFilter === "all" || review.rating === parseInt(ratingFilter)
    
    return matchesSearch && matchesStatus && matchesRating
  }) || []

  // Calculate statistics
  const stats = {
    total: data?.items?.length || 0,
    approved: data?.items?.filter(r => r.status === "APPROVED").length || 0,
    pending: data?.items?.filter(r => r.status === "PENDING").length || 0,
    averageRating: data?.items?.length ? 
      (data.items.reduce((sum, r) => sum + r.rating, 0) / data.items.length).toFixed(1) : "0.0"
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "APPROVED": return "default"
      case "PENDING": return "secondary"
      case "REJECTED": return "destructive"
      default: return "outline"
    }
  }

  if (error) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">Failed to load reviews</div>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Reviews</h1>
          <p className="text-muted-foreground mt-2">
            Manage and view all your photography session reviews
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>Last updated: {new Date().toLocaleDateString()}</span>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Reviews</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Star className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Rating</p>
                <p className="text-2xl font-bold">{stats.averageRating}</p>
              </div>
              <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                <Star className="h-5 w-5 text-green-600 fill-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold">{stats.approved}</p>
              </div>
              <div className="h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center">
                <Calendar className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
              <div className="h-10 w-10 bg-amber-100 rounded-full flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reviews, photographers, or booking IDs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>

              <Select value={ratingFilter} onValueChange={setRatingFilter}>
                <SelectTrigger className="w-[140px]">
                  <Star className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Rating" />
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
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <div className="space-y-4">
        {isLoading ? (
          // Loading Skeletons
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredReviews.length > 0 ? (
          filteredReviews.map((review) => (
            <Card key={review.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Rating Section */}
                  <div className="flex-shrink-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-5 w-5 ${
                              i < review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <Badge variant={getStatusVariant(review.status)} className="text-xs">
                        {review.status}
                      </Badge>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {review.rating}.0
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(review.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>

                  {/* Review Content */}
                  <div className="flex-1 min-w-0">
                    {review.text ? (
                      <p className="text-gray-700 leading-relaxed mb-4">
                        {review.text}
                      </p>
                    ) : (
                      <p className="text-muted-foreground italic mb-4">
                        No review text provided
                      </p>
                    )}

                    {/* Photographer Info */}
                    {review.photographer && (
                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={review.photographer.user?.avatar} />
                          <AvatarFallback>
                            <Camera className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {review.photographer.user?.name || "Unknown Photographer"}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            Booking: {review.bookingId}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex-shrink-0 flex lg:flex-col gap-2 justify-end">
                    <Button variant="outline" size="sm">
                      View Booking
                    </Button>
                    <Button variant="outline" size="sm">
                      Share Review
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          // Empty State
          <Card>
            <CardContent className="p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No reviews found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery || statusFilter !== "all" || ratingFilter !== "all"
                    ? "Try adjusting your search or filters to find what you're looking for."
                    : "You haven't written any reviews yet. Reviews will appear here after you complete photography sessions."}
                </p>
                {(searchQuery || statusFilter !== "all" || ratingFilter !== "all") && (
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setSearchQuery("")
                      setStatusFilter("all")
                      setRatingFilter("all")
                    }}
                  >
                    Clear all filters
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Footer Info */}
      {filteredReviews.length > 0 && (
        <div className="text-center text-sm text-muted-foreground py-4">
          Showing {filteredReviews.length} of {stats.total} reviews
          {searchQuery && ` • Searching for "${searchQuery}"`}
        </div>
      )}
    </div>
  )
}